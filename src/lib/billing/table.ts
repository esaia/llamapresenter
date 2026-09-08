import { MAX_LANGS } from '../bible/languages';

import { FREE_LIMITS, type LimitKey } from './limits';

/**
 * The ceilings as a table, grouped the way the console is.
 *
 * Lives here rather than in the account panel because two surfaces now print
 * the same table — the panel an operator opens when they hit a ceiling, and the
 * pricing page someone reads before they have an account — and the two saying
 * different things is exactly the drift `limits.test.ts` exists to prevent one
 * level down. The groups are the tabs an operator already knows, in the order
 * they matter: scripture on the screen is what this app is for, and it comes
 * first even though it is the part we gate least.
 */
export const LIMIT_GROUPS: { title: string; keys: LimitKey[] }[] = [
  { title: 'Scripture', keys: ['passages', 'languages'] },
  { title: 'Songs', keys: ['songs', 'songs_per_playlist', 'playlists'] },
  { title: 'Music', keys: ['audio_tracks', 'audio_categories'] },
  { title: 'The stream, and your own look', keys: ['name_cards', 'custom_templates', 'custom_fonts'] },
  { title: 'Sessions', keys: ['sessions'] },
];

/** Pro is unlimited everywhere except languages, where three is how many fit. */
export const proLimitValue = (key: LimitKey) => (key === 'languages' ? String(MAX_LANGS) : 'Unlimited');

/** What Free allows, as the pricing table prints it: a ceiling of none is not a number. */
export const freeLimitValue = (key: LimitKey) =>
  FREE_LIMITS[key] === 0 ? 'Pro only' : String(FREE_LIMITS[key]);

/**
 * The part of the app no plan touches.
 *
 * Worth printing beside the ceilings, because a table of numbers read on its
 * own looks like a list of things being withheld — and the answer to "what do
 * I get for nothing?" is most of the product. Every line here is the same on
 * both plans by design: a congregation putting a verse on the wall on Sunday
 * morning is never the thing we are charging for.
 */
export const INCLUDED = [
  {
    title: 'The Bible',
    items: [
      'Every translation we hold, whole — no chapter or book is held back',
      'Side-by-side languages on one slide',
      'Search by reference or by the words of a verse',
      'Psalms split the way each translation splits them',
    ],
  },
  {
    title: 'Screens',
    items: [
      'A projector output for the wall',
      'A stage display for the people on the platform',
      'A transparent lower third for OBS and your livestream',
      'A countdown timer the room can see',
      'As many screens as you can open — every output is a link',
    ],
  },
  {
    title: 'Running the service',
    items: [
      'Control it from your phone, from anywhere in the room',
      'Songs, verses and announcements in one running order',
      'Name cards for whoever is speaking',
      'Built-in backgrounds, and your own pictures and video',
      'Your own music, played from the console',
    ],
  },
  {
    title: 'The account',
    items: [
      'No card to start, and no trial that expires',
      'Your work stays yours if you stop paying — nothing is deleted',
      'Cancel from the console whenever you like',
      'Runs in a browser: Windows, macOS, Linux, ChromeOS',
    ],
  },
];
