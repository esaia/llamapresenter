'use client';

import { ANNUAL_BADGE, CADENCES, type Cadence } from '@/lib/billing/founding';

import { useCadence } from './cadence';

/**
 * Monthly or yearly, drawn once and used wherever a price is offered.
 *
 * A pair of buttons rather than a checkbox: "billed annually" as a tick beside
 * a price makes the reader work out what they would pay, and the number they
 * are choosing between is the whole decision. Both prices are already on the
 * page — the plans arrive from the server as a pair — so flipping this is a
 * state change and never a fetch.
 *
 * The saving rides on the yearly side rather than under the price, because it
 * is the reason to press it, and a reader who has already pressed it does not
 * need telling twice.
 */
const LABELS: Record<Cadence, string> = { monthly: 'Monthly', annual: 'Yearly' };

export const CadenceSwitch = ({ className = '' }: { className?: string }) => {
  const [value, onChange] = useCadence();

  return (
    <div
      aria-label="How often you pay"
      role="group"
      className={`inline-flex items-center gap-1 rounded-full border border-site-rule bg-site-surface p-1 ${className}`}
    >
      {CADENCES.map(cadence => {
        const on = cadence === value;

        return (
          <button
            key={cadence}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(cadence)}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-colors duration-150 ${
              on ? 'bg-site-ink font-medium text-white' : 'text-site-muted hover:text-site-ink'
            }`}
          >
            {LABELS[cadence]}

            {cadence === 'annual' ? (
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] leading-none font-medium ${
                  on ? 'bg-site-accent text-site-onaccent' : 'bg-site-band text-site-muted'
                }`}
              >
                {ANNUAL_BADGE}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
};
