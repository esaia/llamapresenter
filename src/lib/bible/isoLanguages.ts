import catalogue from '@/lib/bible/isoLanguages.json';

import { CUSTOM_LANG_PREFIX, type BuiltInLang, type Lang } from '@/lib/bible/languages';

/**
 * Every language a translation can be added in.
 *
 * The console offers six translations of its own, and for a while those six
 * were also the only languages an uploaded Bible could be read in. That is the
 * wrong list to put in front of a Korean church: they are not choosing between
 * our translations, they are saying what language the file they picked is in.
 *
 * So the picker is the ISO 639-1 languages — 184 of them, English names,
 * alphabetical. Six of them are ours and resolve to the codes the scripture
 * API uses; the rest become a language of the operator's own, keyed by the
 * same ISO code. That keying matters: two Spanish Bibles added a year apart
 * land in the same Spanish, so they can be read side by side and the rail
 * shows one language rather than two of the same name.
 *
 * The list is checked in rather than derived at run time. It was generated
 * from `Intl.DisplayNames`, which is where the names came from, but a browser
 * with a trimmed-down ICU would otherwise offer a shorter list than the one
 * the operator saw last week — and a language that disappears is a translation
 * that cannot be added.
 */
const ISO_LANGUAGES = catalogue as Record<string, string>;

/**
 * The six we hold translations of, by their ISO code.
 *
 * Picking English here has to mean *our* English — the one with the WEB and
 * the KJV behind it — rather than a seventh language that happens to share its
 * name. The scripture API's codes are what the rest of the app counts in, and
 * this is the one place the two spellings meet.
 */
const OURS: Record<string, BuiltInLang> = {
  ka: 'geo',
  en: 'eng',
  ru: 'ru',
  el: 'gr',
  ar: 'ae',
  la: 'la',
};

/** The picker's options: every language, named, in alphabetical order. */
export const LANGUAGE_OPTIONS: { value: string; label: string }[] = Object.entries(ISO_LANGUAGES)
  .map(([iso, label]) => ({ value: iso, label }))
  .sort((a, b) => a.label.localeCompare(b.label));

/** What an ISO code means to the rest of the app: one of ours, or one of theirs. */
export const langOf = (iso: string): Lang => OURS[iso] ?? (`${CUSTOM_LANG_PREFIX}${iso}` as Lang);

export const labelForIso = (iso: string): string => ISO_LANGUAGES[iso] ?? iso;

/** The ISO code behind a language, for putting the picker back where it was. */
export const isoOf = (lang: Lang): string => {
  const mine = Object.entries(OURS).find(([, code]) => code === lang);

  if (mine) return mine[0];

  return lang.startsWith(CUSTOM_LANG_PREFIX) ? lang.slice(CUSTOM_LANG_PREFIX.length) : '';
};
