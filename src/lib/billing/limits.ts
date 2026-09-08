import free from './limits.json';

import type { PlanId } from './plans';

/**
 * How much of the app a free account holds.
 *
 * Free is not a trial: a church can put scripture on a screen, run the
 * projector, the stage and the lower third, and never pay us. What Pro buys is
 * *volume and polish* — a song catalogue, a music library, several running
 * orders, and a look of their own. Nothing here stands between a congregation
 * and a verse on the wall on Sunday morning.
 *
 * The numbers live in `limits.json` because the console is not their only
 * reader: `supabase/migrations/…_plan_limits.sql` carries the same table into
 * Postgres, where the limit actually bites. The console writes to Supabase
 * directly under RLS, so a check that lives only in React is a check anyone
 * with the anon key can skip — the button being grey is a courtesy, and
 * `free_limit()` in the database is the rule. `limits.test.ts` reads the
 * migration and fails when the two drift.
 */
export const LIMIT_KEYS = [
  'sessions',
  'songs',
  'playlists',
  'songs_per_playlist',
  'audio_tracks',
  'audio_categories',
  'name_cards',
  'languages',
  'custom_fonts',
  'custom_templates',
] as const;

export type LimitKey = (typeof LIMIT_KEYS)[number];

/** The free allowance, keyed the same way the SQL function keys it. */
export const FREE_LIMITS: Record<LimitKey, number> = free;

/**
 * What a plan allows, where `null` means unlimited.
 *
 * Pro is unlimited by definition rather than by a second table of numbers:
 * a paid account that hits a ceiling we forgot to raise is a support ticket,
 * and there is nothing here expensive enough to meter.
 */
export const limitOf = (plan: PlanId, key: LimitKey): number | null =>
  plan === 'pro' ? null : FREE_LIMITS[key];

/** Whether `adding` more would still fit under the plan's ceiling. */
export const roomFor = (plan: PlanId, key: LimitKey, current: number, adding = 1): boolean => {
  const limit = limitOf(plan, key);

  return limit === null || current + adding <= limit;
};

/**
 * Whether a list may become `wants` long, given it was `had` long.
 *
 * A ceiling must never trap someone under it. A row can already be over the
 * line — an account that dropped from Pro to Free, or anyone at all on the day
 * the gates are first turned on — and if every write were refused then so
 * would be the writes that bring them back under: a ten-song running order
 * could not have a song taken off it, because nine is still more than three.
 *
 * So growing past the ceiling is refused, and shrinking, reordering and
 * standing still are always allowed. The ceiling still holds, because nothing
 * gets bigger; it is simply a line you can walk back across. The trigger in
 * `…_limits_allow_shrinking.sql` asks the same question.
 */
export const roomForList = (plan: PlanId, key: LimitKey, wants: number, had: number): boolean => {
  const limit = limitOf(plan, key);

  return limit === null || wants <= limit || wants <= had;
};

/** How many more fit, or `null` when the answer is "as many as you like". */
export const remaining = (plan: PlanId, key: LimitKey, current: number): number | null => {
  const limit = limitOf(plan, key);

  return limit === null ? null : Math.max(0, limit - current);
};

/**
 * What the thing is called when we have to tell the operator they ran out.
 *
 * Both forms are written out rather than an `s` appended, because the plural of
 * "song in a playlist" is not "song in a playlists" — the head noun moves and
 * no rule we could write here would know that.
 */
export const LIMIT_LABELS: Record<LimitKey, { one: string; many: string }> = {
  sessions: { one: 'session', many: 'sessions' },
  songs: { one: 'song', many: 'songs' },
  playlists: { one: 'playlist', many: 'playlists' },
  songs_per_playlist: { one: 'song in a playlist', many: 'songs in a playlist' },
  audio_tracks: { one: 'track', many: 'tracks' },
  audio_categories: { one: 'music library', many: 'music libraries' },
  name_cards: { one: 'name card', many: 'name cards' },
  languages: { one: 'language on a slide', many: 'languages on a slide' },
  custom_fonts: { one: 'custom font', many: 'custom fonts' },
  custom_templates: { one: 'custom look', many: 'custom looks' },
};

/**
 * The sentence shown where the operator hits the ceiling.
 *
 * Phrased as what Free covers rather than what they cannot do: they are
 * standing in a console that works, and the honest message is where the line
 * is, not that they were caught at it. A limit of zero has no line to describe
 * and reads better as a plain "Pro adds \u2026".
 */
export const limitMessage = (key: LimitKey): string => {
  const limit = FREE_LIMITS[key];
  const label = LIMIT_LABELS[key];

  if (limit === 0) return `Pro adds ${label.many}. Free has none.`;

  return `Free covers ${limit} ${limit === 1 ? label.one : label.many}. Pro makes it unlimited.`;
};

/**
 * The sentence behind a `plan_limit:<key>` raised by a trigger, if that is what
 * this error is.
 *
 * The database is where the ceilings actually bite, and it can only raise a
 * string. Every write path in the console runs its error through here, so a
 * limit reached by a route the console forgot to check still arrives as
 * "Free covers 3 songs in a playlist" rather than as a Postgres exception.
 */
export const planErrorMessage = (message: string): string | null => {
  const key = /plan_limit:(\w+)/.exec(message)?.[1];

  return key && (LIMIT_KEYS as readonly string[]).includes(key) ? limitMessage(key as LimitKey) : null;
};

/**
 * A refusal that is a plan ceiling rather than a failure.
 *
 * Worth its own type because the two want different handling: a write that
 * broke deserves an inline message next to whatever the operator was doing, and
 * a ceiling has already been announced once by the console's own notice. Panels
 * that show errors inline check for this and stay quiet, so the operator is
 * told where the line is exactly once rather than in two places at the same
 * time — which is what "Free covers 15 songs" appearing twice on one screen
 * looked like.
 */
export class PlanLimitError extends Error {
  readonly key: LimitKey;

  constructor(key: LimitKey) {
    super(limitMessage(key));

    this.name = 'PlanLimitError';
    this.key = key;
  }
}

export const isPlanLimit = (error: unknown): error is PlanLimitError => error instanceof PlanLimitError;

/** The key behind a `plan_limit:<key>` raised by a trigger, if that is what this is. */
export const planLimitKey = (message: string): LimitKey | null => {
  const key = /plan_limit:(\w+)/.exec(message)?.[1];

  return key && (LIMIT_KEYS as readonly string[]).includes(key) ? (key as LimitKey) : null;
};
