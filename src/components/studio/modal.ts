'use client';

/**
 * Is a dialog on top of the console right now?
 *
 * The console's shortcuts are global — ⌘F finds a song, the arrows step
 * slides, Delete drops one — because an operator's hands are never in one
 * place. A dialog is the one time that is wrong: ⌘F over the template editor
 * opened the song finder across it, and an arrow key meant for a slider went
 * to the projector instead.
 *
 * Asked of the document rather than tracked in state, because the dialogs are
 * opened from half a dozen places and threading a flag out of each of them
 * would be a contract every new one could forget. `aria-modal` is what a
 * dialog already has to say about itself for a screen reader, so the marker
 * and the accessibility are the same fact.
 */
export const MODAL_SELECTOR = '[aria-modal="true"]';

export const modalOpen = () =>
  typeof document !== 'undefined' && document.querySelector(MODAL_SELECTOR) !== null;
