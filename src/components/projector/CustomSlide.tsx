'use client';

import { useLayoutEffect, useRef, useState, type CSSProperties, type RefObject } from 'react';

import { fitText } from '@/lib/projector/fitText';
import { fontStyleOf } from '@/lib/projector/fonts';
import {
  renderBox,
  type Frame,
  type PictureElement,
  type ShapeElement,
  type Gradient,
  type SlideTemplate,
  type TemplateElement,
  type TextElement,
} from '@/lib/projector/template';
import type { ProjectorStyle, ShowData } from '@/lib/types';

/** What a template is resolved against, whichever output is drawing it. */
export interface SlideStyle {
  order: ProjectorStyle['order'];
  enabled: ProjectorStyle['enabled'];
  versions?: ProjectorStyle['versions'];
  fonts: ProjectorStyle['fonts'];
  /** The one song language this output carries, when it carries only one. */
  lyricsLang?: string;
}

/** The aspect a template is drawn on, and the one every church screen is. */
const FRAME_RATIO = 16 / 9;

/**
 * How far a shrinking box may go, as a fraction of the frame's height.
 *
 * A fraction rather than a count of pixels, because the same template is
 * fitted against a projector, against the preview panel and against a tile in
 * the settings dialog — and a floor of six pixels is nothing on a screen and
 * a fifth of the type in a tile, so a passage that shrank on the wall stopped
 * shrinking in the tile and the two drew different slides. Every other length
 * here is proportional for the same reason.
 */
const MIN_FONT_RATIO = 0.006;

const SHADOW: Record<TextElement['shadow'], string | undefined> = {
  none: undefined,
  soft: '0 1px 6px rgba(0, 0, 0, 0.45)',
  strong: '0 2px 12px rgba(0, 0, 0, 0.5)',
};

const CAPS: Record<TextElement['caps'], CSSProperties['textTransform']> = {
  none: 'none',
  upper: 'uppercase',
  lower: 'lowercase',
};

const VALIGN: Record<TextElement['valign'], CSSProperties['justifyContent']> = {
  top: 'flex-start',
  middle: 'center',
  bottom: 'flex-end',
};

/**
 * Where an element sits inside the frame, how much of it shows, and which way
 * it faces.
 *
 * The turn is a transform about the box's own centre rather than anything in
 * the frame: the rectangle the operator laid out is still the rectangle text
 * is fitted into and pictures are cropped to, so turning a box never changes
 * what it holds — only which way it is hung.
 */
const placement = (element: TemplateElement): CSSProperties => ({
  position: 'absolute',
  left: `${element.frame.x * 100}%`,
  top: `${element.frame.y * 100}%`,
  width: `${element.frame.w * 100}%`,
  height: `${element.frame.h * 100}%`,
  opacity: element.opacity,
  transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined,
});

/**
 * What a shape is painted with: nothing, a colour, a gradient, or a picture.
 *
 * The picture rides in `background-image` rather than an `<img>` so it is
 * clipped by the shape's own corners — which is the point of offering it at
 * all: an ellipse filled with a photograph is a round photograph, and there is
 * no other way to get one onto a slide.
 */
/** A gradient as CSS, with 0° pointing up as it does everywhere in the editor. */
const gradientCss = (gradient: Gradient) =>
  // CSS measures a linear gradient from the bottom up at 0deg, and the rest of
  // the editor's angles are clockwise from straight up; adding a half turn
  // makes 0 point up here too, so one dial means one thing.
  `linear-gradient(${gradient.angle + 180}deg, ${gradient.from}, ${gradient.to})`;

/** The panel behind the words: nothing, a flat colour, or a gradient. */
const plateOf = (element: TextElement): CSSProperties => {
  // Bands are painted on the lines themselves, not on the box behind them.
  if (element.plateKind === 'none' || element.plateSpan === 'line') return {};

  if (element.plateKind === 'gradient') return { background: gradientCss(element.plateGradient) };

  return { background: element.plate || undefined };
};

