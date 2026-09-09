import Link from 'next/link';

import { FoundingSpots } from '@/components/marketing/FoundingSpots';
import { soldOut, tierNow } from '@/lib/billing/founding';
import { plansFor, type PlanId } from '@/lib/billing/plans';
import { claimedSpots } from '@/lib/billing/seats';
import { COMPARISON, type ComparisonRow, type PlanCell } from '@/lib/billing/table';

export const metadata = {
  title: 'Pricing',
  description:
    'Free covers the Bible, the projector, the stage and your stream. Pro costs less the earlier you join, and '
    + 'the rate you join on is yours for as long as you stay.',
};

/**
 * How stale the spot count may be.
 *
 * A minute, because this page is a shop window and not the till: the seat a
 * church is actually charged for is taken in `/api/billing/checkout`, in one
 * statement, so two visitors reading the same "3 left" cannot both be sold it.
 */
export const revalidate = 60;

/* The rounded display face the brand is drawn in, as on the rest of the site. */
const DISPLAY = 'font-valera tracking-tight text-site-ink';

/* What both cards are, minus the border and paper that tell them apart. */
const CARD = 'flex flex-col rounded-studio-lg border p-6 sm:p-8 lg:row-span-5 lg:grid lg:grid-rows-subgrid';

/** The tick beside a line a plan carries. Drawn rather than a font's glyph. */
const Tick = ({ muted = false }: { muted?: boolean }) => (
  <svg
    viewBox="0 0 16 16"
    aria-hidden
    focusable="false"
    className={`mt-[3px] size-3.5 shrink-0 ${muted ? 'text-site-faint' : 'text-site-ink'}`}
  >
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

/** The cross beside a line a plan does not carry. */
const Cross = () => (
  <svg viewBox="0 0 16 16" aria-hidden focusable="false" className="mt-[3px] size-3.5 shrink-0 text-site-faint">
    <path
      d="M4 4l8 8M12 4l-8 8"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

/**
 * A line, worded for the plan reading it.
 *
 * The count goes inside the sentence rather than in a column of its own — "up
 * to 3 languages on a slide" is the thing someone is deciding about, and a
 * bare 3 in a right-hand column makes them look back at the label to find out
 * what it counted.
 */
const wording = (row: ComparisonRow, cell: PlanCell) => {
  if (cell === false || cell === true) return { lead: '', value: '', tail: row.label };
  if (cell === 'Unlimited') return { lead: '', value: 'Unlimited', tail: ` ${row.label}` };

  // "Up to 1 sessions" is the sentence a ceiling of one writes if nobody stops
  // it, and it is the row a church on Free reads first.
  return { lead: 'Up to ', value: cell, tail: ` ${cell === '1' ? (row.one ?? row.label) : row.label}` };
};

/** One line of one plan's column. */
const Line = ({ row, plan }: { row: ComparisonRow; plan: PlanId }) => {
  const cell = row[plan];
  const has = cell !== false;
  const { lead, value, tail } = wording(row, cell);

  return (
    <li className="flex gap-2.5 py-[7px] text-[15px] leading-snug">
      {has ? <Tick muted={plan === 'free' && value === ''} /> : <Cross />}

      <span className={has ? 'text-site-ink' : 'text-site-faint line-through decoration-site-faint/60'}>
        {lead}
        {value && <span className="font-semibold">{value}</span>}
        {/* The note is a hover, not a second line: nineteen explanations printed
            under nineteen labels turned the column into an essay, and the
            reader who needs "what is a session?" is one reader in ten. */}
        {row.note
          ? (
              <span tabIndex={0} className="group/tip relative outline-none">
                <span className="border-b border-dotted border-site-faint/70">{tail}</span>

                <span
                  role="tooltip"
                  className="pointer-events-none invisible absolute bottom-full left-0 z-10 mb-2 w-64 rounded-studio
                    border border-site-rule bg-site-surface px-3 py-2 text-[13px] leading-relaxed text-site-muted
                    opacity-0 shadow-sm transition-opacity duration-150 group-hover/tip:visible
                    group-hover/tip:opacity-100 group-focus/tip:visible group-focus/tip:opacity-100"
                >
                  {row.note}
                </span>
              </span>
            )
          : tail}
      </span>
    </li>
  );
};

/** The questions, plus the one the founding rate raises. */
const foundingQuestion = (claimed: number) =>
  soldOut(claimed)
    ? {
        q: 'Why do some subscribers pay less?',
        a: 'The first fifteen signed up early, at $9 or $14, and they keep that rate. Those spots are gone.',
      }
    : {
        q: `Is the ${tierNow(claimed).price} really forever?`,
        a: 'Yes, for as long as you keep your Pro plan. Join at $9 and you pay $9 every month after that. The same '
          + 'goes for $14. What changes is the price for the next subscriber, never yours.',
      };

const QUESTIONS = [
  {
    q: 'Is Free really free?',
    a: 'Yes. There is no card required and no trial period. A church that only puts verses on the screen can run '
      + 'every service on Free and never pay us anything.',
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
    q: 'Do you carry my language?',
    a: 'We carry Georgian, English, Russian, Greek, Arabic and Latin, and every other language is a Bible you add '
      + 'yourself — the console browses public archives holding over a thousand of them and fetches the one you tick. '
      + 'A Bible you add reads exactly like ours and sits beside them on the same slide. Free covers one; Pro makes '
      + 'it unlimited.',
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

export default async function PricingPage() {
  const claimed = await claimedSpots();
  const PLANS = plansFor(claimed);
  const gone = soldOut(claimed);

  return (
    <main className="mx-auto max-w-7xl px-6 py-20 sm:py-24">
      <p className="text-sm font-medium tracking-wide text-site-faint uppercase">Pricing</p>

      <h1 className={`${DISPLAY} mt-5 text-4xl sm:text-5xl`}>
        {gone ? 'Simple pricing for your church' : 'Start early. Keep your price.'}
      </h1>

      <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-site-muted">
        {gone
          ? 'Free covers the Bible, the projector, the stage and your stream. Pro lifts the ceilings.'
          : 'LlamaPresenter is $9/month for the first 10 subscribers. After those spots are gone, the price moves to '
            + '$14 for the next 5, then $19/month after that. The price you join at stays yours as long as you keep '
            + 'your Pro plan.'}
      </p>

      <FoundingSpots claimed={claimed} />

      {/* ----------------------------------------------------- the two columns */}
      {/* One column per plan, each carrying the whole product rather than the
          half that differs. Someone deciding reads the plan they think they
          want from top to bottom; a three-column diff makes them assemble that
          answer themselves. Every line the plan does not carry is still printed,
          struck through, because what Pro adds is the thing they came to read. */}
      {/* The two cards share their rows rather than merely sitting side by
          side: Pro's blurb runs to two lines and Free's to one, which walked
          the price, the button and every heading below them out of step. A
          subgrid of five rows — name, blurb, price, button, the lines — makes
          each row as tall as the taller card needs and puts the two buttons on
          one line, which is the pair a reader is actually comparing. */}
      <div className="mt-14 grid items-start gap-6 lg:grid-cols-2 lg:grid-rows-[auto_auto_auto_auto_auto] lg:gap-y-0">
        {Object.values(PLANS).map(plan => (
          <div
            key={plan.id}
            className={
              plan.id === 'pro'
                ? `${CARD} border-site-ink bg-site-surface shadow-sm`
                : `${CARD} border-site-rule bg-site-surface/60`
            }
          >
            <h2 className={`${DISPLAY} text-xl`}>{plan.name}</h2>
            <p className="mt-2 text-sm leading-relaxed text-site-muted">{plan.blurb}</p>

            <p className="mt-6 flex items-baseline gap-2 self-end">
              <span className={`${DISPLAY} text-5xl`}>{plan.price}</span>
              <span className="text-sm text-site-faint">{plan.cadence}</span>
            </p>

            {/* Button and small print are one row, so the note under one card
                cannot push the lines below it past the other's. */}
            <div className="mt-6 self-end">
              <Link
                href={plan.cta.href}
                className={
                  plan.id === 'pro'
                    ? 'block rounded-studio bg-site-accent px-4 py-3 text-center text-sm font-medium text-site-onaccent transition-colors duration-150 hover:bg-site-accent/85'
                    : 'block rounded-studio border border-site-rule px-4 py-3 text-center text-sm text-site-ink transition-colors duration-150 hover:bg-site-band'
                }
              >
                {plan.cta.label}
              </Link>

              <p className="mt-3 text-center text-[13px] text-site-faint">
                {plan.id === 'pro' ? 'Monthly subscription. Cancel any time.' : 'No card required.'}
              </p>
            </div>

            <div className="mt-8 space-y-7">
              {COMPARISON.map(group => (
                <section key={group.title}>
                  {/* No mark on the heading. A tick against a group whose rows
                      are not all ticked says two things at once, and the rows
                      underneath are already saying the true one. */}
                  <h3 className="border-b border-site-rule pb-2 text-[15px] font-semibold text-site-ink">
                    {group.title}
                  </h3>

                  <ul className="mt-2 pl-1">
                    {group.rows.map(row => (
                      <Line key={row.label} row={row} plan={plan.id} />
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </div>
        ))}
      </div>

      <p className="mt-6 max-w-2xl text-sm leading-relaxed text-site-faint">
        Three languages on a slide is the one number Pro does not make unlimited. It is how many fit before a
        slide stops being readable from the back of the room, and not something we would charge for.
      </p>

      {/* ------------------------------------------------------------ questions */}
      <section className="mt-20">
        <h2 className={`${DISPLAY} text-2xl sm:text-3xl`}>Questions about pricing</h2>

        <div className="mt-10 gap-x-12 sm:columns-2 lg:columns-3">
          {[foundingQuestion(claimed), ...QUESTIONS].map(item => (
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
