/**
 * Whether the left rail is collapsed to its mini, icon-only shape, as a
 * per-machine preference.
 *
 * The *shape* — `Sidebar.tsx` swaps in an entirely different tree of icons
 * and flyouts for the languages, transition and outputs rows — still waits
 * for the same `mini` value out of `useSyncExternalStore` in `Console.tsx`.
 * Doing that ahead of hydration would mean shipping two complete rails
 * (drag-and-drop lists, debounced inputs and all) and picking one with CSS, a
 * second live copy of everything in the first rather than a cheaper one.
 *
 * The *width*, though, is one number, and the column's `overflow-hidden`
 * already crops whatever shape is inside it — so unlike the shape, the width
 * costs nothing to get right on the first frame. It is stamped on `<html>` by
 * a blocking script the same way the rail width is (see `railWidth.ts`), and
 * the aside reads it as a CSS variable rather than a class React only knows
 * how to pick once it has hydrated. That is what turns "opens full and snaps
 * to icons a few frames later" into "opens at its saved width, with a
 * cropped, momentarily-wrong picture inside it nobody has time to read."
 */

const KEY = 'studioSidebarCollapsed';

/** What `w-14` (mini) and `w-[18rem]` (full) are in Tailwind, as plain numbers a script can write. */
export const SIDEBAR_MINI_WIDTH = 56;
export const SIDEBAR_FULL_WIDTH = 288;

export const SIDEBAR_WIDTH_VAR = '--studio-sidebar-width';

export const readSidebarCollapsed = (): boolean => {
  try {
    return localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
};

export const writeSidebarCollapsed = (collapsed: boolean) => {
  document.documentElement.style.setProperty(
    SIDEBAR_WIDTH_VAR,
    `${collapsed ? SIDEBAR_MINI_WIDTH : SIDEBAR_FULL_WIDTH}px`,
  );

  try {
    if (collapsed) localStorage.setItem(KEY, '1');
    else localStorage.removeItem(KEY);
  } catch {
    // Non-critical.
  }
};

/**
 * The same read, inlined into the document so the rail is already the right
 * width before React has decided anything. Built from the constants above so
 * the two cannot drift apart.
 */
export const sidebarWidthScript = `(function(){try{var c=localStorage.getItem('${KEY}')==='1';document.documentElement.style.setProperty('${SIDEBAR_WIDTH_VAR}',(c?${SIDEBAR_MINI_WIDTH}:${SIDEBAR_FULL_WIDTH})+'px')}catch(e){}})()`;