/**
 * A plate behind each line, with the picture showing through between them.
 *
 * A layer of its own behind the words, masked into stripes, rather than a
 * background on them: an inline background could only ever be as wide as its
 * own words, and what this is for is a band running the full width of the box.
 * The mask goes on the layer and not on the text's own box — a mask takes the
 * contents with it, so masking the box would slice the letters into bands too.
 *
 * The stripe's period is the line height, so it lands on the line boxes
 * whatever the text says and however it wraps; the leading left over at each
 * end of the period is the gap, and starting the stripe inside it keeps the
 * words centred on their own band. Sized in `em`, which resolves against the
 * words' own size — so the bands follow a box that has shrunk to fit.
 */
const Bands = ({ element }: { element: TextElement }) => {
  if (element.plateKind === 'none' || element.plateSpan !== 'line') return null;

  const period = element.lineHeight;
  const half = Math.min(element.plateGap, period * 0.8) / 2;
  const stripe =
    `repeating-linear-gradient(to bottom, transparent 0, transparent ${half}em, ` +
    `#000 ${half}em, #000 ${period - half}em, transparent ${period - half}em, transparent ${period}em)`;

  const paint =
    element.plateKind === 'gradient' ? gradientCss(element.plateGradient) : element.plate;

  if (!paint) return null;

  return (
    <span
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        // Behind the words, which are in the normal flow above it.
        zIndex: -1,
        background: paint,
        maskImage: stripe,
        WebkitMaskImage: stripe,
      }}
    />
  );
};

/**
 * What a shape is filled with: nothing, a colour, a gradient, or a picture.
 *
 * The picture rides in `background-image` rather than an `<img>` so it is
 * clipped by the shape's own corners — which is the point of offering it at
 * all: an ellipse filled with a photograph is a round photograph, and there is
 * no other way to get one onto a slide.
 */
const fillOf = (element: ShapeElement, url: string | undefined): CSSProperties => {
  if (element.fillKind === 'none') return {};

  if (element.fillKind === 'color') return { background: element.fill || undefined };

  if (element.fillKind === 'gradient') return { background: gradientCss(element.gradient) };

  return url
    ? {
        backgroundImage: `url(${url})`,
        backgroundSize: element.fit === 'fill' ? '100% 100%' : element.fit,
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }
    : {};
};

const Shape = ({ element, unit, url }: { element: ShapeElement; unit: number; url: string | undefined }) => (
  <div
    aria-hidden
    style={{
      ...placement(element),
      ...fillOf(element, url),
      border:
        element.stroke && element.strokeWidth
          ? `${element.strokeWidth * unit}px solid ${element.stroke}`
          : undefined,
      // A line is round-ended whatever its thickness; everything else takes
      // the radius the operator set.
      borderRadius:
        element.kind === 'ellipse' ? '50%' : element.kind === 'line' ? '9999px' : `${element.radius * unit}px`,
    }}
  />
);

/**
 * A picture the operator placed. The bytes are resolved by whoever mounted
 * this — over WebRTC on a projector, straight out of IndexedDB in the console
 * — so an element with nothing to draw simply draws nothing, exactly as an
 * unreachable background does.
 */
const Picture = ({ element, unit, url }: { element: PictureElement; unit: number; url: string | undefined }) =>
  url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      alt=""
      src={url}
      style={{
        ...placement(element),
        objectFit: element.fit,
        borderRadius: element.radius ? `${element.radius * unit}px` : undefined,
      }}
      className="pointer-events-none select-none"
    />
  ) : null;

/**
 * One text box.
 *
 * The size is a percentage of the frame's height, so a template drawn in a
 * 400px panel comes out the same shape on a 4K projector. A `shrink` box then
 * runs the projector's own `fitText` inside its own rectangle — the same
 * binary search the eight shipped looks use, just bounded by a box rather than
 * by the screen — which is what stops a forty-verse reading from spilling off
 * the wall.
 */
