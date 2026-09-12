'use client';

import { useState, type CSSProperties, type ReactNode } from 'react';
import { MdFormatAlignCenter, MdFormatAlignLeft, MdFormatAlignRight } from 'react-icons/md';

import { Select } from '@/components/ui/Select';
import { cn } from '@/lib/cn';

import { FontPicker } from '@/components/studio/pickers/FontPicker';
import type { CustomFont } from '@/lib/projector/fonts';
import {
  asScaleMode,
  clampTextSize,
  isCustomLook,
  MAX_TEXT_SIZE,
  MIN_TEXT_SIZE,
  SCALE_MODES,
  type ScaleMode,
} from '@/lib/projector/looks';
import { useStudio } from '@/lib/studio/StudioProvider';
import type { Align } from '@/lib/types';

import { ProjectorLookPicker, type LookTarget } from '@/components/studio/pickers/ProjectorLookPicker';

const ALIGNMENTS = [
  { value: 'left' as Align, label: 'Align left', Icon: MdFormatAlignLeft },
  { value: 'center' as Align, label: 'Align center', Icon: MdFormatAlignCenter },
  { value: 'right' as Align, label: 'Align right', Icon: MdFormatAlignRight },
];

/** A titled block inside the settings dialog. */
export const Field = ({
  label,
  hint,
  className,
  children,
}: {
  label: string;
  hint?: string;
  className?: string;
  children: ReactNode;
}) => (
  <div className={className}>
    <span className="block text-xs font-semibold text-studio-text">{label}</span>
    {hint ? <p className="mt-0.5 text-[11px] leading-snug text-studio-faint">{hint}</p> : null}
    <div className="mt-2">{children}</div>
  </div>
);

/**
 * Typeface and alignment for one kind of slide: verses, or song lyrics.
 *
 * Exported, because the stream sets the same two things about its own output
 * and an operator who has learned this control on the projector panel should
 * not have to learn a second one on the stream panel.
 */
export const TypeRow = ({
  label,
  hint,
  font,
  fonts,
  setFont,
  align,
  setAlign,
}: {
  label: string;
  hint: string;
  font: string;
  /** The operator's own faces, offered below the ones we ship. */
  fonts: CustomFont[];
  setFont: (value: string) => void;
  align: Align;
  setAlign: (value: Align) => void;
}) => (
  <Field label={label} hint={hint}>
    <div className="flex items-center gap-1.5">
      <FontPicker className="min-w-0 flex-1" label={label} value={font} onChange={setFont} fonts={fonts} />

      <div className="flex shrink-0 items-center gap-0.5 rounded-studio border border-studio-border p-0.5">
        {ALIGNMENTS.map(({ value, label: title, Icon }) => (
          <button
            key={value}
            type="button"
            aria-label={`${title} — ${label.toLowerCase()}`}
            title={`${title} — ${label.toLowerCase()}`}
            aria-pressed={align === value}
            onClick={() => setAlign(value)}
            className={cn(
              'flex size-7 items-center justify-center rounded-[4px] transition-colors duration-150',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-studio-accent/40',
              align === value
                ? 'bg-studio-accent text-studio-onaccent'
                : 'text-studio-muted hover:bg-studio-surface hover:text-studio-text',
            )}
          >
            <Icon className="text-sm" />
          </button>
        ))}
      </div>
    </div>
  </Field>
);

/**
 * How one kind of slide is sized: fitted, or held at a share of the screen.
 *
 * Verses and songs each have a pair of their own, because they are fitted to
 * different ceilings — a song may fill a quarter of the screen height, a verse
 * a thirteenth — and a single held size could not mean both.
 */
