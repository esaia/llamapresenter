/**
 * How tall the media pane stands, as a per-machine preference.
 *
 * The same bargain the output rail's width makes, and for the same reasons:
 * the desk screen and the laptop want different splits, so it belongs to this
 * browser rather than to the account — and it reaches the layout as a CSS
 * variable that React only ever writes to, so dragging the handle re-renders
 * nothing. See `lib/studio/railWidth`, whose shape this follows.
 *
 * Unlike the rail there is no blocking script: the pane opens closed, so there
 * is no height to get wrong on the first paint.
 */

/** Under this the thumbnails are too small to tell one background from another. */
export const MEDIA_MIN_HEIGHT = 140;

/** Past this the pane is taking room the slides need more. */
export const MEDIA_MAX_HEIGHT = 560;

/** What the cards above keep, whatever the pane was dragged to on a taller screen. */
const SLIDE_ROOM = 260;

const HEIGHT_KEY = 'studioMediaHeight';

export const MEDIA_HEIGHT_VAR = '--studio-media-height';

export const DEFAULT_MEDIA_HEIGHT = 208;

/** Never taller than the window can spare, whatever was saved on a bigger one. */
export const clampMediaHeight = (height: number) =>
  Math.max(
    MEDIA_MIN_HEIGHT,
    Math.min(height, MEDIA_MAX_HEIGHT, Math.max(MEDIA_MIN_HEIGHT, window.innerHeight - SLIDE_ROOM)),
  );

export const readMediaHeight = () => {
  try {
    const saved = Number(localStorage.getItem(HEIGHT_KEY));

    return clampMediaHeight(Number.isFinite(saved) && saved > 0 ? saved : DEFAULT_MEDIA_HEIGHT);
  } catch {
    return DEFAULT_MEDIA_HEIGHT;
  }
};

export const writeMediaHeight = (height: number) => {
  document.documentElement.style.setProperty(MEDIA_HEIGHT_VAR, `${height}px`);

  try {
    localStorage.setItem(HEIGHT_KEY, String(height));
  } catch {
    // Non-critical.
  }
};
