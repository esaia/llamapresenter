import { bookByPosition } from '@/lib/bible/import/canon';
import type { ParsedBible } from '@/lib/bible/import/types';
import type { Lang } from '@/lib/bible/languages';
import { toLangBook } from '@/lib/bible/passage';

/**
 * A parsed file as rows of `bible_translation_text`.
 *
 * The row is deliberately identical to a `bible_text` row, which is what lets
 * `/api/bible` read either through the one `chapterOf`. Two things are done
 * here and nowhere else:
 *
 * - `book` is the *parent language's* own book id, not the canonical one. A
 *   request carries `w` already remapped by `toLangBook`, so storing anything
 *   else would mean remapping on every read instead of once on import.
 * - `wigni` is `book - 3`, the id the API stamps on a verse — it is what the
 *   outputs print the book name from, and it has been book - 3 in everything
 *   we have ever mirrored.
 *
 * `chapters` is the highest chapter number the file actually carries for that
 * book, because that is the question the console asks it: how far the chapter
 * picker goes. A translation missing its last chapter says so rather than
 * offering an empty one.
 */
export interface TranslationRow {
  translation_id: string;
  book: number;
  chapter: number;
  wigni: number;
  chapters: number;
  verses: [number, string][];
}

export const rowsOf = (bible: ParsedBible, lang: Lang, translationId: string): TranslationRow[] =>
  bible.books.flatMap(book => {
    const canon = bookByPosition(book.position);

    if (!canon) return [];

    const langBook = toLangBook(canon.shared, lang);
    const chapters = book.chapters.reduce((highest, chapter) => Math.max(highest, chapter.number), 0);

    return book.chapters
      .filter(chapter => chapter.verses.length > 0)
      .map(chapter => ({
        translation_id: translationId,
        book: langBook,
        chapter: chapter.number,
        wigni: langBook - 3,
        chapters,
        verses: [...chapter.verses].sort((a, b) => a[0] - b[0]),
      }));
  });

/** Rows go up in batches, because a Bible is about 1,200 of them. */
export const batched = <T,>(rows: T[], size = 100): T[][] => {
  const batches: T[][] = [];

  for (let at = 0; at < rows.length; at += size) batches.push(rows.slice(at, at + size));

  return batches;
};
