-- A ceiling must never trap someone under it.
--
-- The length checks asked "is this list longer than the plan allows" and
-- refused if it was. That is right for a list that is growing and wrong for
-- everything else, because a row can already be over the line — an account that
-- dropped from Pro to Free, or anyone at all on the day the gates are first
-- turned on. Once over, every write was refused, including the writes that
-- would have brought them back under.
--
-- Two ways that showed. A ten-song running order could not have a song taken
-- off it, because nine is still more than three: the playlist froze, and the
-- only way out was a plan the operator may have been trying to leave. And
-- `settings` is one row holding the language set, the typefaces, the theme, the
-- transition — written by the console on every slider drag. An operator with
-- three languages had *every* settings write refused, so the console quietly
-- stopped saving anything at all.
--
-- So the question becomes "is this list longer than the plan allows *and*
-- longer than it already was". Growing past the ceiling is refused; shrinking,
-- reordering and standing still are always allowed. The ceiling still holds —
-- nothing gets bigger — but it is now a line you can walk back across.

create or replace function public.enforce_playlist_songs() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  ceiling int := public.plan_ceiling(new.user_id, 'songs_per_playlist');
  wants int := jsonb_array_length(coalesce(new.songs, '[]'::jsonb));
  had int := case
    when tg_op = 'UPDATE' then jsonb_array_length(coalesce(old.songs, '[]'::jsonb))
    else 0
  end;
begin
  if ceiling is null then return new; end if;

  if wants > ceiling and wants > had then
    raise exception 'plan_limit:songs_per_playlist' using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

create or replace function public.enforce_settings_limits() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  langs int := public.plan_ceiling(new.user_id, 'languages');
  fonts int := public.plan_ceiling(new.user_id, 'custom_fonts');
  looks int := public.plan_ceiling(new.user_id, 'custom_templates');
  updating boolean := tg_op = 'UPDATE';

  -- How long each list wants to be, and how long it already was. On an insert
  -- there is nothing to have been, so the ceiling alone decides.
  wants_langs int := jsonb_array_length(coalesce(new.lang_order, '[]'::jsonb));
  wants_fonts int := jsonb_array_length(coalesce(new.custom_fonts, '[]'::jsonb));
  wants_looks int := jsonb_array_length(coalesce(new.custom_templates, '[]'::jsonb));
  had_langs int := case when updating then jsonb_array_length(coalesce(old.lang_order, '[]'::jsonb)) else 0 end;
  had_fonts int := case when updating then jsonb_array_length(coalesce(old.custom_fonts, '[]'::jsonb)) else 0 end;
  had_looks int := case when updating then jsonb_array_length(coalesce(old.custom_templates, '[]'::jsonb)) else 0 end;
begin
  if langs is not null and wants_langs > langs and wants_langs > had_langs then
    raise exception 'plan_limit:languages' using errcode = 'check_violation';
  end if;

  if fonts is not null and wants_fonts > fonts and wants_fonts > had_fonts then
    raise exception 'plan_limit:custom_fonts' using errcode = 'check_violation';
  end if;

  if looks is not null and wants_looks > looks and wants_looks > had_looks then
    raise exception 'plan_limit:custom_templates' using errcode = 'check_violation';
  end if;

  return new;
end;
$$;