const Text = ({
  element,
  frame,
  slot,
  lines,
  unit,
  fonts,
  register,
}: {
  element: TextElement;
  /** Where this share of the box sits; see `perLanguage`. */
  frame: Frame;
  slot: string;
  lines: string[];
  unit: number;
  fonts: ProjectorStyle['fonts'];
  register: (slot: string, node: HTMLDivElement | null) => void;
}) => {
  const type = fontStyleOf(element.font, fonts);
  const padding = element.padding * unit;

  return (
    <div
      style={{
        ...placement({ ...element, frame }),
        display: 'flex',
        flexDirection: 'column',
        justifyContent: VALIGN[element.valign],
        padding,
        ...plateOf(element),
        border:
          element.plateStroke && element.plateStrokeWidth
            ? `${element.plateStrokeWidth * unit}px solid ${element.plateStroke}`
            : undefined,
        borderRadius: element.radius ? `${element.radius * unit}px` : undefined,
        overflow: 'hidden',
      }}
    >
      <div
        ref={node => register(slot, node)}
        className={type.className}
        style={{
          fontFamily: type.style,
          fontSize: `${element.size * unit}px`,
          fontWeight: element.weight,
          fontStyle: element.italic ? 'italic' : 'normal',
          textTransform: CAPS[element.caps],
          color: element.color,
          textAlign: element.align,
          lineHeight: element.lineHeight,
          textShadow: SHADOW[element.shadow],
          // So the bands, which are absolute, hang off this box.
          position: 'relative',
          // Behind the letter rather than straddling its edge: a centred
          // stroke eats into the glyph and a thick one closes up the
          // counters, which at projector size turns an `e` into a blob.
          ...(element.stroke && element.strokeWidth
            ? {
                WebkitTextStrokeWidth: `${element.strokeWidth * unit}px`,
                WebkitTextStrokeColor: element.stroke,
                paintOrder: 'stroke fill',
              }
            : {}),
        }}
      >
        <Bands element={element} />

        {lines.map((line, index) => (
          <p key={index} dangerouslySetInnerHTML={{ __html: line }} />
        ))}
      </div>
    </div>
  );
};

/**
 * The largest 16:9 box that fits what we were handed.
 *
 * A frame of its own rather than `useBox`, because what the elements are
 * placed on is not the element's box but the screen-shaped area inside it.
 * A template is authored on 16:9, so a screen of another shape keeps its
 * background full-bleed underneath and gets the elements where they were put
 * rather than stretched somewhere else.
 */
const useFrame = (ref: RefObject<HTMLDivElement | null>) => {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    const node = ref.current;

    if (!node) return;

    const measure = () => {
      const box = node.getBoundingClientRect();
      const width = Math.min(box.width, box.height * FRAME_RATIO);
      const next = { width, height: width / FRAME_RATIO };

      setSize(current => (current.width === next.width && current.height === next.height ? current : next));
    };

    measure();

    const observer = new ResizeObserver(measure);

    observer.observe(node);

    return () => observer.disconnect();
  }, [ref]);

  return size;
};

/**
 * The operator's own layout, drawn.
 *
 * Reached from `Slide.tsx` when the verse look is `custom`, which is what puts
 * it on the projector, in the console's preview panel and in the picker tile at
 * once. The frame is 16:9 and centred: a template is authored on that shape, so
 * a screen of another shape keeps its background full-bleed underneath and gets
 * the elements where they were placed rather than stretched somewhere else.
 */
/**
 * A text box's shares: one per language it repeats for.
 *
 * `stack` is one share holding every repeat's lines run together, which keeps
 * a single language centred in the box the template was built for. `split`
 * cuts the box into equal shares with a gap between them — and because the
 * shares are cut from the box rather than fixed in the template, a language
 * switched off gives its share back to the others and what is left re-centres.
 * Two hand-placed boxes cannot do that; they leave a hole.
 */
interface Share {
  slot: string;
  frame: Frame;
  lines: string[];
  /** The box as this share draws it: the second language may have its own. */
  element: TextElement;
}

const sharesOf = (element: TextElement, groups: string[][]): Share[] => {
  if (element.perLanguage === 'stack' || groups.length < 2) {
    return [{ slot: element.id, frame: element.frame, lines: groups.flat(), element }];
  }

  const { x, y, w, h } = element.frame;
  const gap = element.gap / 100;
  const each = (h - gap * (groups.length - 1)) / groups.length;

  // The first share is the box itself; every one after it takes the second
  // style when there is one, so an original and its translation can be set
  // differently without becoming two boxes that leave a hole.
  const translated = element.secondary ? { ...element, ...element.secondary } : element;

  return groups.map((lines, index) => ({
    slot: `${element.id}:${index}`,
    frame: { x, y: y + index * (each + gap), w, h: Math.max(each, 0.002) },
    lines,
    element: index === 0 ? element : translated,
  }));
};

