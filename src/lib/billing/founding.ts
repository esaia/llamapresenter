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
 * **Every rung is sold by the month and by the year.** A year costs ten
 * months, so the two cadences are two prices on the same rung rather than two
 * ladders: seat 7 is a founding seat whichever way the church pays, and the
 * rung it lands on is what the seat number says. Which cadence a church chose
 * is held by the Dodo product its subscription was created on, the same way
 * the rate is — see `productFor` in `./dodo`.
 *
 * This module is pure and tested for the same reason `psalms.ts` and
 * `blocks.ts` are: an off-by-one here quotes a price we then do not charge.
 */

/** How a church pays. Both are on offer on every rung. */
export type Cadence = 'monthly' | 'annual';

export const CADENCES: readonly Cadence[] = ['monthly', 'annual'];

/** A cadence a value arrived as, or the one we default to. */
export const cadenceOf = (value: string | null | undefined): Cadence =>
  value === 'annual' ? 'annual' : 'monthly';

export type FoundingTierId = 'founding' | 'early' | 'standard';

/** What one rung costs, one way of paying. */
export interface TierPrice {
  /** What Dodo charges, for picking the product and for nothing else. */
  priceCents: number;
  /** What the page prints. */
  price: string;
  cadence: string;
  /** The same, said of the period rather than per it: "a month", "a year". */
  per: string;
}

export interface FoundingTier {
  id: FoundingTierId;
  /** The last seat this rung covers. `null` on the rung that never fills. */
  lastSeat: number | null;
  monthly: TierPrice;
  annual: TierPrice;
}

/**
 * The ladder, in order. The last rung is open-ended and must stay last.
 *
 * The annual prices are twelve months for the price of ten, rounded down to
 * the nine the monthly prices already end on — $89 rather than $90, so the
 * pair reads as one price list rather than two.
 */
export const FOUNDING_TIERS: readonly FoundingTier[] = [
  {
    id: 'founding',
    lastSeat: 10,
    monthly: { priceCents: 900, price: '$9', cadence: 'per month', per: 'a month' },
    annual: { priceCents: 8900, price: '$89', cadence: 'per year', per: 'a year' },
  },
  {
    id: 'early',
    lastSeat: 15,
    monthly: { priceCents: 1400, price: '$14', cadence: 'per month', per: 'a month' },
    annual: { priceCents: 13900, price: '$139', cadence: 'per year', per: 'a year' },
  },
  {
    id: 'standard',
    lastSeat: null,
    monthly: { priceCents: 1900, price: '$19', cadence: 'per month', per: 'a month' },
    annual: { priceCents: 18900, price: '$189', cadence: 'per year', per: 'a year' },
  },
];

/** What a rung costs, paid the way the reader is choosing. */
export const priceOf = (tier: FoundingTier, cadence: Cadence): TierPrice => tier[cadence];

/**
 * What paying by the year saves against paying by the month, in whole dollars
 * with the sign on it — "$19". Derived rather than written down, so a price
 * that moves cannot leave a saving behind that we no longer offer.
 */
export const savingOf = (tier: FoundingTier): string =>
  `$${Math.round((tier.monthly.priceCents * 12 - tier.annual.priceCents) / 100)}`;

/**
 * What a year works out at by the month, for the line under an annual price.
 * Rounded to the nearest cent and printed without a trailing `.00`.
 */
export const monthlyEquivalent = (tier: FoundingTier): string => {
  const cents = Math.round(tier.annual.priceCents / 12);

  return cents % 100 === 0 ? `$${cents / 100}` : `$${(cents / 100).toFixed(2)}`;
};

/** How much of the year a church pays for, as the badge on the switch prints it. */
export const ANNUAL_BADGE = '2 months free';

/** The period stuck on the end of a price — "$9/month", "$89/year". */
export const PER: Record<Cadence, string> = { monthly: '/month', annual: '/year' };

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
