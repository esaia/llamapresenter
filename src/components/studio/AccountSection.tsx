'use client';

import { useState } from 'react';

import { MAX_LANGS } from '@/lib/bible/languages';
import { gatesEnforced, planOf } from '@/lib/billing/entitlements';
import { FREE_LIMITS, LIMIT_LABELS, type LimitKey } from '@/lib/billing/limits';
import { PLANS } from '@/lib/billing/plans';
import { useAudio } from '@/lib/studio/AudioProvider';
import { useStudio } from '@/lib/studio/StudioProvider';

/**
 * The ceilings, in the order an operator meets them.
 *
 * Songs and running orders first because that is what a church fills up in its
 * first month; the look and the second session are further down because they
 * are wants rather than walls.
 */
const ROWS: LimitKey[] = [
  'passages',
  'songs_per_playlist',
  'playlists',
  'songs',
  'languages',
  'audio_tracks',
  'audio_categories',
  'name_cards',
  'custom_fonts',
  'custom_templates',
  'sessions',
];

/**
 * What a Pro account has made. Counts only — no ceilings, because there are
 * none, and a column of the word "Unlimited" eleven times over is a table with
 * nothing in it.
 */
const BUILT: LimitKey[] = ['songs', 'playlists', 'audio_tracks', 'custom_templates', 'name_cards', 'custom_fonts'];

/** Pro is unlimited everywhere except languages, where three is how many fit. */
const proValue = (key: LimitKey) => (key === 'languages' ? String(MAX_LANGS) : 'Unlimited');

/** A date the operator reads, not an ISO string. */
const readable = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }) : null;

/**
 * What the subscription's state means for the person reading it.
 *
 * `past_due` and `on_hold` still carry Pro — a failed card has a dunning run
 * behind it and we would rather not take the projector away mid-service — so
 * the panel has to be the thing that says a card needs attention, because
 * nothing else in the console will.
 */
const STATES: Record<string, { tone: string; says: string }> = {
  active: { tone: 'text-studio-on', says: 'Active' },
  past_due: { tone: 'text-studio-danger', says: 'Payment failed' },
  on_hold: { tone: 'text-studio-danger', says: 'Payment failed' },
  paused: { tone: 'text-studio-muted', says: 'Paused' },
  cancelled: { tone: 'text-studio-muted', says: 'Cancelled' },
  expired: { tone: 'text-studio-muted', says: 'Ended' },
};

