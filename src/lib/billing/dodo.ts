import DodoPayments from 'dodopayments';

/**
 * The payment provider, made lazily.
 *
 * Lazy because the app has to build and run without billing keys — a
 * self-hosted install has no Dodo account, and neither does a contributor
 * running `pnpm dev` — and because only the three billing routes need it.
 *
 * Test and live are two different sets of keys against two different hosts, so
 * the environment is read here rather than guessed from NODE_ENV: a staging
 * deploy is a production build that must still charge nobody.
 */
export const dodo = () => {
  const key = process.env.DODO_PAYMENTS_API_KEY;

  if (!key) throw new Error('DODO_PAYMENTS_API_KEY is not set');

  return new DodoPayments({
    bearerToken: key,
    environment: process.env.DODO_PAYMENTS_ENVIRONMENT === 'live_mode' ? 'live_mode' : 'test_mode',
  });
};

/**
 * Where we are, without a trailing slash.
 *
 * Trimmed because every caller appends a path, and a value pasted from a
 * browser's address bar arrives with the slash already on it — which turns a
 * return URL into `https://…//studio` and a checkout that lands on a 404.
 */
export const siteUrl = () => (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/+$/, '');

/**
 * Which subscription states we honour as Pro.
 *
 * `active` is the paid, current one. A subscription that has gone `past_due`
 * or `on_hold` has a card that failed and a dunning sequence running; Dodo
 * cancels it at the end of that, and until then the church keeps its console.
 * Losing the projector mid-service over an expired card is a worse outcome
 * than a few days of unpaid Pro, and the operator sees the state in the portal.
 */
const PRO_STATUSES = new Set(['active', 'past_due', 'on_hold']);

export const planFromStatus = (status: string | null | undefined): 'free' | 'pro' =>
  status && PRO_STATUSES.has(status) ? 'pro' : 'free';
