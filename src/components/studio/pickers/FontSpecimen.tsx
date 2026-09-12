'use client';

import { cn } from '@/lib/cn';
import { fontStyleOf, type CustomFont } from '@/lib/projector/fonts';
import type { Lang } from '@/lib/types';

/**
 * A line of each script, so a face that cannot draw one shows it here rather
 * than on the wall. Georgian is not a given: most of the faces on offer are
 * Latin and Cyrillic only, and an operator running a Georgian service needs to
 * see the tofu before the service, not during it.
 */
export const SAMPLE: Partial<Record<Lang, string>> = {
  // Modern Georgian, as the 2015 revision has it — not the old `რამეთუ ესრეთ
  // შეიყუარა ღმერთმან`, which is a different century's spelling and reads as
  // one to anybody in the room.
  geo: 'რადგან ისე შეიყვარა ღმერთმა ქვეყნიერება',
  eng: 'For God so loved the world',
  ru: 'Ибо так возлюбил Бог мир',
  gr: 'Οὕτως γὰρ ἠγάπησεν ὁ Θεὸς',
  ae: 'لِأَنَّهُ هَكَذَا أَحَبَّ ٱللهُ',
  la: 'Sic enim dilexit Deus mundum',
};

export const FALLBACK_SAMPLE = 'For God so loved the world';

/**
 * One face, drawn in itself, in each language the operator has armed.
 *
 * Shared by the Fonts tab, which lists the library, and by the picker that
 * chooses from it — the same specimen answering the same question in both,
 * rather than a list of names in one and a list of faces in the other.
 */
export const FontSpecimen = ({
  value,
  fonts,
  langs,
  size = 'base',
}: {
  value: string;
  fonts: CustomFont[];
  langs: Lang[];
  /** Smaller inside a dropdown row, where a dozen of them are stacked. */
  size?: 'base' | 'sm';
}) => {
  const type = fontStyleOf(value, fonts);

  return (
    <div
      className={cn('min-w-0 space-y-0.5', type.className)}
      style={type.style ? { fontFamily: type.style } : undefined}
    >
      {(langs.length ? langs : (['eng'] as Lang[])).map(lang => (
        <p
          key={lang}
          className={cn('truncate leading-snug text-studio-text', size === 'sm' ? 'text-sm' : 'text-base')}
        >
          {SAMPLE[lang] ?? FALLBACK_SAMPLE}
        </p>
      ))}
    </div>
  );
};
