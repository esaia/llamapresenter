'use client';

import { useState } from 'react';

import { gatesEnforced, planOf } from '@/lib/billing/entitlements';
import { FREE_LIMITS, LIMIT_LABELS, type LimitKey } from '@/lib/billing/limits';
import { PLANS } from '@/lib/billing/plans';
import { MAX_LANGS } from '@/lib/bible/languages';
import { useAudio } from '@/lib/studio/AudioProvider';
import { useStudio } from '@/lib/studio/StudioProvider';

/**
 * The ceilings, in the order an operator meets them.
 *
 * Songs and running orders first because that is what a church fills up in its
 * first month; the look and the second session are further down because they
 * are wants rather than walls. Pro is unlimited everywhere except languages,
 * where MAX_LANGS is not a plan decision at all — three is how many fit on a
 * slide before it stops being readable, and no amount of money changes that.
 */
const ROWS: LimitKey[] = [
  'songs_per_playlist',
  'playlists',
  'libraries',
  'songs',
  'languages',
  'audio_tracks',
  'name_cards',
  'custom_fonts',
  'custom_templates',
  'sessions',
];

const proValue = (key: LimitKey) => (key === 'languages' ? String(MAX_LANGS) : 'Unlimited');

/** Plan, what it costs the operator in practice, and the way out of the account. */
export const AccountSection = () => {
  const { email, plan, usage } = useStudio();
  const { tracks } = useAudio();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const current = PLANS[planOf(plan)];
  const free = current.id === 'free';
  const pro = PLANS.pro;

  // The audio library lives in its own provider, so it is the one count the
  // studio does not already hold.
  const used = (key: LimitKey) => (key === 'audio_tracks' ? tracks.length : usage[key]);

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
            <p className="mt-0.5 text-lg leading-none">{current.name}</p>
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

        {/* What the plan costs them in practice. A table of their own numbers
            rather than a feature list: "15 of 15 songs" is a thing an operator
            can check against what they were about to do this morning, and a
            bullet saying "song catalogue" is not. */}
        <table className="w-full border-t border-studio-divider text-xs">
          <thead>
            <tr className="text-studio-faint">
              <th className="px-4 py-2 text-left font-normal">{free ? 'Where the line is' : 'What you are using'}</th>
              {free ? <th className="px-2 py-2 text-right font-normal">Free</th> : null}
              <th className="px-4 py-2 text-right font-normal">{free ? 'Pro' : 'Included'}</th>
            </tr>
          </thead>

          <tbody>
            {ROWS.map(key => {
              const limit = FREE_LIMITS[key];
              const count = used(key);
              // A row only reads as "full" when the operator is actually at it,
              // and only while the free ceiling is the one in force.
              const full = free && gatesEnforced && count !== undefined && count >= limit;

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

                  {free ? (
                    <td className={`px-2 py-2 text-right ${full ? 'text-studio-accent' : 'text-studio-muted'}`}>
                      {limit === 0 ? '—' : limit}
                    </td>
                  ) : null}

                  <td className="px-4 py-2 text-right text-studio-text">{proValue(key)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

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
            <button
              type="button"
              onClick={() => void go('/api/billing/portal')}
              disabled={busy}
              className="rounded-studio border border-studio-border px-3 py-1.5 text-xs transition-colors
                duration-150 hover:border-studio-faint disabled:opacity-60"
            >
              Manage subscription
            </button>
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
