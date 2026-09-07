/**
 * The layouts `/show` can draw a slide in.
 *
 * Eight of them are shipped variants: an operator picks the look that suits
 * their room rather than building one, so a look is a row here and a block of
 * CSS in `globals.css`, exactly as a lower-third variant is — the markup in
 * `Slide.tsx` is the same for all of them.
 *
 * The ninth is the one they *do* build. `custom` is a row here like any other,
 * but it is drawn from `lib/projector/template.ts` instead of from CSS, and it
 * sizes its own text; `selfFit` is what tells every caller of `fitText` so.
 *
 * It is data rather than pure CSS because a look changes how the text is
 * *fitted* and not only how it is painted: one that sits low on the screen has
 * less height to grow into. Keeping those numbers here is what lets the
 * projector and the console's preview panel scale the same slide the same way.
 */
export interface Look {
  value: string;
  label: string;
  /** Ceiling on the font, as a fraction of the screen: height / divisor. */
  divisor: number;
  /** How much of the screen height the block may fill. */
  heightRatio: number;
  /**
   * This look sizes its own text and wants no pass over the slide as a whole.
   * Only the custom template does: it is a set of boxes rather than one block,
   * so each box is fitted inside its own rectangle and a single font size for
   * all of them would mean nothing. Every caller of `fitText` checks it.
   */
  selfFit?: boolean;
}

/**
 * What a look setting carries when one of the operator's own templates is on.
 *
 * `custom:<id>` names which: the library holds as many as they care to draw,
 * so the setting has to say more than "the custom one". A bare `custom` is a
 * row written before the library existed and still reads — `templateOf` takes
 * it as the first template of its kind, which is the only one such a row had.
 *
 * Same shape as a custom font's `custom:<id>`, and for the same reason: the
 * value has to survive in a column that knows nothing about either list.
 */
export const CUSTOM_LOOK = 'custom';

export const customLook = (id: string) => `${CUSTOM_LOOK}:${id}`;

export const isCustomLook = (value: string | undefined): boolean =>
  value === CUSTOM_LOOK || (value ?? '').startsWith(`${CUSTOM_LOOK}:`);

/** The template a look names, or '' for a bare `custom` and anything else. */
export const templateIdOf = (value: string | undefined): string =>
  (value ?? '').startsWith(`${CUSTOM_LOOK}:`) ? value!.slice(CUSTOM_LOOK.length + 1) : '';

/**
 * How a slide is sized. Scaling to fit is what makes one line fill the
 * screen and six lines still fit on it; it is also what makes the words breathe
 * in and out across a verse, which is exactly what some rooms do not want. The
 * answer to that is one steady size — the operator's own, see `lyricsSize` —
 * and there is no third useful answer between the two.
 *
 * The size is read in both modes, as it is in the template editor: fitting
 * takes it as a ceiling — *this large, and smaller when the words need it* —
 * and holding pins the text to it. One number, one slider, live in both modes,
 * rather than a control that greys out under the mode most operators are on.
 *
 * And it is the ceiling, not a second one under the look's: a slider whose top
 * half moved nothing — because `divisor` had already capped a verse at a
 * thirteenth of the screen — is a control that lies. What the look decides is
 * where the block sits and how much height it may fill; how large the words may
 * grow is the operator's, and this is where they say it.
 */
export type ScaleMode = 'both' | 'none';

export const SCALE_MODES: { value: ScaleMode; label: string }[] = [
  { value: 'both', label: 'Scale to fit' },
  { value: 'none', label: 'Hold the size' },
];

/** The chosen size, as a percentage of the screen height. */
export const MIN_TEXT_SIZE = 4;
export const MAX_TEXT_SIZE = 30;

/**
 * Where an operator who has never touched the slider sits, and why these two
 * numbers: they are the ceilings the fit was already running into on a 1080p
 * projector — 200px for a song and 64px for a verse — as a share of that
 * screen. Held as a share, they now mean the same thing on a larger one, which
 * the pixel caps never did.
 */
export const DEFAULT_TEXT_SIZE = 18;
export const DEFAULT_VERSE_TEXT_SIZE = 6;

export const asScaleMode = (value: unknown): ScaleMode =>
  SCALE_MODES.some(mode => mode.value === value) ? (value as ScaleMode) : 'both';

export const clampTextSize = (value: number, fallback = DEFAULT_TEXT_SIZE): number =>
  Math.min(MAX_TEXT_SIZE, Math.max(MIN_TEXT_SIZE, Math.round(value) || fallback));

