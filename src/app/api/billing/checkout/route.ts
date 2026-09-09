import { NextResponse } from 'next/server';

import { dodo, productForTier, siteUrl } from '@/lib/billing/dodo';
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
export const POST = async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'sign in first' }, { status: 401 });

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
  // on — which is what holds the price for as long as the church stays. An
  // operator who already has a seat gets the same one back, so opening
  // checkout twice cannot move them up the ladder or spend a second spot.
  const { tier } = await claimSeat(user.id);
  const product = productForTier(tier);

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
