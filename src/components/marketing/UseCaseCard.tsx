import Link from 'next/link';

import type { UseCase, UseCaseIcon } from '@/lib/marketing/useCases';

/**
 * The glyph on a use-case card.
 *
 * Drawn rather than photographed: nine stock pictures of church tech would be
 * nine strangers' buildings, and the site has never used a photograph it did
 * not take. One stroke weight, one 24-unit box, `currentColor` throughout.
 */
const Glyph = ({ icon }: { icon: UseCaseIcon }) => {
  const paths: Record<UseCaseIcon, string> = {
    languages: 'M4 7h9M8.5 5v2M11 7c0 4-3.5 7-7 7M6 10.5c1.6 2 3.6 3 5.5 3.5M13.5 20l4-9 4 9M15 17.5h5',
    book: 'M5 4.5h6a2 2 0 0 1 2 2V19a2 2 0 0 0-2-1.6H5zM19 4.5h-6a2 2 0 0 0-2 2V19a2 2 0 0 1 2-1.6h6z',
    lyrics: 'M9 18V6.5l10-2V16M9 18a2.2 2.2 0 1 1-4.4 0A2.2 2.2 0 0 1 9 18zM19 16a2.2 2.2 0 1 1-4.4 0 2.2 2.2 0 0 1 4.4 0z',
    stream: 'M12 12h.01M8.5 8.5a5 5 0 0 0 0 7M15.5 15.5a5 5 0 0 0 0-7M6 6a8.5 8.5 0 0 0 0 12M18 18a8.5 8.5 0 0 0 0-12',
    stage: 'M3.5 5.5h17v11h-17zM9 20h6M12 16.5V20M7 9.5h6M7 12.5h4',
    timer: 'M12 21a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM12 9v4l2.5 2M9.5 3h5',
    lower3rd: 'M3.5 5.5h17v13h-17zM6.5 14.5h8M6.5 17h5',
    plant: 'M12 21v-7M12 14c0-3 2-5.5 5.5-6 0 3.5-2 6-5.5 6zM12 16c0-2.6-1.8-4.8-5-5.2C7 14 8.8 16 12 16zM8 21h8',
    team: 'M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM3.5 19.5c0-3 2.5-5 5.5-5s5.5 2 5.5 5M16 6.2a3 3 0 0 1 0 5.6M17.5 14.9c2 .7 3.5 2.4 3.5 4.6',
  };

  return (
    <svg viewBox="0 0 24 24" aria-hidden focusable="false" className="size-7">
      <path
        d={paths[icon]}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

/**
 * One use case, as a link.
 *
 * The glyph sits on a band of its own on the left, the way the card on a
 * comparison page carries its screenshot: the row of cards has to be readable
 * as a list of jobs before any of the words are read.
 */
export const UseCaseCard = ({ useCase }: { useCase: UseCase }) => (
  <Link
    href={`/use-cases/${useCase.slug}`}
    className="group flex overflow-hidden rounded-studio-lg border border-site-rule bg-site-surface
      transition-colors duration-150 hover:border-site-ink/25"
  >
    <div className="flex w-16 shrink-0 items-center justify-center bg-site-accent/25 text-site-ink sm:w-20">
      <Glyph icon={useCase.icon} />
    </div>

    <div className="p-5 sm:p-6">
      <h3 className="flex items-center gap-2 font-valera text-lg tracking-tight text-site-ink">
        {useCase.name}
        <span aria-hidden className="text-site-faint transition-transform group-hover:translate-x-0.5">→</span>
      </h3>
      <p className="mt-2 text-[15px] leading-relaxed text-site-muted">{useCase.card}</p>
    </div>
  </Link>
);
