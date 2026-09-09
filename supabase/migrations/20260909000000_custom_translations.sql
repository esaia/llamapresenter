-- A translation the operator brought themselves.
--
-- `bible_text` is the corpus we mirrored, and `languages.json` is generated
-- from it, so the console can only ever offer what we copied first. That is the
-- right rule for the seventeen translations we ship and the wrong answer for a
-- church whose Bible we hold nothing of. This is the other door: they upload a
-- Zefania, OpenSong, USX, OSIS or Beblia file and it becomes a translation in
-- their own account, read by nobody else.
--
-- It is a *translation under a language we already have*, not a language of its
-- own. `show_data` is keyed by language, and a new language would need a place
-- in the `Lang` union, its own 66 book names and its own psalm split, carried
-- to outputs that cannot read a settings row. Under an existing language every
-- one of those is already answered — the file supplies the words and nothing
-- else.

create table if not exists public.bible_translations (
  -- Made in the console, the way a custom font's id is: the row and the
  -- `custom:<id>` in `settings.versions` are written in the same breath, and
  -- nothing here needs an extension to generate one.
  id          text primary key,
  user_id     uuid not null references auth.users on delete cascade,
  -- Which language it is read under: one of LANGS, or `x:<code>` for a
  -- language the operator brought with it.
  --
  -- Filing a Spanish Bible under English was the first arrangement and it was
  -- wrong: `show_data` is keyed by language, so the two could never be on the
  -- same slide, which is the one thing a bilingual congregation wants.
  lang        text not null,
  -- What that language is called, and its 66 book names, for an `x:` code.
  -- Null for one of ours, which has both already. The names come out of the
  -- file when it carries them — Zefania, OpenSong and USX do — and are English
  -- otherwise, which is a smaller wrong than a blank reference line.
  --
  -- Denormalised onto every translation of the language rather than given a
  -- table of its own: a language with no translation left in it is a language
  -- nobody can read, and this way deleting the last one takes it with it.
  lang_label  text,
  book_names  jsonb,
  -- What the picker shows. The operator's own words; the id is never seen.
  label       text not null,
  -- 'lxx' or 'masoretic'. Defaults to the parent language's scheme and can
  -- disagree with it: a Masoretic file is a normal thing to upload under
  -- Russian, whose own translations are Septuagint-numbered.
  psalms      text not null,
  format      text,
  books       int not null default 0,
  verse_count int not null default 0,
  created_at  timestamptz not null default now()
);

-- Deliberately the same columns as `bible_text`, so `chapterOf` in /api/bible
-- stays one function reading one shape. `book` is the parent language's own
-- book id — the `w` of a request — because that is what `bible_text` holds and
-- what the client already sends.
create table if not exists public.bible_translation_text (
  translation_id text not null references public.bible_translations on delete cascade,
  book     int not null,
  chapter  int not null,
  wigni    int not null,
  chapters int not null,
  -- [[muxli, bv], …], as in bible_text. Over the TOAST threshold, so Postgres
  -- compresses each chapter without being asked.
  verses   jsonb not null,
  primary key (translation_id, book, chapter)
);

-- A database that took the first version of this migration has the table
-- without these two, which arrived with languages of the operator's own.
alter table public.bible_translations
  add column if not exists lang_label text,
  add column if not exists book_names jsonb;

create index if not exists bible_translations_user_id_idx on public.bible_translations (user_id);

alter table public.bible_translations      enable row level security;
alter table public.bible_translation_text  enable row level security;

-- Unlike `bible_text`, which is service-role only, these rows have an owner and
-- the console reads and writes them directly. RLS is what proves a translation
-- is yours — /api/bible reads a custom translation with the caller's own
-- client rather than the service role, precisely so this policy is the check.
drop policy if exists "own translations" on public.bible_translations;
create policy "own translations" on public.bible_translations
  for all using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- The chapters are keyed by their parent rather than by a user, so ownership is
-- looked up through it — the same arrangement `owns_session` has.
create or replace function public.owns_translation(target text) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.bible_translations t
                 where t.id = target and t.user_id = (select auth.uid()));
$$;

drop policy if exists "own translation text" on public.bible_translation_text;
create policy "own translation text" on public.bible_translation_text
  for all using (public.owns_translation(translation_id))
  with check (public.owns_translation(translation_id));

-- ---------------------------------------------------------------- searching it

-- The other half of the Browse box, for an uploaded translation. Same body as
-- `bible_search` over the other table; see `…_bible_search.sql` for why the
-- chapter-level `strpos` comes first and why it is not `ilike`.
--
-- This one runs as the caller — no `security definer` — so the policy above is
-- what keeps an operator inside their own translations, and it is granted to
-- `authenticated` rather than revoked, because the console calls it itself.
create or replace function public.bible_custom_search(
  p_translation text,
  p_query       text,
  p_book        int default null,
  p_limit       int default 40
)
returns table (book int, wigni int, chapter int, verse int, text text)
language sql
stable
as $$
  select
    t.book,
    t.wigni,
    t.chapter,
    (v->>0)::int as verse,
    v->>1        as text
  from public.bible_translation_text t
  cross join lateral jsonb_array_elements(t.verses) v
  where t.translation_id = p_translation
    and (p_book is null or t.book = p_book)
    and strpos(lower(t.verses::text), lower(p_query)) > 0
    and strpos(lower(v->>1), lower(p_query)) > 0
  order by t.book, t.chapter, (v->>0)::int
  limit greatest(1, least(p_limit, 100));
$$;

revoke all on function public.bible_custom_search(text, text, int, int) from public, anon;
grant execute on function public.bible_custom_search(text, text, int, int) to authenticated;

-- ---------------------------------------------------------------- the ceiling

-- Free gets one. A church with a Bible nobody has mirrored is not asked to pay
-- to read it; a shelf of them is volume, which is what Pro buys.
--
-- Re-declared whole, every key, because `limits.test.ts` reads the last
-- `free_limit` in this directory and compares it with `limits.json`.
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
    when 'translations'       then 1
  end;
$$;

-- Rows owned by a user, so the generic trigger covers it. Inserts only: an
-- account that drops to Free keeps the Bible it uploaded and simply cannot add
-- another.
drop trigger if exists bible_translations_plan_limit on public.bible_translations;
create trigger bible_translations_plan_limit before insert on public.bible_translations
  for each row execute function public.enforce_row_limit('translations');

-- PostgREST answers from a cached picture of the schema, and a column added to
-- a table it already knew about does not appear in it until it is told. The
-- console writes these rows directly, so without this the first import after
-- this migration fails with "could not find the column" against a column that
-- is plainly there.
notify pgrst, 'reload schema';
