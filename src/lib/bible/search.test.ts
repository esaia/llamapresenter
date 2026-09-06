import { describe, expect, it } from 'vitest';

import { snippetAround, splitOnMatch } from '@/lib/bible/search';

describe('splitOnMatch', () => {
  it('cuts the verse around the words, whatever the case', () => {
    expect(splitOnMatch('The LORD is my shepherd', 'lord')).toEqual(['The ', 'LORD', ' is my shepherd']);
  });

  it('leaves a verse whole when the words are not in it', () => {
    expect(splitOnMatch('In the beginning', 'shepherd')).toEqual(['In the beginning', '', '']);
  });

  it('leaves a verse whole on an empty query', () => {
    expect(splitOnMatch('In the beginning', '')).toEqual(['In the beginning', '', '']);
  });
});

describe('snippetAround', () => {
  const long = `${'a'.repeat(200)} shepherd ${'b'.repeat(200)}`;

  it('keeps a short verse as it is', () => {
    expect(snippetAround('The LORD is my shepherd', 'shepherd')).toBe('The LORD is my shepherd');
  });

  it('takes the window around the match, and says both ends were cut', () => {
    const shown = snippetAround(long, 'shepherd');

    expect(shown).toContain('shepherd');
    expect(shown.startsWith('…')).toBe(true);
    expect(shown.endsWith('…')).toBe(true);
    expect(shown.length).toBeLessThanOrEqual(142);
  });

  it('fills the card from the front when the match is at the start', () => {
    const shown = snippetAround(`shepherd ${'b'.repeat(300)}`, 'shepherd');

    expect(shown.startsWith('shepherd')).toBe(true);
    expect(shown.endsWith('…')).toBe(true);
  });

  it('falls back to the head of the verse when the words are not in it', () => {
    expect(snippetAround(long, 'nowhere')).toMatch(/^a+…$/);
  });
});
