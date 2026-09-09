/**
 * A very small XML scanner, and why there is one.
 *
 * Five formats have to be read — Zefania, OpenSong, USX, OSIS and Beblia — and
 * they disagree about what a verse *is*. Four of them wrap one in an element;
 * USX marks it with an empty `<verse number="3"/>` and lets the words run on
 * until the next marker. A DOM would answer the first four and not the fifth,
 * and `DOMParser` does not exist in the node environment the tests run in, so
 * every parser here would have been untestable behind it.
 *
 * So this yields tags and text in the order they appear, which is exactly what
 * a milestone format needs and no less than a container format needs. It is
 * the same choice `lib/lyrics/propresenter.ts` made about RTF: the input is
 * narrow, the reading is one pass, and a dependency would be carrying a
 * general answer for a specific question.
 *
 * It is not a validator. A malformed file yields nonsense rather than an
 * error, and the parsers above it decide that a file with no books in it is
 * not a Bible.
 */

export interface XmlTag {
  kind: 'open' | 'close' | 'self';
  name: string;
  attrs: Record<string, string>;
}

export interface XmlText {
  kind: 'text';
  text: string;
}

export type XmlEvent = XmlTag | XmlText;

const ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
};

/** `&amp;`, `&#8212;` and `&#x2014;` — the three spellings a Bible file uses. */
export const decodeEntities = (value: string): string =>
  value.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (whole, body: string) => {
    if (body[0] === '#') {
      const code = body[1] === 'x' || body[1] === 'X' ? parseInt(body.slice(2), 16) : parseInt(body.slice(1), 10);

      return Number.isFinite(code) ? String.fromCodePoint(code) : whole;
    }

    return ENTITIES[body.toLowerCase()] ?? whole;
  });

const ATTR = /([\w:.-]+)\s*=\s*("([^"]*)"|'([^']*)')/g;

const attrsOf = (source: string): Record<string, string> => {
  const attrs: Record<string, string> = {};

  for (const [, name, , double, single] of source.matchAll(ATTR)) {
    attrs[name.toLowerCase()] = decodeEntities(double ?? single ?? '');
  }

  return attrs;
};

/** Everything that is not markup and not content: the prolog, comments, the doctype. */
const skipTo = (source: string, from: number, close: string) => {
  const at = source.indexOf(close, from);

  return at === -1 ? source.length : at + close.length;
};

export function* scanXml(source: string): Generator<XmlEvent> {
  let at = 0;

  while (at < source.length) {
    const open = source.indexOf('<', at);

    if (open === -1) {
      const text = source.slice(at);

      if (text.trim()) yield { kind: 'text', text: decodeEntities(text) };

      return;
    }

    if (open > at) {
      const text = source.slice(at, open);

      if (text) yield { kind: 'text', text: decodeEntities(text) };
    }

    if (source.startsWith('<!--', open)) {
      at = skipTo(source, open, '-->');
      continue;
    }

    if (source.startsWith('<![CDATA[', open)) {
      const end = source.indexOf(']]>', open);
      const text = source.slice(open + 9, end === -1 ? source.length : end);

      if (text) yield { kind: 'text', text };

      at = end === -1 ? source.length : end + 3;
      continue;
    }

    if (source.startsWith('<?', open)) {
      at = skipTo(source, open, '?>');
      continue;
    }

    if (source.startsWith('<!', open)) {
      at = skipTo(source, open, '>');
      continue;
    }

    const end = source.indexOf('>', open);

    if (end === -1) return;

    const raw = source.slice(open + 1, end);
    const closing = raw.startsWith('/');
    const self = raw.endsWith('/');
    const body = raw.slice(closing ? 1 : 0, self ? -1 : undefined);
    const name = (body.match(/^[\w:.-]+/)?.[0] ?? '').toLowerCase();

    if (name) {
      yield {
        kind: closing ? 'close' : self ? 'self' : 'open',
        name,
        attrs: closing ? {} : attrsOf(body.slice(name.length)),
      };
    }

    at = end + 1;
  }
}

/** The root element's name, which is what tells one format from another. */
export const rootOf = (source: string): string => {
  for (const event of scanXml(source)) {
    if (event.kind === 'open' || event.kind === 'self') return event.name;
  }

  return '';
};

/** Verse text as it goes on a screen: one line, no double spaces, no stray gaps at the ends. */
export const tidy = (value: string): string => value.replace(/\s+/g, ' ').trim();
