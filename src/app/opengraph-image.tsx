import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { ImageResponse } from 'next/og';

/**
 * The card a link to the site unfurls into — Slack, iMessage, a tweet, a church
 * WhatsApp group.
 *
 * Drawn here rather than exported from a design file so it cannot drift from
 * the brand: the same three colours, the same llama, the same display face as
 * the marketing page. It renders in satori, which reads neither our CSS
 * variables nor a React component of ours, so the colours are written out and
 * the mark is pulled in as `app/icon.svg` — the copy that already carries its
 * own hexes for the same reason.
 *
 * `/opengraph-image` is listed as public in the auth middleware: the crawler
 * fetching it has no cookies.
 */
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'LlamaPresenter — everything you need for your next service';

const INK = '#191818';
const CREAM = '#FDF7E8';
const YELLOW = '#FCDF50';

export default async function OpengraphImage() {
  // Varela Round is the display face the page is set in. Read off disk: satori
  // takes the font bytes itself, and cannot use the @font-face in globals.css.
  const [valera, icon] = await Promise.all([
    readFile(join(process.cwd(), 'public/fonts/Varela-Regular.ttf')),
    readFile(join(process.cwd(), 'src/app/icon.svg'), 'utf8'),
  ]);

  // The mark, at the size it sits on the card, taken from the favicon so the
  // two can never disagree.
  const mark = `data:image/svg+xml;base64,${Buffer.from(icon).toString('base64')}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 72,
          background: `linear-gradient(160deg, ${YELLOW}33 0%, #f1ecde 38%, #fbf9f3 100%)`,
          fontFamily: 'Varela Round',
          color: INK,
        }}
      >
        {/* the name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <img src={mark} width={72} height={72} alt="" />
          <div style={{ fontSize: 40, letterSpacing: '-0.02em' }}>LlamaPresenter</div>
        </div>

        {/* the promise */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', flexDirection: 'column', fontSize: 76, lineHeight: 1.08, letterSpacing: '-0.03em' }}>
            <div style={{ display: 'flex' }}>Everything you need</div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ display: 'flex' }}>for your&nbsp;</span>
              {/* The hero's highlighter: a yellow plate under the word rather
                  than yellow type, which cannot be read on this ground. */}
              <span
                style={{
                  display: 'flex',
                  background: YELLOW,
                  borderRadius: 8,
                  padding: '2px 16px 10px',
                }}
              >
                next service
              </span>
            </div>
          </div>

          <div style={{ marginTop: 30, fontSize: 30, lineHeight: 1.4, color: '#57524a', maxWidth: 900 }}>
            Bible verses, lyrics and media on your projector, stage display and livestream — from one browser tab.
          </div>
        </div>

        {/* what it drives */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 24, color: INK }}>
          {['Projector', 'Stage display', 'Livestream', 'Your phone'].map(item => (
            <div
              key={item}
              style={{
                display: 'flex',
                padding: '10px 22px',
                borderRadius: 999,
                border: '1px solid #e2dbc9',
                background: CREAM,
              }}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: 'Varela Round', data: valera, weight: 400, style: 'normal' }],
    },
  );
}
