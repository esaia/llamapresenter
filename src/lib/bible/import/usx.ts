import { bookByUsfm, type CanonBook } from '@/lib/bible/import/canon';
import { scanXml, tidy } from '@/lib/bible/import/xml';
import type { ParsedBible, ParsedBook, ParsedChapter } from '@/lib/bible/import/types';

/**
 * USX, which does not wrap a verse at all.
 *
 * `<verse number="3" style="v"/>` is a mark in the middle of a paragraph, and
 * the verse is everything after it until the next mark. That is why the
 * scanner yields events in order rather than handing back a tree: the words of
 * a verse are siblings of the thing that names it, not children of it.
 *
 * One file is one book, so a whole Bible is 66 of them — which is what the
 * import merges when several are chosen at once, or when a zip is dropped.
 *
 * Headings are dropped along with notes. USX 2 has no end marks, so a section
 * heading between two verses would otherwise be read as the tail of the verse
 * above it and go on the wall in the middle of the reading.
 */

const NOTES = new Set(['note', 'figure', 'sidebar', 'ref']);

/** Paragraph styles that are not scripture: headings, references, book titles. */
const HEADING = /^(s\d?|ms\d?|mr|sr|r|d|sp|cl|cp|mt\d?|imt\d?|h|toc\d?|ide|rem|iot|io\d?|ip|is\d?)$/;

const firstNumber = (value: string | undefined): number => {
  const found = value?.match(/\d+/)?.[0];

  return found ? Number(found) : 0;
};

export const parseUsx = (source: string): ParsedBible => {
  const books: ParsedBook[] = [];

  let found: CanonBook | null = null;
  let book: ParsedBook | null = null;
  let chapter: ParsedChapter | null = null;
  let verse: number | null = null;
  let words: string[] = [];
  let notes = 0;
  let heading = false;
  let naming = false;

  const closeVerse = () => {
    const text = tidy(words.join(''));

    if (verse !== null && chapter && text) chapter.verses.push([verse, text]);

    verse = null;
    words = [];
  };

  for (const event of scanXml(source)) {
    if (event.kind === 'text') {
      if (naming && book && !book.name) book.name = tidy(event.text) || undefined;
      if (verse !== null && !notes && !heading) words.push(event.text);
      continue;
    }

    const { name: tag, kind, attrs } = event;

    if (NOTES.has(tag)) {
      if (kind === 'open') notes += 1;
      if (kind === 'close' && notes) notes -= 1;
      continue;
    }

    // Paragraphs do not nest, so this is a flag rather than a depth: a heading
    // silences the words until its own close, whatever style closes it.
    if (tag === 'para') {
      heading = kind === 'open' && HEADING.test(attrs.style ?? '');
      // `h` is the running header a printed Bible puts at the top of the page,
      // which is the book's name in the file's own language.
      naming = kind === 'open' && (attrs.style === 'h' || attrs.style === 'toc2');

      // A new paragraph inside a verse is a space, not a join.
      if (kind === 'open' && !heading && verse !== null) words.push(' ');
      continue;
    }

    if (tag === 'book' && kind !== 'close') {
      found = bookByUsfm(attrs.code ?? '');
      book = found ? { position: found.position, chapters: [] } : null;

      if (book) books.push(book);

      continue;
    }

    if (tag === 'chapter') {
      closeVerse();

      const number = attrs.eid ? 0 : firstNumber(attrs.number);

      chapter = book && number ? { number, verses: [] } : null;

      if (chapter && book) book.chapters.push(chapter);

      continue;
    }

    if (tag === 'verse') {
      closeVerse();

      const number = attrs.eid ? 0 : firstNumber(attrs.number);

      verse = chapter && number ? number : null;
    }
  }

  closeVerse();

  return {
    format: 'usx',
    name: '',
    books: books.filter(entry => entry.chapters.length > 0),
  };
};
