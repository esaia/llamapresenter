/**
 * Whether the left rail is collapsed, as a per-machine preference.
 *
 * Same problem as the rail width and the preview tab, and the same answer:
 * the server cannot read `localStorage`, so a rail seeded from React state
 * would flash open on every reload for an operator who collapsed it. The
 * saved flag is stamped onto `<html>` by a blocking script while the
 * console's HTML is still parsing, and `globals.css` collapses the rail from
 * there. This file stays free of React so `layout.tsx`, a server component,
 * can import the script from it; `useSidebarCollapsed` in `Console.tsx` is
 * what reads it back to choose the toggle button's icon, and writes it when
 * clicked.
 */

const KEY = 'studioSidebarCollapsed';

/** Read by the CSS rule that collapses the rail before hydration. */
export const SIDEBAR_COLLAPSED_ATTR = 'data-sidebar-collapsed';

export const readSidebarCollapsed = (): boolean => {
  try {
    return localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
};

export const writeSidebarCollapsed = (collapsed: boolean) => {
  document.documentElement.toggleAttribute(SIDEBAR_COLLAPSED_ATTR, collapsed);

  try {
    if (collapsed) localStorage.setItem(KEY, '1');
    else localStorage.removeItem(KEY);
  } catch {
    // Non-critical.
  }
};

/** The same read, inlined into the document so the rail is already the right width in the first frame. */
export const sidebarCollapsedScript = `(function(){try{if(localStorage.getItem('${KEY}')==='1')document.documentElement.setAttribute('${SIDEBAR_COLLAPSED_ATTR}','')}catch(e){}})()`;
