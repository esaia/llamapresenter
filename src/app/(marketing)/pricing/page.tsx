import Link from 'next/link';
import { Fragment } from 'react';

import { LIMIT_LABELS } from '@/lib/billing/limits';
import { PLANS } from '@/lib/billing/plans';
import { freeLimitValue, INCLUDED, LIMIT_GROUPS, LIMIT_NOTES, proLimitValue } from '@/lib/billing/table';

export const metadata = {
  title: 'Pricing',
  description:
    'Free covers a congregation putting scripture on a screen — the whole Bible, the projector, the stage and the '
    + 'lower third. Pro lifts the ceilings for $9 a month.',
};

/* The rounded display face the brand is drawn in, as on the rest of the site. */
const DISPLAY = 'font-valera tracking-tight text-site-ink';

/** The tick beside a line both plans carry. Drawn rather than a font's glyph. */
const Tick = () => (
  <svg viewBox="0 0 16 16" aria-hidden focusable="false" className="mt-[5px] size-3.5 shrink-0 text-site-ink">
    <path
      d="M3 8.5 6.2 12 13 4.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const QUESTIONS = [
  {
    q: 'Is Free a trial?',
    a: 'No. There is no clock on it and no card to start. A church that only ever puts verses on the screen can run '
      + 'every service on Free and never hear from us about money.',
  },
  {
    q: 'What actually changes when I pay?',
    a: 'The numbers, and nothing else. There is no feature Pro can do that Free cannot — Pro lifts the ceilings on '
      + 'how many songs, tracks, running orders, name cards and looks of your own you can keep.',
  },
  {
    q: 'What happens to my work if I stop paying?',
    a: 'It stays exactly where it is. A ceiling only ever refuses something new: going back to Free never deletes a '
      + 'song, a playlist or a template you made, and you can still open, reorder and remove them.',
  },
  {
    q: 'Do I need an account for the projector machine?',
    a: 'No. Every output — the projector, the stage display and the lower third — is a link you open on that machine. '
      + 'Only the person running the console signs in.',
  },
  {
    q: 'Where do my backgrounds and music live?',
    a: 'On the machine running the console, not on our servers. That is why they cost you nothing to keep, and why '
      + 'you copy them over when you move to a different computer.',
  },
  {
    q: 'How do I cancel?',
    a: 'From the console, in the account panel, in two clicks. It runs to the end of the month you have paid for, and '
      + 'then the account is a Free one again.',
  },
];

