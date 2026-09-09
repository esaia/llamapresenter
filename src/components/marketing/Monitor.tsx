import Image from 'next/image';

/**
 * A screenshot on a desk monitor.
 *
 * The rest of the site shows a screen as `Frame` — a dark pane with the URL
 * above it, because "every screen is a link" is the pitch. This one is for the
 * places that want the console to look like the machine in the booth instead:
 * the picture says desktop before a word of the page is read.
 *
 * Drawn rather than composited into the image so it stays sharp at any density
 * and the screenshot behind it can be replaced on its own. The proportions are
 * a 16:10 desktop display, modelled on a modern flat-panel: an even, slim
 * bezel rather than a deep chin, a thin neck and a foot that reads as a plate
 * rather than a pill.
 */
export const Monitor = ({
  src,
  alt,
  /** The screenshot's own shape, so the screen crops none of it. */
  aspect = '2000/1066',
  className,
  sizes,
}: {
  src: string;
  alt: string;
  aspect?: string;
  className?: string;
  sizes?: string;
}) => (
  <figure className={className}>
    <div
      className="rounded-[1rem] bg-studio-bar p-[0.45rem] shadow-site-frame ring-1 ring-site-ink/[0.06]
        sm:rounded-[1.2rem] sm:p-[0.6rem]"
    >
      <div
        className="relative overflow-hidden rounded-[0.55rem] bg-studio-slide sm:rounded-[0.7rem]"
        style={{ aspectRatio: aspect }}
      >
        <Image src={src} alt={alt} fill className="object-cover" sizes={sizes ?? '(min-width: 1024px) 40rem, 100vw'} />
      </div>
    </div>

    {/* The neck and the foot. Aria-hidden: they are furniture, and the picture
        is already described by the screenshot's own alt text. A slim neck and
        a wide, shallow plate, the way a modern display stands rather than the
        deep chin and pill-foot of an old CRT-era monitor. */}
    <div aria-hidden className="mx-auto h-3 w-[8%] bg-studio-bar/70 sm:h-4" />
    <div aria-hidden className="mx-auto h-1.5 w-[24%] rounded-full bg-studio-bar/90 sm:h-[7px]" />
  </figure>
);
