/**
 * Public archives of Bible files, browsable from inside the console.
 *
 * The panel used to say "here are five websites, go and download something".
 * That is a fair description of where these files live and a poor way to get
 * one: a church has a translation in mind, not a format, and asking them to
 * work out which of a thousand filenames is theirs — on a projector machine,
 * on a Sunday — is the sort of step that makes a feature go unused.
 *
 * So the two archives that publish a *machine-readable index* are listed here
 * and the console reads it. Both are public GitHub repositories, both serve
 * `access-control-allow-origin: *`, so the browser fetches the index and the
 * file itself with no server of ours in the middle. The other archives in the
 * panel have no index to read and stay as links.
 *
 * This does not put a third party into a Sunday morning. The chapters land in
 * our own rows the moment they are imported, and every reading after that is
 * a primary-key lookup against our database — the same arrangement
 * `scripts/mirror.mjs` has, which is a network call made by hand, once, to
 * fill a table that is then read from forever.
 */

export interface Archive {
  id: string;
  name: string;
  /** owner/repo on GitHub. */
  repo: string;
  branch: string;
  /** What the files in it are, for the operator. */
  formats: string;
  note: string;
  /** Where the archive itself lives, for anyone who wants to look at it. */
  home: string;
  /**
   * How a path becomes a name and a group. `flat` is one directory of files
   * named after the translation; `by-language` is a directory per language
   * code, which is a far better grouping than the first letter of a filename.
   */
  layout: 'flat' | 'by-language';
}

export const ARCHIVES: Archive[] = [
  {
    id: 'beblia',
    name: 'Beblia',
    repo: 'Beblia/Holy-Bible-XML-Format',
    branch: 'master',
    formats: 'Beblia XML',
    note: 'Over a thousand whole Bibles, named by language.',
    home: 'https://github.com/Beblia/Holy-Bible-XML-Format',
    layout: 'flat',
  },
  {
    id: 'gratis',
    name: 'gratis-bible',
    repo: 'gratis-bible/bible',
    branch: 'master',
    formats: 'OSIS',
    note: 'Public-domain and freely licensed translations, filed by language.',
    home: 'https://github.com/gratis-bible/bible',
    layout: 'by-language',
  },
];

export const archiveById = (id: string): Archive | null => ARCHIVES.find(archive => archive.id === id) ?? null;

/** One file in an archive, as the list draws it. */
export interface ArchiveEntry {
  /** The path inside the repository, which is also its id here. */
  path: string;
  /** What it is called in the list. */
  name: string;
  /** The heading it sits under: a language, or nothing. */
  group: string;
  bytes: number;
  url: string;
}

/** The whole repository in one request, rather than a request per directory. */
export const treeUrl = (archive: Archive) =>
  `https://api.github.com/repos/${archive.repo}/git/trees/${archive.branch}?recursive=1`;

export const rawUrl = (archive: Archive, path: string) =>
  `https://raw.githubusercontent.com/${archive.repo}/${archive.branch}/${path}`;

/**
 * A filename as something a person would read.
 *
 * Beblia names a file `AdilabadGondiBible.xml`, which is a translation name
 * with the spaces taken out. Putting them back — before a capital, and between
 * a word and a year — is the difference between a list that can be skimmed and
 * a list that cannot.
 */
export const titleOf = (path: string): string => {
  const file = path.split('/').pop() ?? path;
  const stem = file.replace(/\.[a-z]+$/i, '').replace(/Bible$/i, '');

  return (
    stem
      .replace(/[_-]+/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/([A-Za-z])(\d)/g, '$1 $2')
      .replace(/(\d)([A-Za-z])/g, '$1 $2')
      .replace(/\s+/g, ' ')
      .trim() || stem
  );
};

/**
 * The language a directory names, in words. `Intl` already holds every code
 * these archives use, so a table of our own would be 36 rows to maintain and
 * one more thing to be wrong.
 */
export const languageOf = (code: string): string => {
  try {
    return new Intl.DisplayNames(['en'], { type: 'language' }).of(code) ?? code;
  } catch {
    return code;
  }
};

/** A node of the GitHub tree response, narrowed to what is used. */
export interface TreeNode {
  path?: string;
  type?: string;
  size?: number;
}

const READABLE = /\.(xml|usx|osis)$/i;

/**
 * The archive's index as a list. Pure, so the shape of what GitHub sends is
 * tested rather than trusted — a repository that grows a `docs/` directory
 * full of XML should not put fifty stylesheets in front of the operator.
 */
export const entriesOf = (archive: Archive, tree: TreeNode[]): ArchiveEntry[] => {
  const files = tree.filter(
    node => node.type === 'blob' && typeof node.path === 'string' && READABLE.test(node.path),
  );

  return files
    .map(node => {
      const path = node.path as string;
      const parts = path.split('/');
      const nested = parts.length > 1;

      return {
        path,
        name: titleOf(path),
        group: archive.layout === 'by-language' && nested ? languageOf(parts[0]) : '',
        bytes: node.size ?? 0,
        url: rawUrl(archive, path),
      };
    })
    // A file below the top level of a flat archive is not a translation, and a
    // top-level file in a filed one is its licence or its readme.
    .filter(entry => (archive.layout === 'by-language' ? entry.group !== '' : !entry.path.includes('/')))
    .sort((a, b) => a.group.localeCompare(b.group) || a.name.localeCompare(b.name));
};

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

/**
 * Whether an entry answers to what is being typed. Every word has to match
 * something, so "russian syn" narrows rather than widens, and the language a
 * file is filed under counts as part of its name.
 */
export const entryMatches = (entry: ArchiveEntry, search: string): boolean => {
  const needle = normalize(search);

  if (!needle) return true;

  const haystack = normalize(`${entry.group} ${entry.name} ${entry.path}`);

  return needle.split(/\s+/).every(word => haystack.includes(word));
};

/** A size a person can judge a download by. */
export const sizeOf = (bytes: number): string =>
  bytes >= 1_000_000 ? `${Math.round(bytes / 100_000) / 10} MB` : `${Math.max(1, Math.round(bytes / 1000))} KB`;