/** Today's fit: a verse may fill most of the screen, capped at height/13. */
const VERSE_FIT = { divisor: 13, heightRatio: 0.86 };

/** Lyrics are short and want to be large, so the ceiling is far higher. */
const LYRIC_FIT = { divisor: 4, heightRatio: 0.86 };

export const VERSE_LOOKS: Look[] = [
  { value: 'below', label: 'Reference below', ...VERSE_FIT },
  { value: 'heading', label: 'Heading above', ...VERSE_FIT },
  { value: 'headingbelow', label: 'Heading below', ...VERSE_FIT },
  { value: 'overline', label: 'Overline', ...VERSE_FIT },
  // The plate's padding is part of the block, so it needs a little more room.
  { value: 'plate', label: 'On a plate', divisor: 14, heightRatio: 0.8 },
  { value: 'rule', label: 'Ruled off', ...VERSE_FIT },
  { value: 'chip', label: 'Reference chip', ...VERSE_FIT },
  // The operator's own arrangement, drawn from `lib/projector/template.ts`
  // rather than from a block of CSS. The fit numbers are here so that a
  // template that has somehow gone missing still falls through to something
  // sensible, but nothing reads them while `selfFit` stands.
  { value: CUSTOM_LOOK, label: 'Custom', ...VERSE_FIT, selfFit: true },
];

export const LYRIC_LOOKS: Look[] = [
  { value: 'fill', label: 'Fill the screen', ...LYRIC_FIT },
  // Sitting off centre leaves half the picture clear — low for a room whose
  // screen is high, high for one where the band stands in front of it. Both
  // give up the same height, which is what keeps them the same size.
  { value: 'lower', label: 'Lower third', divisor: 6, heightRatio: 0.42 },
  { value: 'upper', label: 'Upper third', divisor: 6, heightRatio: 0.42 },
  { value: 'plate', label: 'On a plate', divisor: 5, heightRatio: 0.76 },
  { value: 'column', label: 'Narrow column', divisor: 6, heightRatio: 0.86 },
  // The operator's own, as above. Songs get their own template: a lyric slide
  // has no reference and its languages are the song's rather than the armed
  // ones, so one arrangement could not serve both.
  { value: CUSTOM_LOOK, label: 'Custom', ...LYRIC_FIT, selfFit: true },
];

export const DEFAULT_VERSE_LOOK = 'below';
export const DEFAULT_LYRIC_LOOK = 'fill';

/**
 * The look for a stored value, falling back to the default. A settings row
 * written before this feature existed carries an empty string, and a payload
 * from an older console carries nothing at all; both mean "the standard slide".
 */
export const lookOf = (value: string | undefined, lyrics: boolean): Look => {
  const looks = lyrics ? LYRIC_LOOKS : VERSE_LOOKS;
  const fallback = lyrics ? DEFAULT_LYRIC_LOOK : DEFAULT_VERSE_LOOK;
  // Every template in the library is drawn by the one custom row: which of
  // them is a question about the template, not about the fit.
  const wanted = isCustomLook(value) ? CUSTOM_LOOK : value;

  return looks.find(look => look.value === wanted) ?? looks.find(look => look.value === fallback)!;
};

/**
 * The bounds `fitText` should use for `look` inside a box `height` pixels tall.
 *
 * The projector measures against a screen and the console's preview panel
 * against a thumbnail, so each passes its own floor and ceiling in pixels; the
 * look decides the rest. Sharing this is what keeps a slide that fills the
 * projector filling the preview too.
 */
export const fitTo = (
  look: Look,
  height: number,
  { cap = Infinity, min = 8, scale = 'both' as ScaleMode, size = 0 } = {},
) => {
  const ceiling = Math.max(min, Math.min(cap, Math.round(height / look.divisor)));
  const available = height * look.heightRatio;

  // The operator's own size, held as a share of the screen so it means the same
  // thing on a projector, in the preview panel and in a tile.
  const chosen = size ? Math.max(min, Math.round((height * size) / 100)) : 0;

  // Fitting: anywhere between the floor and the operator's size, whatever the
  // slide needs. Their number stands in for the look's own ceiling rather than
  // sitting under it, so raising it raises the words — and it is deliberately
  // not held to `cap`, which is a pixel count and means nothing on a screen
  // twice the size. The look's ceiling is what a slide with no size falls to.
  if (scale === 'both') return { available, min, max: chosen || ceiling };

  if (!chosen) return { available, min, max: ceiling };

  // Holding: the search has nowhere to go, so a slide too long for the size
  // overflows — which is what "no scaling" means everywhere else it is offered.
  return { available, min: chosen, max: chosen };
};
