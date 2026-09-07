import type { RefObject } from 'react';

import { cn } from '@/lib/cn';
import { lyricBlocks } from '@/lib/lyrics/langs';
import { fontStyleOf } from '@/lib/projector/fonts';
import { CUSTOM_LOOK, DEFAULT_LYRIC_LOOK, DEFAULT_VERSE_LOOK } from '@/lib/projector/looks';
import { referenceOf } from '@/lib/projector/template';
import type { Align, Lang, ProjectorStyle, ShowData, Verse } from '@/lib/types';

import { CustomSlide } from './CustomSlide';

const ALIGN_CLASS: Record<Align, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

/** One language's verses, with its reference. */
const VerseBlock = ({ verses, lang }: { verses: Verse[]; lang: Lang }) => {
  const { book, numbers } = referenceOf(verses, lang);

  return (
    <div className="show-block">
      {verses.map((verse, index) => (
        <p className="show-text" key={index} dangerouslySetInnerHTML={{ __html: verse.bv }} />
      ))}

      <div className="show-refline">
        <span className="show-ref">
          <span className="show-ref-book">{book}</span> <span className="show-ref-num">{numbers}</span>
        </span>
      </div>
    </div>
  );
};

/**
 * A slide, as the projector draws it.
 *
 * One markup for three readers: `/show`, the console's preview panel, and the
 * tiles in the look picker. That is the whole point of it being a component —
 * the lower third learned the same lesson, and a look that previews itself
 * cannot drift from what the room will see.
 *
 * Everything inside is sized in `em`, so a single `fitText` pass on this box
 * scales the text, the gaps, the plate padding and the reference together. The
 * caller owns that pass: the projector fits against a screen, the panel against
 * a thumbnail, and the picker not at all.
 */
export const Slide = ({
  ref,
  showData,
  style,
  assets,
  className,
}: {
  ref?: RefObject<HTMLDivElement | null>;
  showData: ShowData;
  style: ProjectorStyle;
  /** Object URLs for the pictures a custom template names, by file id. */
  assets?: Record<string, string>;
  className?: string;
}) => {
  const lyrics = showData?.lyrics;

  const look = lyrics
    ? style.lyricsLook || DEFAULT_LYRIC_LOOK
    : style.look || DEFAULT_VERSE_LOOK;

  // The operator's own arrangement is not this markup with different knobs on
  // it, so it is drawn somewhere else entirely. Neither the ref nor the class
  // travels: both belong to the single fit the shipped looks share, and a
  // template fits each of its boxes on its own. Verses and songs keep separate
  // templates, because a song slide has no reference and its languages are the
  // song's rather than the armed ones. A look set to custom with no template —
  // an output handed a payload from a console that had since moved off it —
  // falls through to the standard slide rather than to a bare screen.
  const template = lyrics ? style.lyricsTemplate : style.template;

  if (look === CUSTOM_LOOK && template) {
    return <CustomSlide template={template} showData={showData} style={style} assets={assets} />;
  }

  // A shipped face is a class and nothing else; one the operator added has no
  // class and is named inline instead. `fontStyleOf` decides which, so a font
  // deleted from the library falls back here rather than on the wall.
  const type = fontStyleOf(lyrics ? style.lyricsFont : style.font, style.fonts);

  return (
    <div
      ref={ref}
      className={cn(
        'show-slide',
        `show-slide--${look}`,
        type.className,
        ALIGN_CLASS[lyrics ? style.lyricsAlign : style.align],
        className,
      )}
      style={type.style ? { fontFamily: type.style } : undefined}
    >
      {lyrics ? (
        // A song slide has no reference, and its languages are the song's own
        // rather than the armed ones — but they stack exactly as verses do, so
        // two languages of a chorus are two blocks fitted as one. The line
        // breaks the song was written with are ignored: at projector size they
        // wrap anyway, and honouring both gives a ragged block.
        lyricBlocks(lyrics).map(block => (
          <div key={block.id} className="show-block">
            <p className="show-text">{block.text.split('\n').join(' ')}</p>
          </div>
        ))
      ) : (
        style.order.map(lang => {
          const verses = showData?.[lang] ?? [];

          return style.enabled?.[lang] && verses.length > 0 ? (
            <VerseBlock key={lang} lang={lang} verses={verses} />
          ) : null;
        })
      )}
    </div>
  );
};
