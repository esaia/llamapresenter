'use client';

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { BookOpen, Check, ExternalLink, Trash2 } from 'lucide-react';

import { Select } from '@/components/ui/Select';
import {
  ARCHIVES,
  entryMatches,
  sizeOf,
  type Archive,
  type ArchiveEntry,
} from '@/lib/bible/import/archives';
import { listArchive } from '@/lib/bible/import/files';
import { labelForIso, langOf, LANGUAGE_OPTIONS } from '@/lib/bible/isoLanguages';
import { labelOf } from '@/lib/bible/languages';
import { isPlanLimit, limitMessage } from '@/lib/billing/limits';
import { cn } from '@/lib/cn';
import { useStudio } from '@/lib/studio/StudioProvider';

import { Field } from '@/components/studio/settings/StyleSection';

/**
 * Archives with no index to read.
 *
 * The two in `ARCHIVES` are browsed in the list below because they publish a
 * machine-readable listing and serve it to any origin. These three do not —
 * SourceForge has no API we may call from a browser, and eBible ships zips —
 * so they stay what they were: a link, and a download the operator makes
 * themselves. Front pages rather than deep links, because an archive
 * reorganises and a dead link reads as a broken feature.
 */
/** "1,048 translations", or "1 translation" — a count nobody has to parse. */
const counted = (many: number) => `${many.toLocaleString()} translation${many === 1 ? '' : 's'}`;

const LINKED = [
  {
    name: 'Zefania XML archive',
    href: 'https://sourceforge.net/projects/zefania-sharp/files/Bibles/',
    formats: 'Zefania',
    note: 'The long-standing Zefania module collection, sorted by language.',
  },
  {
    name: 'OpenSong',
    href: 'https://www.opensong.org/downloads/#bibles',
    formats: 'OpenSong',
    note: 'The Bible list kept by the OpenSong project itself.',
  },
  {
    name: 'eBible.org',
    href: 'https://ebible.org/download.php',
    formats: 'USX',
    note: 'A zip per translation, holding one file per book. Choose the USFM/USX download.',
  },
];

/**
 * How many rows are drawn at once.
 *
 * The whole archive is in the list — over a thousand of them — and every one
 * is reachable by typing. This is only how many are put in the document at a
 * time, because a thousand rows rebuilt on every keystroke is a search box
 * that stutters. Nobody finds their Bible by scrolling a thousand names, so
 * the cap costs nothing as long as it never reads as a limit on what is there.
 */
const SHOWN = 200;

/**
 * Bibles the operator brought themselves.
 *
 * Everything else the console offers is a translation we mirrored, which is
 * what makes "the catalogue and the corpus are the same list" true. This is
 * the other door, for a church whose Bible we hold nothing of.
 *
 * Two ways in, and the first is the one that will be used: tick a translation
 * in a public archive and the console fetches it. The second is a file they
 * already have, which is what covers every archive with no index and every
 * church that was sent one by their Bible society.
 *
 * Either way it is filed *under* one of the six languages, so it inherits that
 * language's book names, its book ordering and its browse list — and the one
 * thing it may disagree with the language about is how the psalms are split,
 * which is the one thing that would silently show the wrong verse.
 */
