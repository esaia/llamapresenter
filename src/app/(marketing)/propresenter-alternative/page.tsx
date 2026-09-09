import Link from 'next/link';
import { Fragment } from 'react';

import { Art } from '@/components/marketing/Art';
import { CompareScene } from '@/components/marketing/CompareScene';
import { plansFor, type Plan, type PlanId } from '@/lib/billing/plans';
import { claimedSpots } from '@/lib/billing/seats';

/* The rounded display face the brand is drawn in, as on the rest of the site. */
const DISPLAY = 'font-valera tracking-tight text-site-ink';

export const metadata = {
  title: 'LlamaPresenter vs ProPresenter',
  description:
    'A browser-based ProPresenter alternative for churches. Nothing to install, every output is a link, '
    + 'scripture in several languages at once, and your ProPresenter songs come with you. Free to start.',
  alternates: { canonical: '/propresenter-alternative' },
};

/**
 * The two names, drawn the same way wherever the page sets them against each
 * other. Ours takes the accent; theirs takes the paper — the point of the page
 * is the difference between the columns, not a colour saying who should win.
 */
const OURS = 'LlamaPresenter';
const THEIRS = 'ProPresenter';

/** A tick, for a row where the answer really is yes. Drawn, not a font glyph. */
const Tick = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 16 16" aria-hidden focusable="false" className={className ?? 'size-3.5 shrink-0'}>
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

/**
 * The table, row by row.
 *
 * Written as sentences rather than ticks in both columns, because a tick in one
 * column and a blank in the other is an argument, and most of these rows are
 * genuinely a difference in shape rather than a thing one of us cannot do. The
 * ProPresenter column describes a native desktop app of the kind their own
 * documentation describes; where a number would date badly — what a licence
 * costs this year — the cell sends the reader to look rather than guessing.
 */
const comparison = (PLANS: Record<PlanId, Plan>): { group: string; rows: { label: string; theirs: string; ours: string }[] }[] => [
  {
    group: 'Getting it running',
    rows: [
      {
        label: 'What you install',
        theirs: 'A desktop application, downloaded and installed on each machine that runs it, and updated there.',
        ours: 'Nothing. It is a web address. The machine needs a modern browser and no admin rights.',
      },
      {
        label: 'What it runs on',
        theirs: 'macOS and Windows.',
        ours: 'Any recent browser — Windows, macOS, Linux, ChromeOS, and a phone or tablet for the remote.',
      },
      {
        label: 'Setting up a second computer',
        theirs: 'Install it again, and licence that machine too.',
        ours: 'Open the same session in a browser tab. Two operators can sit on the same live slide.',
      },
      {
        label: 'When something changes',
        theirs: 'You download the new version when it suits your team.',
        ours: 'The tab is always the current version — and never mid-service, because it loads at open.',
      },
    ],
  },
  {
    group: 'The screens',
    rows: [
      {
        label: 'How the projector is fed',
        theirs: 'A second video output of the presenting machine, or a video-over-network feed on the same network.',
        ours: 'A link. You open it on whatever computer or stick is wired to the projector, in that room or another.',
      },
      {
        label: 'Stage display',
        theirs: 'Yes — the slide now, the next one, clocks and timers, on its own output.',
        ours: 'Yes — the same, on its own link. No account on that machine either.',
      },
      {
        label: 'Livestream overlay',
        theirs: 'Yes, via an alpha-keyed output your switcher or streaming software takes.',
        ours: 'Yes — a transparent lower third you paste into OBS, vMix or any other tool as a browser source.',
      },
      {
        label: 'How many screens',
        theirs: 'As many as the machine has outputs, and as its licence tier allows.',
        ours: 'As many as you can open. Every output is a link, and a link costs nothing.',
      },
      {
        label: 'Running it from the room',
        theirs: 'Its own remote app, on the same network as the presenting machine.',
        ours: 'Your phone browser, on the same link. Nothing to pair and nothing to install.',
      },
    ],
  },
  {
    group: 'Scripture and songs',
    rows: [
      {
        label: 'Bible translations',
        theirs: 'Bibles are added to the app, some free and some bought.',
        ours: 'Every translation we hold is there on the free plan, whole, with nothing to add or buy.',
      },
      {
        label: 'More than one language at once',
        theirs: 'Possible, by building the slide that way.',
        ours: 'Built in. Arm the languages you want and every verse comes out stacked on one slide.',
      },
      {
        label: 'Your existing song library',
        theirs: 'Lives in its documents and bundles.',
        ours: 'Drop a ProPresenter 7 .pro or .proBundle file on the console and the lyrics come across.',
      },
      {
        label: 'Backgrounds and music',
        theirs: 'Files on that machine.',
        ours: 'Files on that machine too — held in the browser, never uploaded to us.',
      },
    ],
  },
  {
    group: 'What it costs',
    rows: [
      {
        label: 'To start',
        theirs: 'A paid licence, per computer — see their site for this year’s tiers and prices.',
        ours: `${PLANS.free.price}. No card, no trial clock, and no watermark on the wall.`,
      },
      {
        label: 'To run a full service',
        theirs: 'The licence tier that covers the outputs and campuses you need.',
        ours: `${PLANS.pro.price} ${PLANS.pro.cadence} lifts the ceilings on songs, music and templates. Nothing else changes.`,
      },
      {
        label: 'If you stop paying',
        theirs: 'The version you bought keeps working.',
        ours: 'The account becomes a free one. Nothing you made is deleted — a ceiling only refuses something new.',
      },
    ],
  },
];

