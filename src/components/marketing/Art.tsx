import Image from 'next/image';

/**
 * The drawing beside a feature: screens of the app, arranged and annotated by
 * hand rather than screenshotted.
 *
 * Every one is the same 1000x700 artboard on a transparent ground, so they
 * share a column width and need no frame around them — the shadows and the
 * coloured card behind each are part of the picture. Lives here rather than in
 * the home page because the comparison page shows the same drawings, and two
 * copies of the artboard's dimensions is one copy too many.
 */
export const Art = ({ src, alt }: { src: string; alt: string }) => (
  <Image
    src={src}
    alt={alt}
    width={1000}
    height={700}
    sizes="(min-width: 1024px) 38rem, 100vw"
    className="h-auto w-full"
  />
);
