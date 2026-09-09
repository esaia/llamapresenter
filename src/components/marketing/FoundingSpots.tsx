import { FoundingLadder, type LadderColors } from '@/components/billing/FoundingLadder';

/**
 * Early pricing on cream paper. `FoundingLadder` is the drawing; this names
 * the colours it wears.
 *
 * The pricing page and the home page show the same thing, at the same size —
 * a visitor who saw the ladder on the way in should recognise it when they get
 * to the page that explains it.
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

export const FoundingSpots = ({ claimed, className = 'mt-12' }: { claimed: number; className?: string }) => (
  <section aria-label="Early pricing" style={COLORS}>
    <FoundingLadder claimed={claimed} className={className} />
  </section>
);
