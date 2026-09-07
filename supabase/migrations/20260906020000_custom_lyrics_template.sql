-- The song slide the operator draws themselves: the custom lyric look.
--
-- Its own column rather than a second entry in `custom_template`, because a
-- song slide is a different arrangement of different things — no reference,
-- and its languages are the song's own rather than the armed ones — so an
-- operator picks a layout for verses and a layout for songs separately, the
-- way they already pick a shipped look for each.
--
-- `{}` reads as one centred box holding every language the song is sung in.
alter table public.settings
  add column if not exists custom_lyrics_template jsonb not null default '{}'::jsonb;
