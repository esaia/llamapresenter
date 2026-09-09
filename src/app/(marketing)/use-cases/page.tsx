import Link from 'next/link';

import { Marker } from '@/components/marketing/Marker';
import { LinkCard } from '@/components/marketing/LinkCard';
import { USE_CASES } from '@/lib/marketing/useCases';

/* The rounded display face the brand is drawn in, as on the rest of the site. */
const DISPLAY = 'font-valera tracking-tight text-site-ink';

const OURS = 'LlamaPresenter';

const TITLE = 'What LlamaPresenter Is Used For | Church Presentation Software';

const DESCRIPTION =
  'What web-based worship presentation software is used for: dual language Bible verse display, worship song '
  + 'lyrics, church livestream lower thirds, stage displays, service timing and a phone remote.';

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/use-cases' },
  openGraph: {
    type: 'website',
    siteName: 'LlamaPresenter',
    url: '/use-cases',
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
};

export default function UseCasesPage() {
  return (
    <main>
      {/* ------------------------------------------------------------- hero */}
      <section className="mx-auto max-w-7xl px-6 pt-10 pb-8 sm:pt-14">
        <p className="text-sm font-medium tracking-wide text-site-faint uppercase">Use cases</p>

        <h1 className={`${DISPLAY} mt-5 max-w-3xl text-[clamp(2.2rem,4.4vw,3.4rem)] leading-[1.05]`}>
          What {OURS} is{' '}
          <Marker>used for</Marker>
        </h1>

        <div className="mt-7 h-1 w-16 rounded-full bg-site-accent" />

        <div className="mt-7 grid max-w-5xl gap-6 text-[17px] leading-relaxed text-site-muted lg:grid-cols-2">
          <p>
            It is one console and four screens, and churches point it at different problems. Some came for a second
            language on the wall, some for a stream that needed lyrics, some because the laptop in the booth
            belongs to whoever turned up.
          </p>
          <p>
            Each page below is one of those jobs: what it looks like, how a Sunday runs with it, and the questions
            churches ask before they try it.
          </p>
        </div>
      </section>

      {/* ------------------------------------------------------------- cards */}
      <section className="border-t border-site-rule bg-site-band">
        <div className="mx-auto max-w-7xl px-6 py-14 sm:py-20">
          <div className="grid gap-5 md:grid-cols-2">
            {USE_CASES.map(useCase => (
              <LinkCard
                key={useCase.slug}
                href={`/use-cases/${useCase.slug}`}
                name={useCase.name}
                blurb={useCase.card}
                icon={useCase.icon}
              />
            ))}
          </div>

          <p className="mt-10 max-w-[62ch] text-[16px] leading-relaxed text-site-muted">
            Looking for your kind of church rather than a job? The{' '}
            <Link href="/solutions" className="text-site-ink underline underline-offset-4">
              solutions
            </Link>{' '}
            pages are written that way. Weighing it against something you already run? The{' '}
            <Link href="/compare" className="text-site-ink underline underline-offset-4">
              comparison
            </Link>{' '}
            puts {OURS} beside ProPresenter, EasyWorship, FreeShow and Proclaim on one grid.
          </p>
        </div>
      </section>

      {/* -------------------------------------------------------- last word */}
      <section className="bg-studio-bg">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-8 px-6 py-20 sm:py-24 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-valera text-3xl leading-[1.1] tracking-tight text-studio-text sm:text-4xl">
              Try it on this Sunday
            </h2>
            <p className="mt-4 max-w-md text-[17px] leading-relaxed text-studio-muted">
              Bible verses, lyrics, screens, livestream and stage timer in one browser tab, on a free plan that is
              not a countdown.
            </p>
          </div>

          <div className="flex flex-col items-start gap-3">
            <Link
              href="/login"
              className="rounded-studio bg-studio-accent px-6 py-3 font-medium text-studio-onaccent
                transition-colors duration-150 hover:bg-studio-accent/85"
            >
              Start for free
            </Link>

            <p className="text-sm text-studio-muted">No credit card required</p>
          </div>
        </div>
      </section>
    </main>
  );
}
