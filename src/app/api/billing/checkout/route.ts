import { NextResponse, type NextRequest } from 'next/server';

import { dodo, productFor, siteUrl } from '@/lib/billing/dodo';
import { cadenceOf } from '@/lib/billing/founding';
import { claimSeat } from '@/lib/billing/seats';
import { admin } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

/**
 * Start a Pro subscription for the signed-in operator.
 *
 * The Dodo customer is created here rather than left to the checkout page, and
 * written to our row before the operator ever reaches it. That is what lets the
 * webhook find whose plan to change: an event can arrive for a subscription
 * created in the Dodo dashboard, resumed after a pause, or cancelled months
 * later, and none of those carry our metadata. The customer id always does.
 *
 * This is also the till for the founding ladder. The pricing page's "3 spots
 * left at $9" is a shop window and may be a moment out of date; the seat is
 * taken here, in one statement, right before the checkout session opens — so
 * two churches that both read "3 left" cannot both be sold the same spot.
 */
export const POST = async (request: NextRequest) => {
  // Monthly unless the caller asked for a year. Read off the body rather than
  // trusted from the browser as a price: what a year *costs* is decided here,
  // from the rung the seat lands on, exactly as the monthly rate is.
  const cadence = cadenceOf(
    await request
      .json()
      .then((body: { cadence?: string }) => body?.cadence)
      .catch(() => null),
  );

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'sign in first' }, { status: 401 });

  // A guest room's operator has no email for Dodo to bill or send receipts
  // to, and no real account for the webhook to reconcile against — they must
  // sign in for real before a subscription can exist for them at all.
  if (user.is_anonymous) {
    return NextResponse.json(
      { error: 'Sign in with Google first — a demo room cannot hold a subscription.', code: 'anonymous' },
      { status: 401 },
    );
  }

  if (!process.env.DODO_PAYMENTS_API_KEY) {
    return NextResponse.json({ error: 'billing is not configured yet' }, { status: 503 });
  }

  const db = admin();
  const { data: row } = await db
    .from('subscriptions')
    .select('provider_customer_id')
    .eq('user_id', user.id)
    .maybeSingle();

  const client = dodo();
  let customer = row?.provider_customer_id ?? null;

  if (!customer) {
    const created = await client.customers.create({
      email: user.email ?? '',
      name: user.email ?? 'Operator',
      metadata: { user_id: user.id },
    });

    customer = created.customer_id;
    await db.from('subscriptions').update({ provider_customer_id: customer }).eq('user_id', user.id);
  }

  // The founding spot, and with it the product this subscription is created
  // on — which is what holds the price and the cadence for as long as the
  // church stays. An operator who already has a seat gets the same one back,
  // so opening checkout twice cannot move them up the ladder or spend a
  // second spot.
  const { tier } = await claimSeat(user.id);
  const product = productFor(tier, cadence);

  if (!product) {
    return NextResponse.json({ error: 'billing is not configured yet' }, { status: 503 });
  }

  // A checkout session rather than a subscription with `payment_link`: Dodo
  // needs a billing country for tax, and the session collects it on the page
  // instead of us inventing one for a church we know nothing about.
  const session = await client.checkoutSessions.create({
    product_cart: [{ product_id: product, quantity: 1 }],
    customer: { customer_id: customer },
    return_url: `${siteUrl()}/studio?upgraded=1`,
    metadata: { user_id: user.id },
  });

  if (!session.checkout_url) {
    return NextResponse.json({ error: 'could not open checkout' }, { status: 502 });
  }

  return NextResponse.json({ url: session.checkout_url });
};