export default function PricingPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-20 sm:py-24">
      <h1 className={`${DISPLAY} text-4xl sm:text-5xl`}>Pricing</h1>
      <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-site-muted">
        Putting scripture on the screen costs nothing, on every screen you have, for as long as you like. Pro is for
        the teams that also run songs, music and a look of their own — it lifts the ceilings, and adds no buttons.
      </p>

      {/* ------------------------------------------------------- the two cards */}
      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        {Object.values(PLANS).map(plan => (
          <div
            key={plan.id}
            className={
              plan.id === 'pro'
                ? 'flex flex-col rounded-studio-lg border border-site-ink bg-site-surface p-6 shadow-sm'
                : 'flex flex-col rounded-studio-lg border border-site-rule p-6'
            }
          >
            <h2 className="text-sm text-site-muted">{plan.name}</h2>

            <p className="mt-4 flex items-baseline gap-2">
              <span className={`${DISPLAY} text-4xl`}>{plan.price}</span>
              <span className="text-sm text-site-faint">{plan.cadence}</span>
            </p>

            <p className="mt-4 text-sm leading-relaxed text-site-muted">{plan.blurb}</p>

            <ul className="mt-6 flex-1 space-y-2 text-sm text-site-ink">
              {plan.highlights.map(item => (
                <li key={item} className="flex gap-2">
                  <span className="text-site-faint">·</span>
                  {item}
                </li>
              ))}
            </ul>

            <Link
              href={plan.cta.href}
              className={
                plan.id === 'pro'
                  ? 'mt-8 block rounded-studio bg-site-accent px-4 py-2.5 text-center text-sm font-medium text-site-onaccent transition-colors duration-150 hover:bg-site-accent/85'
                  : 'mt-8 block rounded-studio border border-site-rule px-4 py-2.5 text-center text-sm text-site-ink transition-colors duration-150 hover:bg-site-band'
              }
            >
              {plan.id === 'pro' ? `${plan.cta.label} — ${plan.price} ${plan.cadence}` : plan.cta.label}
            </Link>
          </div>
        ))}
      </div>

      {/* ------------------------------------------------------------- ceilings */}
      {/* The whole table, not a curated half of it: someone deciding whether
          Free is enough for their church is asking about the one row we have
          not printed. It is the table the console shows an operator who has
          hit a ceiling, from the same `LIMIT_GROUPS`. */}
      <section className="mt-20">
        <h2 className={`${DISPLAY} text-2xl sm:text-3xl`}>Every ceiling, side by side</h2>
        <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-site-muted">
          These are all of them. A gate in this app is always a number — how many of a thing you can keep — so this
          table is the entire difference between the two plans.
        </p>

        {/* One card, one rule per group, and no lines between rows.
            A hairline under every row drew nineteen of them down the page; a
            band behind the Pro column instead drew one long white stripe, which
            read as something broken rather than as a column. So the table sits
            on its own paper and Pro is told apart by the weight of its type —
            the thing the reader is actually comparing is two numbers on one
            line, and those are already side by side. */}
        <div className="mt-8 overflow-x-auto rounded-studio-lg border border-site-rule bg-site-surface px-5 py-1 sm:px-8">
          <table className="w-full min-w-md border-collapse text-left text-[15px]">
            <thead>
              <tr className="text-site-faint">
                <th className="py-4 pr-6 text-left text-sm font-normal">
                  <span className="sr-only">What is being counted</span>
                </th>
                <th className="w-24 px-4 py-4 text-right text-sm font-normal sm:w-28">Free</th>
                <th className="w-24 py-4 pl-4 text-right text-sm font-normal text-site-ink sm:w-28">Pro</th>
              </tr>
            </thead>

            <tbody>
              {LIMIT_GROUPS.map((group, index) => (
                <Fragment key={group.title}>
                  <tr>
                    <th
                      colSpan={3}
                      scope="colgroup"
                      className={`border-t border-site-rule pb-2 text-left text-[11px] font-semibold tracking-wider
                        text-site-faint uppercase ${index === 0 ? 'pt-5' : 'pt-8'}`}
                    >
                      {group.title}
                    </th>
                  </tr>

                  {group.keys.map(key => (
                    <tr key={key} className="align-top">
                      {/* The noun on its own was a riddle to anyone who has not
                          run the console — "sessions, 1" most of all — so each
                          row says what the thing is underneath its name. */}
                      <td className="py-3.5 pr-6">
                        <span className="block text-site-ink">{LIMIT_LABELS[key].many}</span>
                        <span className="mt-1 block max-w-prose text-[13px] leading-relaxed text-site-faint">
                          {LIMIT_NOTES[key]}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right whitespace-nowrap text-site-muted">{freeLimitValue(key)}</td>
                      <td className="py-3.5 pl-4 text-right font-medium whitespace-nowrap text-site-ink">
                        {proLimitValue(key)}
                      </td>
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-6 max-w-2xl text-sm leading-relaxed text-site-faint">
          Three languages on a slide is the one number Pro does not make unlimited: it is how many fit before a slide
          stops being readable from the back of the room, and not something we would charge for.
        </p>
      </section>

      {/* ------------------------------------------------------- in both plans */}
      <section className="mt-20">
        <h2 className={`${DISPLAY} text-2xl sm:text-3xl`}>In both plans</h2>
        <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-site-muted">
          Nothing below is a Pro feature. It is what the app is, and it is the same on the day you sign up as it is on
          the day you pay us.
        </p>

        <div className="mt-10 grid gap-x-12 gap-y-10 sm:grid-cols-2">
          {INCLUDED.map(group => (
            <div key={group.title}>
              <h3 className="text-sm font-semibold text-site-ink">{group.title}</h3>

              <ul className="mt-4 space-y-2.5 text-[15px] leading-relaxed text-site-muted">
                {group.items.map(item => (
                  <li key={item} className="flex gap-2.5">
                    <Tick />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------ questions */}
      <section className="mt-20">
        <h2 className={`${DISPLAY} text-2xl sm:text-3xl`}>Questions about paying</h2>

        <div className="mt-10 gap-x-12 sm:columns-2">
          {QUESTIONS.map(item => (
            <div key={item.q} className="mb-8 break-inside-avoid">
              <h3 className="text-[17px] leading-snug font-medium text-site-ink">{item.q}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-site-muted">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ----------------------------------------------------------- last word */}
      <section className="mt-16 flex flex-col items-start gap-6 rounded-studio-lg border border-site-rule bg-site-band px-6 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-10">
        <div>
          <h2 className={`${DISPLAY} text-2xl`}>Start on Free.</h2>
          <p className="mt-2 max-w-md text-[15px] leading-relaxed text-site-muted">
            Open the console, send the projector its link, and put a verse on the wall. Move to Pro the week you run
            out of room.
          </p>
        </div>

        <Link
          href="/login"
          className="shrink-0 rounded-studio bg-site-ink px-6 py-3 text-sm font-medium text-white transition-colors
            duration-150 hover:bg-site-ink/85"
        >
          Open the console
        </Link>
      </section>
    </main>
  );
}
