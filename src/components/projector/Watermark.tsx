import { LlamaMark } from '@/components/brand/Wordmark';

/**
 * What a Free church's screens carry.
 *
 * The one thing Pro takes away rather than raises, which is why it is worth
 * being careful with. It sits in a corner and never moves: a mark that
 * animates, or that repositions with the words, pulls the eye off the verse,
 * and the verse is the entire point of the screen.
 *
 * Its own dark plate rather than a blend mode. `/lower3rd` is captured by OBS
 * over a genuinely transparent background, where `mix-blend-*` has nothing of
 * ours to blend with and behaves differently from the projector — one drawing
 * that reads the same on a white slide, a photograph and a camera feed is
 * worth more than a clever one that does not.
 *
 * Sized in `vh` so it is the same fraction of a 1080p wall, a stage monitor and
 * a stream, and drawn from `LlamaMark` because that file is the only drawing of
 * the llama.
 *
 * `aria-hidden`: it is our mark, not the church's content, and a screen reader
 * following a service should be reading the verse.
 */
export const Watermark = () => (
  <div
    aria-hidden
    className="pointer-events-none absolute right-[1.8vh] bottom-[1.8vh] z-30 flex items-center gap-[0.7vh]
      rounded-full bg-black/35 px-[1.2vh] py-[0.6vh] text-[1.5vh] leading-none font-semibold tracking-tight
      text-white/75 backdrop-blur-[2px]"
  >
    <LlamaMark bare className="size-[2vh] shrink-0 opacity-90" />
    LlamaPresenter
  </div>
);
