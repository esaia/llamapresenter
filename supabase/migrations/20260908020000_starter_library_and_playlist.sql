-- A new console opens with a shelf and a running order already on it.
--
-- It opened with neither, and the rail said so: "Make a library to file songs
-- on, and a playlist to run a service from." True, and still one more thing to
-- do before the first song can go anywhere — the operator has to invent two
-- names for concepts they have not met yet, in the ten minutes before a
-- service. The empty state is honest but it is not a good first morning.
--
-- One of each, which is also exactly what the free plan allows, so nothing here
-- spends an allowance the operator would rather have chosen themselves. They
-- are renameable like any other.

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare new_session uuid;
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
  insert into public.song_libraries (user_id, name) values (new.id, 'Library');
  insert into public.song_playlists (user_id, name) values (new.id, 'Playlist');

  return new;
end;
$$;

-- And the accounts that were made before this. Only the ones that have none:
-- an operator who deleted their last library did that on purpose.
insert into public.song_libraries (user_id, name)
select id, 'Library' from auth.users as account
where not exists (
  select 1 from public.song_libraries as library where library.user_id = account.id
);

insert into public.song_playlists (user_id, name)
select id, 'Playlist' from auth.users as account
where not exists (
  select 1 from public.song_playlists as playlist where playlist.user_id = account.id
);
