'use client';

import Link from 'next/link';

import { CountingPrice } from '@/components/billing/CountingPrice';
import type { Cadence } from '@/lib/billing/founding';
import type { Plan, PlanId } from '@/lib/billing/plans';

import { useCadence } from './cadence';
import { CadenceSwitch } from './CadenceSwitch';
import { PlanPrice } from './PlanPrice';

/**
 * The short pair of cards in the home page's price band, and their switch.
 *
 * The long version, with every line of the product under each price, is on
 * /pricing. Here the card is a price, six lines and a door — enough to decide
 * whether to read the long one. The switch is the same drawing on both, so a
 * visitor who picked a year here finds it already picked when they follow the
 * link, and the link they follow carries it.
 */

/* The rounded display face the brand is drawn in, as on the rest of the site. */
const DISPLAY = 'font-valera tracking-tight text-site-ink';

export const HomePlanCards = ({ plans }: { plans: Record<Cadence, Record<PlanId, Plan>> }) => {
  const [cadence] = useCadence();

  return (
    <div>
      <div className="flex sm:justify-end">
        <CadenceSwitch />
      </div>

      <div className="mt-5 grid gap-6 sm:grid-cols-2">
        {Object.values(plans[cadence]).map((plan: Plan) => (
          <div
            key={plan.id}
            // Both cards take a ground of their own now that the section has
            // one: on the band, a transparent card is not a card. They are
            // columns because the two lists are different lengths and the
            // buttons still have to sit on one line at the foot.
            className={
              plan.id === 'pro'
                ? 'flex flex-col rounded-studio-lg border border-site-ink bg-site-surface p-6 shadow-sm'
                : 'flex flex-col rounded-studio-lg border border-site-rule bg-site-bg p-6'
            }
          >
            <h3 className="text-sm text-site-muted">{plan.name}</h3>

            <div className="mt-3">
              <PlanPrice plan={plan} size="text-4xl" display={DISPLAY} />
            </div>

            <ul className="mt-4 flex-1 space-y-2 text-[15px] text-site-muted">
              {plan.highlights.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>

            <Link
              href={plan.cta.href}
              className={
                plan.id === 'pro'
                  ? `mt-8 block rounded-studio bg-site-accent px-4 py-2.5 text-center text-[15px] font-medium
                     text-site-onaccent transition-colors duration-150 hover:bg-site-accent/85`
                  : `mt-8 block rounded-studio border border-site-rule px-4 py-2.5 text-center text-[15px]
                     text-site-ink transition-colors duration-150 hover:bg-site-band`
              }
            >
              {plan.id === 'pro' ? (
                <>
                  {plan.cta.label} — <CountingPrice value={plan.price} /> {plan.cadence}
                </>
              ) : (
                plan.cta.label
              )}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};
