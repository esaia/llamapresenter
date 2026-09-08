-- Billing moves to Dodo Payments, and the free tier grows a floor.
--
-- Two changes that belong together. The columns stop naming a provider, because
-- the one they named is not the one we use; and the plan stops being a label on
-- a row nobody checks. The console writes to Supabase directly under RLS — a
-- limit enforced only in React is a limit anyone with the anon key can skip —
-- so the ceilings live here, in triggers, and the greyed-out button in the
-- console is a courtesy on top of them.
--
-- The numbers are the same table as `src/lib/billing/limits.json`, and
-- `limits.test.ts` reads this file and fails when the two drift.

-- ---------------------------------------------------------------- provider

do $$
begin
  if exists (select 1 from information_schema.columns
             where table_schema = 'public' and table_name = 'subscriptions'
               and column_name = 'stripe_customer_id') then
    alter table public.subscriptions rename column stripe_customer_id to provider_customer_id;
  end if;

  if exists (select 1 from information_schema.columns
             where table_schema = 'public' and table_name = 'subscriptions'
               and column_name = 'stripe_subscription_id') then
    alter table public.subscriptions rename column stripe_subscription_id to provider_subscription_id;
  end if;
end
$$;

alter table public.subscriptions
  add column if not exists provider text not null default 'dodo',
  -- The timestamp on the event that last wrote this row. Dodo retries, and a
  -- retry can land behind an event that overtook it; without this a stale
  -- delivery could put a paying church back on Free.
  add column if not exists event_at timestamptz;

-- ---------------------------------------------------------------- the switch

-- Whether the ceilings are live, in the one place both halves of the app can
-- read it. The console's half is NEXT_PUBLIC_ENFORCE_GATES; this is the
-- database's, and the two are meant to be flipped together.
--
-- It starts off, so applying this migration changes nothing for anyone. Turn it
-- on with:  update public.billing_config set enforce = true;
create table if not exists public.billing_config (
  id boolean primary key default true check (id),
  enforce boolean not null default false
);

insert into public.billing_config (id, enforce) values (true, false) on conflict (id) do nothing;

alter table public.billing_config enable row level security;

drop policy if exists "read billing config" on public.billing_config;
create policy "read billing config" on public.billing_config for select using (true);

-- ---------------------------------------------------------------- the numbers

create or replace function public.gates_enforced() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select enforce from public.billing_config where id), false);
$$;

create or replace function public.plan_of(uid uuid) returns text
language sql stable security definer set search_path = public as $$
  select coalesce((select plan from public.subscriptions where user_id = uid), 'free');
$$;

-- What a free account holds. Mirrors src/lib/billing/limits.json exactly.
create or replace function public.free_limit(key text) returns int
language sql immutable as $$
  select case key
    when 'sessions'           then 1
    when 'songs'              then 15
    when 'libraries'          then 1
    when 'playlists'          then 1
    when 'songs_per_playlist' then 3
    when 'audio_tracks'       then 5
    when 'name_cards'         then 3
    when 'languages'          then 2
    when 'custom_fonts'       then 0
    when 'custom_templates'   then 0
  end;
$$;

-- The ceiling actually in force for someone, or null for "as many as you like"
-- — which is what Pro gets, and what everyone gets while the gates are off.
create or replace function public.plan_ceiling(uid uuid, key text) returns int
language sql stable security definer set search_path = public as $$
  select case
    when not public.gates_enforced() then null
    when public.plan_of(uid) = 'pro' then null
    else public.free_limit(key)
  end;
$$;

-- ---------------------------------------------------------------- the triggers

-- One trigger function for every table that is simply "rows owned by a user".
-- The limit key is the trigger's argument and the table is its own name, so
-- adding a limit is a `create trigger` rather than another function.
--
-- Only inserts are checked. An account that drops from Pro to Free keeps every
-- song it imported and every playlist it built — deleting a church's work
-- because a card expired would be indefensible — it simply cannot add more
-- until it is back under the line.
create or replace function public.enforce_row_limit() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  ceiling int := public.plan_ceiling(new.user_id, TG_ARGV[0]);
  used int;
begin
  if ceiling is null then return new; end if;

  execute format('select count(*) from public.%I where user_id = $1', TG_TABLE_NAME)
    into used using new.user_id;

  if used >= ceiling then
    raise exception 'plan_limit:%', TG_ARGV[0] using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

drop trigger if exists sessions_plan_limit on public.sessions;
create trigger sessions_plan_limit before insert on public.sessions
  for each row execute function public.enforce_row_limit('sessions');

drop trigger if exists songs_plan_limit on public.songs;
create trigger songs_plan_limit before insert on public.songs
  for each row execute function public.enforce_row_limit('songs');

drop trigger if exists song_libraries_plan_limit on public.song_libraries;
create trigger song_libraries_plan_limit before insert on public.song_libraries
  for each row execute function public.enforce_row_limit('libraries');

drop trigger if exists song_playlists_plan_limit on public.song_playlists;
create trigger song_playlists_plan_limit before insert on public.song_playlists
  for each row execute function public.enforce_row_limit('playlists');

drop trigger if exists audio_tracks_plan_limit on public.audio_tracks;
create trigger audio_tracks_plan_limit before insert on public.audio_tracks
  for each row execute function public.enforce_row_limit('audio_tracks');

drop trigger if exists name_cards_plan_limit on public.name_cards;
create trigger name_cards_plan_limit before insert on public.name_cards
  for each row execute function public.enforce_row_limit('name_cards');

-- A running order is a jsonb array rather than rows, so its ceiling is a length
-- and it has to be checked on update too: the whole list is rewritten by a
-- single drag.
create or replace function public.enforce_playlist_songs() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  ceiling int := public.plan_ceiling(new.user_id, 'songs_per_playlist');
begin
  if ceiling is null then return new; end if;

  if jsonb_array_length(coalesce(new.songs, '[]'::jsonb)) > ceiling then
    raise exception 'plan_limit:songs_per_playlist' using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

drop trigger if exists song_playlists_songs_limit on public.song_playlists;
create trigger song_playlists_songs_limit before insert or update on public.song_playlists
  for each row execute function public.enforce_playlist_songs();

-- Languages, typefaces and drawn looks all live in the one settings row, so
-- they are three lengths checked in one place. The language count is
-- `lang_order` rather than the `enabled` map: the set the operator has chosen
-- is the thing the ceiling is about, and `enabled` only says which of that set
-- is armed right now — counting it would let three languages be kept as long
-- as one was switched off.
create or replace function public.enforce_settings_limits() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  langs int := public.plan_ceiling(new.user_id, 'languages');
  fonts int := public.plan_ceiling(new.user_id, 'custom_fonts');
  looks int := public.plan_ceiling(new.user_id, 'custom_templates');
begin
  if langs is not null and jsonb_array_length(coalesce(new.lang_order, '[]'::jsonb)) > langs then
    raise exception 'plan_limit:languages' using errcode = 'check_violation';
  end if;

  if fonts is not null and jsonb_array_length(coalesce(new.custom_fonts, '[]'::jsonb)) > fonts then
    raise exception 'plan_limit:custom_fonts' using errcode = 'check_violation';
  end if;

  if looks is not null and jsonb_array_length(coalesce(new.custom_templates, '[]'::jsonb)) > looks then
    raise exception 'plan_limit:custom_templates' using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

drop trigger if exists settings_plan_limits on public.settings;
create trigger settings_plan_limits before insert or update on public.settings
  for each row execute function public.enforce_settings_limits();
