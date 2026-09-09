import { toSharedBook } from '@/lib/bible/passage';

/**
 * The 66 books, in the order every Bible file on earth lists them.
 *
 * Each format names a book its own way — USX has `code="GEN"`, OSIS has
 * `osisID="Gen.1.1"`, Zefania and Beblia number them 1–66, OpenSong writes the
 * English name out — so this is the one table that turns any of those into the
 * shared book id the rest of the app counts in.
 *
 * The shared id is not stored: it is derived through `toSharedBook`, because
 * this list is in the English ordering (position 1 = English book id 4 = the
 * `w` of a request in an English-ordered language) and the Georgian ordering
 * the app counts in is already one function away. A hand-typed column would be
 * a second copy of `englishBooks.ts` that could disagree with it.
 */
export interface CanonBook {
  /** 1–66, the order below. */
  position: number;
  /** The book id the app counts in — Georgian ordering, Genesis = 4. */
  shared: number;
  /** USX / USFM: three letters. */
  usfm: string;
  /** OSIS: the abbreviation an `osisID` begins with. */
  osis: string;
  english: string;
}

const TABLE: [usfm: string, osis: string, english: string][] = [
  ['GEN', 'Gen', 'Genesis'],
  ['EXO', 'Exod', 'Exodus'],
  ['LEV', 'Lev', 'Leviticus'],
  ['NUM', 'Num', 'Numbers'],
  ['DEU', 'Deut', 'Deuteronomy'],
  ['JOS', 'Josh', 'Joshua'],
  ['JDG', 'Judg', 'Judges'],
  ['RUT', 'Ruth', 'Ruth'],
  ['1SA', '1Sam', '1 Samuel'],
  ['2SA', '2Sam', '2 Samuel'],
  ['1KI', '1Kgs', '1 Kings'],
  ['2KI', '2Kgs', '2 Kings'],
  ['1CH', '1Chr', '1 Chronicles'],
  ['2CH', '2Chr', '2 Chronicles'],
  ['EZR', 'Ezra', 'Ezra'],
  ['NEH', 'Neh', 'Nehemiah'],
  ['EST', 'Esth', 'Esther'],
  ['JOB', 'Job', 'Job'],
  ['PSA', 'Ps', 'Psalms'],
  ['PRO', 'Prov', 'Proverbs'],
  ['ECC', 'Eccl', 'Ecclesiastes'],
  ['SNG', 'Song', 'Song of Solomon'],
  ['ISA', 'Isa', 'Isaiah'],
  ['JER', 'Jer', 'Jeremiah'],
  ['LAM', 'Lam', 'Lamentations'],
  ['EZK', 'Ezek', 'Ezekiel'],
  ['DAN', 'Dan', 'Daniel'],
  ['HOS', 'Hos', 'Hosea'],
  ['JOL', 'Joel', 'Joel'],
  ['AMO', 'Amos', 'Amos'],
  ['OBA', 'Obad', 'Obadiah'],
  ['JON', 'Jonah', 'Jonah'],
  ['MIC', 'Mic', 'Micah'],
  ['NAM', 'Nah', 'Nahum'],
  ['HAB', 'Hab', 'Habakkuk'],
  ['ZEP', 'Zeph', 'Zephaniah'],
  ['HAG', 'Hag', 'Haggai'],
  ['ZEC', 'Zech', 'Zechariah'],
  ['MAL', 'Mal', 'Malachi'],
  ['MAT', 'Matt', 'Matthew'],
  ['MRK', 'Mark', 'Mark'],
  ['LUK', 'Luke', 'Luke'],
  ['JHN', 'John', 'John'],
  ['ACT', 'Acts', 'Acts'],
  ['ROM', 'Rom', 'Romans'],
  ['1CO', '1Cor', '1 Corinthians'],
  ['2CO', '2Cor', '2 Corinthians'],
  ['GAL', 'Gal', 'Galatians'],
  ['EPH', 'Eph', 'Ephesians'],
  ['PHP', 'Phil', 'Philippians'],
  ['COL', 'Col', 'Colossians'],
  ['1TH', '1Thess', '1 Thessalonians'],
  ['2TH', '2Thess', '2 Thessalonians'],
  ['1TI', '1Tim', '1 Timothy'],
  ['2TI', '2Tim', '2 Timothy'],
  ['TIT', 'Titus', 'Titus'],
  ['PHM', 'Phlm', 'Philemon'],
  ['HEB', 'Heb', 'Hebrews'],
  ['JAS', 'Jas', 'James'],
  ['1PE', '1Pet', '1 Peter'],
  ['2PE', '2Pet', '2 Peter'],
  ['1JN', '1John', '1 John'],
  ['2JN', '2John', '2 John'],
  ['3JN', '3John', '3 John'],
  ['JUD', 'Jude', 'Jude'],
  ['REV', 'Rev', 'Revelation'],
];

export const CANON: CanonBook[] = TABLE.map(([usfm, osis, english], index) => ({
  position: index + 1,
  // index + 4: the English book id, past the three group headers.
  shared: toSharedBook(index + 4, 'eng'),
  usfm,
  osis,
  english,
}));

const byPosition = new Map(CANON.map(book => [book.position, book]));
const byUsfm = new Map(CANON.map(book => [book.usfm, book]));
const byOsis = new Map(CANON.map(book => [book.osis.toLowerCase(), book]));

/**
 * Names an OpenSong file is known to use that are not the ones above. Every
 * other spelling is caught by the loose match below; these are the ones where
 * the words themselves differ rather than the punctuation.
 */
const ALIASES: Record<string, string> = {
  psalm: 'Psalms',
  psalter: 'Psalms',
  canticles: 'Song of Solomon',
  'song of songs': 'Song of Solomon',
  songs: 'Song of Solomon',
  qoheleth: 'Ecclesiastes',
  apocalypse: 'Revelation',
  'revelation of john': 'Revelation',
  'acts of the apostles': 'Acts',
};

const loose = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    // `1Thessalonians` and `1 Thessalonians` are the same book.
    .replace(/(\d)(?=[a-z])/g, '$1 ')
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const byLoose = new Map(CANON.map(book => [loose(book.english), book]));

export const bookByPosition = (position: number): CanonBook | null => byPosition.get(position) ?? null;

export const bookByUsfm = (code: string): CanonBook | null => byUsfm.get(code.trim().toUpperCase()) ?? null;

/** From an `osisID` — `Gen.1.1`, or just `Gen`. */
export const bookByOsis = (osisId: string): CanonBook | null =>
  byOsis.get(osisId.split('.')[0]?.trim().toLowerCase() ?? '') ?? null;

/**
 * From a written-out English name, as OpenSong files carry it. Exact first,
 * then a prefix — `1 Thess`, `Rev`, `Song of Sol` are all files we have seen —
 * and a prefix is only accepted when it matches one book, so `J` finds nothing
 * rather than finding Joshua.
 */
export const bookByName = (name: string): CanonBook | null => {
  const needle = loose(name);

  if (!needle) return null;

  const exact = byLoose.get(needle) ?? byLoose.get(loose(ALIASES[needle] ?? ''));

  if (exact) return exact;

  const prefixed = CANON.filter(book => loose(book.english).startsWith(needle));

  return prefixed.length === 1 ? prefixed[0] : null;
};
