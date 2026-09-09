/** The five shapes a church's Bible arrives in. */
export type BibleFormat = 'zefania' | 'opensong' | 'beblia' | 'usx' | 'osis';

export const FORMAT_LABELS: Record<BibleFormat, string> = {
  zefania: 'Zefania XML',
  opensong: 'OpenSong',
  beblia: 'Beblia',
  usx: 'USX',
  osis: 'OSIS',
};

/**
 * One chapter, holding `[verse, text]` pairs — the same shape `bible_text`
 * stores and `/api/bible` hands back, so nothing is reshaped between the file
 * and the row.
 *
 * Verse numbers are kept rather than assumed contiguous. A translation that
 * runs two verses together prints them at the first of the two and leaves the
 * second out, and a passage that asks for the missing one gets a gap rather
 * than someone else's words.
 */
export interface ParsedChapter {
  number: number;
  verses: [number, string][];
}

export interface ParsedBook {
  /** 1–66 in the canonical order; see `canon.ts`. */
  position: number;
  /**
   * What the file calls this book, when it says. Zefania, OpenSong and USX
   * carry the name; Beblia numbers its books and OSIS uses a Latin code, so
   * both leave this empty. It is what gives a language the operator added its
   * own book names instead of English ones.
   */
  name?: string;
  chapters: ParsedChapter[];
}

export interface ParsedBible {
  format: BibleFormat;
  /** What the file calls itself, when it says. The operator can rename it. */
  name: string;
  books: ParsedBook[];
}

/**
 * The 66 book names a file carries, in the shape a `LangSpec` wants: three
 * group headers, then the books in English order.
 *
 * Null unless most of the Bible is named, because a handful of names and
 * fifty-odd blanks is worse than the English list — a browse list with gaps in
 * it cannot be used at all, and the fallback at least can.
 */
export const bookNamesOf = (bible: ParsedBible, fallback: string[]): string[] | null => {
  const named = bible.books.filter(book => book.name?.trim());

  if (named.length < 50) return null;

  const names = [...fallback];

  for (const book of named) names[3 + book.position - 1] = book.name!.trim();

  return names;
};

export const verseCountOf = (bible: ParsedBible): number =>
  bible.books.reduce(
    (total, book) => total + book.chapters.reduce((sum, chapter) => sum + chapter.verses.length, 0),
    0,
  );
