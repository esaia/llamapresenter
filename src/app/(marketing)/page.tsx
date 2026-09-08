import Image from 'next/image';
import Link from 'next/link';

import { Frame } from '@/components/marketing/Frame';
import { HeroScene } from '@/components/marketing/HeroScene';
import { ScrollZoom } from '@/components/marketing/ScrollZoom';
import { PLANS } from '@/lib/billing/plans';

/* The two type roles for the page: the rounded display face the brand is drawn
   in, and the interface stack for everything read as a sentence. */
const DISPLAY = 'font-valera tracking-tight text-site-ink';

/**
 * The drawing beside a feature: screens of the app, arranged and annotated by
 * hand rather than screenshotted.
 *
 * Every one is the same 1000x700 artboard on a transparent ground, so they
 * share a column width and need no frame around them — the shadows and the
 * coloured card behind each are part of the picture.
 */
const Art = ({ src, alt }: { src: string; alt: string }) => (
  <Image
    src={src}
    alt={alt}
    width={1000}
    height={700}
    sizes="(min-width: 1024px) 38rem, 100vw"
    className="h-auto w-full"
  />
);

/** A feature: a paragraph on one side, a screen on the other. */
const Feature = ({
  id,
  title,
  children,
  visual,
  flip,
}: {
  id?: string;
  title: string;
  children: React.ReactNode;
  visual: React.ReactNode;
  flip?: boolean;
}) => (
  // Half the padding a standalone section carries: two of these meet, so the
  // gap between one feature and the next is twice whatever is set here.
  <section id={id} className="mx-auto max-w-7xl scroll-mt-20 px-6 py-8 sm:py-12">
    <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
      <div className={flip ? 'lg:order-last' : undefined}>
        <h2 className={`${DISPLAY} max-w-md text-3xl leading-[1.1] sm:text-4xl`}>{title}</h2>
        <div className="mt-5 max-w-prose space-y-4 text-[17px] leading-relaxed text-site-muted">{children}</div>
      </div>
      <div>{visual}</div>
    </div>
  </section>
);

const SMALL = [
  {
    title: 'Psalms line up',
    body: 'Translations disagree about where the psalms divide. Type one reference and every language on the slide lands on the verse it actually is.',
  },
  {
    title: 'Songs come across',
    body: 'Import a ProPresenter library and the lyrics arrive as slides you can step through, in the order the band plays them.',
  },
  {
    title: 'Your own typefaces',
    body: 'Paste a Google Fonts family or a link to a font file and it is on the wall. Nothing to install on the projector machine.',
  },
  {
    title: 'A screen can join late',
    body: 'A projector switched on halfway through the service opens the link and is already showing the verse the room is on.',
  },
  {
    title: 'Backgrounds stay yours',
    body: 'Your images and music live on your computer, not in our storage. The projector pulls them from you directly when it needs them.',
  },
  {
    title: 'Two clicks to black',
    body: 'Take the screen down without losing your place. The verse is still armed underneath when you bring it back.',
  },
];

const FAQ = [
  {
    q: 'Does anything need installing?',
    a: 'No. The console, the projector and the stage display are browser tabs, and the stream overlay is an OBS browser source. The machine at the back of the room needs a browser and nothing else.',
  },
  {
    q: 'How does the projector know which session it belongs to?',
    a: 'Each session has its own unguessable link. Whoever opens it sees that session and nothing else — which is why the projector needs no account and no password. Treat the link the way you would a meeting link.',
  },
  {
    q: 'Which translations can I use?',
    a: 'Six languages and seventeen translations, and any three of them can share a slide. The text comes out of our own database rather than a third-party API, so a service never depends on somebody else being up.',
  },
  {
    q: 'What happens if the internet drops mid-service?',
    a: 'Whatever is on the screens stays there. The outputs count their own clocks, so a countdown keeps running, and when the connection returns the next slide goes through as normal.',
  },
  {
    q: 'Can two people run it at once?',
    a: 'Yes. The console is a browser tab, so a second operator can open the same session on their own laptop and both see the same live slide.',
  },
];

