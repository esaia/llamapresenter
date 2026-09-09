import Link from 'next/link';

import { LinkCard } from '@/components/marketing/LinkCard';
import { Marker } from '@/components/marketing/Marker';
import { SOLUTIONS } from '@/lib/marketing/solutions';

/* The rounded display face the brand is drawn in, as on the rest of the site. */
const DISPLAY = 'font-valera tracking-tight text-site-ink';

const OURS = 'LlamaPresenter';

const TITLE = 'Church Presentation Software for Every Kind of Church | LlamaPresenter';

const DESCRIPTION =
  'Browser-based church presentation software for small churches, church plants, bilingual congregations, '
  + 'multisite rooms, online church, worship teams, volunteer rotas and youth groups.';

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/solutions' },
  openGraph: {
    type: 'website',
    siteName: 'LlamaPresenter',
    url: '/solutions',
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
};

export default function SolutionsPage() {
  return (
    <main>
      {/* ------------------------------------------------------------- hero */}
      <section className="mx-auto max-w-7xl px-6 pt-10 pb-8 sm:pt-14">
        <p className="text-sm font-medium tracking-wide text-site-faint uppercase">Solutions</p>

        <h1 className={`${DISPLAY} mt-5 max-w-3xl text-[clamp(2.2rem,4.4vw,3.4rem)] leading-[1.05]`}>
          Church presentation software for{' '}
          <Marker>every church</Marker>
        </h1>

        <div className="mt-7 h-1 w-16 rounded-full bg-site-accent" />

        <div className="mt-7 grid max-w-5xl gap-6 text-[17px] leading-relaxed text-site-muted lg:grid-cols-2">
          <p>
            Every church runs a different Sunday. A church of forty in a school hall needs something different from
            a church with three rooms and a livestream.
          </p>
          <p>
            Pick the one that sounds like yours. Each page covers what you get, how a service runs, and the
            questions churches ask before they start.
          </p>
        </div>
      </section>

      {/* ------------------------------------------------------------- cards */}
      <section className="border-t border-site-rule bg-site-band">
        <div className="mx-auto max-w-7xl px-6 py-14 sm:py-20">
          <div className="grid gap-5 md:grid-cols-2">
            {SOLUTIONS.map(solution => (
              <LinkCard
                key={solution.slug}
                href={`/solutions/${solution.slug}`}
                name={solution.name}
                blurb={solution.card}
                icon={solution.icon}
              />
            ))}
          </div>

          <p className="mt-10 max-w-[62ch] text-[16px] leading-relaxed text-site-muted">
            Looking for a particular job rather than a kind of church? The{' '}
            <Link href="/use-cases" className="text-site-ink underline underline-offset-4">
              use cases
            </Link>{' '}
            cover those, and the{' '}
            <Link href="/compare" className="text-site-ink underline underline-offset-4">
              comparison
            </Link>{' '}
            puts {OURS} beside ProPresenter, EasyWorship, FreeShow and Proclaim.
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
              Nothing to install, a free plan that is not a countdown, and every screen a link.
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
