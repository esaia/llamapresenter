/**
 * The product demo, self-hosted rather than on Vimeo.
 *
 * A muted, controls-less, looping background clip has no use for adaptive
 * streaming — nobody is ever offered a quality picker — so there is nothing
 * "auto" buys here that a single, deliberately compressed rendition doesn't:
 * one fixed 1080p encode, always, with no plan to gate it behind. It is also
 * a fraction of the export it started as (~4MB against the raw ~79MB), so
 * self-hosting costs nothing a CDN would have saved.
 *
 * Fills whatever box it is put in, the same way `Vimeo` did and `Frame`'s own
 * `Image` does — meant to sit inside `Frame`'s pane, which is already
 * `relative`.
 */
export const DemoVideo = () => (
  <video
    className="absolute inset-0 size-full object-cover"
    src="/videos/demo.mp4"
    poster="/videos/demo-poster.jpg"
    autoPlay
    muted
    loop
    playsInline
    preload="metadata"
    aria-hidden
  />
);
