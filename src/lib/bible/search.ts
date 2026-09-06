import type { Lang } from '@/lib/bible/languages';
import { toLangBook } from '@/lib/bible/passage';

/** Shorter than this and every second verse matches; the console waits. */
export const MIN_SEARCH_LENGTH = 3;

/** How many verses come back. A list nobody scrolls past is a list nobody reads. */
export const SEARCH_LIMIT = 40;

/** One verse the words were found in, as `bible_search` hands it over. */
export interface VerseHit {
  /** The language's own book id — the `w` of a chapter request, not the shared id. */
  book: number;
  wigni: number;
  chapter: number;
  verse: number;
  text: string;
}

/**
 * Where the words are in the verse, as `[before, match, after]`.
 *
 * Case-folded, because that is how the database matched, and the operator who
 * typed `lord` is looking at `LORD`. A query the text does not contain — a
 * different case-folding, a hit on a neighbouring verse — leaves the verse
 * whole rather than guessing, which is why this returns the parts rather than
 * an index.
 */
export const splitOnMatch = (text: string, query: string): [string, string, string] => {
  const at = query ? text.toLowerCase().indexOf(query.toLowerCase()) : -1;

  if (at < 0) return [text, '', ''];

  return [text.slice(0, at), text.slice(at, at + query.length), text.slice(at + query.length)];
};

/**
 * Enough of a long verse to recognise it, with the match still in it.
 *
 * A card two lines tall that ends before the words the operator typed is worse
 * than no preview at all, so the window is taken around the match rather than
 * from the front of the verse. Ellipses mark whichever end was cut.
 */
export const snippetAround = (text: string, query: string, span = 140): string => {
  if (text.length <= span) return text;

  const at = query ? text.toLowerCase().indexOf(query.toLowerCase()) : -1;

  if (at < 0) return `${text.slice(0, span).trimEnd()}…`;

  // Room on both sides of the match, pushed back inside the verse at the ends
  // so a hit in the first or last line still fills the card.
  const room = Math.max(0, span - query.length);
  const start = Math.min(Math.max(0, at - Math.floor(room / 2)), Math.max(0, text.length - span));
  const end = Math.min(text.length, start + span);

  return `${start > 0 ? '…' : ''}${text.slice(start, end).trim()}${end < text.length ? '…' : ''}`;
};

/**
 * Ask the library for the verses that say this.
 *
 * `book` is the shared book id, or null for the whole translation. It is
 * translated into the language's own numbering here, in the one place that
 * already knows it is talking to a row of `bible_text`.
 */
export const searchVerses = async (
  { lang, version, query, book }: { lang: Lang; version: string; query: string; book?: number | null },
  signal?: AbortSignal,
): Promise<VerseHit[]> => {
  const params = new URLSearchParams({ language: lang, mv: version, q: query });

  if (book) params.set('w', String(toLangBook(book, lang)));
  const response = await fetch(`/api/bible/search?${params}`, { signal });

  if (!response.ok) {
    const reason = await response
      .json()
      .then((body: { error?: string }) => body.error)
      .catch(() => null);

    throw new Error(reason || 'Could not search the scripture library');
  }

  const body = (await response.json()) as { results?: VerseHit[] };

  return body.results ?? [];
};
