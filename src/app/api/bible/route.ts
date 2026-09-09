import { NextResponse, type NextRequest } from 'next/server';

import { customIdOf } from '@/lib/bible/custom';
import { admin } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

/** A chapter as `bible_text` holds it: `[[muxli, bv], …]`. */
type StoredVerses = [number, string][];

/**
 * A stored chapter, in the shape the client reads.
 *
 * Only two things are ever read off a chapter response: the verses, and how
 * many chapters the book has. The book names and translation lists that the
 * upstream API used to send with every single chapter live in
 * `lib/bible/languages.json` now, which is why they are neither stored nor
 * rebuilt here.
 */
const chapterOf = (row: { wigni: number; chapters: number; verses: unknown }, chapter: number) => ({
  bibleData: (row.verses as StoredVerses).map(([muxli, bv]) => ({
    bv,
    wigni: row.wigni,
    tavi: String(chapter),
    muxli,
  })),
  tavi: [{ cc: row.chapters }],
});

/**
 * Scripture, out of our own database.
 *
 * This route used to be a proxy: it asked `holybible.ge` for a chapter and
 * cached the answer. It no longer talks to anyone. Every translation the
 * console offers is one we hold a full copy of — `lib/bible/languages.json`
 * is generated from what is in `bible_text`, so the catalogue cannot offer
 * something this cannot serve — and a church's Sunday morning does not depend
 * on a stranger's shared PHP host being awake.
 *
 * That is also why a miss here is a 404 rather than a fetch. There is nowhere
 * else to look, and quietly reaching for a third party would put the
 * dependency back the moment someone armed a language we had not mirrored.
 *
 * A `custom:<id>` translation is the operator's own upload, which is the one
 * thing here that is not everybody's. It is read with the caller's own client
 * rather than the service role, so the RLS policy on the table is what proves
 * it is theirs — there is no ownership check in this file, deliberately, and
 * nothing to forget. Its answer is `private`, for the same reason.
 */
/** The corpus we mirrored: everyone's, and read with the service role. */
const readOurs = async (lang: string, version: string, book: number, chapter: number) => {
  const db = admin();

  return db
    .from('bible_text')
    .select('wigni, chapters, verses')
    .eq('lang', lang)
    .eq('version', version)
    .eq('book', book)
    .eq('chapter', chapter)
    .maybeSingle();
};

export const GET = async (request: NextRequest) => {
  const params = request.nextUrl.searchParams;

  const lang = params.get('language') ?? '';
  const version = params.get('mv') ?? '';
  const book = Number(params.get('w'));
  const chapter = Number(params.get('t'));

  if (!lang || !version || !book || !chapter) {
    return NextResponse.json({ error: 'a language, a translation, a book and a chapter are required' }, { status: 400 });
  }

  const uploaded = customIdOf(version);

  let found;

  try {
    found = uploaded
      ? await (await createClient())
          .from('bible_translation_text')
          .select('wigni, chapters, verses')
          .eq('translation_id', uploaded)
          .eq('book', book)
          .eq('chapter', chapter)
          .maybeSingle()
      : await readOurs(lang, version, book, chapter);
  } catch (error) {
    // A missing service key, which is a deployment that cannot serve anyone.
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }

  if (found.error) {
    return NextResponse.json({ error: 'could not read the scripture library' }, { status: 500 });
  }

  const stored = found.data;

  if (!stored) {
    // Naming the translation matters: the likeliest cause is a stored setting
    // pointing at something no longer in the library, and "not found" alone
    // sends whoever is looking to the wrong place. An uploaded one has no name
    // here — the console holds the label, not this route — and an id would
    // send them somewhere wronger still.
    return NextResponse.json(
      { error: uploaded ? 'that uploaded translation is not there' : `${version} (${lang}) is not in the scripture library` },
      { status: 404 },
    );
  }

  return NextResponse.json(chapterOf(stored, chapter), {
    // Scripture does not change, and neither does our copy of it between
    // mirror runs. A year is as good as forever for a verse. An uploaded one
    // is just as immutable — an id belongs to one upload and a re-import makes
    // a new one — but it belongs to one operator, so it is not shared.
    headers: {
      'cache-control': `${uploaded ? 'private' : 'public'}, max-age=31536000, immutable`,
    },
  });
};
