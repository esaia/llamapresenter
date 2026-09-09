import DodoPayments from 'dodopayments';

import type { Cadence, FoundingTier, FoundingTierId } from './founding';

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

/**
 * The Dodo product a rung of the founding ladder is sold on, one way of paying.
 *
 * One product per rung and cadence rather than one product and a discount
 * code, because a Dodo subscription is bound to the product it was created on:
 * the $9 is then held by the processor for the life of the subscription, which
 * is what makes "yours for as long as you stay" true without us having to
 * remember it. A coupon is a line on an invoice that can be removed. The same
 * reasoning is why a year is its own product rather than a monthly one billed
 * twelve at a time — the cadence, like the rate, is the processor's to keep.
 *
 * A rung with no product id configured is not sellable — better a 503 than a
 * checkout that quietly charges the standard price for a founding spot, or a
 * month for a church that asked for a year.
 */
const products = (): Record<Cadence, Record<FoundingTierId, string | undefined>> => ({
  monthly: {
    founding: process.env.DODO_PAYMENTS_PRODUCT_PRO_FOUNDING,
    early: process.env.DODO_PAYMENTS_PRODUCT_PRO_EARLY,
    // The old single-product variable is the standard rung, so an install that
    // predates the ladder keeps working with the id it already has.
    standard: process.env.DODO_PAYMENTS_PRODUCT_PRO_STANDARD || process.env.DODO_PAYMENTS_PRODUCT_PRO,
  },
  annual: {
    founding: process.env.DODO_PAYMENTS_PRODUCT_PRO_FOUNDING_ANNUAL,
    early: process.env.DODO_PAYMENTS_PRODUCT_PRO_EARLY_ANNUAL,
    standard: process.env.DODO_PAYMENTS_PRODUCT_PRO_STANDARD_ANNUAL || process.env.DODO_PAYMENTS_PRODUCT_PRO_ANNUAL,
  },
});

export const productFor = (tier: FoundingTier, cadence: Cadence): string | undefined =>
  products()[cadence][tier.id];
