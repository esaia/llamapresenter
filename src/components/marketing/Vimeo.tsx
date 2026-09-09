/**
 * A Vimeo video, filling whatever box it is put in.
 *
 * Meant to sit inside `Frame`'s pane — which is already `relative` — the same
 * way `Frame`'s own `Image` does, so the two share one aspect-ratio and
 * rounding story instead of the video carving out its own frame.
 */
export const Vimeo = ({ id, title }: { id: string; title: string }) => (
  <iframe
    // Autoplay only fires muted — a browser policy, not a Vimeo one — and with
    // the controls gone there is no play button left to start it by hand, so
    // it also loops rather than ending on a dead, silent last frame.
    src={`https://player.vimeo.com/video/${id}?badge=0&autopause=0&player_id=0&app_id=58479&autoplay=1&muted=1&loop=1&controls=0&title=0&byline=0&portrait=0`}
    title={title}
    className="absolute inset-0 size-full"
    allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
    referrerPolicy="strict-origin-when-cross-origin"
    loading="lazy"
  />
);
