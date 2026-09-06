-- Finding a verse by what it says, rather than by where it is.
--
-- The console's Browse box filters the 66 book names, which only helps an
-- operator who already knows the reference. This is the other half: the same
-- box asks here, and the words themselves find the verse.
--
-- It lives in the database rather than in the route because `bible_text` holds
-- a chapter per row as `[[verse, text], …]`, and pulling a translation's whole
-- corpus over the wire to grep it in Node would be around 100 MB per
-- keystroke. `jsonb_array_elements` splits the matching chapters into verses
-- where the rows already are, and only the handful that match come back.
--
-- The chapter-level test comes first on purpose: it is one comparison against
-- the row's own text, and it throws away all but a few dozen chapters before
-- the expansion runs. `strpos` on `lower(...)` rather than `ilike` so the
-- operator's `%` and `_` are the characters they typed, not wildcards.
--
-- `book` is the language's own book id — the `w` of a request — because that
-- is what the row holds; the console maps it back to the shared id itself.
-- `p_book` is the same id going the other way: null searches the whole
-- translation, and a book narrows it, because forty hits ordered by book are
-- all in Matthew the moment the words are common ones.
drop function if exists public.bible_search(text, text, text, int);

create function public.bible_search(
  p_lang    text,
  p_version text,
  p_query   text,
  p_book    int default null,
  p_limit   int default 40
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
  from public.bible_text t
  cross join lateral jsonb_array_elements(t.verses) v
  where t.lang = p_lang
    and t.version = p_version
    and (p_book is null or t.book = p_book)
    and strpos(lower(t.verses::text), lower(p_query)) > 0
    and strpos(lower(v->>1), lower(p_query)) > 0
  order by t.book, t.chapter, (v->>0)::int
  limit greatest(1, least(p_limit, 100));
$$;

-- Read the same way the scripture route reads the table: through the service
-- role, from a route that has authorised the caller another way. Nobody else
-- has a reason to run it, so nobody else is granted it.
revoke all on function public.bible_search(text, text, text, int, int) from public, anon, authenticated;
