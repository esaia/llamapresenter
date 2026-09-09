import { LlamaMark } from '@/components/brand/Wordmark';

/**
 * What a Free church's screens carry.
 *
 * The one thing Pro takes away rather than raises, so it is worth being careful
 * with: it sits in a corner, it never moves, and it is as small as it can be
 * and still be read. A mark that animates, repositions with the words or takes
 * a plate of its own pulls the eye off the verse, and the verse is the entire
 * point of the screen.
 *
 * **The llama keeps its own plate.** `bare` draws the coat in brand ink, which
 * is a black llama — invisible on a projector's black and on any dark
 * photograph, leaving its yellow shades floating on nothing. The plated mark is
 * the drawing that was made to sit on anything, so that is the one used here.
 *
 * **The name is white with a shadow rather than a panel behind it.** A chip
 * reads as part of the church's slide — a label somebody put there on purpose —
 * where a shadowed wordmark reads as a mark on top of it. It also survives
 * `/lower3rd`, which is captured over a genuinely transparent background: a
 * plate there is a grey box on the broadcast, and a shadow is nothing at all
 * until there is something behind it.
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
    className="pointer-events-none absolute right-[2vh] bottom-[2vh] z-30 flex items-center gap-[0.55vh]
      text-[1.35vh] leading-none font-medium tracking-tight text-white/60
      [filter:drop-shadow(0_0.1vh_0.25vh_rgba(0,0,0,0.55))]"
  >
    <LlamaMark className="size-[1.9vh] shrink-0 rounded-[0.5vh] opacity-75" />
    LlamaPresenter
  </div>
);
