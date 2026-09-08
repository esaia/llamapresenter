-- A song library stops being counted.
--
-- It was counted for symmetry with playlists, and the two are not the same
-- thing. A playlist is a service — the running order for one Sunday — and one
-- of those is a fair thing to ask a free account to work within. A library is
-- only a shelf, and importing a ProPresenter bundle makes one, because a bundle
-- is somebody else's library and tipping it into the shelf on screen mixes two
-- collections that were never meant to be one.
--
-- So the ceiling landed on the wrong thing: it did not limit how much a free
-- account holds — `songs` already does that — it stopped the import that would
-- have filled it. Shelves are free. What is on them is what is counted.

create or replace function public.free_limit(key text) returns int
language sql immutable as $$
  select case key
    when 'sessions'           then 1
    when 'songs'              then 15
    when 'playlists'          then 1
    when 'songs_per_playlist' then 3
    when 'audio_tracks'       then 5
    when 'audio_categories'   then 2
    when 'name_cards'         then 3
    when 'languages'          then 2
    when 'custom_fonts'       then 0
    when 'custom_templates'   then 0
  end;
$$;

-- `free_limit` now returns null for 'libraries', which `plan_ceiling` reads as
-- no ceiling — but the trigger goes too, so the count is not taken at all.
drop trigger if exists song_libraries_plan_limit on public.song_libraries;
