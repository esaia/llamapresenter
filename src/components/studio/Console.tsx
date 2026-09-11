'use client';

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { X } from 'lucide-react';

import { useCustomFonts } from '@/components/projector/useCustomFonts';
import { IconButton } from '@/components/ui/IconButton';
import {
  readSidebarCollapsed,
  SIDEBAR_FULL_WIDTH,
  SIDEBAR_WIDTH_VAR,
  writeSidebarCollapsed,
} from '@/lib/studio/sidebarCollapse';
import { useStudio } from '@/lib/studio/StudioProvider';
import { toggleRun } from '@/lib/timer/model';
import type { SongSlide } from '@/lib/types';

import { AppBar } from './AppBar';
import { AudioBar } from './AudioBar';
import { MediaPane } from './MediaPane';
import { AudioPanel } from './AudioPanel';
import { Lower3rdPanel } from './Lower3rdPanel';
import { LyricsPanel } from './LyricsPanel';
import { SongSearch } from './SongSearch';
import { PassageBlock } from './PassageBlock';
import { modalOpen } from './modal';
import { useSortable } from './sortable';
import { RightRail } from './RightRail';
import { SearchBar } from './SearchBar';
import { SettingsModal } from './SettingsModal';
import { Sidebar } from './Sidebar';
import { TimerPanel } from './TimerPanel';

/**
 * Let go of the card the operator last clicked.
 *
 * A click leaves the card focused without a ring — but the moment the operator
 * reaches for the arrows, the browser decides the focus is worth showing and
 * paints `:focus-visible` on it. So the card they stepped away from wears an
 * accent ring while the live one is red, which reads as two slides claiming the
 * screen. Arrows mean the hands have left the mouse; the ring has nothing left
 * to say.
 */
const dropCardFocus = () => {
  const focused = document.activeElement;

  if (focused instanceof HTMLElement && focused.matches('[data-slide-card]')) focused.blur();
};

/**
 * Backs the sidebar's collapsed flag with `useSyncExternalStore`, unknown
 * (`null`) on the server and on the very first client render rather than
 * guessed at `false`.
 *
 * The server cannot read `localStorage`, so any guess is sometimes wrong —
 * but a *wrong* one used to mean rendering the full shape's rows into a rail
 * that a blocking script in `layout.tsx` had already narrowed to the mini
 * width, which reads as broken rather than as a frame that is merely late.
 * `null` renders nothing in the aside until the real value is known, which is
 * a blank rail for a frame instead of a squeezed one, and — because both the
 * server and this first render agree on `null` — never a hydration mismatch.
 */
const sidebarListeners = new Set<() => void>();
let sidebarSnapshot: boolean | null = null;

const sidebarStore = {
  subscribe: (listener: () => void) => {
    sidebarListeners.add(listener);
    return () => {
      sidebarListeners.delete(listener);
    };
  },
  get: (): boolean => (sidebarSnapshot ??= readSidebarCollapsed()),
  getServer: (): boolean | null => null,
  set: (collapsed: boolean) => {
    sidebarSnapshot = collapsed;
    writeSidebarCollapsed(collapsed);
    sidebarListeners.forEach(listener => listener());
  },
};

/**
 * The console shell.
 *
 * Setup on the left, passages in the middle, what the room is seeing on the
 * right. The arrow keys step through slides from anywhere on the page, because
 * during a service the operator's hand is not on the mouse.
 */
