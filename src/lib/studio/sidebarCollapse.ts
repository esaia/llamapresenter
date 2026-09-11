/**
 * Whether the left rail is collapsed to its mini, icon-only shape, as a
 * per-machine preference.
 *
 * Unlike the rail width and the preview tab, this one cannot be stamped on
 * `<html>` before React runs: the rail's *width* is only half of what mini
 * mode changes — `Sidebar.tsx` swaps in an entirely different tree of icons
 * and flyouts for the languages, transition and outputs rows. Doing that
 * ahead of hydration would mean shipping two complete rails (drag-and-drop
 * lists, debounced inputs and all) and picking one with CSS, which is a
 * second live copy of everything in the first, not a cheaper one. So both
 * the width and the content wait for the same `mini` value out of
 * `useSyncExternalStore` in `Console.tsx` — a rail that briefly opens full
 * before snapping to icons is a plain, correct frame; one squeezed into an
 * icon's width while still drawing full rows is broken.
 */

const KEY = 'studioSidebarCollapsed';

export const readSidebarCollapsed = (): boolean => {
  try {
    return localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
};

export const writeSidebarCollapsed = (collapsed: boolean) => {
  try {
    if (collapsed) localStorage.setItem(KEY, '1');
    else localStorage.removeItem(KEY);
  } catch {
    // Non-critical.
  }
};
