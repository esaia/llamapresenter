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

const FAQ = [
  {
    q: 'What is LlamaPresenter?',
    a: 'LlamaPresenter is a web-based presentation tool made for churches. Use it to show Bible verses, song lyrics, announcements, and media on your projector, stage display, and livestream.',
  },
  {
    q: 'Do I need to install anything?',
    a: 'No. LlamaPresenter runs in your web browser, so there is nothing to install. Open it on your computer and start presenting.',
  },
  {
    q: 'Can I show Bible verses in multiple languages?',
    a: 'Yes. You can display multiple languages at the same time and choose which languages appear on the screen. Turn languages on or off whenever you need.',
  },
  {
    q: 'Can I control the projector, stage, and livestream separately?',
    a: 'Yes. LlamaPresenter gives you three views: Projector, Stage, and Lower Third. Each screen can show different content while everything stays connected to the same presentation.',
  },
  {
    q: 'Can I use my phone as a remote?',
    a: 'Yes. You can control your presentation from your phone. Move between slides and change what is being shown without staying next to the main computer.',
  },
  {
    q: 'Can I create my own templates?',
    a: 'Yes. You can start with our built-in templates or create your own. Design custom templates for Bible verses and lyrics on your projector or livestream.',
  },
  {
    q: 'Does it work on Mac and Windows?',
    a: 'Yes. Because LlamaPresenter runs in a web browser, you can use it on both Mac and Windows.',
  },
  {
    q: 'Is LlamaPresenter only for large churches?',
    a: 'No. LlamaPresenter works for churches of any size. Whether you have one screen or a full setup with projector, stage display, and livestream, you can use the features you need.',
  },
  {
    q: 'Can I use LlamaPresenter for livestreams?',
    a: 'Yes. LlamaPresenter works with livestreaming tools like OBS. Simply add a Browser source in OBS and paste your LlamaPresenter stream URL. Your Bible verses, lyrics, and other content can then appear directly in your livestream.',
  },
  {
    q: 'Can I use it for song lyrics?',
    a: 'Yes. You can add your songs and display lyrics on your projector, stage display, or livestream. You can also import song lyrics from a file exported from ProPresenter, so you do not have to add all your songs again.',
  },
  {
    q: 'How does the projector know which session it belongs to?',
    a: 'Each session has its own unguessable link. Whoever opens it sees that session and nothing else — which is why the projector needs no account and no password. Treat the link the way you would a meeting link.',
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
                  Everything you need for your next service
                </h2>
                <p className="mt-5 text-[17px] leading-relaxed text-site-muted">
                  Show Bible verses, lyrics, announcements, and media across your projector, stage display, and
                  livestream. Switch languages, control your service from your phone, and create your own look with
                  flexible templates.
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
        title="One service. Every language."
        visual={
          <Art
            src="/images/features/languages.png"
            alt="A slide carrying the same verse in Georgian and English, beside the panel that arms each language and picks its translation"
          />
        }
      >
        <p>
          Choose which languages appear on the projector, stage display, or livestream and turn them on or off whenever
          you need.
        </p>
      </Feature>

      <Feature
        flip
        title="Give your team the view they need"
        visual={
          <Art
            src="/images/features/stage-timer.png"
            alt="The stage display: the verse on screen now, the one coming next, the clock, the agenda and a countdown"
          />
        }
      >
        <p>
          See the current slide, next slide, clock, agenda, and timer in Stage View. Show only the timer on your stage
          display when you need a clean view.
        </p>
      </Feature>

      <Feature
        title="Your content. Your style."
        visual={
          <Art
            src="/images/features/template-editor.png"
            alt="The template editor: a text box selected on the canvas, with its size, case, colour, alignment, outline and plate in the panel beside it"
          />
        }
      >
        <p>
          Start with beautiful ready-made templates or create your own. Design custom looks for Bible verses and lyrics
          on your projector and livestream.
        </p>
      </Feature>

      <Feature
        flip
        title="Three screens. One service."
        visual={
          <Art
            src="/images/features/outputs.png"
            alt="One link feeding the stage display, the projector slide and a stream overlay on a transparent background"
          />
        }
      >
        <p>
          Control your projector, stage display, and livestream from one place. Each screen gets exactly what it needs,
          while your team stays in sync.
        </p>
      </Feature>

      <Feature
        title="Control your service from your phone"
        visual={
          <Art
            src="/images/features/remote-phone.webp"
            alt="The lower-third panel open on a laptop and on a phone, the same card selected on both"
          />
        }
      >
        <p>
          Move through slides and control your presentation right from your phone. Stay close to the service instead of
          being tied to the computer.
        </p>
      </Feature>

      {/* ------------------------------------------------------------ price */}
      {/* The band the "what they see" section uses, so price reads as its own
          stop on the page rather than more of the paper the features sit on. */}
      <section className="border-y border-site-rule bg-site-band">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 sm:py-24 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
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
                // Both cards take a ground of their own now that the section
                // has one: on the band, a transparent card is not a card.
                className={
                  plan.id === 'pro'
                    ? 'rounded-studio-lg border border-site-ink bg-site-surface p-6 shadow-sm'
                    : 'rounded-studio-lg border border-site-rule bg-site-bg p-6'
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
      {/* Every answer open, in two columns. A dozen questions behind
          disclosure triangles is a dozen clicks to find out whether the thing
          runs on Windows — the answers are short enough to simply print. */}
      <section id="faq" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-16 sm:py-24">
        <h2 className={`${DISPLAY} text-3xl leading-[1.1] sm:text-4xl`}>Frequently asked questions</h2>

        {/* Columns rather than a grid: the questions run down one column and
            continue in the next, and the browser balances the two whatever
            length the answers are. */}
        <div className="mt-12 gap-x-14 sm:columns-2">
          {FAQ.map(item => (
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
