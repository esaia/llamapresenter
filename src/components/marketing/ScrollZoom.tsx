'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react';

/**
 * The console screenshot, walked up to.
 *
 * The one picture on this page that is the whole product gets the one piece of
 * motion on this page. The words and the frame are pinned together as one
 * group, centred in the window and sitting exactly as they would on a still
 * page; then the section holds under the scroll and the frame grows until it
 * is the window — over the words, which stay where they were until it covers
 * them. Scroll-linked rather than played once: scrubbing back up plays it
 * back, and a page that animates on its own animates while you are trying to
 * read it.
 *
 * Both figures are measured rather than guessed. The frame is asked how much
 * bigger the window is, capped so a short window crops none of it; and because
 * it sits below the words rather than in the middle of the screen, it rides up
 * to the middle as it grows — a frame that grew where it stood would go off
 * the bottom. `sizes="100vw"` on the shot inside is the other half of the
 * scale figure: the file fetched is the one the *zoomed* frame needs.
 *
 * A phone gets none of it: a pinned section costs two windows of scrolling to
 * read one picture, the picture is already the width of the screen there, and
 * the scroll on a touch device is the reader's own. Below `lg` — and for
 * anyone who has asked for less motion — the words and the frame are simply
 * stacked.
 */
export const ScrollZoom = ({ intro, children }: { intro: React.ReactNode; children: React.ReactNode }) => {
  const track = useRef<HTMLDivElement>(null);
  const group = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [wide, setWide] = useState(false);
  const [fit, setFit] = useState({ scale: 1, lift: 0 });

  // `lg`, the breakpoint the page's own two-column layouts turn on at.
  useEffect(() => {
    const q = window.matchMedia('(min-width: 64rem)');
    const read = () => setWide(q.matches);
    read();
    q.addEventListener('change', read);
    return () => q.removeEventListener('change', read);
  }, []);

  // Re-run when the page crosses into the animated layout: the box being
  // measured does not exist until then, and a first pass against nothing would
  // leave the frame at its natural size for the whole of the pin.
  useEffect(() => {
    const measure = () => {
      const el = box.current;
      const wrap = group.current;
      if (!el || !wrap) return;
      // Layout sizes, not `getBoundingClientRect`: on a resize the box is
      // already under a scale, and a rect would report the scaled figure and
      // compound it.
      const { offsetWidth: width, offsetHeight: height, offsetTop: top } = el;
      if (!width || !height) return;

      setFit({
        // Contain, not cover: whichever axis runs out first is the one that
        // decides, so the whole console is on screen at the end.
        scale: Math.max(1, Math.min(window.innerWidth / width, window.innerHeight / height)),
        // The group is centred in the window, so the middle of the group is
        // the middle of the screen: this is the distance from the frame's own
        // centre to that, and it is negative because the frame sits below it.
        lift: wrap.offsetHeight / 2 - (top + height / 2),
      });
    };

    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [wide, reduced]);

  // The track is a window taller than the stage: that extra window is the
  // scroll the zoom is given, and the section lets go the moment it is spent.
  const { scrollYProgress } = useScroll({ target: track, offset: ['start start', 'end end'] });

  // Scroll wheels arrive in steps; the spring is what turns them into a move.
  const t = useSpring(scrollYProgress, { stiffness: 110, damping: 26, mass: 0.35 });

  // Full size is reached before the end of the track, so there is a beat of
  // holding it there before the page moves on.
  const scale = useTransform(t, [0.06, 0.78], [1, fit.scale]);
  const y = useTransform(t, [0.06, 0.78], [0, fit.lift]);

  if (reduced || !wide) {
    return (
      <div className="space-y-12">
        {intro}
        <div className="mx-auto max-w-7xl px-6">{children}</div>
      </div>
    );
  }

  return (
    <div ref={track} className="relative h-[200vh]">
      {/* The stage is the size of the window and mostly empty, so it lets
          clicks through and only the frame takes them back — otherwise it
          would swallow whatever it is sitting over.

          `overflow-x-clip` rather than `overflow-hidden`: a clipped stage would
          also cut the frame's shadow off at the top and bottom. */}
      <div className="pointer-events-none sticky top-0 z-20 flex h-dvh items-center overflow-x-clip">
        <div ref={group} className="relative w-full">
          {intro}

          <div className="mx-auto mt-12 w-full max-w-7xl px-6">
            <motion.div ref={box} className="pointer-events-auto" style={{ scale, y, willChange: 'transform' }}>
              {children}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};