/** The three things a reader wants before they scroll. */
const HEADLINES = [
  {
    title: 'Nothing to install',
    body:
      'No download, no admin password, no version to keep in step across the booth machine and the laptop in the '
      + 'office. The console is a browser tab.',
  },
  {
    title: 'Every screen is a link',
    body:
      'The projector, the stage display and the stream overlay each open at their own address, on whatever machine '
      + 'is wired to them — and none of them signs in.',
  },
  {
    title: 'Free is a real plan',
    body:
      'The whole Bible, all three outputs and the stage display cost nothing, with no clock on them. Pro lifts the '
      + 'ceilings for teams running songs and music every week.',
  },
];

/** Where the honest answer is "use theirs". */
const THEIRS_IS_BETTER = [
  'Your service runs without reliable internet. A native app on a machine in the booth does not care about the '
    + 'building’s wifi; a browser tab does.',
  'You build heavy productions — layered media, motion backgrounds cued to the second, props and masks, a video '
    + 'pipeline that other gear on the network subscribes to.',
  'You drive presentation from a lighting or playback desk over MIDI, timecode or the show-control gear that lives '
    + 'in a large auditorium.',
  'Your team already knows it, the licences are bought, and Sunday is not asking for anything it cannot do.',
];

const QUESTIONS = [
  {
    q: 'Can I bring my songs over?',
    a: 'Yes. Drop a ProPresenter 7 document or bundle on the console and we read the lyrics out of it, slide by '
      + 'slide, and make songs of them. It is the words we take, not the layout — the look comes from your template '
      + 'here. If a bundle carries more songs than your plan holds, you pick the ones you are singing rather than '
      + 'being refused the file.',
  },
  {
    q: 'Do I have to replace ProPresenter to try this?',
    a: 'No, and most churches should not start by trying. Open the console on a laptop, send the projector its link, '
      + 'and run one midweek service on it. Nothing has been uninstalled and nothing has been paid for.',
  },
  {
    q: 'What happens if the internet drops mid-service?',
    a: 'The screens keep showing whatever slide they are on — they do not go blank. What you lose until it comes '
      + 'back is the ability to change it. If your building’s connection is genuinely unreliable, this is the honest '
      + 'reason to stay on a native app.',
  },
  {
    q: 'Does the projector machine need an account?',
    a: 'No. Every output is an unguessable link, and whoever opens it sees that session and nothing else. Only the '
      + 'person running the console signs in.',
  },
  {
    q: 'Where do my backgrounds and music live?',
    a: 'On the machine running the console, held by the browser. We keep the names and settings, not the files — '
      + 'which is why they cost you nothing, and why you copy them over when you move to a different computer.',
  },
  {
    q: 'Is this made by ProPresenter?',
    a: 'No. LlamaPresenter is a separate product, and ProPresenter is a trademark of its own owner. We read their '
      + 'song files because churches asked us to, not because there is any arrangement between us.',
  },
];

export const revalidate = 60;

