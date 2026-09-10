-- A fresh library ships with one more thing already in it: a lower-thirds
-- song, laid out as name slides and subtitle slides alternating. An operator
-- who has never fired a name card gets to see the shape of one before they
-- have to build it themselves.
--
-- The eight slides are placeholder text only — no real name, no real handle —
-- the same way a blank template ships with sample copy rather than a real
-- person's details.

-- The eight slides, as their own function rather than inlined twice — the
-- trigger below uses it for every account made from here on, and the backfill
-- further down uses it once for every account that already exists.
create or replace function public.starter_lower_thirds_slides() returns jsonb
language sql immutable as $$
  select jsonb_build_array(
    jsonb_build_object('id', gen_random_uuid(), 'text', 'FULL NAME GOES HERE'),
    jsonb_build_object('id', gen_random_uuid(), 'text', 'SUBTITLE or SOCIAL MEDIA HANDLE GOES HERE'),
    jsonb_build_object('id', gen_random_uuid(), 'text', 'Subtitle or social media here'),
    jsonb_build_object('id', gen_random_uuid(), 'text', 'Subtitles GOES HERE or THEIR social HANDLES'),
    jsonb_build_object('id', gen_random_uuid(), 'text', 'Subtitles GOES HERE or THEIR social HANDLES'),
    jsonb_build_object('id', gen_random_uuid(), 'text', 'SUBTITLE GOES HERE OR SOCIAL MEDIA HANDLE'),
    jsonb_build_object('id', gen_random_uuid(), 'text', 'FULL NAME GOES HERE'),
    jsonb_build_object('id', gen_random_uuid(), 'text', 'SUBTITLE or SOCIAL MEDIA HANDLE GOES HERE')
  );
$$;

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare new_session uuid;
declare new_library uuid;
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email,
          new.raw_user_meta_data ->> 'full_name',
          new.raw_user_meta_data ->> 'avatar_url');

  insert into public.subscriptions (user_id) values (new.id);
  insert into public.settings (user_id) values (new.id);

  insert into public.sessions (user_id) values (new.id) returning id into new_session;
  insert into public.session_state (session_id) values (new_session);
  insert into public.session_workspace (session_id) values (new_session);

  -- Somewhere to file songs, and somewhere to run a service from.
  insert into public.song_libraries (user_id, name) values (new.id, 'Library') returning id into new_library;
  insert into public.song_playlists (user_id, name) values (new.id, 'Playlist');

  insert into public.songs (user_id, title, slides, library_id, source)
  values (new.id, 'Lower Thirds', public.starter_lower_thirds_slides(), new_library, 'manual');

  return new;
end;
$$;

-- Every account made before this migration, filed on the library it already
-- has (the oldest one, same rule the song-libraries backfill used) rather than
-- a new one. Skipped where an account already has something called "Lower
-- Thirds" — reran or typed by the operator themselves — so this never doubles
-- up and never overwrites their own song of that name.
--
-- The plan-limit trigger is sat out for this one statement: a church already
-- at its ceiling should still get the starter song, the same way the ceiling
-- never takes one away from a church that has since gone over it.
alter table public.songs disable trigger songs_plan_limit;

insert into public.songs (user_id, title, slides, library_id, source)
select account.id, 'Lower Thirds', public.starter_lower_thirds_slides(), library.id, 'manual'
from auth.users as account
join lateral (
  select id from public.song_libraries as library
  where library.user_id = account.id
  order by library.position, library.created_at
  limit 1
) as library on true
where not exists (
  select 1 from public.songs as song
  where song.user_id = account.id and lower(song.title) = 'lower thirds'
);

alter table public.songs enable trigger songs_plan_limit;
