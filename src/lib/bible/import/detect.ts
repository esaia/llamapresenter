import { rootOf, scanXml } from '@/lib/bible/import/xml';
import type { BibleFormat } from '@/lib/bible/import/types';

/**
 * Which of the five this file is, from the element it opens with.
 *
 * The root separates four of them outright. The fifth is the split inside
 * `<bible>`: OpenSong writes the book out (`<b n="Genesis">`) and Beblia
 * numbers it (`<b n="1">`), which is the only difference between them and is
 * why one reader covers both — the format is a label on the row, not a
 * different code path.
 */
export const detectFormat = (source: string): BibleFormat | null => {
  const root = rootOf(source);

  if (root === 'xmlbible' || root === 'x') return 'zefania';
  if (root === 'usx') return 'usx';
  if (root === 'osis' || root === 'osistext') return 'osis';
  if (root !== 'bible' && root !== 'bibletext') return null;

  for (const event of scanXml(source)) {
    if (event.kind !== 'open') continue;
    if (event.name !== 'b' && event.name !== 'book') continue;

    // OpenSong writes `n="Genesis"`; Beblia numbers it, in `n` or in `number`.
    const named = event.attrs.n ?? event.attrs.number ?? event.attrs.name ?? '';

    return /^\d+$/.test(named.trim()) ? 'beblia' : 'opensong';
  }

  return 'opensong';
};
