import {
  defaultVersionOf,
  isCustomLang,
  isLang,
  LANG_SPECS,
  specOf,
  type Lang,
  type LangSpec,
} from '@/lib/bible/languages';

/**
 * What a translation setting *means*, once the operator can bring their own.
 *
 * A translation has always been a string in `settings.versions[lang]`, taken
 * verbatim from `languages.json` — the catalogue and the corpus being the same
 * list is what makes that safe. An uploaded one is in neither: it lives in the
 * operator's own rows, so it is named by a `custom:<id>` value that resolves
 * here, the way `lib/projector/fonts.ts` resolves a typeface.
 *
 * Every reader goes through this file — the two pickers, the settings
 * narrowers, the style that travels with a slide, the psalm mapping — so there
 * is one answer to "which translation is this" rather than five. It is pure,
 * and it is where a value naming a translation that has since been deleted
 * falls back rather than 404-ing on the wall.
 */

/**
 * A Bible the operator uploaded.
 *
 * It is read under a language: one of the six we mirrored, or one it brought
 * with it. Filing everything under the six was the first arrangement and it
 * was wrong — `showData` is keyed by language, so a Spanish Bible filed under
 * English could never sit beside English on a slide, which is the one thing a
 * bilingual congregation wants.
 *
 * A language of its own needs two things the six have already: a name, and 66
 * book names. Both ride here, because they came out of the same file.
 */
export interface CustomTranslation {
  id: string;
  /** One of the six, or an `x:` code for a language they brought with it. */
  lang: Lang;
  /** What that language is called, for an `x:` code. */
  langLabel?: string;
  /** Its 66 book names, out of the file, for an `x:` code that had them. */
  bookNames?: string[];
  /** What the operator called it. Shown in the pickers; the id never is. */
  label: string;
  /**
   * How its psalms are split. Defaults to the parent language's scheme and is
   * allowed to disagree with it — a Masoretic file under Russian, whose own
   * translations are Septuagint-numbered, is a normal thing to upload.
   */
  psalms: 'lxx' | 'masoretic';
}

export const CUSTOM_PREFIX = 'custom:';

export const isCustomVersion = (value: string) => value.startsWith(CUSTOM_PREFIX);

export const customIdOf = (value: string) => (isCustomVersion(value) ? value.slice(CUSTOM_PREFIX.length) : null);

export const versionValueOf = (translation: { id: string }) => `${CUSTOM_PREFIX}${translation.id}`;

/** The operator's translations for one language, in the order they uploaded them. */
export const customsFor = (lang: Lang, customs: CustomTranslation[]) =>
  customs.filter(translation => translation.lang === lang);

export const findCustomVersion = (value: string, customs: CustomTranslation[]): CustomTranslation | null => {
  const id = customIdOf(value);

  return (id && customs.find(translation => translation.id === id)) || null;
};

/**
 * Whether a stored version string still names something we can serve — one of
 * the catalogue's, or one of theirs. `settings.ts` asks this before keeping a
 * pick, so a translation deleted last week reverts to the default instead of
 * 404-ing every verse of the reading.
 */
export const isKnownVersion = (lang: Lang, value: string, customs: CustomTranslation[]): boolean =>
  (!isCustomLang(lang) && specOf(lang).versions.includes(value)) ||
  findCustomVersion(value, customs)?.lang === lang;

/** Everything `lang` can be read in, as options for a picker. */
export const versionOptions = (lang: Lang, customs: CustomTranslation[]) => [
  ...(isCustomLang(lang) ? [] : specOf(lang).versions.map(version => ({ value: version, label: version }))),
  ...customsFor(lang, customs).map(translation => ({
    value: versionValueOf(translation),
    label: translation.label,
  })),
];

/**
 * What to *call* a translation.
 *
 * The catalogue's are their own name already. An uploaded one is a `custom:…`
 * id, which is no use to anybody: this is what a custom template printing
 * `{translation}` shows, and it travels to outputs that have no account and
 * cannot look the id up themselves. A pick that no longer exists falls back to
 * the language's default rather than putting an id on the stream.
 */
export const versionLabel = (lang: Lang, value: string | undefined, customs: CustomTranslation[]): string => {
  if (!value) return '';
  if (!isCustomVersion(value)) return value;

  return findCustomVersion(value, customs)?.label ?? defaultVersionOf(lang);
};

/** Which psalm split a language is being read in, in this translation. */
export const psalmSchemeOf = (
  lang: Lang,
  value: string | undefined,
  customs: CustomTranslation[],
): 'lxx' | 'masoretic' =>
  (value ? findCustomVersion(value, customs)?.psalms : undefined) ?? specOf(lang).psalms;

/**
 * The rows as the console holds them. Narrowed at the edge like every other
 * jsonb read: a translation filed under a language we have since dropped is
 * left out rather than trusted.
 */
export const asCustomTranslations = (rows: unknown): CustomTranslation[] =>
  Array.isArray(rows)
    ? rows.flatMap(row => {
        const entry = row as Partial<CustomTranslation> & { lang_label?: unknown; book_names?: unknown };

        return typeof entry?.id === 'string' && typeof entry.label === 'string' && isLang(entry.lang)
          ? [
              {
                id: entry.id,
                lang: entry.lang,
                label: entry.label,
                psalms: entry.psalms === 'lxx' ? 'lxx' : 'masoretic',
                // The row spells these the database's way; everything above
                // this line is the console's.
                langLabel: typeof entry.lang_label === 'string' ? entry.lang_label : entry.langLabel,
                bookNames: Array.isArray(entry.book_names) && entry.book_names.length === 69
                  ? (entry.book_names as string[])
                  : entry.bookNames,
              } satisfies CustomTranslation,
            ]
          : [];
      })
    : [];

/**
 * The languages an operator's translations bring with them, as `specOf` wants
 * them.
 *
 * Everything except the label and the names is the same for every one of them:
 * a file in these formats is in canonical order, and how its psalms are split
 * is measured off the translation rather than declared by the language. So the
 * only real content here is what came out of the file.
 *
 * A language with several translations in it takes the names from the first
 * that carried any — they are the same language, and one file naming its books
 * is enough for all of them.
 */
export const langSpecsOf = (customs: CustomTranslation[]): Record<string, LangSpec> => {
  const gathered = new Map<string, { label: string; names: string[] | null; versions: string[] }>();

  for (const translation of customs) {
    if (!isCustomLang(translation.lang)) continue;

    const had = gathered.get(translation.lang);

    gathered.set(translation.lang, {
      label: had?.label || translation.langLabel || 'Added language',
      // The first translation that carried names names the language. They are
      // the same language, and one file naming its books does for all of them.
      names: had?.names ?? (translation.bookNames?.length === 69 ? translation.bookNames : null),
      versions: [...(had?.versions ?? []), versionValueOf(translation)],
    });
  }

  return Object.fromEntries(
    [...gathered].map(([code, { label, names, versions }]): [string, LangSpec] => [
      code,
      {
        label,
        // A file in any of these formats is in canonical order, and how its
        // psalms are split is measured off the translation rather than
        // declared by the language — so the label and the names are the only
        // real content here.
        order: 'eng',
        psalms: 'masoretic',
        nameOffset: 0,
        versions,
        names: names ?? LANG_SPECS.eng.names,
      },
    ]),
  );
};

/** The languages the operator may pick, beyond the six. */
export const customLangsOf = (customs: CustomTranslation[]): { code: Lang; label: string }[] => {
  const specs = langSpecsOf(customs);

  return Object.entries(specs).map(([code, spec]) => ({ code: code as Lang, label: spec.label }));
};
