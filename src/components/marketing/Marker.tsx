import type { ReactNode } from 'react';

/**
 * The yellow stroke under a word or two of a headline.
 *
 * One drawing of it, on every hero that has one. The plate is the text's own
 * background — see `.site-marker` in `globals.css` — so a headline that wraps
 * gets a stroke per line rather than one running past the last word.
 */
export const Marker = ({ children }: { children: ReactNode }) => (
  <span className="site-marker">{children}</span>
);
