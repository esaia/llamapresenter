'use client';

import { FoundingLadder, type LadderColors } from '@/components/billing/FoundingLadder';

import { useCadence } from './cadence';

/**
 * Early pricing on cream paper. `FoundingLadder` is the drawing; this names
 * the colours it wears.
 *
 * The pricing page and the home page show the same thing, at the same size —
 * a visitor who saw the ladder on the way in should recognise it when they get
 * to the page that explains it.
 *
 * A client component only to read the monthly/yearly choice its page is
 * holding, so the rungs move with the switch beside the cards. The console
 * draws its own wrapper, with no switch and no provider, and gets the monthly
 * prices from the context's default.
 */

/* Ink on cream, with the brand yellow as the spot you would take. */
const COLORS = {
  '--spot-taken': 'var(--color-site-ink)',
  '--spot-next': 'var(--color-site-accent)',
  '--spot-open': 'color-mix(in oklab, var(--color-site-ink) 4%, transparent)',
  '--spot-line': 'color-mix(in oklab, var(--color-site-ink) 30%, transparent)',
  '--ladder-strong': 'var(--color-site-ink)',
  '--ladder-faint': 'var(--color-site-faint)',
} satisfies LadderColors as React.CSSProperties;

export const FoundingSpots = ({ claimed, className = 'mt-12' }: { claimed: number; className?: string }) => {
  const [cadence] = useCadence();

  return (
    <section aria-label="Early pricing" style={COLORS}>
      <FoundingLadder claimed={claimed} cadence={cadence} className={className} />
    </section>
  );
};
