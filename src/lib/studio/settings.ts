import { defaultVersionOf, isLang, MAX_LANGS, REQUIRED_LANG, specOf, type Lang } from '@/lib/bible/languages';
import { asStreamColors, migrated, type StreamColors } from '@/lib/lower3rd/colors';
import { asCustomFonts, DEFAULT_FONT, fontsUsedBy, type CustomFont } from '@/lib/projector/fonts';
import {
  asScaleMode,
  clampTextSize,
  DEFAULT_TEXT_SIZE,
  DEFAULT_VERSE_TEXT_SIZE,
  isCustomLook,
  lookOf,
  templateIdOf,
  type ScaleMode,
} from '@/lib/projector/looks';
import {
  asTemplate,
  fontsNamedBy,
  startingTemplate,
  TEMPLATE_TARGETS,
  type SlideTemplate,
  type TemplateTarget,
} from '@/lib/projector/template';
import { DEFAULT_THEME } from '@/lib/projector/themes';
import { clampTransition, DEFAULT_TRANSITION_MS } from '@/lib/projector/transition';
import type { Database } from '@/lib/supabase/types';
import type { Align, LocalFileMeta, ProjectorStyle, StreamStyle } from '@/lib/types';

export type SettingsRow = Database['public']['Tables']['settings']['Row'];

/**
 * One of the operator's own layouts: a name, the kind of slide it is for, and
 * the document itself.
 *
 * A list rather than the four columns it grew out of, because a church has a
 * Christmas slide and an ordinary Sunday one and no reason to redraw either.
 */
export interface CustomTemplate {
  id: string;
  target: TemplateTarget;
  name: string;
  template: SlideTemplate;
}

const asCustomTemplates = (value: unknown): CustomTemplate[] => {
  const rows = Array.isArray(value) ? value : [];

  return rows
    .map(row => (row ?? {}) as Partial<Record<keyof CustomTemplate, unknown>>)
    .filter(row => typeof row.id === 'string' && row.id && TEMPLATE_TARGETS.includes(row.target as TemplateTarget))
    .map(row => {
      const target = row.target as TemplateTarget;

      return {
        id: row.id as string,
        target,
        name: (typeof row.name === 'string' && row.name.trim()) || 'Custom',
        template: asTemplate(row.template, startingTemplate(target)),
      };
    });
};

/** The templates of one kind, in the order they were drawn. */
export const templatesFor = (settings: Settings, target: TemplateTarget): CustomTemplate[] =>
  settings.customTemplates.filter(row => row.target === target);

/**
 * The template a look setting names, or null when it names none.
 *
 * A bare `custom` is a row written before the library existed: it can only
 * have meant the one template of its kind, which is the first here.
 */
export const templateOf = (settings: Settings, target: TemplateTarget, look: string): SlideTemplate | null => {
  if (!isCustomLook(look)) return null;

  const kind = templatesFor(settings, target);
  const id = templateIdOf(look);

  return (id ? kind.find(row => row.id === id) : kind[0])?.template ?? null;
};

/** The shipped strap a stream look falls back to. */
const STREAM_FALLBACK = 'scrim';

/** Whether a look setting still names a template that exists. */
const looksAt = (templates: CustomTemplate[], target: TemplateTarget, look: unknown): boolean => {
  if (typeof look !== 'string' || !isCustomLook(look)) return false;

  const kind = templates.filter(row => row.target === target);
  const id = templateIdOf(look);

  return id ? kind.some(row => row.id === id) : kind.length > 0;
};

/**
 * What to call the next one: "Layout 2", "Layout 3", counted past whatever is
 * already in that kind so a name is never taken twice — a rename is one click
 * away in the editor, and this only has to be a name rather than the name.
 */
export const newTemplateName = (settings: Settings, target: TemplateTarget): string => {
  const taken = new Set(templatesFor(settings, target).map(row => row.name));
  const noun = target === 'stream' || target === 'streamLyrics' ? 'Strap' : 'Layout';

  for (let n = 1; ; n += 1) {
    const name = n === 1 ? noun : `${noun} ${n}`;

    if (!taken.has(name)) return name;
  }
};

/** A look that names one of the operator's templates, and that template is gone. */
const droppedTemplate = (templates: CustomTemplate[], target: TemplateTarget, look: string): boolean =>
  isCustomLook(look) && !looksAt(templates, target, look);

/**
 * The operator's whole look, held as one object in the console and one row in
 * the database. In the old app each field was its own localStorage key, read
 * with a plain getItem in three places; keeping them together is what lets the
 * outputs be handed a complete style with the slide.
 */
