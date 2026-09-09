import { MAX_LANGS } from '../bible/languages';
import { THEMES } from '../projector/themes';

import { FOUNDING_SPOTS, tierNow } from './founding';
import { FREE_LIMITS } from './limits';

/**
 * The two plans, and what the pricing page and the console both say about them.
 *
 * Every gate in the app is a number rather than a capability — see `./limits`.
 * There is no feature Pro can do that Free cannot; there is more of it. That
 * keeps the promise on the marketing page and the check in Postgres the same
 * sentence, and it means a church that outgrows Free discovers it by filling
 * something up rather than by hitting a wall in the middle of a service.
 *
 * What Pro costs is not written here. While the founding spots last it depends
 * on how many are gone — see `./founding` — so anything that prints a price
 * calls `plansFor(claimed)` with a count read on the server.
 */
export type PlanId = 'free' | 'pro';

export interface Plan {
  id: PlanId;
  name: string;
  price: string;
  cadence: string;
  blurb: string;
  highlights: string[];
  /** What the button under the card says, and where it goes. */
  cta: { label: string; href: string };
}

/**
 * The two plans, with Pro priced at whatever the next church would pay.
 *
 * `claimed` comes from `claimedSpots()` on the server. Every caller has it,
 * because every page that prints a price is already server-rendered — the
 * console is handed it as an `initial` prop rather than fetching after paint.
 */
export const plansFor = (claimed: number): Record<PlanId, Plan> => {
  const tier = tierNow(claimed);

  return {
  free: {
    id: 'free',
    name: 'Free',
    price: '$0',
    cadence: 'forever',
    blurb: 'Everything you need to run your church service on screen.',
    highlights: [
      'The whole Bible, in every translation we hold',
      'Any language — add a Bible of your own',
      'Projector, stage, and lower third for your stream',
      `${FREE_LIMITS.languages} languages side by side`,
      `${THEMES.length} built-in backgrounds`,
      `${FREE_LIMITS.songs} songs, ${FREE_LIMITS.songs_per_playlist} to a playlist`,
      `${FREE_LIMITS.audio_tracks} tracks and ${FREE_LIMITS.audio_categories} music libraries`,
    ],
    cta: { label: 'Start free', href: '/login' },
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: tier.price,
    cadence: tier.cadence,
    blurb: 'For churches that need more songs, more languages, custom templates, and more control.',
    highlights: [
      'Everything in Free, without the limits',
      'Unlimited songs, playlists, and music libraries',
      `${MAX_LANGS} languages on a slide`,
      'Use your own music, fonts and Bible translations',
      'Create your own templates',
      'Run more than one session',
    ],
    // Buying needs an account, so the button goes to `/upgrade` rather than to
    // the provider: that page signs the visitor in if it has to and opens the
    // checkout session we created for them.
    cta: { label: 'Get Pro', href: '/upgrade' },
  },
  };
};

/**
 * The plans at the standard price, for anywhere a live count is not to hand.
 *
 * Deliberately the *top* of the ladder: a page that forgot to read the count
 * shows $19 and disappoints nobody, where a stale $9 would be a price we then
 * do not charge.
 */
export const PLANS: Record<PlanId, Plan> = plansFor(FOUNDING_SPOTS);