/** Plan, what it costs the operator in practice, and the way out of the account. */
export const AccountSection = () => {
  const { email, plan, billing, usage } = useStudio();
  const { tracks } = useAudio();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const current = PLANS[planOf(plan)];
  const free = current.id === 'free';
  const pro = PLANS.pro;

  // The audio library lives in its own provider, so it is the one count the
  // studio does not already hold.
  const used = (key: LimitKey) => (key === 'audio_tracks' ? tracks.length : usage[key]);

  const state = STATES[billing.status] ?? { tone: 'text-studio-muted', says: billing.status };
  const renews = readable(billing.renewsAt);
  const troubled = billing.status === 'past_due' || billing.status === 'on_hold';

  const go = async (path: string) => {
    setBusy(true);
    setError('');

    const response = await fetch(path, { method: 'POST' });
    const body = await response.json();

    if (body.url) {
      window.location.href = body.url;
      return;
    }

    setError(body.error ?? 'Something went wrong.');
    setBusy(false);
  };

  const manage = (
    <button
      type="button"
      onClick={() => void go('/api/billing/portal')}
      disabled={busy}
      className="shrink-0 rounded-studio border border-studio-border px-3 py-1.5 text-xs transition-colors
        duration-150 hover:border-studio-faint disabled:opacity-60"
    >
      Manage subscription
    </button>
  );

  return (
    <div className="space-y-6 text-sm">
      <div className="rounded-studio border border-studio-divider p-4">
        <p className="text-xs text-studio-muted">Signed in as</p>
        <p className="mt-1 break-all">{email || 'Unknown'}</p>
      </div>

      <div className="overflow-hidden rounded-studio border border-studio-divider">
        <div className="flex items-baseline justify-between gap-3 border-b border-studio-divider px-4 py-3">
          <div>
            <p className="text-xs text-studio-muted">Your plan</p>

            <p className="mt-0.5 flex items-baseline gap-2 text-lg leading-none">
              {current.name}
              {free ? null : <span className={`text-xs ${state.tone}`}>{state.says}</span>}
            </p>
          </div>

          <p className="shrink-0 text-xs text-studio-muted">
            <span className="text-studio-text">{current.price}</span> {current.cadence}
          </p>
        </div>

        <p className="px-4 py-3 text-xs leading-relaxed text-studio-muted">{current.blurb}</p>

        {gatesEnforced ? null : (
          <p className="mx-4 mb-3 rounded-studio bg-studio-surface px-3 py-2 text-xs text-studio-accent">
            Every ceiling below is off for everyone while the tiers are being settled.
          </p>
        )}

        {free ? (
          // Where the line is, in the operator's own numbers. "15 of 15 songs"
          // is something they can check against what they were about to do this
          // morning; a bullet saying "song catalogue" is not.
          <table className="w-full border-t border-studio-divider text-xs">
            <thead>
              <tr className="text-studio-faint">
                <th className="px-4 py-2 text-left font-normal">Where the line is</th>
                <th className="px-2 py-2 text-right font-normal">Free</th>
                <th className="px-4 py-2 text-right font-normal">Pro</th>
              </tr>
            </thead>

            <tbody>
              {ROWS.map(key => {
                const limit = FREE_LIMITS[key];
                const count = used(key);
                const full = gatesEnforced && count !== undefined && count >= limit;

                return (
                  <tr key={key} className="border-t border-studio-divider/60">
                    <td className="px-4 py-2 text-studio-text">
                      {LIMIT_LABELS[key].many}

                      {count !== undefined ? (
                        <span className={full ? 'ml-2 text-studio-accent' : 'ml-2 text-studio-faint'}>
                          {full ? 'full' : `${count} used`}
                        </span>
                      ) : null}
                    </td>

                    <td className={`px-2 py-2 text-right ${full ? 'text-studio-accent' : 'text-studio-muted'}`}>
                      {limit === 0 ? '—' : limit}
                    </td>

                    <td className="px-4 py-2 text-right text-studio-text">{proValue(key)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="border-t border-studio-divider px-4 py-4">
            <p className="text-xs text-studio-text">
              Everything is unlimited, except three languages on a slide — which is how many fit before a slide stops
              being readable, and not something we would charge for.
            </p>

            {/* What they have made, rather than a column of the word
                "Unlimited" repeated down the panel. */}
            <dl className="mt-4 grid grid-cols-3 gap-x-3 gap-y-4">
              {BUILT.map(key => (
                <div key={key}>
                  <dt className="text-[11px] leading-tight text-studio-faint">{LIMIT_LABELS[key].many}</dt>
                  <dd className="mt-0.5 text-lg leading-none text-studio-text">{used(key) ?? 0}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        <div className="border-t border-studio-divider px-4 py-4">
          {free ? (
            <>
              <button
                type="button"
                onClick={() => void go('/api/billing/checkout')}
                disabled={busy}
                className="w-full rounded-studio bg-studio-accent px-3 py-2 text-sm font-medium text-studio-onaccent
                  transition-transform duration-150 hover:-translate-y-px disabled:translate-y-0 disabled:opacity-60"
              >
                Upgrade to Pro — {pro.price} {pro.cadence}
              </button>

              <p className="mt-2 text-center text-[11px] leading-relaxed text-studio-faint">
                Cancel whenever you like. Everything you have made stays yours, and stays where it is.
              </p>
            </>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs leading-relaxed text-studio-muted">
                {troubled
                  ? 'The last payment did not go through. Pro keeps working for now — update the card to keep it that way.'
                  : billing.ending && renews
                    ? `Ends ${renews}. Everything you have made stays yours.`
                    : renews
                      ? `Renews ${renews}.`
                      : 'Change the card, or cancel, whenever you like.'}
              </p>

              {manage}
            </div>
          )}

          {error ? <p className="mt-3 text-xs text-studio-danger">{error}</p> : null}
        </div>
      </div>

      <form action="/auth/signout" method="post">
        <button type="submit" className="text-xs text-studio-muted hover:text-studio-text">
          Sign out
        </button>
      </form>
    </div>
  );
};
