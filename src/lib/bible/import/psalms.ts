import type { PsalmScheme } from '@/lib/bible/psalms';
import type { ParsedBible } from '@/lib/bible/import/types';

/**
 * Which psalm split a file uses, measured rather than asked.
 *
 * This was a dropdown, and it should not have been. "Septuagint or Masoretic"
 * is not a preference an operator holds — it is a fact about the file in front
 * of them, and one most people setting up a projector have no way to answer.
 * Worse, the obvious guess is wrong often enough to matter: the Russian
 * Synodal Bible is Septuagint-numbered in print, and the machine-readable copy
 * of it in the archives has been renumbered to Masoretic. Someone answering
 * from what they know about their own Bible would have put Psalm 23 on the
 * screen when Psalm 22 was asked for.
 *
 * The Septuagint runs Hebrew 9 and 10 together, so its ninth psalm is about
 * twice the length of the Masoretic one — 39 verses against 20. Nothing else
 * in the Psalter is anywhere near that far apart, which makes it a
 * measurement rather than a heuristic. The two-verse psalm confirms it: the
 * shortest chapter in the Bible is 117 under one numbering and 116 under the
 * other, and it agrees or the answer is not trusted.
 *
 * Null means the file cannot say — a New Testament, or a Psalter that stops
 * early — and the caller falls back to the language's own scheme.
 */
const PSALMS = 19;

/** Halfway between the two lengths of the ninth psalm, and nowhere near either. */
const MERGED = 28;

export const detectPsalms = (bible: ParsedBible): PsalmScheme | null => {
  const psalter = bible.books.find(book => book.position === PSALMS);

  if (!psalter) return null;

  const lengthOf = (chapter: number) =>
    psalter.chapters.find(entry => entry.number === chapter)?.verses.length ?? 0;

  const ninth = lengthOf(9);

  if (ninth >= MERGED) return 'lxx';

  // The shortest psalm sits one number earlier under the Septuagint, because
  // of that same merge a hundred chapters back.
  const short = lengthOf(117) === 2 ? 'masoretic' : lengthOf(116) === 2 ? 'lxx' : null;

  if (ninth > 0) return short ?? 'masoretic';

  return short;
};
