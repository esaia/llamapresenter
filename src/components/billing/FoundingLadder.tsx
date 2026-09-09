import {
  FOUNDING_TIERS,
  MARK_GROUPS,
  marks,
  soldOut,
  spotsInTier,
  tierNow,
  type FoundingTierId,
} from '@/lib/billing/founding';

/**
 * Early pricing, drawn the same way everywhere it is offered.
 *
 * Each rung is its price, the word `forever`, who it is for, and one mark per
 * spot. The last rung has no marks, because it is the one that never fills,
 * and that absence is the point of the whole row. Underneath, the one line
 * that says what the offer is.
 *
 * **It carries no palette of its own.** The console is dark and the marketing
 * pages are cream, and neither is allowed to name the other's tokens, so the
 * colours arrive as custom properties from whichever side is drawing it. That
 * is what lets the pricing page, the home page and the account panel show the
 * same thing rather than three drifting versions of it.
 */

/** What a caller has to set. Both wrappers below are the worked examples. */
export interface SpotColors {
  /** A spot already taken. */
  '--spot-taken': string;
  /** The spot the reader would take. */
  '--spot-next': string;
  /** The ground of a spot nobody is in. */
  '--spot-open': string;
  /** Its outline. */
  '--spot-line': string;
}

/** Where each drawn rung starts and stops, as seat numbers. */
export const GROUPS = MARK_GROUPS.map((tier, index) => ({
  tier,
  from: index === 0 ? 0 : (MARK_GROUPS[index - 1].lastSeat ?? 0),
  to: tier.lastSeat ?? 0,
}));

/** How long the row takes to deal itself out, per mark. */
const STEP = 42;

const Mark = ({ state, delay, size }: { state: 'taken' | 'next' | 'open'; delay: number; size: number }) => (
  <span className="relative inline-flex">
    <span
      aria-hidden
      style={{ animationDelay: `${delay}ms`, width: size, height: size, borderRadius: Math.round(size / 5) }}
      className={`site-spot-in ${
        state === 'taken'
          ? 'bg-[var(--spot-taken)]'
          : state === 'next'
            ? 'bg-[var(--spot-next)] ring-1 ring-[var(--spot-line)]'
            : 'border border-[var(--spot-line)] bg-[var(--spot-open)]'
      }`}
    />

    {/* One ring, going out once, around the spot the reader would take. */}
    {state === 'next' ? (
      <span
        aria-hidden
        style={{ animationDelay: `${delay + 220}ms`, borderRadius: Math.round(size / 5) }}
        className="site-spot-halo pointer-events-none absolute inset-0 ring-2 ring-[var(--spot-next)]"
      />
    ) : null}
  </span>
);

const gapFor = (size: number) => Math.max(4, Math.round(size / 2.8));

/**
 * One rung's marks, for a caller that puts its own label over each group —
 * the pricing page does, so its `$14` stays above the five it describes even
 * when the row wraps on a phone.
 *
 * `claimed` is the whole count, not the slice: the deal-out stagger has to run
 * on across the gap, or the second group looks like a separate animation.
 */
export const SpotGroup = ({
  claimed,
  from,
  to,
  size = 22,
  className = '',
}: {
  claimed: number;
  from: number;
  to: number;
  size?: number;
  className?: string;
}) => {
  const row = marks(claimed);

  return (
    <div aria-hidden className={`flex ${className}`} style={{ gap: gapFor(size) }}>
      {row.slice(from, to).map((state, index) => (
        <Mark key={from + index} state={state} delay={(from + index) * STEP} size={size} />
      ))}
    </div>
  );
};

/** The spot colours, plus the two the type needs. */
export interface LadderColors extends SpotColors {
  /** Prices and the line underneath. */
  '--ladder-strong': string;
  /** `forever`, the rung labels, and a rung that has filled. */
  '--ladder-faint': string;
}

/** Words for a rung. The prices come from the ladder; this is the copy. */
const GROUP_COPY: Record<FoundingTierId, string> = {
  founding: 'first 10 subscribers',
  early: 'next 5 subscribers',
  standard: 'after that',
};

const STRONG = 'text-[color:var(--ladder-strong)]';
const FAINT = 'text-[color:var(--ladder-faint)]';

/** A price, whether it lasts, and who it is for. */
const Rung = ({
  price,
  copy,
  forever,
  gone,
  size,
}: {
  price: string;
  copy: string;
  forever: boolean;
  gone: boolean;
  size: number;
}) => (
  <p className={gone || !forever ? FAINT : STRONG}>
    <span
      className={`font-valera tracking-tight ${gone ? 'line-through' : ''}`}
      style={{ fontSize: size, lineHeight: 1.1 }}
    >
      {price}
    </span>

    {/* The question every early-pricing page gets asked, answered beside the
        price rather than three sections down in the questions. */}
    {forever ? <span className={`ml-1.5 text-sm ${FAINT}`}>forever</span> : null}

    <span className={`mt-1 block text-[13px] leading-snug ${FAINT}`}>{copy}</span>
  </p>
);

export const FoundingLadder = ({
  claimed,
  compact = false,
  className = '',
}: {
  claimed: number;
  /** Smaller type and marks, for the account panel beside a running service. */
  compact?: boolean;
  className?: string;
}) => {
  const standard = FOUNDING_TIERS[FOUNDING_TIERS.length - 1];

  // Once every spot is gone the row retires rather than standing there full:
  // fifteen filled squares forever is decoration, not information. What is
  // worth keeping is why Pro costs what it costs.
  if (soldOut(claimed)) {
    return (
      <p className={`max-w-prose leading-relaxed ${FAINT} ${compact ? 'text-xs' : 'text-[17px]'} ${className}`}>
        All 15 early spots are taken. Pro is {standard.price} a month from here.
      </p>
    );
  }

  const mark = compact ? 16 : 22;
  const price = compact ? 20 : 26;

  return (
    <div className={className}>
      <div className={`flex flex-wrap items-start ${compact ? 'gap-x-10 gap-y-5' : 'gap-x-14 gap-y-8'}`}>
        {GROUPS.map(({ tier, from, to }) => (
          <div key={tier.id}>
            <Rung price={tier.price} copy={GROUP_COPY[tier.id]} forever gone={claimed >= to} size={price} />

            {/* Each rung draws its own slice, so a label stays over the marks
                it describes when the row wraps on a phone. */}
            <SpotGroup claimed={claimed} from={from} to={to} size={mark} className={compact ? 'mt-2.5' : 'mt-3.5'} />
          </div>
        ))}

        <Rung price={standard.price} copy={GROUP_COPY[standard.id]} forever={false} gone={false} size={price} />
      </div>

      <p className={`${STRONG} ${compact ? 'mt-4 text-sm' : 'mt-7 text-[17px]'}`}>
        Only {spotsInTier(claimed)} subscribers can get Pro for {tierNow(claimed).price}/month.
      </p>
    </div>
  );
};