export interface Settings {
  adminLang: Lang;
  adminVersion: string;
  enabled: Partial<Record<Lang, boolean>>;
  versions: Partial<Record<Lang, string>>;
  theme: string;
  dynamicImage: string;
  localImage: LocalFileMeta | null;
  font: string;
  align: Align;
  lyricsFont: string;
  lyricsAlign: Align;
  /**
   * The lower third's own type, which is not the projector's.
   *
   * A projector is a wall of text read from the back of a room; a lower third
   * is two lines over a camera shot. They were one setting until an operator
   * wanted the stream centred and the wall ragged-left, which is a reasonable
   * thing to want and was impossible to say.
   */
  streamFont: string;
  streamAlign: Align;
  streamLyricsFont: string;
  streamLyricsAlign: Align;
  /**
   * Typefaces the operator added themselves, held whole here and narrowed to
   * what is in use on the way out. See `lib/projector/fonts.ts`.
   */
  customFonts: CustomFont[];
  projectorLook: string;
  projectorLyricsLook: string;
  /**
   * The looks the operator drew rather than picked, all four kinds in one
   * list. Each is named, and a look setting points at one by id; see
   * `customLook` in `lib/projector/looks.ts`. Held whole here and narrowed on
   * the way out — only the template actually on air rides with a slide.
   */
  customTemplates: CustomTemplate[];
  verseScale: ScaleMode;
  verseSize: number;
  lyricsScale: ScaleMode;
  lyricsSize: number;
  transitionMs: number;
  langOrder: Lang[];
  lowerThirdPosition: 'top' | 'bottom';
  lowerThirdVariant: string;
  lyricsVariant: string;
  /**
   * What those two looks are painted in. A look says how the words are
   * arranged; this says in what colours — which is why "White bands" and
   * "Black bands" are no longer two looks. See `lib/lower3rd/colors.ts`.
   */
  streamColors: StreamColors;
  obsHidden: boolean;
  streamLang: Lang;
  stageLang: Lang;
}

/**
 * The languages the operator has chosen, cleaned up.
 *
 * English is always in and always first if it had fallen out, because it is
 * what every output falls back to and the one row that cannot be removed.
 * Three is the ceiling: a fourth language on a slide is a fourth block of text
 * on a projector nobody at the back can read.
 */
export const asOrder = (value: unknown): Lang[] => {
  const listed: Lang[] = Array.isArray(value) ? value.filter(isLang) : [];
  const chosen = listed.filter((lang, index, all) => all.indexOf(lang) === index);
  const order = chosen.includes(REQUIRED_LANG) ? chosen : [REQUIRED_LANG, ...chosen];

  return order.slice(0, MAX_LANGS);
};

const asAlign = (value: unknown): Align =>
  value === 'center' || value === 'right' ? value : 'left';

/** Armed flags for the chosen languages, and nothing for the rest. */
const asFlags = (value: unknown, order: Lang[]): Partial<Record<Lang, boolean>> => {
  const flags = (value ?? {}) as Partial<Record<Lang, unknown>>;

  return Object.fromEntries(
    order.map(lang => [lang, typeof flags[lang] === 'boolean' ? flags[lang] : true]),
  );
};

/**
 * A translation the library actually holds, or the language's default.
 *
 * A settings row outlives the catalogue that was current when it was written.
 * A translation dropped since — a licence not held, a language not mirrored —
 * would otherwise sit in the row looking perfectly valid and 404 every verse
 * the operator asked for, which is a blank screen with no explanation rather
 * than a translation quietly reverting.
 */
const asVersion = (lang: Lang, value: unknown): string =>
  typeof value === 'string' && specOf(lang).versions.includes(value) ? value : defaultVersionOf(lang);

