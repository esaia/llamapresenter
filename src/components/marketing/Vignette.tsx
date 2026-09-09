'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react';

/**
 * The room going black behind the console as it grows, and lifting again as
 * the feature cards after it arrive.
 *
 * Tracked against the whole section this wraps, not the console's own zoom in
 * `ScrollZoom` — that only pins and grows its own frame, and has nothing to
 * say about when the room around it should lighten back up.
 *
 * Sprung rather than read straight off the scroll, so the fade settles in
 * behind a flick of the wheel instead of tracking every step of it — the
 * deliberate cost of "slow" is a beat of lag if you stop scrolling mid-fade,
 * which reads as the room catching up rather than as the room being slow to
 * look at.
 *
 * Fixed rather than pinned like the zoom itself: what is darkening is the
 * whole viewport around the frame, not a box that has to be measured and
 * scaled. Painted before its own children in the markup and given no z-index
 * of its own, so ordinary stacking — later in the tree paints on top — is
 * what keeps the frame above it without reaching for one.
 *
 * Skipped below `lg` for the same reason `ScrollZoom` skips its own pin
 * there: the console never grows into the window on a phone, everything is
 * just stacked and scrolled past at its own size, so there is no "room
 * around the frame" for a vignette to darken — only a page.
 */
export const Vignette = ({ children }: { children: React.ReactNode }) => {
  const reduced = useReducedMotion();
  const [wide, setWide] = useState(false);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = window.matchMedia('(min-width: 64rem)');
    const read = () => setWide(q.matches);
    read();
    q.addEventListener('change', read);
    return () => q.removeEventListener('change', read);
  }, []);

  const { scrollYProgress } = useScroll({ target: track, offset: ['start start', 'end end'] });
  const t = useSpring(scrollYProgress, { stiffness: 55, damping: 22, mass: 0.5 });

  // A long, gentle climb to black — timed to finish about where the console
  // frame has grown enough to cover the words above it — held through the
  // video at full size, then just as long a climb back to light, easing back
  // up well before the feature cards below are on screen rather than
  // snapping the moment they arrive.
  const opacity = useTransform(t, [0.05, 0.35, 0.75, 0.95], [0, 1, 1, 0]);

  return (
    <div ref={track} className="relative">
      {reduced || !wide ? null : (
        <motion.div aria-hidden className="pointer-events-none fixed inset-0 bg-[#110F0F]" style={{ opacity }} />
      )}
      {children}
    </div>
  );
};
