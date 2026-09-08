import { MAX_LANGS } from '../bible/languages';
import { THEMES } from '../projector/themes';

import { FREE_LIMITS } from './limits';

/**
 * The two plans, and what the pricing page and the console both say about them.
 *
 * Every gate in the app is a number rather than a capability — see `./limits`.
 * There is no feature Pro can do that Free cannot; there is more of it. That
 * keeps the promise on the marketing page and the check in Postgres the same
 * sentence, and it means a church that outgrows Free discovers it by filling
 * something up rather than by hitting a wall in the middle of a service.
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

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: 'free',
    name: 'Free',
    price: '$0',
    cadence: 'forever',
    blurb: 'Everything you need to get your church service on screen.',
    highlights: [
      'The whole Bible, in every translation we hold',
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
    price: '$9',
    cadence: 'per month',
    blurb: 'For churches that need more songs, more languages, and more control over their presentation.',
    highlights: [
      'Everything in Free, without the limits',
      'Unlimited songs, libraries, and running orders',
      `${MAX_LANGS} languages on a slide`,
      'Use your own music and typefaces',
      'Create your own templates',
      'More than one session',
    ],
    // Buying needs an account, so the button goes to `/upgrade` rather than to
    // the provider: that page signs the visitor in if it has to and opens the
    // checkout session we created for them.
    cta: { label: 'Get Pro', href: '/upgrade' },
  },
};