export const CustomSlide = ({
  template,
  showData,
  style,
  assets,
}: {
  template: SlideTemplate;
  showData: ShowData;
  /**
   * Only what a template needs, rather than a whole `ProjectorStyle`: the
   * stream draws the same templates from a `StreamStyle`, and neither reader
   * should have to pretend to be the other to do it.
   */
  style: SlideStyle;
  /** Object URLs for the pictures the template names, by file id. */
  assets?: Record<string, string>;
}) => {
  const boxRef = useRef<HTMLDivElement>(null);
  const size = useFrame(boxRef);

  const texts = useRef(new Map<string, HTMLDivElement | null>());

  const register = (slot: string, node: HTMLDivElement | null) => {
    texts.current.set(slot, node);
  };

  const unit = size.height / 100;

  const ctx = {
    showData,
    order: style.order ?? [],
    enabled: style.enabled ?? {},
    versions: style.versions ?? {},
    lyricsLang: style.lyricsLang,
  };

  const drawn = template.elements.flatMap((element): { element: TemplateElement; share: Share | null }[] => {
    if (element.kind !== 'text') return [{ element, share: null }];

    // A box whose tokens all came out empty is not drawn at all — that is what
    // lets one template serve a one-language operator and a three-language one.
    return sharesOf(element, renderBox(element.content, ctx)).map(share => ({ element, share }));
  });

  // After the paint that set every box's chosen size, shrink the ones that ask
  // for it. Runs on every render, like the preview panel's fit, because the
  // thing being measured changes with the slide and not only with the box.
  useLayoutEffect(() => {
    // Every share of one split box, so they can be brought to a common size
    // below: two languages of different lengths, each fitted alone, come out
    // at two sizes, and a song set larger in one language than the other reads
    // as a mistake rather than as a choice.
    const together = new Map<string, HTMLDivElement[]>();

    for (const { element, share } of drawn) {
      if (element.kind !== 'text' || !share) continue;

      const node = texts.current.get(share.slot);
      const max = share.element.size * unit;

      if (!node) continue;

      if (share.element.autoSize === 'fixed') {
        node.style.fontSize = `${max}px`;
        continue;
      }

      const available = share.frame.h * size.height - share.element.padding * unit * 2;
      const floor = Math.max(1, size.height * MIN_FONT_RATIO);

      fitText(node, available, { min: Math.min(floor, max), max });

      // Only when the shares are meant to match. A box whose translation has
      // a style of its own has been given a size on purpose, and levelling the
      // two would throw that away.
      if (!element.secondary) together.set(element.id, [...(together.get(element.id) ?? []), node]);
    }

    for (const nodes of together.values()) {
      if (nodes.length < 2) continue;

      const smallest = Math.min(...nodes.map(node => parseFloat(node.style.fontSize) || 0));

      for (const node of nodes) node.style.fontSize = `${smallest}px`;
    }
  });

  return (
    <div ref={boxRef} className="relative flex h-full w-full items-center justify-center">
      <div className="relative" style={{ width: size.width, height: size.height }}>
        {drawn.map(({ element, share }) =>
          element.kind === 'text' && share ? (
            <Text
              key={share.slot}
              element={share.element}
              frame={share.frame}
              slot={share.slot}
              lines={share.lines}
              unit={unit}
              fonts={style.fonts}
              register={register}
            />
          ) : element.kind === 'picture' ? (
            <Picture
              key={element.id}
              element={element}
              unit={unit}
              url={element.file ? assets?.[element.file.id] : undefined}
            />
          ) : element.kind === 'text' ? null : (
            <Shape
              key={element.id}
              element={element}
              unit={unit}
              url={element.file ? assets?.[element.file.id] : undefined}
            />
          ),
        )}
      </div>
    </div>
  );
};
