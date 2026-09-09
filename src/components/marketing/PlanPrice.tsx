import { CountingPrice } from '@/components/billing/CountingPrice';
import type { Plan } from '@/lib/billing/plans';

/**
 * A plan's price, and the one line under it that only a yearly price needs.
 *
 * Shared by the two cards — the home page's short one and the pricing page's
 * long one — because the number and the sentence under it are the part a
 * reader compares, and two drawings of it would drift the moment one of them
 * gained a saving and the other did not.
 *
 * The monthly equivalent is printed rather than the discount percentage: a
 * church deciding between $19 a month and $189 a year is asking what the year
 * costs per month, and "$15.75 a month" answers it outright.
 *
 * The number counts from the one before it to the one now asked for; the words
 * either side of it are keyed on their own value and simply rise into place.
 * Free's $0 is the same $0 either way, so it neither counts nor moves — which
 * is what shows the reader that the switch is about the other card.
 *
 * It has to stay one short line. The card is a narrow column and the sentence
 * that ran to two wrapped its last two characters onto a line of their own,
 * which read as a mistake — so the saving and the rate are two short sentences
 * rather than one clause with a dash in it.
 */
export const PlanPrice = ({
  plan,
  size,
  display,
}: {
  plan: Plan;
  /** The class the big number is set in, so each card keeps its own scale. */
  size: string;
  /** The rounded display face, which each surface names for itself. */
  display: string;
}) => (
  <>
    <p className="flex items-baseline gap-2">
      <CountingPrice value={plan.price} className={`${display} ${size}`} />

      <span key={plan.cadence} className="site-price-in text-sm text-site-faint">
        {plan.cadence}
      </span>
    </p>

    {/* A line whichever way the reader is paying, so flipping the switch moves
        the price and nothing else on the page under it. A space rather than a
        fixed height: a line that grew inside one would sit on top of whatever
        the card puts next. */}
    <p className="mt-1.5 text-[13px] leading-4 text-site-faint">
      <span key={plan.permonth ?? 'none'} className="site-price-in">
        {plan.permonth ? `Save ${plan.saving}. That's ${plan.permonth} a month.` : '\u00A0'}
      </span>
    </p>
  </>
);
