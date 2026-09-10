/**
 * Cloudflare Turnstile, loaded once however many widgets end up on a page.
 *
 * Supabase verifies the token itself against the secret key in its own
 * dashboard — this file only has to get one out of the visitor's browser.
 */

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js';

interface TurnstileRenderOptions {
  sitekey: string;
  /** Runs only when `execute()` is called, rather than the moment it renders. */
  execution: 'execute';
  /** Invisible unless Cloudflare actually needs the visitor to prove something. */
  appearance: 'interaction-only';
  callback: (token: string) => void;
  'error-callback'?: () => void;
}

interface TurnstileApi {
  render: (container: HTMLElement, options: TurnstileRenderOptions) => string;
  execute: (widgetId: string) => void;
  remove: (widgetId: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

let scriptPromise: Promise<TurnstileApi> | null = null;

export const loadTurnstile = (): Promise<TurnstileApi> => {
  if (window.turnstile) return Promise.resolve(window.turnstile);

  scriptPromise ??= new Promise<TurnstileApi>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => (window.turnstile ? resolve(window.turnstile) : reject(new Error('Turnstile did not load')));
    script.onerror = () => reject(new Error('Turnstile did not load'));
    document.head.appendChild(script);
  });

  return scriptPromise;
};
