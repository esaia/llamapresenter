import catalogue from '@/lib/bible/languages.json';

/**
 * Every language LlamaPresenter can put on a screen — which is exactly the set we hold
 * our own copy of, in `bible_text`.
 *
 * It used to be everything `holybible.ge` listed, with the console falling
 * back to that host for whatever had not been copied. Offering a translation
 * we cannot serve ourselves is a promise we cannot keep on the one morning it
 * matters, so the catalogue and the corpus are now the same list. Adding a
 * language means mirroring it first: `pnpm mirror`, then regenerate this.
 *
 * Codes are the scripture API's own, so the mirror script needs no translation
 * table. This list is what makes `Lang` a closed union; `languages.json` is
 * what the rows are, and `mapping.test.ts` checks the two agree.
 */
export const LANGS = ['geo', 'eng', 'ru', 'gr', 'ae', 'la'] as const;

/** One of the six we hold a mirrored copy of. */
export type BuiltInLang = (typeof LANGS)[number];

/**
 * A language an operator brought with a Bible of their own.
 *
 * The six above are the ones we mirrored, and for a long time they were the
 * whole world: an uploaded translation was filed under one of them. That
 * cannot be right for a Spanish church, because `showData` is keyed by
 * language — filing Spanish under English means the two can never be on the
 * same slide, which is the one thing a bilingual congregation actually wants.
 *
 * So a language is now either one of ours or one of theirs, and the prefix is
 * what tells them apart in a settings row, a slide and a database column. What
 * a custom one *is* — its name, and its book names — is registered below,
 * because it lives in the operator's own rows rather than in `languages.json`.
 */
export const CUSTOM_LANG_PREFIX = 'x:';

export type CustomLang = `${typeof CUSTOM_LANG_PREFIX}${string}`;

export type Lang = BuiltInLang | CustomLang;

export const isCustomLang = (value: string): value is CustomLang => value.startsWith(CUSTOM_LANG_PREFIX);

/**
 * English is always in the operator's set and cannot be removed: it is the one
 * language every reader of this console has in common, and the fallback every
 * output lands on when a pick goes away.
 */
export const REQUIRED_LANG: Lang = 'eng';

/** How many languages fit on a slide before it stops being readable. */
export const MAX_LANGS = 3;

export interface LangSpec {
  label: string;
  /**
   * Which book numbering the API expects. Georgian order puts the catholic
   * epistles before the Pauline ones; English does not, and `englishBooks`
   * remaps between them.
   */
  order: 'geo' | 'eng';
  /** Psalm numbering: the Septuagint splits, or the Masoretic ones. */
  psalms: 'lxx' | 'masoretic';
  /**
   * Greek's `bibleNames` carries a stray fourth header before Genesis, so every
   * name in it sits one index later than the book id says.
   */
  nameOffset: 0 | 1;
  /**
   * The translations, best first — the first is what a console opens on, so
   * the order is a recommendation rather than a catalogue listing. English
   * leads with the WEB: it is the only modern-English translation here, and
   * the only one dedicated outright to the public domain.
   */
  versions: string[];
  /** Overrides the first entry, for a language whose order is not a preference. */
  defaultVersion?: string;
  /** `bibleNames`: three group headers, then the 66 books. */
  names: string[];
}

/**
 * The catalogue itself: a label, the translations, the book names, and the only
 * two things that actually vary between languages — which book numbering the
 * API wants and how the psalms are split. Both were checked against the API
 * rather than assumed: `w=48` returns James in Georgian-ordered languages and
 * Romans in English-ordered ones, and Psalm 10 has seven verses under the
 * Septuagint split and eighteen under the Masoretic.
 *
 * It lives in JSON rather than in this file so that `scripts/` can read it too
 * — `languages.mjs` writes it, and `mirror.mjs` walks it — and so the eleven
 * generated languages can be refreshed without touching any code. JSON has no
 * literal types, hence the cast; the shape is enforced by the test.
 *
 * Abkhazian and Ossetian are New Testament only. Their Old Testament names fall
 * back to Russian upstream and an Old Testament request returns nothing.
 */
export const LANG_SPECS = catalogue as unknown as Record<BuiltInLang, LangSpec>;

/**
 * The languages the operator added, by code.
 *
 * Module state, deliberately, and set from exactly two places: the console,
 * which loads them with everything else it opens with, and an output, which is
 * handed the ones a slide carries in the slide's own payload — an output page
 * has no account and cannot read a row. It is the same arrangement the added
 * typefaces have, and for the same reason.
 *
 * It is here rather than threaded through every signature because `specOf` is
 * called from pure book and psalm code that has no business knowing about
 * React, an account or a payload. Registering is the one impure act, and it
 * happens before anything is drawn.
 */
let registered: Record<string, LangSpec> = {};

const listeners = new Set<() => void>();

/** Told when the set changes, so a cache keyed by language can drop itself. */
export const onLangsChanged = (listener: () => void) => {
  listeners.add(listener);

  return () => listeners.delete(listener);
};

export const registerLangs = (specs: Record<string, LangSpec>) => {
  registered = specs;
  listeners.forEach(listener => listener());
};

export const registeredLangs = (): Lang[] => Object.keys(registered) as Lang[];

/**
 * What a language we know nothing about is read as.
 *
 * A settings row can name a language whose translation has since been deleted,
 * and a payload can reach an output that has not been told about one. Neither
 * is worth a blank screen: the verses are still the verses, and English book
 * names over them is a smaller wrong than nothing at all.
 */
const UNKNOWN: LangSpec = {
  label: 'Added language',
  order: 'eng',
  psalms: 'masoretic',
  nameOffset: 0,
  versions: [],
  names: LANG_SPECS.eng.names,
};

export const specOf = (lang: Lang): LangSpec =>
  isCustomLang(lang)
    ? (registered[lang] ?? UNKNOWN)
    : (LANG_SPECS[lang as BuiltInLang] ?? UNKNOWN);

export const LANG_LABELS = Object.fromEntries(
  LANGS.map(lang => [lang, LANG_SPECS[lang].label]),
) as Record<BuiltInLang, string>;

/** What to call a language, ours or theirs. */
export const labelOf = (lang: Lang): string => specOf(lang).label;

/** The translations `lang` offers, as options for a picker. */
export const versionsOf = (lang: Lang) =>
  specOf(lang).versions.map(version => ({ value: version, label: version }));

/** The translation a language opens on when the operator has not chosen one. */
export const defaultVersionOf = (lang: Lang): string => {
  const spec = specOf(lang);

  return spec.defaultVersion ?? spec.versions[0] ?? '';
};

/**
 * Whether this is a language code at all. A custom one is checked for shape
 * rather than for existence — `settings.ts` is what refuses a code naming a
 * language the operator no longer has.
 */
export const isLang = (value: unknown): value is Lang =>
  typeof value === 'string' && (LANGS.includes(value as BuiltInLang) || isCustomLang(value));
