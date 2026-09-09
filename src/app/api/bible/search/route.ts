import { NextResponse, type NextRequest } from 'next/server';

import { customIdOf } from '@/lib/bible/custom';
import { MIN_SEARCH_LENGTH, SEARCH_LIMIT, type VerseHit } from '@/lib/bible/search';
import { admin } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

/**
 * Verses that say a thing, for the operator who knows the words and not the
 * reference — "a thousand generations", and Deuteronomy 7:9 comes back.
 *
 * It reads the same library the chapter route does and answers with nothing
 * else: no upstream, no second opinion. A translation we have not mirrored
 * simply has no rows, and an empty result is the honest answer.
 *
 * The search itself is `bible_search` in the database, because the corpus is
 * the thing being searched and it is already there. This handler only says
 * which translation to look in and how much to hand back.
 *
 * A translation the operator uploaded is searched by its own function, run as
 * the caller so the RLS policy is what keeps them inside their own — the same
 * arrangement the chapter route has. Without this the Browse box's "in the
 * text" tab would come back empty for the one translation they added
 * themselves, which reads as broken rather than as unsupported.
 */
export const GET = async (request: NextRequest) => {
  const params = request.nextUrl.searchParams;

  const lang = params.get('language') ?? '';
  const version = params.get('mv') ?? '';
  const query = (params.get('q') ?? '').trim();
  // The language's own book id, as a chapter request spells it. Absent means
  // the whole translation.
  const book = Number(params.get('w')) || null;

  if (!lang || !version) {
    return NextResponse.json({ error: 'a language and a translation are required' }, { status: 400 });
  }

  // Two letters match half the Bible, and the operator is still typing. The
  // console holds off too; this is the backstop for anything that does not.
  if (query.length < MIN_SEARCH_LENGTH) {
    return NextResponse.json({ error: `type at least ${MIN_SEARCH_LENGTH} characters` }, { status: 400 });
  }

  const uploaded = customIdOf(version);

  let data;
  let error;

  try {
    ({ data, error } = uploaded
      ? await (await createClient()).rpc('bible_custom_search', {
          p_translation: uploaded,
          p_query: query,
          p_book: book,
          p_limit: SEARCH_LIMIT,
        })
      : await admin().rpc('bible_search', {
          p_lang: lang,
          p_version: version,
          p_query: query,
          p_book: book,
          p_limit: SEARCH_LIMIT,
        }));
  } catch (thrown) {
    return NextResponse.json({ error: (thrown as Error).message }, { status: 500 });
  }

  if (error) {
    return NextResponse.json({ error: 'could not search the scripture library' }, { status: 500 });
  }

  return NextResponse.json(
    { results: (data ?? []) as VerseHit[] },
    // The corpus is immutable between mirror runs, so the same words find the
    // same verses for as long as anyone cares to ask — but an hour is plenty:
    // this is a typist's cache, not a chapter an output will read all year.
    { headers: { 'cache-control': `${uploaded ? 'private' : 'public'}, max-age=3600` } },
  );
};