export const fromRow = (row: SettingsRow): Settings => {
  const versions = (row.versions ?? {}) as Partial<Record<Lang, string>>;
  // Read before the looks are, because a look naming a template that has since
  // been deleted has to fall back to a shipped one rather than sit there
  // selected while the wall draws something else — the same reasoning as
  // `asVersion` below, and as the font pickers'.
  const customTemplates = asCustomTemplates(row.custom_templates);
  // The dark bands look was folded back into the light one as a colourway; a
  // row still naming it is read as that arrangement in those colours.
  const stored = asStreamColors(row.stream_colors);
  const verses = migrated(row.lower_third_variant || 'scrim', stored.verses);
  const lyrics = migrated(row.lyrics_variant || 'scrim', stored.lyrics);
  const langOrder = asOrder(row.lang_order);
  const adminLang = isLang(row.admin_lang) && langOrder.includes(row.admin_lang) ? row.admin_lang : langOrder[0];

  return {
    adminLang,
    adminVersion: asVersion(adminLang, row.admin_version),
    enabled: asFlags(row.enabled, langOrder),
    versions: Object.fromEntries(langOrder.map(lang => [lang, asVersion(lang, versions[lang])])),
    theme: row.theme || DEFAULT_THEME,
    dynamicImage: row.dynamic_image || '',
    localImage: (row.local_image as LocalFileMeta | null) ?? null,
    font: row.font || DEFAULT_FONT,
    align: asAlign(row.align),
    lyricsFont: row.lyrics_font || row.font || DEFAULT_FONT,
    lyricsAlign: asAlign(row.lyrics_align ?? row.align),
    // Empty is a row written before the stream had type of its own, and it
    // reads as the projector's — which is what the stream was drawn in until
    // now, so nothing moves under an operator who never opens the panel.
    streamFont: row.stream_font || row.font || DEFAULT_FONT,
    streamAlign: asAlign(row.stream_align || row.align),
    streamLyricsFont: row.stream_lyrics_font || row.lyrics_font || row.font || DEFAULT_FONT,
    streamLyricsAlign: asAlign(row.stream_lyrics_align || row.lyrics_align || row.align),
    customFonts: asCustomFonts(row.custom_fonts),
    // Through the registry, not straight out of the row: a settings row
    // outlives the catalogue it was written against, and a look we have since
    // dropped would otherwise sit there looking valid while the projector drew
    // something else — the picker showing nothing selected and no way to tell
    // why. Same reasoning as `asVersion` above.
    projectorLook: looksAt(customTemplates, 'verses', row.projector_look)
      ? row.projector_look
      : lookOf(row.projector_look, false).value,
    // 'steady' was a layout before song text got its own scaling control; it
    // said "hold the size still", which is now a mode rather than a look.
    projectorLyricsLook: looksAt(customTemplates, 'lyrics', row.projector_lyrics_look)
      ? row.projector_lyrics_look
      : lookOf(row.projector_lyrics_look === 'steady' ? '' : row.projector_lyrics_look, true).value,
    customTemplates,
    verseScale: asScaleMode(row.verse_scale),
    verseSize: clampTextSize(row.verse_size ?? DEFAULT_VERSE_TEXT_SIZE, DEFAULT_VERSE_TEXT_SIZE),
    lyricsScale: row.projector_lyrics_look === 'steady' ? 'none' : asScaleMode(row.lyrics_scale),
    lyricsSize: clampTextSize(row.lyrics_size ?? DEFAULT_TEXT_SIZE),
    transitionMs: clampTransition(row.transition_ms ?? DEFAULT_TRANSITION_MS),
    langOrder,
    lowerThirdPosition: row.lower_third_position === 'top' ? 'top' : 'bottom',
    // A strap look naming a template that has since been deleted falls back to
    // the shipped one, exactly as the projector's two do above.
    lowerThirdVariant: droppedTemplate(customTemplates, 'stream', verses.variant) ? STREAM_FALLBACK : verses.variant,
    lyricsVariant: droppedTemplate(customTemplates, 'streamLyrics', lyrics.variant) ? STREAM_FALLBACK : lyrics.variant,
    streamColors: { verses: verses.colors, lyrics: lyrics.colors },
    obsHidden: Boolean(row.obs_hidden),
    streamLang: isLang(row.stream_lang) ? row.stream_lang : REQUIRED_LANG,
    stageLang: isLang(row.stage_lang) ? row.stage_lang : REQUIRED_LANG,
  };
};

export const toRow = (settings: Settings) => ({
  admin_lang: settings.adminLang,
  admin_version: settings.adminVersion,
  enabled: settings.enabled,
  versions: settings.versions,
  theme: settings.theme,
  dynamic_image: settings.dynamicImage,
  local_image: settings.localImage,
  font: settings.font,
  align: settings.align,
  lyrics_font: settings.lyricsFont,
  lyrics_align: settings.lyricsAlign,
  stream_font: settings.streamFont,
  stream_align: settings.streamAlign,
  stream_lyrics_font: settings.streamLyricsFont,
  stream_lyrics_align: settings.streamLyricsAlign,
  custom_fonts: settings.customFonts,
  projector_look: settings.projectorLook,
  projector_lyrics_look: settings.projectorLyricsLook,
  custom_templates: settings.customTemplates,
  verse_scale: settings.verseScale,
  verse_size: settings.verseSize,
  lyrics_scale: settings.lyricsScale,
  lyrics_size: settings.lyricsSize,
  transition_ms: settings.transitionMs,
  lang_order: settings.langOrder,
  lower_third_position: settings.lowerThirdPosition,
  lower_third_variant: settings.lowerThirdVariant,
  lyrics_variant: settings.lyricsVariant,
  stream_colors: settings.streamColors,
  obs_hidden: settings.obsHidden,
  stream_lang: settings.streamLang,
  stage_lang: settings.stageLang,
});

