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
 * a 16:10 desktop display: a thin bezel, a chin a little deeper than the sides,
 * a short neck and a base that is wider than it is tall.
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
      className="rounded-[1.4rem] bg-studio-bar p-[0.6rem] pb-[1.6rem] shadow-site-frame ring-1
        ring-site-ink/10 sm:rounded-[1.8rem] sm:p-3 sm:pb-7"
    >
      <div
        className="relative overflow-hidden rounded-[0.7rem] bg-studio-slide sm:rounded-[0.9rem]"
        style={{ aspectRatio: aspect }}
      >
        <Image src={src} alt={alt} fill className="object-cover" sizes={sizes ?? '(min-width: 1024px) 40rem, 100vw'} />
      </div>
    </div>

    {/* The neck and the foot. Aria-hidden: they are furniture, and the picture
        is already described by the screenshot's own alt text. */}
    <div aria-hidden className="mx-auto h-5 w-[14%] bg-studio-bar/80 sm:h-7" />
    <div aria-hidden className="mx-auto h-2 w-[30%] rounded-full bg-studio-bar sm:h-2.5" />
  </figure>
);