export const Console = () => {
  const {
    blocks,
    stepLive,
    tab,
    loading,
    updateTimer,
    orderBlocks,
    settings,
    live,
    songs,
    removeSlide,
    removeSlides,
    pasteSlides,
    selectedSlides,
    setSelectedSlides,
    limitNotice,
    dismissLimit,
    room,
    noteLimit,
  } = useStudio();


  // The console draws its own copies of the slide — the preview panel, every
  // card, the specimens in the settings dialog — so the operator's own faces
  // have to be in this document too. The whole library and not just what is
  // live, because a face is being looked at here before it is chosen.
  useCustomFonts(settings.customFonts);

  // The running order of passages. Every block folds while one is in the air —
  // see `PassageBlock` — so the whole order fits on screen as it is rearranged.
  const sortable = useSortable(blocks, block => block.id, orderBlocks);
  const [settingsTab, setSettingsTab] = useState<string | null>(null);
  const [navOpen, setNavOpen] = useState(false);
  const sidebarCollapsed = useSyncExternalStore(sidebarStore.subscribe, sidebarStore.get, sidebarStore.getServer);

  // Keeps the width in step with the resolved value even when the blocking
  // script could not run at all (a CSP, an extension) — a write, not a
  // `setState`, so it stays the recommended shape for synchronizing with an
  // external system from an effect.
  useEffect(() => {
    if (sidebarCollapsed !== null) writeSidebarCollapsed(sidebarCollapsed);
  }, [sidebarCollapsed]);

  const [searching, setSearching] = useState(false);
  const [browsing, setBrowsing] = useState(false);

  // Copied words, held here until a paste asks for them — every selected
  // card's words when there is a selection, the live card's alone otherwise.
  const clipboardRef = useRef<Omit<SongSlide, 'id'>[] | null>(null);

  /**
   * Open the passage browser, or say why not.
   *
   * The ceiling is met here rather than at the end of the browser, because
   * everything in between is wasted: an operator picks a book, picks a chapter,
   * picks a range, waits for it, and only then hears there was never room. Both
   * ways in come through this — the button on the bar and the find shortcut.
   */
  const browse = useCallback(
    (open: boolean) => {
      if (open && !room('passages')) {
        noteLimit('passages');
        return;
      }

      setBrowsing(open);
    },
    [noteLimit, room],
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;

      const typing = Boolean(
        target && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)),
      );

      // Escape puts the finder away wherever the operator's hands are. Each
      // panel takes Escape itself, but only while the caret is still in its
      // box — after a click into the results the key had nowhere to land.
      if (event.key === 'Escape' && (searching || browsing)) {
        event.preventDefault();
        setSearching(false);
        setBrowsing(false);
        return;
      }

      // Escape also lets go of a marquee selection — a quieter way out than
      // clicking the grid's empty background.
      if (event.key === 'Escape' && tab === 'lyrics' && selectedSlides.size > 0) {
        event.preventDefault();
        setSelectedSlides(new Set());
        return;
      }

      // Nothing below here belongs to a dialog. These shortcuts are global
      // because an operator's hands are never in one place — but a dialog is
      // the one time that is wrong: ⌘F over the template editor opened the
      // song finder across it, and an arrow meant for a slider went to the
      // projector. Below the Escape above, so a finder can always be put away.
      if (modalOpen()) return;

      // Find, meaning "find me something to put up" — which is a different
      // thing on each tab: the songs on the lyrics tab, and the books on the
      // Bible tab, where the operator wants the whole list and not the box
      // they are already typing in.
      if (event.key === 'f' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();

        if (tab === 'bible') browse(true);
        else setSearching(true);

        return;
      }

      // Stepping slides must not fight with typing a reference or a lyric.
      if (typing) return;

      // Delete takes whatever the grid has picked out — a marquee's worth of
      // cards when there is one, and otherwise the slide the operator is
      // looking at, which is the one on the projector: selecting a card and
      // putting it up are the same gesture there, so there is no quieter
      // selection to delete instead. Backspace as well as Delete — the key a
      // Mac keyboard actually has is ⌫.
      //
      // Songs only. On the Bible tab a card's × trims the passage rather than
      // dropping one verse, and a key that means two different things on two
      // tabs is a key nobody trusts.
      if ((event.key === 'Delete' || event.key === 'Backspace') && tab === 'lyrics') {
        if (selectedSlides.size > 0) {
          event.preventDefault();

          for (const song of songs) {
            const ids = song.slides.filter(slide => selectedSlides.has(slide.id)).map(slide => slide.id);

            if (ids.length > 0) void removeSlides(song, ids);
          }

          setSelectedSlides(new Set());
          return;
        }

        if (live?.kind !== 'lyrics') return;

        const song = songs.find(item => item.id === live.songId);
        const slide = song?.slides[live.slideIndex];

        if (!song || !slide) return;

        event.preventDefault();
        void removeSlide(song, slide.id);
        return;
      }

      // ⌘/Ctrl+C takes the words of every card picked out — the selection
      // when there is one, otherwise the live card, the same fallback Delete
      // uses above — and holds them until a paste asks.
      if (event.key.toLowerCase() === 'c' && (event.metaKey || event.ctrlKey) && tab === 'lyrics') {
        const clips: Omit<SongSlide, 'id'>[] = [];

        if (selectedSlides.size > 0) {
          for (const song of songs) {
            for (const slide of song.slides) {
              if (selectedSlides.has(slide.id)) clips.push({ text: slide.text, group: slide.group, alt: slide.alt });
            }
          }
        } else if (live?.kind === 'lyrics') {
          const slide = songs.find(item => item.id === live.songId)?.slides[live.slideIndex];

          if (slide) clips.push({ text: slide.text, group: slide.group, alt: slide.alt });
        }

        if (clips.length === 0) return;

        event.preventDefault();
        clipboardRef.current = clips;
        return;
      }

      // ⌘/Ctrl+V drops copies of those words right after whatever is picked
      // out — the selection when there is one, otherwise the live slide, the
      // same fallback Delete and Copy use above — in the order they were
      // copied. Never sends anything to the projector, even pasted straight
      // after the live slide: pasting is filing, and filing must never move
      // what the room is looking at (see `pasteSlides` in `StudioProvider.tsx`).
      if (event.key.toLowerCase() === 'v' && (event.metaKey || event.ctrlKey) && tab === 'lyrics') {
        if (!clipboardRef.current || clipboardRef.current.length === 0) return;

        if (selectedSlides.size > 0) {
          event.preventDefault();

          for (const song of songs) {
            const picked = song.slides.filter(slide => selectedSlides.has(slide.id));
            const after = picked[picked.length - 1];

            if (after) void pasteSlides(song, after.id, clipboardRef.current);
          }

          // Used, not carried forward — a selection left over from an earlier
          // click would otherwise silently steer wherever the *next* paste
          // lands, nowhere near where it looks like it should.
          setSelectedSlides(new Set());
          return;
        }

        if (live?.kind !== 'lyrics') return;

        const song = songs.find(item => item.id === live.songId);
        const slide = song?.slides[live.slideIndex];

        if (!song || !slide) return;

        event.preventDefault();
        void pasteSlides(song, slide.id, clipboardRef.current);
        return;
      }

      // A stage timer is started and stopped with a thumb on the space bar. On
      // its own tab that wins over stepping the slide, which is what the same
      // key does everywhere else in the console.
      if (event.key === ' ' && tab === 'stage') {
        event.preventDefault();
        updateTimer(toggleRun);
        return;
      }

      if (event.key === 'ArrowRight' || event.key === 'ArrowDown' || event.key === ' ') {
        event.preventDefault();
        dropCardFocus();
        stepLive(1);
      }

      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        event.preventDefault();
        dropCardFocus();
        stepLive(-1);
      }
    };

    window.addEventListener('keydown', onKey);

    return () => window.removeEventListener('keydown', onKey);
  }, [
    browse,
    browsing,
    live,
    pasteSlides,
    removeSlide,
    removeSlides,
    searching,
    selectedSlides,
    setSelectedSlides,
    songs,
    stepLive,
    tab,
    updateTimer,
  ]);

  // A notice that has been read should not have to be dismissed. Long enough to
  // finish reading twice, and the button is still there for anyone who wants it
  // gone sooner.
  useEffect(() => {
    if (!limitNotice) return;

    const wait = window.setTimeout(dismissLimit, 9000);

    return () => window.clearTimeout(wait);
  }, [dismissLimit, limitNotice]);

  return (
    <div className="flex h-dvh flex-col bg-studio-bg">
      <AppBar onSettings={() => setSettingsTab('projector')} onOpenNav={() => setNavOpen(true)} />

      {/* Sits on the seam under the app bar, so it is in the operator's eyeline
          wherever they are working — the wait is usually a language change made
          on the far left while looking at the cards on the right. */}
      <div aria-hidden className="relative h-0.5 shrink-0">
        {loading ? (
          <div role="progressbar" aria-label="Loading passages" className="studio-progress absolute inset-0" />
        ) : null}
      </div>

      {/* A ceiling the operator has just walked into.
          
          Floated over everything rather than banded across the top. It was a
          band, and a band was wrong twice: it pushed the whole console down for
          a sentence, and the refusal it was reporting usually happened inside a
          dialog — so the answer appeared behind the thing the operator was
          looking at. Above the modal layer (z-100), because that is where the
          question was asked. */}
      {limitNotice ? (
        // Centring and arriving are two jobs and they get two elements. Done on
        // one, they fight: Tailwind centres with the `translate` property and
        // the keyframe moved `transform`, which are composed rather than shared
        // — so the notice started a whole width to the left and slid sideways
        // into place. The outer box does the placing and never animates; the
        // inner one only fades and settles.
        <div className="pointer-events-none fixed inset-x-0 top-3 z-[110] flex justify-center px-3">
          <div
            role="status"
            className="studio-notice pointer-events-auto flex items-center gap-3 rounded-studio border
              border-studio-border bg-studio-lift px-3 py-2 shadow-studio-panel"
          >
            <span className="text-sm text-studio-text">{limitNotice}</span>

            <a
              href="/pricing"
              className="shrink-0 rounded-studio bg-studio-accent px-2.5 py-1 text-xs font-medium text-studio-onaccent"
            >
              See Pro
            </a>

            <IconButton label="Dismiss" onClick={dismissLimit}>
              <X className="size-3.5" />
            </IconButton>
          </div>
        </div>
      ) : null}

      <div className="flex min-h-0 flex-1">
        <aside
          data-studio-sidebar
          style={{ width: `var(${SIDEBAR_WIDTH_VAR}, ${SIDEBAR_FULL_WIDTH}px)` }}
          className="hidden shrink-0 overflow-hidden border-r border-studio-border lg:block"
        >
          {sidebarCollapsed !== null ? (
            <Sidebar
              onSettings={setSettingsTab}
              mini={sidebarCollapsed}
              onToggleMini={() => sidebarStore.set(!sidebarCollapsed)}
            />
          ) : null}
        </aside>

        {navOpen ? (
          <div className="fixed inset-0 z-40 flex lg:hidden">
            <div className="flex-1 bg-black/70" onClick={() => setNavOpen(false)} />
            <div className="w-[18rem] max-w-[85vw] border-l border-studio-border bg-studio-bg shadow-studio-panel">
              <div className="flex h-12 items-center justify-between border-b border-studio-border px-3">
                <span className="text-sm font-semibold">Setup</span>
                <IconButton label="Close setup" onClick={() => setNavOpen(false)}>
                  <X className="size-4" />
                </IconButton>
              </div>
              <div className="h-[calc(100%-3rem)]">
                <Sidebar
                  onSettings={next => {
                    setNavOpen(false);
                    setSettingsTab(next);
                  }}
                />
              </div>
            </div>
          </div>
        ) : null}

        <main className="flex min-w-0 flex-1 flex-col">
          {tab === 'bible' ? (
            <>
              <div className="shrink-0 border-b border-studio-border bg-studio-bg px-4 py-3">
                <SearchBar browsing={browsing} onBrowse={browse} />
              </div>

              <div className="studio-scroll min-h-0 flex-1 overflow-y-auto">
                {blocks.length === 0 ? (
                  <div className="grid place-items-center px-6 py-32 text-center text-sm text-studio-muted">
                    <p>
                      Search a passage above — “John 3:16-18” — and it is on the screen.
                      <br />
                      Every verse of the chapter comes with it, so stepping through costs nothing.
                    </p>
                  </div>
                ) : (
                  <div {...sortable.list()}>
                    {sortable.items.map((block, index) => (
                      <PassageBlock
                        key={block.id}
                        block={block}
                        index={index}
                        isFirst={index === 0}
                        isLast={index === blocks.length - 1}
                        sortable={sortable}
                      />
                    ))}
                  </div>
                )}
              </div>

            </>
          ) : null}

          {tab === 'lyrics' ? <LyricsPanel onSearch={() => setSearching(true)} /> : null}
          {tab === 'lower3rd' ? <Lower3rdPanel /> : null}
          {tab === 'audio' ? <AudioPanel /> : null}
          {tab === 'stage' ? <TimerPanel /> : null}

          {/* Both mounted on every tab: a background is changed and a bed is
              faded during a service, not between them, and neither should cost
              the operator the passage they are looking at. */}
          <MediaPane />

          <AudioBar />
        </main>

        <RightRail onSettings={setSettingsTab} />
      </div>

      {settingsTab ? <SettingsModal tab={settingsTab} onClose={() => setSettingsTab(null)} /> : null}
      {searching ? <SongSearch onClose={() => setSearching(false)} /> : null}
    </div>
  );
};
