/**
 * The founding-price ladder.
 *
 * LlamaPresenter opened with fifteen spots held below the standard price: the
 * first ten churches pay $9 a month, the next five pay $14, and everyone after
 * that pays $19. The rate is theirs for as long as the subscription runs.
 *
 * **A spot is a number stamped on a subscription, not a running total.** Each
 * row that reaches checkout takes the next `founding_seat`, and the price
 * follows from that integer for the life of the row. Deriving the rung from a
 * live `count(*)` of paying churches instead would walk the number backwards
 * every time someone cancelled — which reads as broken, and is worth gaming.
 * So a church that leaves has spent its spot.
 *
 * This module is pure and tested for the same reason `psalms.ts` and
 * `blocks.ts` are: an off-by-one here quotes a price we then do not charge.
 */

export type FoundingTierId = 'founding' | 'early' | 'standard';

export interface FoundingTier {
  id: FoundingTierId;
  /** The last seat this rung covers. `null` on the rung that never fills. */
  lastSeat: number | null;
  /** What Dodo charges, for picking the product and for nothing else. */
  priceCents: number;
  /** What the page prints. */
  price: string;
  cadence: string;
}

/** The ladder, in order. The last rung is open-ended and must stay last. */
export const FOUNDING_TIERS: readonly FoundingTier[] = [
  { id: 'founding', lastSeat: 10, priceCents: 900, price: '$9', cadence: 'per month' },
  { id: 'early', lastSeat: 15, priceCents: 1400, price: '$14', cadence: 'per month' },
  { id: 'standard', lastSeat: null, priceCents: 1900, price: '$19', cadence: 'per month' },
];

/** The rung nobody has to race for. */
export const STANDARD_TIER = FOUNDING_TIERS[FOUNDING_TIERS.length - 1];

/**
 * How many spots are held below the standard price — fifteen, read off the
 * ladder rather than written down twice.
 */
export const FOUNDING_SPOTS = FOUNDING_TIERS.reduce((last, tier) => tier.lastSeat ?? last, 0);

/** What seat number `n` pays. Seats are 1-based: the first church sits in 1. */
export const tierForSeat = (seat: number): FoundingTier =>
  FOUNDING_TIERS.find(tier => tier.lastSeat === null || seat <= tier.lastSeat) ?? STANDARD_TIER;

/** What the next church to sign up would pay, given how many spots are gone. */
export const tierNow = (claimed: number): FoundingTier => tierForSeat(claimed + 1);

/**
 * Spots left on the rung being sold right now, or `null` once the ladder is
 * spent and there is no longer a number worth counting down.
 */
export const spotsLeftInTier = (claimed: number): number | null => {
  const { lastSeat } = tierNow(claimed);

  return lastSeat === null ? null : Math.max(0, lastSeat - claimed);
};

/**
 * How many spots the rung being sold holds in total — ten, then five.
 *
 * `null` once the ladder is spent, for the same reason `spotsLeftInTier` is:
 * the standard price has no ceiling to count against.
 */
export const spotsInTier = (claimed: number): number | null => {
  const index = FOUNDING_TIERS.indexOf(tierNow(claimed));
  const tier = FOUNDING_TIERS[index];

  if (tier.lastSeat === null) return null;

  return tier.lastSeat - (index === 0 ? 0 : (FOUNDING_TIERS[index - 1].lastSeat ?? 0));
};

/** Whether all fifteen founding spots are gone. */
export const soldOut = (claimed: number): boolean => claimed >= FOUNDING_SPOTS;

export type MarkState = 'taken' | 'next' | 'open';

/**
 * The fifteen marks the pricing page draws, left to right.
 *
 * Here rather than in the component so the row that carries the whole idea is
 * covered by the same tests as the prices it illustrates.
 */
export const marks = (claimed: number): MarkState[] =>
  Array.from({ length: FOUNDING_SPOTS }, (_, index) =>
    index < claimed ? 'taken' : index === claimed ? 'next' : 'open',
  );

/** Where the row breaks: ten, then five. One entry per rung that fills. */
export const MARK_GROUPS: readonly FoundingTier[] = FOUNDING_TIERS.filter(tier => tier.lastSeat !== null);
