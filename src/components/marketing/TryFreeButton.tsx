'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import { supabase } from '@/lib/supabase/client';
import { loadTurnstile } from '@/lib/turnstile';

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

/**
 * The no-signup path the marketing copy promises: an anonymous Supabase
 * session gets the same auth-trigger workspace a real signup gets, so the
 * console opens with a real room and every feature — just no way to present
 * off it (see `isGuest` in StudioProvider).
 *
 * Every click makes a room, so this is also the one door on the site a bot can
 * walk through for free — Turnstile is what Supabase itself asks for behind
 * anonymous sign-in, kept invisible unless a visitor actually looks like one.
 */
export const TryFreeButton = ({ className, children }: { className?: string; children: React.ReactNode }) => {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const widgetEl = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const resolveToken = useRef<((token: string | undefined) => void) | null>(null);

  useEffect(() => {
    if (!SITE_KEY) return;

    let cancelled = false;

    void loadTurnstile().then(turnstile => {
      if (cancelled || !widgetEl.current || widgetId.current) return;

      widgetId.current = turnstile.render(widgetEl.current, {
        sitekey: SITE_KEY,
        execution: 'execute',
        appearance: 'interaction-only',
        callback: token => resolveToken.current?.(token),
        'error-callback': () => resolveToken.current?.(undefined),
      });
    });

    return () => {
      cancelled = true;
      if (widgetId.current) window.turnstile?.remove(widgetId.current);
    };
  }, []);

  // No site key configured (local dev without Turnstile set up) skips the
  // check entirely — Supabase only rejects a missing token when it has a
  // secret key of its own to check it against.
  const captchaToken = () =>
    new Promise<string | undefined>(resolve => {
      if (!widgetId.current || !window.turnstile) return resolve(undefined);

      resolveToken.current = resolve;
      window.turnstile.execute(widgetId.current);
    });

  const start = async () => {
    setBusy(true);
    setFailed(false);

    // Already signed in — real account or a guest room from earlier in this
    // browser — so the console is just a click away, not a new anonymous
    // session stomping the one they have.
    const {
      data: { user },
    } = await supabase().auth.getUser();

    if (!user) {
      const captchaTokenValue = await captchaToken();
      const { error } = await supabase().auth.signInAnonymously(
        captchaTokenValue ? { options: { captchaToken: captchaTokenValue } } : undefined,
      );

      if (error) {
        // Anonymous sign-ins may simply be off for this project, or the
        // captcha check failed — surface it rather than leaving the button
        // looking like it did nothing.
        console.error('signInAnonymously failed', error);
        setBusy(false);
        setFailed(true);
        return;
      }
    }

    router.push('/studio');
  };

  return (
    <span className="flex flex-col gap-2">
      <button type="button" onClick={start} disabled={busy} className={className}>
        {busy ? 'Opening the console…' : children}
      </button>

      {/* Empty until Cloudflare decides a visitor needs to prove something —
          most never see this. */}
      <div ref={widgetEl} />

      {failed ? <span className="text-sm text-site-muted">Could not start a session. Please try again.</span> : null}
    </span>
  );
};
