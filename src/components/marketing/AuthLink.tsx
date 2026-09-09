'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

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

  return (
    <Link href={signedIn ? '/studio' : '/login'} className={className}>
      {signedIn ? 'Open console' : 'Sign in'}
    </Link>
  );
};