export default function HomePage() {
  return (
    <main>
      {/* ------------------------------------------------------------- hero */}
      <section>
        <div
          className="mx-auto grid max-w-7xl items-center gap-14 px-6 pt-12 pb-8
            sm:pt-16 lg:grid-cols-[1fr_0.9fr] lg:gap-12"
        >
          <div>
            <h1 className={`${DISPLAY} text-[clamp(2.4rem,4.6vw,3.6rem)] leading-[1.0]`}>
              Simple Church{' '}
              <span className="relative inline-block">
                <span
                  aria-hidden
                  className="absolute inset-x-[-0.08em] bottom-[0.06em] h-[0.38em] -rotate-[0.7deg]
                    rounded-[2px] bg-site-accent/60"
                />
                <span className="relative">Presentation</span>
              </span>{' '}
              Software
            </h1>

            <div className="mt-7 h-1 w-16 rounded-full bg-site-accent" />

            <p className="mt-7 max-w-[54ch] text-lg leading-relaxed text-site-muted">
              Present scripture, lyrics, announcements, and media from one browser-based tool. Display verses in
              multiple languages side by side so everyone can follow along, ideal for multilingual congregations.
            </p>

            <Link
              href="/login"
              className="mt-9 flex w-full max-w-md items-center justify-center rounded-studio bg-site-accent px-6 py-4
                text-lg font-medium text-site-onaccent shadow-sm transition-transform duration-150 hover:-translate-y-px"
            >
              Try for free in the browser
            </Link>

            <p className="mt-4 text-sm text-site-faint">No credit card or signup required</p>
          </div>

          <HeroScene />
        </div>
      </section>

      {/* ------------------------------------------------- what they see */}
      <section id="room" className="mt-16 scroll-mt-20 border-y border-site-rule bg-site-band">
        {/* The console gets the whole width. It is one picture of the whole
            product, and a column of prose beside it only made it smaller —
            what a volunteer sees for an hour on a Sunday is the argument. */}
        <div className="py-16 sm:py-24">
          {/* The words go inside the zoom rather than above it: they are pinned
              with the frame as one group, and the frame grows over them. */}
          <ScrollZoom
            intro={
              <div className="mx-auto max-w-3xl px-6 text-center">
                <h2 className={`${DISPLAY} text-3xl leading-[1.1] sm:text-4xl`}>
                  Built for the person at the back of the room.
                </h2>
                <p className="mt-5 text-[17px] leading-relaxed text-site-muted">
                  Type “John 14:6-7” and it is on the wall. The whole chapter loads with it, so stepping to the next
                  verse costs nothing — no waiting, no second search, no dead air while somebody finds the passage.
                </p>
              </div>
            }
          >
            <Frame
              url="llamapresenter.com/studio"
              src="/images/console-studio.webp"
              alt="The console: the language panel on the left, Philippians and Luke broken into verse cards in the
                middle, and the live projector preview, outputs and audio playlist on the right"
              // The screenshot's own shape, so the pane crops none of it.
              paneClassName="aspect-[900/481]"
              sizes="100vw"
              className="shadow-site-frame"
            />
          </ScrollZoom>
        </div>
      </section>

      {/* --------------------------------------------------------- features */}
      <Feature
        id="languages"
        title="Several languages, stacked the way your congregation reads them."
        visual={
          <Art
            src="/images/features/languages.png"
            alt="A slide carrying the same verse in Georgian and English, beside the panel that arms each language and picks its translation"
          />
        }
      >
        <p>
          Seventeen translations across six languages, and any three of them can share a slide, in whatever order your
          congregation reads them. Each one keeps its own book names and its own verse numbering.
        </p>
        <p>
          That last part matters more than it sounds. Translations do not agree about where the psalms divide, so one
          reference can be three different verses. LlamaPresenter reconciles them, and the line on the wall is the line
          being read from the front.
        </p>
      </Feature>

      <Feature
        flip
        title="A clock the person on stage can trust."
        visual={
          <Art
            src="/images/features/stage-timer.png"
            alt="The stage display: the verse on screen now, the one coming next, the clock, the agenda and a countdown"
          />
        }
      >
        <p>
          The stage display shows what is on the screen now, what is coming next, and how long is left. Give the
          preacher five more minutes and the number changes under them without anyone waving from the back.
        </p>
        <p>
          Nothing about the countdown travels over the network second by second. Each screen counts its own, so a slow
          connection shows the same time as the console rather than drifting behind it.
        </p>
      </Feature>

      <Feature title="Or draw the slide yourself."
        visual={
          <Art
            src="/images/features/template-editor.png"
            alt="The template editor: a text box selected on the canvas, with its size, case, colour, alignment, outline and plate in the panel beside it"
          />
        }
      >
        <p>
          Eight finished layouts ship with it, and when none of them is your church, there is a canvas. Drag boxes,
          shapes and pictures where you want them, set the type, and keep as many layouts as you have Sundays that need
          one — a Christmas slide and an ordinary one, each under its own name.
        </p>
        <p>
          Text is fitted inside the box you drew rather than spilling out of it, so a long passage comes down a size and
          a short one fills the frame. The projector, the preview and the tile in your settings all run the same fit.
        </p>
      </Feature>

      <Feature
        flip
        title="One link, and the screen is in the service."
        visual={
          <Art
            src="/images/features/outputs.png"
            alt="One link feeding the stage display, the projector slide and a stream overlay on a transparent background"
          />
        }
      >
        <p>
          Send the address to the projector machine, the stage monitor and OBS — or point a phone at the code and hand
          it over. Each screen starts following the console the moment it opens, with nothing installed and nobody
          signed in.
        </p>
        <p>
          The stream overlay comes through on a transparent background, so it drops onto the camera shot as a browser
          source and nothing else in your scene has to move.
        </p>
      </Feature>

      <Feature
        title="The console fits in your pocket, too."
        visual={
          <Art
            src="/images/features/remote-phone.webp"
            alt="The lower-third panel open on a laptop and on a phone, the same card selected on both"
          />
        }
      >
        <p>
          The console is a browser tab, so a phone is another one. Open the session on it and the running order, the
          live slide and the next-verse button are under your thumb — from the front row, the sound desk, or the
          doorway you ended up standing in.
        </p>
        <p>
          Two people can hold it at once. Whoever is at the laptop and whoever is on their feet see the same order and
          the same live card, and either of them can put the next thing up.
        </p>
      </Feature>

      {/* ------------------------------------------------------- small print */}
      <section className="border-y border-site-rule bg-site-band">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
          <h2 className={`${DISPLAY} max-w-lg text-3xl leading-[1.1] sm:text-4xl`}>
            The small things a service actually turns on.
          </h2>

          <div className="mt-12 grid gap-x-12 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {SMALL.map(item => (
              <div key={item.title} className="border-t border-site-rule pt-4">
                <h3 className="text-base font-medium text-site-ink">{item.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-site-muted">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ price */}
      <section className="mx-auto max-w-7xl px-6 py-16 sm:py-24">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
          <div>
            <h2 className={`${DISPLAY} text-3xl leading-[1.1] sm:text-4xl`}>Free is a real plan.</h2>
            <p className="mt-5 max-w-prose text-[17px] leading-relaxed text-site-muted">
              A congregation putting scripture on a screen never has to pay us. Pro is for the teams running songs,
              music and their own look on top of it.
            </p>
            <Link href="/pricing" className="mt-6 inline-block text-[17px] text-site-ink underline underline-offset-4">
              Compare the two plans
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {Object.values(PLANS).map(plan => (
              <div
                key={plan.id}
                className={
                  plan.id === 'pro'
                    ? 'rounded-studio-lg border border-site-ink bg-site-surface p-6'
                    : 'rounded-studio-lg border border-site-rule p-6'
                }
              >
                <h3 className="text-sm text-site-muted">{plan.name}</h3>
                <p className="mt-3 flex items-baseline gap-2">
                  <span className={`${DISPLAY} text-4xl`}>{plan.price}</span>
                  <span className="text-sm text-site-faint">{plan.cadence}</span>
                </p>
                <ul className="mt-5 space-y-2 text-[15px] text-site-muted">
                  {plan.highlights.map(item => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------- faq */}
      <section id="faq" className="mx-auto max-w-3xl scroll-mt-20 px-6 py-16 sm:py-24">
        <h2 className={`${DISPLAY} text-3xl leading-[1.1] sm:text-4xl`}>Questions we get asked</h2>

        <div className="mt-10">
          {FAQ.map(item => (
            <details key={item.q} className="group border-t border-site-rule py-5 last:border-b">
              <summary className="flex items-start justify-between gap-6 text-[17px] text-site-ink marker:content-none">
                {item.q}
                <span
                  aria-hidden
                  className="mt-1 shrink-0 text-site-faint transition-transform duration-200 group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="mt-3 max-w-prose text-[16px] leading-relaxed text-site-muted">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* -------------------------------------------------------- last word */}
      <section className="bg-studio-bg">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-8 px-6 py-20 sm:py-24 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-valera text-3xl leading-[1.1] tracking-tight text-studio-text sm:text-4xl">
              Sunday is in six days.
            </h2>
            <p className="mt-4 max-w-md text-[17px] leading-relaxed text-studio-muted">
              Set it up in the time it takes to make coffee. Open the console, send the projector its link, and put a
              verse on the wall.
            </p>
          </div>

          <Link
            href="/login"
            className="rounded-studio bg-studio-accent px-6 py-3 font-medium text-studio-onaccent
              transition-transform duration-150 hover:-translate-y-px"
          >
            Start free
          </Link>
        </div>
      </section>
    </main>
  );
}