const TextSizeField = ({
  label,
  hint,
  scale,
  setScale,
  size,
  setSize,
}: {
  label: string;
  hint: string;
  scale: ScaleMode;
  setScale: (value: ScaleMode) => void;
  size: number;
  setSize: (value: number) => void;
}) => (
  <Field label={label} hint={hint}>
    <div className="flex items-center gap-1.5">
      <Select
        className="min-w-0 flex-1"
        value={scale}
        onChange={value => setScale(asScaleMode(value))}
        options={SCALE_MODES}
      />

      {/* Live in both modes, as the same control is in the template editor:
          fitting reads it as a ceiling, holding pins the text to it. */}
      <div className="flex shrink-0 items-center gap-2">
        <input
          type="range"
          min={MIN_TEXT_SIZE}
          max={MAX_TEXT_SIZE}
          step={1}
          value={size}
          aria-label={
            scale === 'both'
              ? `${label}, the largest share of the screen height the words may take`
              : `${label}, as a share of the screen height`
          }
          onChange={event => setSize(clampTextSize(Number(event.target.value)))}
          style={
            {
              '--range-fill': `${((size - MIN_TEXT_SIZE) / (MAX_TEXT_SIZE - MIN_TEXT_SIZE)) * 100}%`,
            } as CSSProperties
          }
          className="studio-range h-1.5 w-28 cursor-pointer appearance-none rounded-full bg-studio-border"
        />

        <span className="w-12 shrink-0 text-right text-xs text-studio-muted tabular-nums">
          {`${scale === 'both' ? '≤ ' : ''}${size}%`}
        </span>
      </div>
    </div>
  </Field>
);

/**
 * The projector panel of the settings dialog: the background behind the words,
 * the typeface they are set in, and how one slide gives way to the next.
 *
 * Everything under the layout grid belongs to the tab above it. A verse and a
 * song keep separate looks, separate type and separate sizing, and showing
 * both sets at once meant an operator who had come about the song reading four
 * controls to find the two that moved — and a lyrics choice that hid a control
 * while the Verses tab was open, which reads as the panel losing it.
 */
export const StyleSection = () => {
  const { settings, showData, update } = useStudio();

  // Opens on whichever kind of slide is live, and the grid, the sizing and the
  // type below it all follow it. Held here rather than in the picker because
  // it is no longer only the picker's.
  const [target, setTarget] = useState<LookTarget>(showData?.lyrics ? 'lyrics' : 'verses');

  const lyrics = target === 'lyrics';
  const custom = isCustomLook(lyrics ? settings.projectorLyricsLook : settings.projectorLook);

  return (
    <div className="space-y-6">
      <ProjectorLookPicker target={target} onTarget={setTarget} />

      {/* A custom slide sizes and sets each of its own boxes, and answers both
          of these in the template — so under that look they are dead UI. */}
      {custom ? null : (
        <>
          {lyrics ? (
            <TextSizeField
              label="Song text size"
              hint="As large as this, and smaller when the words need it. Hold the size instead if
                song text growing and shrinking between slides is distracting."
              scale={settings.lyricsScale}
              setScale={value => update({ lyricsScale: value })}
              size={settings.lyricsSize}
              setSize={value => update({ lyricsSize: value })}
            />
          ) : (
            <TextSizeField
              label="Verse text size"
              hint="As large as this, and smaller when the words need it — a passage never spills.
                Hold the size instead if the words changing size between passages is distracting."
              scale={settings.verseScale}
              setScale={value => update({ verseScale: value })}
              size={settings.verseSize}
              setSize={value => update({ verseSize: value })}
            />
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            {lyrics ? (
              <TypeRow
                label="Lyric type"
                hint="Typeface and alignment for song slides."
                font={settings.lyricsFont}
                fonts={settings.customFonts}
                setFont={value => update({ lyricsFont: value })}
                align={settings.lyricsAlign}
                setAlign={value => update({ lyricsAlign: value })}
              />
            ) : (
              <TypeRow
                label="Verse type"
                hint="Typeface and alignment for Bible slides."
                font={settings.font}
                fonts={settings.customFonts}
                setFont={value => update({ font: value })}
                align={settings.align}
                setAlign={value => update({ align: value })}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
};
