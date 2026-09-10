/**
 * A self-hosted product clip.
 *
 * Every clip on the marketing site is a fixed, deliberately compressed
 * encode rather than an embed — a controls-less background loop and a
 * feature walkthrough both have no use for adaptive streaming, since nobody
 * is ever offered a quality picker. `DemoVideo` is the ambient loop behind
 * the console screenshot on the home page; a feature walkthrough on a
 * use-case page wants `controls` and no autoplay instead, so both go through
 * this one element rather than duplicating the `<video>` tag.
 *
 * Fills whatever box it is put in, the same way `Frame`'s own `Image` does —
 * meant to sit inside `Frame`'s pane, which is already `relative`.
 */
export const ProductVideo = ({
  src,
  poster,
  autoPlay = true,
  loop = true,
  controls = false,
}: {
  src: string;
  poster: string;
  autoPlay?: boolean;
  loop?: boolean;
  controls?: boolean;
}) => (
  <video
    className="absolute inset-0 size-full object-cover"
    src={src}
    poster={poster}
    autoPlay={autoPlay}
    muted={autoPlay}
    loop={loop}
    controls={controls}
    playsInline
    preload="metadata"
    aria-hidden={autoPlay && !controls}
  />
);
