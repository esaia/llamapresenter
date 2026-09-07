/**
 * Undo, as three lists.
 *
 * Pure, and separate from the editor for the same reason the canvas geometry
 * is: an undo that quietly loses a step is a bug nobody notices until the one
 * time it matters, and that is exactly what a test catches and an operator
 * does not.
 *
 * The shape is the usual one — what came before, what is on screen, and what
 * was undone — and the only interesting decision is that a gesture is *one*
 * entry. A drag across the canvas is a hundred state changes and one act; an
 * undo that stepped back through all hundred would be useless. `edit` takes a
 * key naming the gesture, and while the key holds it replaces the present
 * rather than stacking a new step behind it.
 */
export interface History<T> {
  past: T[];
  present: T;
  future: T[];
}

/** As far back as an editor session remembers. Well past a Sunday's fiddling. */
export const HISTORY_LIMIT = 100;

export const start = <T>(present: T): History<T> => ({ past: [], present, future: [] });

export const canUndo = <T>(history: History<T>) => history.past.length > 0;
export const canRedo = <T>(history: History<T>) => history.future.length > 0;

/**
 * A new step.
 *
 * Anything undone is dropped: the operator has taken a different turning, and
 * a redo stack that survived it would put back work that no longer follows
 * from what is on screen.
 */
export const commit = <T>(history: History<T>, present: T, limit = HISTORY_LIMIT): History<T> =>
  present === history.present
    ? history
    : { past: [...history.past, history.present].slice(-limit), present, future: [] };

/** The same step, still being made: the present moves, nothing is stacked. */
export const amend = <T>(history: History<T>, present: T): History<T> =>
  present === history.present ? history : { ...history, present, future: [] };

export const undo = <T>(history: History<T>): History<T> =>
  canUndo(history)
    ? {
        past: history.past.slice(0, -1),
        present: history.past[history.past.length - 1],
        future: [history.present, ...history.future],
      }
    : history;

export const redo = <T>(history: History<T>): History<T> =>
  canRedo(history)
    ? {
        past: [...history.past, history.present],
        present: history.future[0],
        future: history.future.slice(1),
      }
    : history;
