/**
 * The arithmetic behind a drag on the template canvas.
 *
 * Pure, and separated from the editor for the same reason `lib/studio/blocks.ts`
 * is separated from the provider: getting it wrong moves a box somewhere
 * slightly wrong rather than throwing, which is exactly the kind of mistake a
 * test catches and an operator does not. The component owns the pointer events
 * and the pixels; everything here is in frame fractions.
 */
import type { Frame } from '@/lib/projector/template';

/** The eight grips on a selected box, named by compass point. */
export const HANDLES = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'] as const;

export type Handle = (typeof HANDLES)[number];

/** Small enough to be a deliberate choice, large enough to still be grabbable. */
export const MIN_W = 0.02;
export const MIN_H = 0.008;

/** How close two edges have to be, in fractions of the frame, to snap together. */
export const SNAP = 0.006;

export const moveBy = (frame: Frame, dx: number, dy: number): Frame => ({
  ...frame,
  x: frame.x + dx,
  y: frame.y + dy,
});

/**
 * The box after dragging one grip by (dx, dy).
 *
 * A corner moves two edges, a side moves one, and the opposite edge stays
 * where it is — which is what makes a resize feel like pulling the box rather
 * than sliding it. Pulling an edge past its opposite pins it at the minimum
 * instead of turning the box inside out.
 */
export const resizeBy = (frame: Frame, handle: Handle, dx: number, dy: number): Frame => {
  let { x, y, w, h } = frame;

  const right = x + w;
  const bottom = y + h;

  if (handle.includes('w')) {
    x = Math.min(x + dx, right - MIN_W);
    w = right - x;
  }

  if (handle.includes('e')) w = Math.max(MIN_W, w + dx);

  if (handle.includes('n')) {
    y = Math.min(y + dy, bottom - MIN_H);
    h = bottom - y;
  }

  if (handle.includes('s')) h = Math.max(MIN_H, h + dy);

  return { x, y, w, h };
};

/**
 * Keep a box findable.
 *
 * Not "inside the frame": a picture meant to bleed off every edge is a normal
 * thing to draw, and a photograph clamped back to the screen edge would be the
 * editor refusing a correct instruction. What is not allowed is losing one —
 * so the *centre* has to stay on the frame, which leaves any amount of
 * overhang and no way to drag a box off into nowhere.
 */
export const clampToFrame = (frame: Frame): Frame => ({
  ...frame,
  x: Math.min(1 - frame.w / 2, Math.max(-frame.w / 2, frame.x)),
  y: Math.min(1 - frame.h / 2, Math.max(-frame.h / 2, frame.y)),
});

/** Where a box can be sent, relative to the slide itself. */
export const EDGES = ['left', 'hcenter', 'right', 'top', 'vmiddle', 'bottom'] as const;

export type Edge = (typeof EDGES)[number];

/**
 * A box moved flush to one edge of the slide, or onto its centre line.
 *
 * Against the frame rather than against another box, because a selection here
 * is one element: "centre this on the screen" is the thing an operator asks
 * for constantly and the one thing the eye is worst at. The size never
 * changes — this moves a box, it does not stretch one.
 */
export const alignTo = (frame: Frame, edge: Edge): Frame => {
  switch (edge) {
    case 'left':
      return { ...frame, x: 0 };
    case 'hcenter':
      return { ...frame, x: (1 - frame.w) / 2 };
    case 'right':
      return { ...frame, x: 1 - frame.w };
    case 'top':
      return { ...frame, y: 0 };
    case 'vmiddle':
      return { ...frame, y: (1 - frame.h) / 2 };
    default:
      return { ...frame, y: 1 - frame.h };
  }
};

/** How far a held Shift rounds a turn, in degrees. */
export const ANGLE_STEP = 15;

/** An angle folded into (-180, 180], so a slider and a readout agree. */
export const normalizeAngle = (degrees: number) => {
  const turned = ((degrees + 180) % 360 + 360) % 360 - 180;

  // -180 and 180 are the same turn; the positive one reads better.
  return turned === -180 ? 180 : turned;
};

export const snapAngle = (degrees: number, step = ANGLE_STEP) =>
  normalizeAngle(Math.round(degrees / step) * step);

/**
 * The angle from a box's centre out to a point, in degrees, with 0 straight up.
 *
 * In pixels rather than frame fractions: the frame is 16:9, so the two axes
 * are different lengths on screen and an angle worked out in fractions would
 * be skewed — the handle would not stay under the pointer.
 */
export const angleFrom = (cx: number, cy: number, x: number, y: number) =>
  normalizeAngle((Math.atan2(x - cx, cy - y) * 180) / Math.PI);

/**
 * A drag turned into the box's own axes.
 *
 * A rotated box still resizes along its own edges — pulling its right-hand
 * grip has to widen it, whichever way it happens to be facing — so the
 * pointer's movement is turned back by the box's own angle before it is read
 * as a change to the frame.
 */
export const unrotate = (dx: number, dy: number, degrees: number) => {
  const radians = (-degrees * Math.PI) / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);

  return { dx: dx * cos - dy * sin, dy: dx * sin + dy * cos };
};

/** A line the editor draws while a box is snapped to something. */
export interface Guide {
  axis: 'x' | 'y';
  at: number;
}

/** Left, centre, right — and the same three vertically. */
const edgesOf = (frame: Frame, axis: 'x' | 'y') =>
  axis === 'x' ? [frame.x, frame.x + frame.w / 2, frame.x + frame.w] : [frame.y, frame.y + frame.h / 2, frame.y + frame.h];

/**
 * The nearest alignment on one axis: how far to shift, and the lines to draw.
 *
 * The frame's own edges and centre are always targets, because "centred on the
 * screen" is the thing an operator most often means and the hardest to hit by
 * eye. Every other box contributes its three too, so a second line of text
 * lands under the first.
 */
const nearest = (frame: Frame, others: Frame[], axis: 'x' | 'y', tolerance: number) => {
  const targets = [0, 0.5, 1, ...others.flatMap(other => edgesOf(other, axis))];
  const edges = edgesOf(frame, axis);

  let delta = 0;
  let best = tolerance;

  for (const edge of edges) {
    for (const target of targets) {
      const distance = Math.abs(target - edge);

      if (distance < best) {
        best = distance;
        delta = target - edge;
      }
    }
  }

  if (!delta) return { delta: 0, guides: [] as Guide[] };

  // Every target the shift actually lands on, not only the one that won it:
  // a box whose left edge and centre both line up should show both lines.
  const guides = targets
    .filter(target => edges.some(edge => Math.abs(edge + delta - target) < 1e-9))
    .map(at => ({ axis, at }));

  return { delta, guides: guides.filter((guide, index) => guides.findIndex(one => one.at === guide.at) === index) };
};

/**
 * A moved box pulled onto the nearest alignment, with the lines to show for it.
 *
 * Only ever a nudge — the tolerance is a fraction of a percent of the frame —
 * so it corrects a drag that was already trying to line up and never fights
 * one that was not.
 */
export const snapTo = (frame: Frame, others: Frame[], tolerance = SNAP): { frame: Frame; guides: Guide[] } => {
  const horizontal = nearest(frame, others, 'x', tolerance);
  const vertical = nearest(frame, others, 'y', tolerance);

  return {
    frame: { ...frame, x: frame.x + horizontal.delta, y: frame.y + vertical.delta },
    guides: [...horizontal.guides, ...vertical.guides],
  };
};
