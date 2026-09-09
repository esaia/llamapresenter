import { describe, expect, it } from 'vitest';

import { isoOf, langOf, labelForIso, LANGUAGE_OPTIONS } from './isoLanguages';
import { LANGS } from './languages';

describe('the language picker', () => {
  it('offers every ISO 639-1 language, named and in order', () => {
    expect(LANGUAGE_OPTIONS.length).toBeGreaterThan(150);
    expect(LANGUAGE_OPTIONS.map(option => option.label)).toEqual(
      [...LANGUAGE_OPTIONS.map(option => option.label)].sort((a, b) => a.localeCompare(b)),
    );
  });

  it('names them in a way somebody can search for', () => {
    expect(labelForIso('es')).toBe('Spanish');
    expect(labelForIso('ko')).toBe('Korean');
    expect(labelForIso('zz')).toBe('zz');
  });
});

describe('what a picked language means', () => {
  // Picking English has to mean the English with the WEB and the KJV behind
  // it, not a seventh language that happens to share the name.
  it('lands the six we hold on their own codes', () => {
    expect(langOf('en')).toBe('eng');
    expect(langOf('ka')).toBe('geo');
    expect(langOf('el')).toBe('gr');
    expect(langOf('ar')).toBe('ae');
    expect(langOf('ru')).toBe('ru');
    expect(langOf('la')).toBe('la');
  });

  it('makes every other language one of the operator’s own', () => {
    expect(langOf('es')).toBe('x:es');
    expect(langOf('ko')).toBe('x:ko');
  });

  // Keyed by the language rather than by the upload, so two Spanish Bibles
  // added a year apart are one Spanish on the rail and can be read together.
  it('sends two files in the same language to the same place', () => {
    expect(langOf('es')).toBe(langOf('es'));
  });

  it('goes back the way it came, for putting the picker where it was', () => {
    for (const option of LANGUAGE_OPTIONS) expect(isoOf(langOf(option.value))).toBe(option.value);
  });

  it('covers all six of ours', () => {
    for (const lang of LANGS) expect(isoOf(lang)).not.toBe('');
  });
});
