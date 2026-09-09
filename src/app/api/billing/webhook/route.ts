import { NextResponse, type NextRequest } from 'next/server';
import type { WebhookPayload } from 'dodopayments/resources';
import { Webhook } from 'standardwebhooks';

import { planFromStatus } from '@/lib/billing/dodo';
import { admin } from '@/lib/supabase/admin';

/**
 * Dodo's view of a subscription, written into ours.
 *
 * The signature is what authorises this route, so it runs with the service role
 * and never trusts the body until `verify` has passed. Everything about a plan
 * is decided here rather than at checkout, because a subscription also ends,
 * lapses on a failed card, pauses and resumes — none of which the browser is
 * present for.
 */
const RELEVANT = new Set([
  'subscription.active',
  'subscription.renewed',
  'subscription.on_hold',
  'subscription.past_due',
  'subscription.paused',
  'subscription.unpaused',
  'subscription.cancelled',
  'subscription.failed',
  'subscription.expired',
  'subscription.plan_changed',
  'subscription.updated',
]);

export const POST = async (request: NextRequest) => {
  const secret = process.env.DODO_PAYMENTS_WEBHOOK_KEY;

  if (!secret) return NextResponse.json({ error: 'not configured' }, { status: 503 });

  // The signature is over the bytes as sent, so the body is read as text and
  // parsed only after it has been verified.
  const body = await request.text();

  let event: WebhookPayload;

  try {
    new Webhook(secret).verify(body, {
      'webhook-id': request.headers.get('webhook-id') ?? '',
      'webhook-signature': request.headers.get('webhook-signature') ?? '',
      'webhook-timestamp': request.headers.get('webhook-timestamp') ?? '',
    });

    event = JSON.parse(body) as WebhookPayload;
  } catch {
    return NextResponse.json({ error: 'bad signature' }, { status: 400 });
  }

  if (!RELEVANT.has(event.type) || event.data.payload_type !== 'Subscription') {
    return NextResponse.json({ received: true });
  }

  const subscription = event.data;
  const db = admin();

  // A subscription started anywhere but our checkout carries no metadata of
  // ours; the customer we created before sending them there is the fallback.
  const userId =
    (typeof subscription.metadata?.user_id === 'string' ? subscription.metadata.user_id : null) ??
    (
      await db
        .from('subscriptions')
        .select('user_id')
        .eq('provider_customer_id', subscription.customer.customer_id)
        .maybeSingle()
    ).data?.user_id;

  if (!userId) return NextResponse.json({ received: true });

  const plan = planFromStatus(subscription.status);

  // Dodo retries, and a retry can land behind an event that overtook it. A
  // stale delivery must not put a paying church back on Free, so the event's
  // own timestamp decides whether it still has anything to say.
  await db
    .from('subscriptions')
    .update({
      provider: 'dodo',
      provider_subscription_id: subscription.subscription_id,
      provider_customer_id: subscription.customer.customer_id,
      plan,
      status: subscription.status,
      current_period_end: subscription.next_billing_date ?? null,
      cancel_at_period_end: subscription.cancel_at_next_billing_date,
      event_at: event.timestamp,
      // The founding spot stops being a checkout reservation and becomes the
      // church's outright, once there is a subscription paying for it. Note
      // what is *not* here: a cancellation does not hand the spot back. The
      // ladder is the order churches arrived in, and it only ever moves
      // forward — a count that walked backwards on every cancellation would
      // read as broken on the pricing page and be worth gaming.
      ...(plan === 'pro' ? { founding_reserved_at: null } : {}),
    })
    .eq('user_id', userId)
    .or(`event_at.is.null,event_at.lte.${event.timestamp}`);

  return NextResponse.json({ received: true });
};
