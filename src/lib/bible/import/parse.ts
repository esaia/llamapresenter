import { detectFormat } from '@/lib/bible/import/detect';
import { parseNested } from '@/lib/bible/import/nested';
import { parseOsis } from '@/lib/bible/import/osis';
import { parseUsx } from '@/lib/bible/import/usx';
import type { ParsedBible, ParsedBook } from '@/lib/bible/import/types';

/**
 * One XML document to books, whichever of the five it is.
 *
 * Pure and synchronous, so the whole of the reading is testable without a
 * browser. Unwrapping a zip and reading the bytes off a `File` is `files.ts`
 * next door, which is the only part of the import that cannot be.
 */
export const parseBibleXml = (source: string): ParsedBible | null => {
  const format = detectFormat(source);

  if (!format) return null;
  if (format === 'usx') return parseUsx(source);
  if (format === 'osis') return parseOsis(source);

  return parseNested(source, format);
};

/**
 * Several documents as one Bible.
 *
 * USX is one file per book, so a whole translation is sixty-six of them, and a
 * church's download is a folder or a zip. The books are taken in canonical
 * order rather than in the order the files happened to arrive, and a book that
 * appears twice keeps the copy with more verses in it — a partial file next to
 * a complete one is a redownload, not a correction.
 */
export const mergeBibles = (parts: ParsedBible[]): ParsedBible | null => {
  const found = parts.filter(part => part.books.length > 0);

  if (found.length === 0) return null;

  const books = new Map<number, ParsedBook>();

  for (const part of found) {
    for (const book of part.books) {
      const had = books.get(book.position);
      const verses = (entry: ParsedBook) =>
        entry.chapters.reduce((sum, chapter) => sum + chapter.verses.length, 0);

      if (!had || verses(book) > verses(had)) books.set(book.position, book);
    }
  }

  return {
    format: found[0].format,
    name: found.find(part => part.name)?.name ?? '',
    books: [...books.values()].sort((a, b) => a.position - b.position),
  };
};
