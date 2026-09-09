import { bookByOsis } from '@/lib/bible/import/canon';
import { scanXml, tidy } from '@/lib/bible/import/xml';
import type { ParsedBible, ParsedBook, ParsedChapter } from '@/lib/bible/import/types';

/**
 * OSIS, which names every verse twice over.
 *
 * A verse is either wrapped — `<verse osisID="Gen.1.1">…</verse>` — or marked
 * with an empty element and left to run until the next mark. Both are legal
 * and both are in the wild, so this reads the `osisID` and lets the words run
 * until *anything* ends them: the closing tag, the end marker, or the next
 * verse starting. That covers the two arrangements without having to know
 * which one the file chose.
 *
 * `osisID` carries the book, the chapter and the verse together, so nothing
 * else has to be tracked: a `<div type="book">` that lies about which book it
 * is cannot put verses in the wrong one.
 */

const NOTES = new Set(['note', 'rdg', 'figure']);

/** `Gen.1.1`, or the first of `Gen.1.1-Gen.1.3`. */
const refOf = (osisId: string) => {
  const [book, chapter, verse] = osisId.split('-')[0].split('.');
  const found = book ? bookByOsis(book) : null;

  return found && chapter && verse
    ? { position: found.position, chapter: Number(chapter), verse: Number(verse) }
    : null;
};

export const parseOsis = (source: string): ParsedBible => {
  const books = new Map<number, ParsedBook>();
  const chapters = new Map<string, ParsedChapter>();

  let name = '';
  let at: { position: number; chapter: number; verse: number } | null = null;
  let words: string[] = [];
  let noteDepth = 0;
  let inWork = false;
  let titled = false;

  const closeVerse = () => {
    const text = tidy(words.join(''));

    if (at && text) {
      const book = books.get(at.position) ?? { position: at.position, chapters: [] };
      books.set(at.position, book);

      const key = `${at.position}:${at.chapter}`;
      let chapter = chapters.get(key);

      if (!chapter) {
        chapter = { number: at.chapter, verses: [] };
        chapters.set(key, chapter);
        book.chapters.push(chapter);
      }

      chapter.verses.push([at.verse, text]);
    }

    at = null;
    words = [];
    noteDepth = 0;
  };

  for (const event of scanXml(source)) {
    if (event.kind === 'text') {
      if (titled) name = tidy(event.text);
      if (at && !noteDepth) words.push(event.text);
      continue;
    }

    const { name: tag, kind, attrs } = event;

    if (NOTES.has(tag)) {
      if (kind === 'open') noteDepth += 1;
      if (kind === 'close' && noteDepth) noteDepth -= 1;
      continue;
    }

    if (tag === 'work') {
      // The header's `<work>` holds the translation's real name in a `<title>`.
      // `osisWork` is an id — "kjv" — and is only the fallback.
      inWork = kind === 'open';

      if (kind !== 'close' && !name) name = attrs.osiswork ?? '';

      continue;
    }

    if (tag === 'title' && kind === 'open') {
      // A psalm's superscription and a section heading are both `title`, and
      // neither is a verse. Sending them nowhere is easier to defend than
      // guessing which one this is — except in the header, where it is the name.
      titled = inWork;
      noteDepth += 1;
      continue;
    }

    if (tag === 'title' && kind === 'close' && noteDepth) {
      titled = false;
      noteDepth -= 1;
      continue;
    }

    if (tag === 'verse') {
      if (kind === 'close') {
        closeVerse();
        continue;
      }

      const ref = attrs.osisid && !attrs.eid ? refOf(attrs.osisid) : null;

      closeVerse();
      at = ref;
      continue;
    }

    if (tag === 'chapter' || tag === 'div') closeVerse();

  }

  closeVerse();

  return {
    format: 'osis',
    name: tidy(name),
    books: [...books.values()].sort((a, b) => a.position - b.position),
  };
};
