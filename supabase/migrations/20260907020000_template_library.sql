-- The layouts an operator draws become a library rather than four slots.
--
-- There were exactly four: a verse slide, a song slide, a verse strap and a
-- song strap, one column each. A church has a Christmas slide and an ordinary
-- Sunday one and no reason to redraw either, so the four columns become one
-- list of named templates, each carrying the kind of slide it is for.
--
-- A look setting names one by id — `custom:<uuid>`, the same shape a custom
-- font's value has, and for the same reason: the column knows nothing about
-- either list. A bare `custom` still reads, as the first template of its kind.
--
-- Only a drawing that exists is moved: `{}` is the "standard slide" default
-- these columns shipped with, so a row still on it had nothing drawn — unless
-- the look was pointing at it, which makes the empty document the operator's
-- own starting point and worth carrying over.
alter table public.settings
  add column if not exists custom_templates jsonb not null default '[]'::jsonb;

with drawn as (
  select
    user_id,
    gen_random_uuid()::text as verses_id,
    gen_random_uuid()::text as lyrics_id,
    gen_random_uuid()::text as stream_id,
    gen_random_uuid()::text as stream_lyrics_id
  from public.settings
)
update public.settings s
set
  custom_templates =
    case when s.custom_template <> '{}'::jsonb or s.projector_look = 'custom'
      then jsonb_build_array(jsonb_build_object(
        'id', d.verses_id, 'target', 'verses', 'name', 'Custom', 'template', s.custom_template))
      else '[]'::jsonb end
    || case when s.custom_lyrics_template <> '{}'::jsonb or s.projector_lyrics_look = 'custom'
      then jsonb_build_array(jsonb_build_object(
        'id', d.lyrics_id, 'target', 'lyrics', 'name', 'Custom', 'template', s.custom_lyrics_template))
      else '[]'::jsonb end
    || case when s.custom_stream_template <> '{}'::jsonb or s.lower_third_variant = 'custom'
      then jsonb_build_array(jsonb_build_object(
        'id', d.stream_id, 'target', 'stream', 'name', 'Custom', 'template', s.custom_stream_template))
      else '[]'::jsonb end
    || case when s.custom_stream_lyrics_template <> '{}'::jsonb or s.lyrics_variant = 'custom'
      then jsonb_build_array(jsonb_build_object(
        'id', d.stream_lyrics_id, 'target', 'streamLyrics', 'name', 'Custom', 'template', s.custom_stream_lyrics_template))
      else '[]'::jsonb end,
  projector_look = case when s.projector_look = 'custom' then 'custom:' || d.verses_id else s.projector_look end,
  projector_lyrics_look =
    case when s.projector_lyrics_look = 'custom' then 'custom:' || d.lyrics_id else s.projector_lyrics_look end,
  lower_third_variant =
    case when s.lower_third_variant = 'custom' then 'custom:' || d.stream_id else s.lower_third_variant end,
  lyrics_variant = case when s.lyrics_variant = 'custom' then 'custom:' || d.stream_lyrics_id else s.lyrics_variant end
from drawn d
where d.user_id = s.user_id;

-- The four columns stay for now, read by nothing: a deploy that has to be
-- rolled back should find the rows it wrote still there.
