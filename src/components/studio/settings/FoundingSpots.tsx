import { FoundingLadder, type LadderColors } from '@/components/billing/FoundingLadder';
import { soldOut } from '@/lib/billing/founding';

/**
 * Early pricing in the account panel, over the upgrade button.
 *
 * The same ladder the marketing pages draw, wearing the console's palette, so
 * an operator who read it on the way in sees the same thing when they open
 * Account a week later. Compact, because this is a panel beside a running
 * service rather than a page someone came to read.
 *
 * Free accounts only, and only while spots are open: telling a church that is
 * already paying how few are left is a countdown it cannot act on, and telling
 * anyone once the ladder is spent is a promotion for something gone.
 */

/* Cream on the console's dark ground, with the same brand yellow as the spot
   the operator would take. The open marks take the raised surface and the
   lighter border so they read as seats rather than as holes. */
const COLORS = {
  '--spot-taken': 'var(--color-studio-text)',
  '--spot-next': 'var(--color-studio-accent)',
  '--spot-open': 'var(--color-studio-lift)',
  '--spot-line': 'var(--color-studio-raised)',
  '--ladder-strong': 'var(--color-studio-text)',
  '--ladder-faint': 'var(--color-studio-muted)',
} satisfies LadderColors as React.CSSProperties;

export const FoundingSpots = ({ claimed }: { claimed: number }) => {
  if (soldOut(claimed)) return null;

  return (
    <div className="mb-5" style={COLORS}>
      <FoundingLadder claimed={claimed} compact />
    </div>
  );
};