export const TranslationsSection = () => {
  const { translations, importTranslation, importFromArchive, removeTranslation, importing, room } = useStudio();

  const picker = useRef<HTMLInputElement>(null);
  // An ISO code rather than one of ours, because the picker is every language
  // and only six of them are ours. `langOf` is what turns it into either.
  const [iso, setIso] = useState('en');
  const [error, setError] = useState('');

  const [archive, setArchive] = useState<Archive>(ARCHIVES[0]);
  const [search, setSearch] = useState('');
  const [ticked, setTicked] = useState<Set<string>>(new Set());

  /**
   * The archive's index, stamped with the archive it is of.
   *
   * One piece of state rather than three, because "which archive is this a
   * listing of" is the question that matters: a slow reply that lands after
   * the operator moved on is simply not this archive's, and drawing one
   * archive's files under another's name is the bug that would cause.
   */
  const [index, setIndex] = useState<{ id: string; entries: ArchiveEntry[]; error: string } | null>(null);

  useEffect(() => {
    let current = true;

    listArchive(archive)
      .then(entries => current && setIndex({ id: archive.id, entries, error: '' }))
      .catch(failure => current && setIndex({ id: archive.id, entries: [], error: (failure as Error).message }));

    return () => {
      current = false;
    };
  }, [archive]);

  const listed = index?.id === archive.id ? index : null;
  const listing = !listed;
  const listError = listed?.error ?? '';
  const entries = listed?.entries;

  const matching = useMemo(() => (entries ?? []).filter(entry => entryMatches(entry, search)), [entries, search]);

  // Where a translation goes, in the terms the provider wants: one of the six,
  // or a language of the operator's own keyed by the same ISO code — so two
  // Spanish Bibles added months apart land in one Spanish.
  const into = { lang: langOf(iso), langLabel: labelForIso(iso) };

  const busy = importing !== null;
  const full = !room('translations');

  const toggle = (path: string) =>
    setTicked(current => {
      const next = new Set(current);

      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }

      return next;
    });

  const run = async (task: Promise<void>) => {
    setError('');

    try {
      await task;
      setTicked(new Set());
    } catch (failure) {
      // A ceiling has already been said once, by the console's own notice.
      if (isPlanLimit(failure)) return;

      setError((failure as Error).message);
    }
  };

  const chosen = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = [...(event.target.files ?? [])];

    // Cleared before the await, so choosing the same file twice after a failed
    // first try still fires a change.
    event.target.value = '';

    if (files.length === 0) return;

    await run(importTranslation(files, into));
  };

  const add = async () => {
    const picked = (entries ?? []).filter(entry => ticked.has(entry.path));

    if (picked.length === 0) return;

    await run(importFromArchive(picked, into));
  };

  const progress = importing
    ? importing.total
      ? `${importing.label} — ${importing.done} of ${importing.total} chapters`
      : `Downloading ${importing.label}…`
    : '';

  return (
    <div className="space-y-6">
      <Field
        label="Add a translation"
        hint="Say what language it is, then tick one — the console fetches it straight from the
          archive, with nothing to download and nothing to upload. Every language is here, and one
          you add sits on the rail beside ours."
      >
        <div className="space-y-2">
          {/* The only thing the operator is asked, because it is the only thing
              the file cannot answer. Six of these are languages we hold
              translations of and the rest become the operator's own, which is
              a distinction they have no reason to care about and are never
              shown. How the psalms are split used to be a second dropdown and
              is measured off the file now, which is both simpler and more
              often right. */}
          <Select
            value={iso}
            onChange={setIso}
            options={LANGUAGE_OPTIONS}
            className="w-full"
          />

          <Select
            value={archive.id}
            onChange={value => {
              setArchive(ARCHIVES.find(item => item.id === value) ?? ARCHIVES[0]);
              setTicked(new Set());
            }}
            options={ARCHIVES.map(item => ({ value: item.id, label: `${item.name} · ${item.note}` }))}
            className="w-full"
          />

          <input
            type="search"
            value={search}
            placeholder="Search by language or name — “russian”, “kjv”, “geneva”"
            onChange={event => setSearch(event.target.value)}
            className="h-8 w-full min-w-0 rounded-studio border border-studio-border px-2.5 text-xs text-studio-text
              placeholder:text-studio-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-studio-accent/40"
          />

          <div className="studio-scroll max-h-64 overflow-y-auto rounded-studio border border-studio-border">
            {listing ? (
              <p className="px-3 py-4 text-center text-xs text-studio-faint">Reading {archive.name}…</p>
            ) : listError ? (
              <p className="px-3 py-4 text-center text-[11px] leading-relaxed text-studio-danger">{listError}</p>
            ) : matching.length === 0 ? (
              <p className="px-3 py-4 text-center text-xs text-studio-faint">
                Nothing in {archive.name} matches “{search}”.
              </p>
            ) : (
              <ul className="divide-y divide-studio-border">
                {matching.slice(0, SHOWN).map(entry => {
                  const on = ticked.has(entry.path);

                  return (
                    <li key={entry.path}>
                      <button
                        type="button"
                        onClick={() => toggle(entry.path)}
                        disabled={busy}
                        className="flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors
                          duration-150 hover:bg-studio-surface disabled:cursor-not-allowed"
                      >
                        <span
                          className={cn(
                            'flex size-4 shrink-0 items-center justify-center rounded-sm border',
                            on
                              ? 'border-studio-accent bg-studio-accent text-studio-onaccent'
                              : 'border-studio-border',
                          )}
                        >
                          {on ? <Check className="size-3" /> : null}
                        </span>

                        <span className="min-w-0 flex-1 truncate text-xs text-studio-text">
                          {entry.name}
                          {entry.group ? <span className="text-studio-faint"> · {entry.group}</span> : null}
                        </span>

                        <span className="shrink-0 text-[11px] text-studio-faint">{sizeOf(entry.bytes)}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Worded so it can never read as "we only fetched 80 of them". Every
              one of these is in the list; this is how many are drawn. */}
          {!listing && !listError && entries?.length ? (
            <p className="text-[11px] text-studio-faint">
              {search ? (
                <>
                  {counted(matching.length)} match “{search}”
                  {matching.length > SHOWN ? <> · showing the first {SHOWN}</> : null}.
                </>
              ) : (
                <>
                  All {counted(entries.length)} are here
                  {entries.length > SHOWN ? <> · showing the first {SHOWN}</> : null}. Type a language to
                  find yours.
                </>
              )}
            </p>
          ) : null}

          <button
            type="button"
            disabled={busy || ticked.size === 0 || !room('translations', ticked.size)}
            onClick={() => void add()}
            className="h-8 w-full rounded-studio border border-studio-accent bg-studio-accent px-3 text-xs
              font-medium text-studio-onaccent transition-colors duration-150 disabled:cursor-not-allowed
              disabled:border-studio-border disabled:bg-studio-border disabled:text-studio-faint"
          >
            {busy
              ? importing.of > 1
                ? `Adding ${importing.from + 1} of ${importing.of}…`
                : 'Adding…'
              : ticked.size === 0
                ? 'Tick a translation to add it'
                : `Add ${ticked.size} translation${ticked.size === 1 ? '' : 's'}`}
          </button>

          {busy && progress ? <p className="text-[11px] text-studio-muted">{progress}</p> : null}
          {error ? <p className="text-[11px] leading-relaxed text-studio-danger">{error}</p> : null}

          {full ? (
            <p className="text-[11px] leading-relaxed text-studio-muted">
              {limitMessage('translations')}{' '}
              <a href="/pricing" className="text-studio-accent underline underline-offset-2">
                See Pro
              </a>
            </p>
          ) : null}

          {/* The file picker is one line rather than a section of its own: it
              is the way in for the archives with no list to read, and for a
              church that was sent a file, and neither is the common case. */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-0.5">
            <input
              ref={picker}
              type="file"
              multiple
              accept=".xml,.usx,.usfx,.osis,.zip"
              onChange={chosen}
              className="hidden"
            />

            <button
              type="button"
              disabled={busy || full}
              onClick={() => picker.current?.click()}
              className="text-[11px] text-studio-muted underline underline-offset-2 transition-colors
                duration-150 hover:text-studio-text disabled:cursor-not-allowed disabled:no-underline"
            >
              Or choose a file you already have
            </button>

            <a
              href={archive.home}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1 text-[11px] text-studio-muted underline underline-offset-2
                hover:text-studio-text"
            >
              Look at {archive.name} yourself
              <ExternalLink className="size-3" />
            </a>
          </div>
        </div>
      </Field>

      <Field
        label="Your translations"
        hint="Yours alone — nobody else's console can see them. They are offered wherever ours are,
          in the language you filed them under."
      >
        {translations.length === 0 ? (
          <p className="rounded-studio border border-dashed border-studio-border px-3 py-4 text-center text-xs text-studio-faint">
            No translations of your own yet.
          </p>
        ) : (
          <ul className="space-y-2">
            {translations.map(translation => (
              <li
                key={translation.id}
                className="flex items-center gap-3 rounded-studio border border-studio-border border-l-2
                  border-l-studio-accent bg-studio-lift py-2 pr-3 pl-2.5"
              >
                <span
                  className="flex size-7 shrink-0 items-center justify-center rounded-studio
                    bg-studio-accent/15 text-studio-accent"
                >
                  <BookOpen className="size-3.5" />
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-studio-text">{translation.label}</p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-studio-faint">
                    <span className="rounded-sm bg-studio-raised px-1.5 py-0.5 text-studio-muted">
                      {labelOf(translation.lang)}
                    </span>
                    {translation.psalms === 'lxx' ? 'Septuagint psalms' : 'Masoretic psalms'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => void removeTranslation(translation.id)}
                  aria-label={`Remove ${translation.label}`}
                  title={`Remove ${translation.label}`}
                  className="shrink-0 rounded p-1 text-studio-muted transition-colors duration-150 hover:text-studio-danger"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </Field>

      <Field
        label="Other archives"
        hint="These publish no list a browser may read, so they are a download and then the button above."
      >
        <ul className="divide-y divide-studio-divider border-y border-studio-divider">
          {LINKED.map(source => (
            <li key={source.href}>
              <a
                href={source.href}
                target="_blank"
                rel="noreferrer noopener"
                className="group flex items-start gap-3 py-2 transition-colors duration-150"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs text-studio-muted transition-colors duration-150
                    group-hover:text-studio-text">
                    {source.name} <span className="text-studio-faint">· {source.formats}</span>
                  </p>
                  <p className="mt-0.5 text-[11px] leading-snug text-studio-faint">{source.note}</p>
                </div>

                <ExternalLink className="mt-0.5 size-3 shrink-0 text-studio-faint transition-colors
                  duration-150 group-hover:text-studio-muted" />
              </a>
            </li>
          ))}
        </ul>
      </Field>

      {/* Said here rather than in the terms, because this is the one screen
          where somebody is about to copy a translation they may not own. */}
      <p className="text-[11px] leading-snug text-studio-faint">
        Most modern translations are under copyright, and these archives carry some of them. Check
        what a file says about itself before you put it on a screen. A language we hold no
        translations of takes its book names from the file when it carries them — Zefania, OpenSong
        and USX do — and English ones otherwise, which is only ever the name beside the verse.
      </p>
    </div>
  );
};
