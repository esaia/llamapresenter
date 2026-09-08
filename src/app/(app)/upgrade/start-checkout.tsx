'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * The step between "Get Pro" on the marketing page and Dodo's checkout.
 *
 * The checkout session is created by us rather than linked to, because the
 * customer has to exist in our `subscriptions` row before the operator ever
 * reaches the payment page — see `/api/billing/checkout`. So the button on the
 * public page cannot be a link to the provider; it is a link to here, and here
 * asks for the session and leaves.
 *
 * A visitor who is not signed in never gets this far: `/upgrade` is not public,
 * so the middleware sends them to sign in and back again.
 */
export const StartCheckout = ({ price, cadence }: { price: string; cadence: string }) => {
  const [error, setError] = useState<string | null>(null);
  // Two effects in development would be two checkout sessions, and the second
  // is the one the operator would pay on while the first sits open.
  const asked = useRef(false);

  const start = useCallback(async () => {
    setError(null);

    try {
      const res = await fetch('/api/billing/checkout', { method: 'POST' });
      const body = (await res.json()) as { url?: string; error?: string };

      if (res.ok && body.url) {
        window.location.replace(body.url);
        return;
      }

      setError(body.error ?? 'Checkout would not open.');
    } catch {
      setError('Checkout would not open.');
    }
  }, []);

  useEffect(() => {
    if (asked.current) return;
    asked.current = true;
    void start();
  }, [start]);

  return (
    <main className="grid min-h-dvh place-items-center bg-studio-bg px-6">
      <div className="w-full max-w-sm text-center">
        {error ? (
          <>
            <h1 className="text-2xl text-studio-text">Not this time</h1>
            <p className="mt-2 text-sm leading-relaxed text-studio-muted">{error}</p>

            <button
              type="button"
              onClick={() => void start()}
              className="mt-6 w-full rounded-studio bg-studio-accent px-4 py-2.5 text-sm font-medium
                text-studio-onaccent transition-colors duration-150 hover:bg-studio-accent/85"
            >
              Try again
            </button>

            <Link href="/studio" className="mt-4 inline-block text-sm text-studio-muted underline underline-offset-4">
              Back to the console
            </Link>
          </>
        ) : (
          <>
            <h1 className="text-2xl text-studio-text">Opening checkout…</h1>
            <p className="mt-2 text-sm leading-relaxed text-studio-muted">
              Pro is {price} {cadence}. Cancel whenever you like — everything you have made stays yours, and stays
              where it is.
            </p>
          </>
        )}
      </div>
    </main>
  );
};