/**
 * Everything /show needs to draw a slide.
 *
 * The template rides only when the operator is actually on it: a console on
 * one of the eight shipped looks sends nothing extra, and an output handed no
 * template falls back to the look it was given.
 */
export const projectorStyle = (settings: Settings): ProjectorStyle => {
  const template = templateOf(settings, 'verses', settings.projectorLook);
  const lyricsTemplate = templateOf(settings, 'lyrics', settings.projectorLyricsLook);

  return {
    theme: settings.theme,
    dynamicImage: settings.dynamicImage,
    localImage: settings.localImage,
    font: settings.font,
    align: settings.align,
    lyricsFont: settings.lyricsFont,
    lyricsAlign: settings.lyricsAlign,
    look: settings.projectorLook,
    lyricsLook: settings.projectorLyricsLook,
    template,
    lyricsTemplate,
    versions: settings.versions,
    verseScale: settings.verseScale,
    verseSize: settings.verseSize,
    lyricsScale: settings.lyricsScale,
    lyricsSize: settings.lyricsSize,
    order: settings.langOrder,
    enabled: settings.enabled,
    transitionMs: settings.transitionMs,
    // A face named only inside the template still has to reach the output, or
    // the words come up in the fallback on the wall and nowhere else.
    fonts: fontsUsedBy(
      [settings.font, settings.lyricsFont, ...fontsNamedBy(template), ...fontsNamedBy(lyricsTemplate)],
      settings.customFonts,
    ),
  };
};

/** The armed languages, in the order the operator has them. */
const armedLangs = (settings: Settings): Lang[] =>
  settings.langOrder.filter(lang => settings.enabled[lang]);

/** The language the stream shows: the operator's pick, if it is still armed. */
export const streamLangOf = (settings: Settings): Lang => {
  const armed = armedLangs(settings);

  return armed.includes(settings.streamLang) ? settings.streamLang : (armed[0] ?? REQUIRED_LANG);
};

/**
 * The language the stage display reads. One only — the person standing up is
 * reading it, not glancing at it — and disarming a language falls back to the
 * first still armed rather than emptying the panels, exactly as the stream
 * does. The pick is kept either way, so re-arming restores it.
 */
export const stageLangOf = (settings: Settings): Lang => {
  const armed = armedLangs(settings);

  return armed.includes(settings.stageLang) ? settings.stageLang : (armed[0] ?? REQUIRED_LANG);
};

/**
 * Everything /lower3rd needs. The stream carries one language, so `enabled`
 * here is reduced to exactly one true — a language the operator disarms falls
 * back to the first armed one rather than blanking the overlay, and the stored
 * preference is kept so re-arming restores it.
 */
export const streamStyle = (settings: Settings): StreamStyle => {
  const chosen = streamLangOf(settings);
  const template = templateOf(settings, 'stream', settings.lowerThirdVariant);
  const lyricsTemplate = templateOf(settings, 'streamLyrics', settings.lyricsVariant);

  return {
    font: settings.streamFont,
    align: settings.streamAlign,
    lyricsFont: settings.streamLyricsFont,
    lyricsAlign: settings.streamLyricsAlign,
    order: settings.langOrder,
    enabled: Object.fromEntries(settings.langOrder.map(lang => [lang, lang === chosen])),
    transitionMs: settings.transitionMs,
    position: settings.lowerThirdPosition,
    variant: settings.lowerThirdVariant,
    lyricsVariant: settings.lyricsVariant,
    template,
    lyricsTemplate,
    versions: settings.versions,
    colors: settings.streamColors.verses,
    lyricsColors: settings.streamColors.lyrics,
    hidden: settings.obsHidden,
    fonts: fontsUsedBy(
      [
        settings.streamFont,
        settings.streamLyricsFont,
        ...fontsNamedBy(template),
        ...fontsNamedBy(lyricsTemplate),
      ],
      settings.customFonts,
    ),
  };
};
