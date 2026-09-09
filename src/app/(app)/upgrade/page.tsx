import { redirect } from 'next/navigation';

import { planOf } from '@/lib/billing/entitlements';
import { cadenceOf } from '@/lib/billing/founding';
import { plansFor } from '@/lib/billing/plans';
import { claimedSpots } from '@/lib/billing/seats';
import { configured, createClient } from '@/lib/supabase/server';

import { StartCheckout } from './start-checkout';

export const metadata = { title: 'Upgrade to Pro' };

/**
 * Where the "Get Pro" button on the public pages lands.
 *
 * Buying needs an account — the checkout route creates the Dodo customer
 * against the signed-in operator — and `/upgrade` is not a public path, so a
 * visitor arriving from the marketing page signs in first and is returned here
 * by the middleware's `next`, which carries the query so the year they picked
 * on the pricing page survives the sign-in. Someone who is already paying has
 * nothing to buy
 * — the subscription row is read rather than the entitlement, because with the
 * gates off everyone is *treated* as Pro and nobody could reach checkout.
 */
export default async function UpgradePage({
  searchParams,
}: {
  searchParams: Promise<{ billing?: string }>;
}) {
  const cadence = cadenceOf((await searchParams).billing);

  if (!configured()) redirect('/login');

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login?next=/upgrade');

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('plan')
    .eq('user_id', user.id)
    .maybeSingle();

  if (planOf(subscription?.plan) === 'pro') redirect('/studio');

  // What the checkout route is about to charge. Read here rather than baked in
  // because while the founding spots last it depends on how many are gone —
  // and the route takes the seat itself, so the two agree.
  const pro = plansFor(await claimedSpots(), cadence).pro;

  return <StartCheckout billing={cadence} price={pro.price} cadence={pro.cadence} />;
}
