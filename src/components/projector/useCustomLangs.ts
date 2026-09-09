'use client';

import { useMemo } from 'react';

import { registerLangs, type CustomLangSpec, type LangSpec } from '@/lib/types';

/**
 * Tell this page about the languages a slide brought with it.
 *
 * A language the operator added is not in `languages.json` — it lives in their
 * own rows — so an output, which has no account, is told about it by the slide
 * itself. Without this a Spanish verse prints under an English book name, and
 * the browse code that resolves a name has no entry at all to look up.
 *
 * A memo rather than an effect on purpose. The book name is read during the
 * same render that draws the verse, so registering afterwards would paint the
 * wrong name and then correct it — visibly, on a wall.
 *
 * The counterpart of `useCustomFonts`, which does the same job for a typeface,
 * and it arrives by the same road: only what the slide names travels.
 */
export const useCustomLangs = (langs: CustomLangSpec[] | undefined) => {
  useMemo(() => {
    const specs: Record<string, LangSpec> = {};

    for (const lang of langs ?? []) {
      specs[lang.code] = {
        label: lang.label,
        // Every language that arrives this way is one an operator uploaded a
        // file for, and every file we read is in canonical order. The psalm
        // split rides with the translation rather than the language, and no
        // output has ever had a reason to ask for one.
        order: 'eng',
        psalms: 'masoretic',
        nameOffset: 0,
        versions: [],
        names: lang.names,
      };
    }

    registerLangs(specs);
  }, [langs]);
};
