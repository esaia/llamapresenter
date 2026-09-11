'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';

import { supabase } from '@/lib/supabase/client';

/**
 * "Sign in", swapped for "Open console" once the browser knows better.
 *
 * The marketing layout used to call the server's `getUser()` for this one
 * button — but reading cookies anywhere in a route tree opts the whole tree
 * out of static rendering, so every marketing page, `/faq` included, was
 * re-running a full render and a live Supabase round trip on every visit
 * just to draw it. Decided here instead, after hydration, so the page around
 * it can be prerendered and cached like the rest of its own content.
 *
 * Reads the browser client's own session rather than hitting the network:
 * `getSession()` answers from the cookie already on the page, so this
 * resolves before a visitor has had time to look at the button.
 */
export const AuthLink = ({ className }: { className?: string }) => {
  const [signedIn, setSignedIn] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    supabase()
      .auth.getSession()
      .then(({ data }) => {
        if (!cancelled) setSignedIn(Boolean(data.session));
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const href = signedIn ? '/studio' : '/login';

  // The console is a server component that loads a session's worth of data
  // before it can render, so the click and the page appearing are seconds
  // apart. A plain `Link` leaves that gap silent; routing inside a transition
  // instead makes `pending` true the instant it's clicked and false only once
  // the next page is ready, so the label can say so in between.
  return (
    <Link
      href={href}
      className={className}
      aria-disabled={pending}
      onClick={event => {
        event.preventDefault();
        startTransition(() => router.push(href));
      }}
    >
      {pending ? 'Opening…' : signedIn ? 'Open console' : 'Sign in'}
    </Link>
  );
};
