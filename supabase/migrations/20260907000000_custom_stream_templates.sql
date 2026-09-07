-- The stream's own two custom looks: a verse strap and a song strap the
-- operator draws themselves.
--
-- Separate from the projector's pair because the overlay is a different shape
-- of thing — a strap composited over live video rather than a wall of words —
-- and an operator who has drawn one has not drawn the other. Both are the
-- same document as the projector's, so one editor draws all four.
--
-- `{}` reads as a bar across the foot of the frame, which is where a lower
-- third has always been.
alter table public.settings
  add column if not exists custom_stream_template jsonb not null default '{}'::jsonb,
  add column if not exists custom_stream_lyrics_template jsonb not null default '{}'::jsonb;
