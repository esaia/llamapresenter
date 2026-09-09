'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * A price that counts from the one before it to the one now asked for.
 *
 * The monthly/yearly switch moves $9 to $89 and $189 back to $19, and a number
 * that simply swaps leaves the reader checking whether it changed at all. A
 * count is the one animation that says *which* number moved and *which way* it
 * went, which is the whole question the switch is asking.
 *
 * Held as a string end to end — `$89`, `$7.42` — so the currency and any
 * decimals come from whatever priced it, and nothing here has to know that a
 * price is dollars. Only the digits move; the symbol either side of them stays
 * put.
 *
 * The first render shows the target outright, so the server's HTML and the
 * browser's first paint agree and nothing ticks on a page that has only just
 * loaded. It counts on the *second* value it is given, which is the press.
 */

/** How long a count takes, whether it climbs 10 or 170. */
const RUN = 520;

/** Out of the gate and easing into the answer, so the last digits settle. */
const ease = (t: number) => 1 - (1 - t) ** 3;

/** The digits in the middle of a price, and whatever sits either side of them. */
const parse = (value: string) => {
  const match = /^(\D*)(\d+(?:\.\d+)?)(.*)$/.exec(value);

  if (!match) return null;

  const [, before, digits, after] = match;

  return { before, after, target: Number(digits), places: (digits.split('.')[1] ?? '').length };
};

export const CountingPrice = ({
  value,
  className = '',
  style,
}: {
  value: string;
  className?: string;
  /** The ladder sets its own size per rung, so the caller may size the text. */
  style?: React.CSSProperties;
}) => {
  const parsed = parse(value);
  const target = parsed?.target ?? 0;

  const [shown, setShown] = useState(target);
  // What is on screen right now, so a switch pressed twice in half a second
  // carries on from the number the reader can see rather than from the one the
  // last count was aiming at.
  const at = useRef(target);

  useEffect(() => {
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (still || at.current === target) {
      at.current = target;
      setShown(target);

      return;
    }

    const from = at.current;
    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / RUN);
      const next = from + (target - from) * ease(t);

      at.current = next;
      setShown(next);

      if (t < 1) frame = requestAnimationFrame(tick);
      else at.current = target;
    };

    frame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frame);
  }, [target]);

  if (!parsed) return <span className={className} style={style}>{value}</span>;

  return (
    <span className={className} style={style}>
      {parsed.before}
      {/* Tabular figures: a number counting through 9s and 1s in a
          proportional face jitters its own width, and the price sits beside a
          word that would shuffle with it. */}
      <span className="tabular-nums">{shown.toFixed(parsed.places)}</span>
      {parsed.after}
    </span>
  );
};
