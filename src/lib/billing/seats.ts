import { unstable_cache } from 'next/cache';

import { admin } from '@/lib/supabase/admin';

import { FOUNDING_SPOTS, tierForSeat, type FoundingTier } from './founding';

/**
 * Reading and taking founding spots. See `./founding` for what a spot costs.
 *
 * The split is the point: **the page is the shop window and the checkout route
 * is the till.** Anything rendered — the pricing page, the upgrade screen, the
 * account panel — reads `claimedSpots()`, which is allowed to be a moment out
 * of date. The seat a church is actually charged for is taken by `claimSeat()`
 * inside the checkout route, in one statement, immediately before the Dodo
 * session is created. So two people looking at "3 spots left at $9" can both be
 * told the truth, and only one of them gets seat 8.
 */

/**
 * How many of the fifteen are gone.
 *
 * Through the service-role client because `subscriptions` is readable only by
 * its owner and this is a number for anyone who opens the pricing page.
 * Failures return zero rather than throwing: a marketing page that will not
 * render because a count timed out is a worse outcome than one showing the
 * ladder at its most generous, and the checkout route is where the number has
 * to be right.
 */
const countSpots = async (): Promise<number> => {
  try {
    const { data, error } = await admin().rpc('founding_claimed');

    if (error || typeof data !== 'number') return 0;

    return Math.min(data, FOUNDING_SPOTS);
  } catch {
    return 0;
  }
};

/**
 * Cached for a minute, because every marketing page renders it and none of them
 * needs it to the second — the checkout route takes the seat itself, so a
 * window that is briefly generous cannot oversell one.
 */
export const claimedSpots = unstable_cache(countSpots, ['founding-claimed'], { revalidate: 60 });

/**
 * Take the operator's founding spot and say what it costs.
 *
 * Called once, from the checkout route. An operator who already holds a seat
 * gets the same one back, so opening checkout twice cannot move a church up the
 * ladder or spend a second spot.
 */
export const claimSeat = async (userId: string): Promise<{ seat: number; tier: FoundingTier }> => {
  const { data, error } = await admin().rpc('claim_founding_seat', { uid: userId });

  if (error || typeof data !== 'number') {
    throw new Error(`could not take a founding spot: ${error?.message ?? 'no seat returned'}`);
  }

  return { seat: data, tier: tierForSeat(data) };
};
