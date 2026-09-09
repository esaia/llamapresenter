import Image from 'next/image';
import Link from 'next/link';
import { Fragment } from 'react';

import { Art } from '@/components/marketing/Art';
import { plansFor, type Plan, type PlanId } from '@/lib/billing/plans';
import { claimedSpots } from '@/lib/billing/seats';

/* The rounded display face the brand is drawn in, as on the rest of the site. */
const DISPLAY = 'font-valera tracking-tight text-site-ink';

export const metadata = {
  title: 'LlamaPresenter vs ProPresenter',
  description:
    'Modern church presentation software with no install required. Bible verses in any language, side by side, song lyrics, '
    + 'stage timers and lower thirds from any web browser. A ProPresenter alternative that is free to start.',
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
        label: 'Installation',
        theirs: 'A heavy desktop app, downloaded and installed on every machine that runs it, and licensed there.',
        ours: '100% web based. It runs in any modern browser, with nothing to download and no admin rights.',
      },
      {
        label: 'Remote control',
        theirs: 'Its own remote app, installed on the phone and on the same network as the presenting machine.',
        ours: 'Control it from any phone browser, on the same web link. Nothing to install and nothing to pair.',
      },
    ],
  },
  {
    group: 'The screens',
    rows: [
      {
        label: 'Display outputs',
        theirs: 'Limited by the physical video outputs of the presenting machine, or a video feed over the network.',
        ours: 'Unlimited web outputs, each at its own URL — projector, stage display and lower third.',
      },
      {
        label: 'Stage timer and clocks',
        theirs: 'Built-in countdowns and clocks, carried on the stage display.',
        ours: 'Advanced timer controls of the kind a dedicated timer app gives you, on a display feed of their own.',
      },
      {
        label: 'Livestream overlay',
        theirs: 'An alpha-keyed video output or a network video feed, taken by your switcher or streaming software.',
        ours: 'A transparent browser source you paste straight into OBS or vMix. No capture hardware in between.',
      },
    ],
  },
  {
    group: 'Scripture, songs and looks',
    rows: [
      {
        label: 'Multi-language scripture',
        theirs: 'Set up by hand, slide by slide.',
        ours: 'Built in. Arm your languages and every verse comes out side by side on one slide.',
      },
      {
        label: 'A Bible in your own language',
        theirs: 'Buy the module, or find a file and hope it imports.',
        ours: 'Pick it from a public archive inside the console. Over a thousand Bibles, hundreds of languages, '
          + 'nothing to download.',
      },
      {
        label: 'Template customization',
        theirs: 'Themes and templates built in the app, on that machine.',
        ours: 'A drag-and-drop template editor for scripture and lyrics, in the browser.',
      },
    ],
  },
  {
    group: 'What it costs',
    rows: [
      {
        label: 'Pricing model',
        theirs: '$29 a month for one seat, and a seat is a computer that puts something on a screen. A campus '
          + 'licence is $59 a month, and four seats or more come down to $19 each.',
        ours: `A generous free plan, and one flexible subscription at ${PLANS.pro.price} ${PLANS.pro.cadence} when `
          + 'your church outgrows it.',
      },
    ],
  },
];

