import JSZip from 'jszip';

import { entriesOf, titleOf, treeUrl, type Archive, type ArchiveEntry, type TreeNode } from '@/lib/bible/import/archives';
import { mergeBibles, parseBibleXml } from '@/lib/bible/import/parse';
import type { ParsedBible } from '@/lib/bible/import/types';

/**
 * What the operator actually dropped, turned into one Bible.
 *
 * Everything above this is pure; this is the part that cannot be, because it
 * reads bytes off a `File` and unwraps a zip. It is deliberately thin for that
 * reason — the same division `lib/lyrics/propresenter.ts` draws between
 * `parseProDocument` and `parseProBundle`.
 *
 * A zip or a folder of sixty-six USX files is one translation, not sixty-six,
 * so everything selected in one go is merged. `jszip` is already here for
 * ProPresenter bundles.
 */

const READABLE = /\.(xml|usx|usfx|osis)$/i;

const isZip = (name: string) => /\.zip$/i.test(name);

const textOf = async (file: Blob) => {
  const text = await file.text();

  // A file saved from Windows keeps its byte-order mark, and a BOM before the
  // prolog puts a stray character in front of the root element.
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
};

export const parseBibleFiles = async (files: Iterable<File>): Promise<ParsedBible | null> => {
  const parts: ParsedBible[] = [];

  for (const file of files) {
    if (isZip(file.name)) {
      const zip = await JSZip.loadAsync(file);
      const entries = Object.values(zip.files).filter(entry => !entry.dir && READABLE.test(entry.name));

      for (const entry of entries) {
        const parsed = parseBibleXml(await entry.async('text'));

        if (parsed) parts.push(parsed);
      }

      continue;
    }

    if (!READABLE.test(file.name)) continue;

    const parsed = parseBibleXml(await textOf(file));

    if (parsed) parts.push(parsed);
  }

  const merged = mergeBibles(parts);

  if (!merged) return null;

  // A file that does not name itself is named after itself. "Uploaded
  // translation" in the picker tells the operator nothing about which of the
  // three they added it is.
  const first = [...files][0];

  return merged.name ? merged : { ...merged, name: first ? titleOf(first.name) : '' };
};

/**
 * What an archive holds, read from its own index.
 *
 * One request for the whole repository rather than one per directory, because
 * GitHub allows sixty an hour to a browser that has not signed in and a church
 * opening this panel twice should not run out. The reply is a few hundred
 * kilobytes and is held for as long as the panel is open.
 */
export const listArchive = async (archive: Archive): Promise<ArchiveEntry[]> => {
  const response = await fetch(treeUrl(archive), { headers: { accept: 'application/vnd.github+json' } });

  if (!response.ok) {
    // The likeliest failure by far, and the one worth naming: an hour is a
    // real wait and "could not load" would send them looking for a fault.
    throw new Error(
      response.status === 403
        ? 'GitHub is not answering right now — it allows a limited number of listings an hour. Try again later, or download the file yourself.'
        : `Could not read ${archive.name} (${response.status}).`,
    );
  }

  const body = (await response.json()) as { tree?: TreeNode[] };

  return entriesOf(archive, body.tree ?? []);
};

/** One file out of an archive, fetched and read. */
export const fetchArchiveEntry = async (entry: ArchiveEntry): Promise<ParsedBible | null> => {
  const response = await fetch(entry.url);

  if (!response.ok) throw new Error(`Could not download ${entry.name} (${response.status}).`);

  return parseBibleXml(await response.text());
};