export default async function ProPresenterAlternativePage() {
  const PLANS = plansFor(await claimedSpots());
  const COMPARISON = comparison(PLANS);

  return (
    <main>
      {/* ------------------------------------------------------------- hero */}
      <section className="mx-auto max-w-7xl px-6 pt-10 pb-8 sm:pt-14">
        <p className="text-sm font-medium tracking-wide text-site-faint uppercase">
          {OURS} vs {THEIRS}
        </p>

        <div className="mt-5 max-w-3xl">
          <div>
            <h1 className={`${DISPLAY} text-[clamp(2.2rem,4.4vw,3.4rem)] leading-[1.05]`}>
              A church presenter that{' '}
              <span className="relative inline-block">
                <span
                  aria-hidden
                  className="absolute inset-x-[-0.08em] bottom-[0.06em] h-[0.38em] -rotate-[0.7deg]
                    rounded-[2px] bg-site-accent/60"
                />
                <span className="relative">nobody installs</span>
              </span>
            </h1>

            <div className="mt-7 h-1 w-16 rounded-full bg-site-accent" />

            <p className="mt-7 max-w-[56ch] text-lg leading-relaxed text-site-muted">
              {THEIRS} is a fine piece of software, and this page is not going to pretend otherwise. It is also an
              application you install, licence and update on every machine that runs it. {OURS} is the same Sunday —
              scripture, lyrics, the stage display and the stream overlay — with a browser tab where that machine used
              to be.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                href="/login"
                className="rounded-studio bg-site-accent px-6 py-3.5 text-[17px] font-medium text-site-onaccent
                  shadow-sm transition-colors duration-150 hover:bg-site-accent/85"
              >
                Try it free in the browser
              </Link>

              <Link
                href="#table"
                className="rounded-studio border border-site-rule px-6 py-3.5 text-[17px] text-site-ink
                  transition-colors duration-150 hover:bg-site-band"
              >
                See the two side by side
              </Link>
            </div>

            <p className="mt-4 text-sm text-site-faint">No credit card. Nothing to uninstall if you change your mind.</p>
          </div>
        </div>

        {/* The banner gets the full width rather than a column beside the
            headline: the argument is two machines set against each other, and
            at half the page neither screen can be read. */}
        <div className="mt-12">
          <CompareScene />

          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-site-faint">
            On the right, an application of the kind {THEIRS} is: installed on a machine, licensed to it, and updated
            there. The screen is our own drawing of what that asks of you rather than any screenshot of theirs.
          </p>
        </div>
      </section>

      {/* ------------------------------------------------------ short version */}
      <section className="border-y border-site-rule bg-site-band">
        <div className="mx-auto grid max-w-7xl gap-6 px-6 py-14 sm:py-16 md:grid-cols-3">
          {HEADLINES.map(item => (
            <div key={item.title} className="rounded-studio-lg border border-site-rule bg-site-bg p-6">
              <h2 className={`${DISPLAY} text-xl`}>{item.title}</h2>
              <p className="mt-3 text-[15px] leading-relaxed text-site-muted">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* -------------------------------------------------------------- table */}
      {/* Both columns in sentences. A tick against a blank would settle every
          row in our favour and tell the reader nothing about the row where the
          difference is a shape rather than a shortfall. */}
      <section id="table" className="mx-auto max-w-7xl scroll-mt-20 px-6 py-16 sm:py-24">
        <h2 className={`${DISPLAY} text-3xl leading-[1.1] sm:text-4xl`}>The two, side by side</h2>
        <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-site-muted">
          The differences worth knowing before a Sunday, in the order you would meet them: setting it up, getting it
          onto the screens, what goes on those screens, and what it costs.
        </p>

        {/* The whole table on one sheet of paper, rather than a band behind
            our column: a white stripe running the height of the page reads as
            something broken, and the column is already told apart by the tick
            beside every line of it. */}
        <div className="mt-10 overflow-x-auto rounded-studio-lg border border-site-rule bg-site-surface px-5 py-1 sm:px-8">
          <table className="w-full min-w-3xl border-collapse text-left align-top">
            <caption className="sr-only">
              {THEIRS} compared with {OURS}, row by row
            </caption>

            <thead>
              <tr>
                <th className="w-[22%] py-4 pr-6 text-left text-sm font-normal text-site-faint">
                  <span className="sr-only">What is being compared</span>
                </th>

                <th scope="col" className="w-[39%] px-6 py-4 text-left text-[15px] font-semibold text-site-muted">
                  {THEIRS}
                </th>

                <th scope="col" className="w-[39%] px-6 py-4 text-left text-[15px] font-semibold text-site-ink">
                  <span className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-site-accent" />
                    {OURS}
                  </span>
                </th>
              </tr>
            </thead>

            <tbody>
              {COMPARISON.map(section => (
                <Fragment key={section.group}>
                  <tr>
                    <th
                      scope="colgroup"
                      className="border-t border-site-rule pt-8 pb-2 text-left text-[11px] font-semibold
                        tracking-wider text-site-faint uppercase"
                    >
                      {section.group}
                    </th>
                    <td className="border-t border-site-rule" />
                    <td className="border-t border-site-rule" />
                  </tr>

                  {/* One rule per group, none between rows: every row here is a
                      pair of paragraphs with its own name in the margin, and a
                      hairline under each of them turned the table into a grid
                      of boxes to read past. */}
                  {section.rows.map(row => (
                    <tr key={row.label} className="align-top">
                      <th scope="row" className="py-5 pr-6 text-left text-[15px] font-medium text-site-ink">
                        {row.label}
                      </th>

                      <td className="px-6 py-5 text-[15px] leading-relaxed text-site-muted">{row.theirs}</td>

                      <td className="px-6 py-5 text-[15px] leading-relaxed text-site-ink">
                        <span className="flex gap-2.5">
                          <Tick className="mt-[6px] size-3.5 shrink-0 text-site-ink" />
                          <span>{row.ours}</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </Fragment>
              ))}

            </tbody>
          </table>
        </div>

        <p className="mt-6 max-w-2xl text-sm leading-relaxed text-site-faint">
          The right-hand column is what this app does today. The left is a fair reading of what a native desktop
          presenter of {THEIRS}’ kind does, taken from their own material — if we have something wrong there, write to
          us and we will correct it.
        </p>
      </section>

      {/* ---------------------------------------------------------- the detail */}
      <Detail
        title="The booth machine stops being special"
        visual={
          <Art
            src="/images/features/outputs.png"
            alt="One session feeding a stage display, a projector slide and a transparent stream overlay, each at its own link"
          />
        }
      >
        <p>
          With a desktop presenter, one computer is the service: it holds the licence, the files and every video
          output, and everything else in the room is wired back to it.
        </p>
        <p>
          Here the session is the service, and the screens are readers of it. The projector opens one link, the stage
          display another, and OBS, vMix or whatever you stream with takes a third as a browser source. They can be
          three machines, or one machine with three windows, and none of them needs an account or a copy of your
          media.
        </p>
      </Detail>

      <Detail
        flip
        title="Your ProPresenter songs come with you"
        visual={
          <Art
            src="/images/features/template-editor.png"
            alt="The template editor with a lyric text box selected and its size, case, colour and outline in the panel beside it"
          />
        }
      >
        <p>
          Drop a <code className="rounded bg-site-band px-1.5 py-0.5 text-[0.9em]">.pro</code> file or a whole{' '}
          <code className="rounded bg-site-band px-1.5 py-0.5 text-[0.9em]">.proBundle</code> on the console and we
          read the lyrics out of it in slide order. Two hundred songs is an ordinary bundle; if that is more than your
          plan holds, you tick the ones you are singing rather than being handed a refusal.
        </p>
        <p>
          We take the words, not the layout — the look comes from a template here, which is the part you were going to
          want to change anyway.
        </p>
      </Detail>

      <Detail
        title="Two languages on the wall, without building the slide twice"
        visual={
          <Art
            src="/images/features/languages.png"
            alt="A slide carrying the same verse in Georgian and English, beside the panel that arms each language"
          />
        }
      >
        <p>
          Arm the languages your congregation reads and every verse you send comes out stacked on one slide, in the
          order you set, with the projector and the stream agreeing about it.
        </p>
        <p>
          Nothing is duplicated and nothing is pasted: it is the same passage, read out of our own copy of each
          translation, so turning a language off mid-service is one click rather than a different set of slides.
        </p>
      </Detail>

      <Detail
        flip
        title="The platform sees what it needs. The room sees the verse."
        visual={
          <Art
            src="/images/features/stage-timer.png"
            alt="The stage display showing the current verse, the next one, the clock, the running order and a countdown"
          />
        }
      >
        <p>
          The stage display carries the slide on screen now, the one coming next, the clock, the running order and a
          countdown the speaker can read from the platform — or just the countdown, when that is all they want.
        </p>
        <p>
          It is a link like the others, so the screen at the front of the platform is a cheap stick or an old laptop
          rather than another licensed seat.
        </p>
      </Detail>

      <Detail
        title="Run it from where you are standing"
        visual={
          <Art
            src="/images/features/remote-phone.webp"
            alt="The same session open on a laptop and on a phone, the same card selected on both"
          />
        }
      >
        <p>
          Open the session on your phone and you have the console: move through the slides, change what is showing,
          fire a name card. There is no remote app to install and nothing to pair — it is the same address.
        </p>
        <p>
          A second person can open it too, on their own laptop, and both of you see the same live slide.
        </p>
      </Detail>

      {/* ------------------------------------------------- where theirs is better */}
      {/* On a page with our name at the top, the section that costs us something
          is the one that makes the rest of it worth reading. */}
      <section className="border-y border-site-rule bg-site-band">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 sm:py-24 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <div>
            <h2 className={`${DISPLAY} text-3xl leading-[1.1] sm:text-4xl`}>When to stay with {THEIRS}</h2>
            <p className="mt-5 max-w-prose text-[17px] leading-relaxed text-site-muted">
              We would rather you read this here than find it out on a Sunday. {THEIRS} has had two decades to grow a
              production toolkit, and there are rooms it fits and we do not.
            </p>
          </div>

          <ul className="space-y-4">
            {THEIRS_IS_BETTER.map(item => (
              <li
                key={item}
                className="rounded-studio-lg border border-site-rule bg-site-bg p-5 text-[16px] leading-relaxed
                  text-site-muted"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* --------------------------------------------------------- questions */}
      <section className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
        <h2 className={`${DISPLAY} text-3xl leading-[1.1] sm:text-4xl`}>Questions about switching</h2>

        <div className="mt-12 gap-x-14 sm:columns-2">
          {QUESTIONS.map(item => (
            <div key={item.q} className="mb-9 break-inside-avoid">
              <h3 className="text-[19px] leading-snug font-medium text-site-ink">{item.q}</h3>
              <p className="mt-2.5 text-[16px] leading-relaxed text-site-muted">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* -------------------------------------------------------- last word */}
      <section className="bg-studio-bg">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-8 px-6 py-20 sm:py-24 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-valera text-3xl leading-[1.1] tracking-tight text-studio-text sm:text-4xl">
              Try it on a midweek service.
            </h2>
            <p className="mt-4 max-w-md text-[17px] leading-relaxed text-studio-muted">
              Nothing to install and nothing to cancel. Open the console, send the projector its link, and put a verse
              on the wall — {THEIRS} is still sitting there on Sunday if it does not suit you.
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <Link
              href="/login"
              className="rounded-studio bg-studio-accent px-6 py-3 font-medium text-studio-onaccent
                transition-colors duration-150 hover:bg-studio-accent/85"
            >
              Start free
            </Link>

            <Link
              href="/pricing"
              className="rounded-studio border border-studio-border px-6 py-3 font-medium text-studio-text
                transition-colors duration-150 hover:bg-studio-panel"
            >
              See the plans
            </Link>
          </div>
        </div>
      </section>

      {/* The one line of small print the page owes anybody: whose name that is. */}
      <p className="mx-auto max-w-7xl px-6 pt-10 pb-12 text-sm leading-relaxed text-site-faint">
        {THEIRS} is a trademark of Renewed Vision, LLC. {OURS} is not affiliated with, endorsed by or sponsored by
        Renewed Vision. Product names are used here only to say which product we are comparing ourselves with.
      </p>
    </main>
  );
}

/** A claim on one side, a screen of the app on the other. */
const Detail = ({
  title,
  children,
  visual,
  flip,
}: {
  title: string;
  children: React.ReactNode;
  visual: React.ReactNode;
  flip?: boolean;
}) => (
  // Half the padding a standalone section carries: two of these meet, so the
  // gap between one and the next is twice whatever is set here.
  <section className="mx-auto max-w-7xl px-6 py-8 sm:py-12">
    <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
      <div className={flip ? 'lg:order-last' : undefined}>
        <h2 className={`${DISPLAY} max-w-md text-3xl leading-[1.1] sm:text-4xl`}>{title}</h2>
        <div className="mt-5 max-w-prose space-y-4 text-[17px] leading-relaxed text-site-muted">{children}</div>
      </div>
      <div>{visual}</div>
    </div>
  </section>
);
