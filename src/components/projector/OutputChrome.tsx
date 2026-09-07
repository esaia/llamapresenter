'use client';

import { useCallback, useEffect, useState, useSyncExternalStore, type ReactNode } from 'react';
import { FlipHorizontal2, FlipVertical2, Maximize2, Minimize2 } from 'lucide-react';

/** Which output the chrome is dressing, and the key its toggles are saved under. */
export type OutputKind = 'show' | 'stage' | 'lower3rd';

type Toggle = 'mirror' | 'flip';

const keyFor = (kind: OutputKind, toggle: Toggle) => `selahOutput:${kind}:${toggle}`;

const readToggle = (kind: OutputKind, toggle: Toggle) => {
  try {
    return localStorage.getItem(keyFor(kind, toggle)) === '1';
  } catch {
    return false;
  }
};

const writeToggle = (kind: OutputKind, toggle: Toggle, on: boolean) => {
  try {
    localStorage.setItem(keyFor(kind, toggle), on ? '1' : '0');
  } catch {
    // Non-critical: the toggle still holds for this run.
  }
};

/**
 * Client-only, without a state write on mount: the server renders no chrome,
 * so hydration matches, and the toggles below are only ever read where there is
 * a `localStorage` to read them from.
 */
const useMounted = () => useSyncExternalStore(() => () => {}, () => true, () => false);

/** How long the cluster stays up after the operator last moved the mouse. */
const IDLE_MS = 2500;

const CHROME_BUTTON =
  'rounded-studio p-3 text-white/30 transition-colors duration-150 hover:bg-white/10 hover:text-white/80 ' +
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40';

const CHROME_BUTTON_ON = 'bg-white/10 text-white/80';

/**
 * The controls an output page carries for the person standing in front of it:
 * a flip each way — a screen bounced off a mirror, or a projector hung upside
 * down — and fullscreen. Nothing here
 * is pushed from the console and nothing here is published back — these are
 * properties of the machine the page is open on, which is why they are saved
 * in its own `localStorage` and not in the session.
 *
 * The cluster follows the mouse rather than sitting there: `/lower3rd` is
 * captured by OBS, and three grey buttons burnt into a broadcast is the thing
 * to avoid. A browser source never moves a pointer, so it never sees them.
 */
export const OutputChrome = ({
  kind,
  children,
  hiddenAtRest = false,
}: {
  kind: OutputKind;
  children: ReactNode;
  /** Start out of the way rather than showing once, for a page that is on air. */
  hiddenAtRest?: boolean;
}) => {
  // Nothing until mounted: the toggles live in `localStorage`, which the server
  // cannot read, and the console renders these pages into its own preview with
  // `?preview`, where controls would be furniture over the operator's slide.
  const mounted = useMounted();
  const [mirror, setMirror] = useState(() => typeof window !== 'undefined' && readToggle(kind, 'mirror'));
  const [flip, setFlip] = useState(() => typeof window !== 'undefined' && readToggle(kind, 'flip'));
  const [preview] = useState(
    () => typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('preview'),
  );
  const [fullscreen, setFullscreen] = useState(false);
  const [awake, setAwake] = useState(!hiddenAtRest);

  const ready = mounted && !preview;

  useEffect(() => {
    const onChange = () => setFullscreen(Boolean(document.fullscreenElement));

    document.addEventListener('fullscreenchange', onChange);

    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  useEffect(() => {
    if (!ready) return;

    let idle = setTimeout(() => setAwake(false), IDLE_MS);

    const wake = () => {
      setAwake(true);
      clearTimeout(idle);
      idle = setTimeout(() => setAwake(false), IDLE_MS);
    };

    window.addEventListener('pointermove', wake);
    window.addEventListener('pointerdown', wake);

    return () => {
      clearTimeout(idle);
      window.removeEventListener('pointermove', wake);
      window.removeEventListener('pointerdown', wake);
    };
  }, [ready]);

  const toggle = useCallback(
    (which: Toggle, on: boolean) => {
      (which === 'mirror' ? setMirror : setFlip)(on);
      writeToggle(kind, which, on);
    },
    [kind],
  );

  // One transform for both axes: flipping each way in turn is the same screen
  // turned upside down, and a projector bounced off a mirror rig needs exactly
  // that as often as it needs either on its own.
  const transform = ready ? `${mirror ? 'scaleX(-1) ' : ''}${flip ? 'scaleY(-1)' : ''}`.trim() : '';

  return (
    <>
      {/* The flip is the whole output, controls excepted: those are the
          operator's, and a mirrored button is one nobody can read. */}
      <div className="h-dvh w-full" style={transform ? { transform } : undefined}>
        {children}
      </div>

      {ready ? (
        <div
          className="fixed right-4 bottom-4 z-50 flex items-center gap-2 transition-opacity duration-200"
          style={{ opacity: awake ? 1 : 0, pointerEvents: awake ? undefined : 'none' }}
        >
          <button
            type="button"
            title="Flip horizontally"
            aria-label="Flip horizontally"
            aria-pressed={mirror}
            onClick={() => toggle('mirror', !mirror)}
            className={`${CHROME_BUTTON} ${mirror ? CHROME_BUTTON_ON : ''}`}
          >
            <FlipHorizontal2 className="size-5" />
          </button>

          <button
            type="button"
            title="Flip vertically"
            aria-label="Flip vertically"
            aria-pressed={flip}
            onClick={() => toggle('flip', !flip)}
            className={`${CHROME_BUTTON} ${flip ? CHROME_BUTTON_ON : ''}`}
          >
            <FlipVertical2 className="size-5" />
          </button>

          <button
            type="button"
            title={fullscreen ? 'Leave fullscreen' : 'Fullscreen'}
            aria-label={fullscreen ? 'Leave fullscreen' : 'Fullscreen'}
            onClick={() =>
              void (fullscreen ? document.exitFullscreen() : document.documentElement.requestFullscreen()).catch(
                () => {},
              )
            }
            className={CHROME_BUTTON}
          >
            {fullscreen ? <Minimize2 className="size-5" /> : <Maximize2 className="size-5" />}
          </button>
        </div>
      ) : null}
    </>
  );
};
