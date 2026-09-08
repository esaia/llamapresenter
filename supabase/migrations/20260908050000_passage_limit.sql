-- How many passages can be on the board at once.
--
-- The Bible tab holds a running order of passages — John 4, then Philippians 2
-- — and a free account gets three. Enough for a reading, a sermon text and the
-- verse at the end, which is a Sunday; a series of eleven is a Pro thing.
--
-- They live in `session_workspace.blocks`, a jsonb array rewritten whole on
-- every add, collapse, split and reorder, so this is a length like a playlist's
-- and not a count of rows. And the same rule: it may not *grow* past the
-- ceiling, but shrinking, reordering and standing still are always allowed.
-- `blocks` shares its row with the live pointer, the open tab and the card
-- size, so a check that refused any write while the board was over the line
-- would freeze the console mid-service for someone who simply had four
-- passages open when their plan changed.
--
-- The row is keyed by session rather than by user, so the owner is looked up
-- through `sessions` — which is why this cannot use `enforce_row_limit`.

create or replace function public.free_limit(key text) returns int
language sql immutable as $$
  select case key
    when 'sessions'           then 1
    when 'passages'           then 3
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

create or replace function public.enforce_passage_limit() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  owner uuid := (select user_id from public.sessions where id = new.session_id);
  ceiling int;
  wants int := jsonb_array_length(coalesce(new.blocks, '[]'::jsonb));
  had int := case
    when tg_op = 'UPDATE' then jsonb_array_length(coalesce(old.blocks, '[]'::jsonb))
    else 0
  end;
begin
  if owner is null then return new; end if;

  ceiling := public.plan_ceiling(owner, 'passages');

  if ceiling is null then return new; end if;

  if wants > ceiling and wants > had then
    raise exception 'plan_limit:passages' using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

drop trigger if exists session_workspace_passage_limit on public.session_workspace;
create trigger session_workspace_passage_limit before insert or update on public.session_workspace
  for each row execute function public.enforce_passage_limit();
