'use client';

import { useEffect, type DragEvent } from 'react';

/**
 * How a drop target says so, everywhere the console has one.
 *
 * A dashed inset outline rather than a hard ring: it reads as "this area is
 * open" without redrawing the panel's own borders, and it sits inside the
 * scroll box so a long list does not push it out of view.
 */
export const DROP_ZONE = 'bg-studio-accent/5 outline-2 outline-dashed outline-studio-accent -outline-offset-4';

/** Where the drop would land in an ordered list. */
export const DROP_LINE = 'border-studio-accent';

/**
 * Has the drag actually left this box, or only crossed into something inside
 * it?
 *
 * `dragover` is listened for on the panel and arrives by bubbling from
 * whatever child the pointer is over, so `dragleave` arrives the same way —
 * once for every child boundary crossed on the way across. Comparing
 * `currentTarget` to `target` answers "did it leave the panel *itself*", which
 * is only true when the pointer never touched a child at all: drag over a song
 * card and out again and the panel is never told, so the highlight stays lit
 * with no drag under it.
 *
 * `relatedTarget` is where the pointer went next. Still inside means it is
 * still over the zone; outside — or nothing at all, on the way out of the
 * window — means it has gone.
 */
export const leftZone = (event: DragEvent<HTMLElement>) =>
  !event.currentTarget.contains(event.relatedTarget as Node | null);

/**
 * Put the highlight out when the drag ends anywhere at all.
 *
 * The safety net behind `leftZone`: a drag abandoned with Escape, or dropped
 * on another window, sends no `dragleave` to anyone. Without this the console
 * is left outlined until something else happens to clear it, which is the
 * shape the operator sees as "stuck".
 */
export const useDragEnded = (lit: boolean, clear: () => void) => {
  useEffect(() => {
    if (!lit) return;

    // `drop` as well as `dragend`: a drop the page itself handles never
    // reaches the window when a handler calls `preventDefault`, but one that
    // lands anywhere else does.
    window.addEventListener('dragend', clear);
    window.addEventListener('drop', clear);

    return () => {
      window.removeEventListener('dragend', clear);
      window.removeEventListener('drop', clear);
    };
  }, [lit, clear]);
};