/** The three things a reader wants before they scroll. */
const HEADLINES = [
  {
    title: '100% web-based, zero install',
    body:
      'Run your entire Sunday service from a browser tab. No bulky desktop app, no licence to activate, and no '
      + 'software update waiting for you right before the service starts.',
  },
  {
    title: 'Multi-screen and remote control',
    body:
      'Send distinct feeds to your projector, your stage display and your livestream lower third. Control all of '
      + 'them from a desktop or from your phone.',
  },
  {
    title: 'Fully custom template builder',
    body:
      'Design your own templates for Bible verses and song lyrics. Fonts, backgrounds and layout are yours, on the '
      + 'main screens and on the stream overlay alike.',
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

        {/* Headline on the left, the two machines on the right. The banner
            used to run the full width under the text, which left the fold as a
            column of words with nothing beside it — and the whole argument of
            the page is the pair of screens, so it belongs where the reader
            already is. The picture column is given the larger share: it is a
            wide artboard, and at half the page neither laptop reads. */}
        <div className="mt-5 grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-12">
          <div>
            <h1 className={`${DISPLAY} text-[clamp(2.2rem,4.4vw,3.4rem)] leading-[1.05]`}>
              Modern church presentation software —{' '}
              <span className="relative inline-block">
                <span
                  aria-hidden
                  className="absolute inset-x-[-0.08em] bottom-[0.06em] h-[0.38em] -rotate-[0.7deg]
                    rounded-[2px] bg-site-accent/60"
                />
                <span className="relative">no install required</span>
              </span>
            </h1>

            <div className="mt-7 h-1 w-16 rounded-full bg-site-accent" />

            <p className="mt-7 max-w-[56ch] text-lg leading-relaxed text-site-muted">
              Present dual-language Bible verses, song lyrics, stage timers and lower thirds straight from any web
              browser.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                href="/login"
                className="rounded-studio bg-site-accent px-6 py-3.5 text-[17px] font-medium text-site-onaccent
                  shadow-sm transition-colors duration-150 hover:bg-site-accent/85"
              >
                Start free in browser
              </Link>

              <Link
                href="#table"
                className="rounded-studio border border-site-rule px-6 py-3.5 text-[17px] text-site-ink
                  transition-colors duration-150 hover:bg-site-band"
              >
                Compare with {THEIRS}
              </Link>
            </div>

            <p className="mt-4 text-sm text-site-faint">Zero setup. No app downloads. Works on any device.</p>
          </div>

          {/* Pulled out to the section's own gutter on a wide screen, so the
              artboard finishes at the edge of the page rather than inside it. */}
          <div className="lg:-mr-6">
            <Image
              src="/images/compare-propresenter.webp"
              alt={`The ${OURS} console open in a browser on one laptop, with ${THEIRS} running on a second laptop `
                + 'beside it'}
              width={1919}
              height={690}
              sizes="(min-width: 1024px) 52rem, 100vw"
              className="h-auto w-full"
              priority
            />
          </div>
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
        <h2 className={`${DISPLAY} text-3xl leading-[1.1] sm:text-4xl`}>
          {THEIRS} vs {OURS}
        </h2>
        <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-site-muted">
          Feature by feature, in the order a church tech team meets them: getting it running, getting it onto the
          screens, what goes on those screens, and what it costs.
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
      </section>

      {/* ---------------------------------------------------------- the detail */}
      <Detail
        title="Multi-screen output, without a video card"
        visual={
          <Art
            src="/images/features/outputs.png"
            alt="One session feeding a stage display, a projector slide and a transparent stream overlay, each at its own link"
          />
        }
      >
        <p>
          With a desktop presenter, one computer is the service: it holds the licence, the files and every video
          output, and how many screens you can feed is a question about that machine.
        </p>
        <p>
          Here every output is a URL. The projector opens one, the stage display another, and OBS, vMix or whatever
          you stream with takes a third as a browser source. Open as many as you need, on as many machines as you
          like — none of them signs in, and none of them holds a copy of your media.
        </p>
      </Detail>

      <Detail
        flip
        title="A template builder for verses and lyrics"
        visual={
          <Art
            src="/images/features/template-editor.png"
            alt="The template editor with a lyric text box selected and its size, case, colour and outline in the panel beside it"
          />
        }
      >
        <p>
          Drag boxes onto a 16:9 frame and put the verse, the reference, the lyric or a picture where you want them.
          Fonts, colours, backgrounds and layout are yours, for the projector and for the stream overlay alike, and
          the same template comes out right on a 4K wall and in the preview beside you.
        </p>
        <p>
          It is also where your old library lands. Drop a{' '}
          <code className="rounded bg-site-band px-1.5 py-0.5 text-[0.9em]">.pro</code> file or a whole{' '}
          <code className="rounded bg-site-band px-1.5 py-0.5 text-[0.9em]">.proBundle</code> from {THEIRS} 7 on the
          console and we read the lyrics out of it in slide order — the words come across, and the look comes from
          your template here.
        </p>
      </Detail>

      <Detail
        title="Dual-language Bible verses, side by side"
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
        <p>
          Your language does not have to be one of ours. The console browses public Bible archives — over a thousand
          translations in hundreds of languages — and fetches the one you tick, with nothing to download and nothing to
          upload. It then reads exactly like the ones we ship, side by side with them on the same slide.
        </p>
      </Detail>

      <Detail
        flip
        title="A stage display and timers built for the platform"
        visual={
          <Art
            src="/images/features/stage-timer.png"
            alt="The stage display showing the current verse, the next one, the clock, the running order and a countdown"
          />
        }
      >
        <p>
          The stage display carries the slide on screen now, the one coming next, the clock, the running order and a
          countdown the speaker can read from the platform — or just the countdown, when that is all they want. Set
          up your timers for the run of the service, start and adjust them mid-service, and send a message to the
          platform without anybody in the room seeing it.
        </p>
        <p>
          It is a link like the others, so the screen at the front of the platform is a cheap stick or an old laptop
          rather than another licensed seat.
        </p>
      </Detail>

      <Detail
        title="Run it from your phone, from anywhere in the room"
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
