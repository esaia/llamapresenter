-- A music library is a shelf like any other, and had no ceiling.
--
-- The Audio tab's LIBRARIES are `audio_categories`: the operator's own shelves
-- for their music, beside the "All tracks" list every account has. Songs got a
-- library ceiling and music did not, which was an oversight rather than a
-- decision — the same shape of thing should cost the same.
--
-- One, like song libraries, and "All tracks" is not one of them: a free account
-- keeps every track it is allowed in a list it did not have to make.

create or replace function public.free_limit(key text) returns int
language sql immutable as $$
  select case key
    when 'sessions'           then 1
    when 'songs'              then 15
    when 'libraries'          then 1
    when 'playlists'          then 1
    when 'songs_per_playlist' then 3
    when 'audio_tracks'       then 5
    when 'audio_categories'   then 1
    when 'name_cards'         then 3
    when 'languages'          then 2
    when 'custom_fonts'       then 0
    when 'custom_templates'   then 0
  end;
$$;

drop trigger if exists audio_categories_plan_limit on public.audio_categories;
create trigger audio_categories_plan_limit before insert on public.audio_categories
  for each row execute function public.enforce_row_limit('audio_categories');
