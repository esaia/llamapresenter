'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  Captions,
  Check,
  Copy,
  ExternalLink,
  Menu,
  Mic2,
  Monitor,
  MonitorPlay,
  Music,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  ShieldCheck,
} from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Wordmark } from '@/components/brand/Wordmark';
import { cn } from '@/lib/cn';
import { useStudio, type Tab } from '@/lib/studio/StudioProvider';

/**
 * `beta` marks a tab that works but is not finished.
 *
 * It is a promise to the operator rather than a decoration: what is behind it
 * can still move between now and the version that drops the flag, so a church
 * can decide for itself whether to lean on it this Sunday. Take the flag off
 * the day the tab stops changing.
 */
const TABS: { id: Tab; label: string; Icon: typeof BookOpen; beta?: boolean }[] = [
  { id: 'bible', label: 'Bible', Icon: BookOpen },
  { id: 'lyrics', label: 'Lyrics', Icon: Mic2 },
  { id: 'audio', label: 'Audio', Icon: Music },
  { id: 'lower3rd', label: 'Lower3rd', Icon: Captions, beta: true },
  { id: 'stage', label: 'Stage', Icon: MonitorPlay },
];

/** One output an operator carries to another machine, with a one-click copy. */
const OutputRow = ({
  label,
  hint,
  href,
  connected,
  disabled,
}: {
  label: string;
  hint: string;
  href: string;
  connected: number;
  /** A guest room: the link exists but signing up is what makes it usable. */
  disabled?: boolean;
}) => {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(new URL(href, window.location.origin).toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const actionClass =
    'inline-flex size-7 shrink-0 items-center justify-center rounded-studio transition-colors duration-150 ' +
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-studio-accent/40';

  return (
    <div className="flex items-center gap-2 rounded-studio px-2 py-2 transition-colors duration-150 hover:bg-studio-surface">
      <span
        className={cn('size-1.5 shrink-0 rounded-full', connected ? 'bg-studio-go' : 'bg-studio-border')}
        aria-hidden
      />

      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-studio-text">{label}</span>
        <span className="block truncate text-xs text-studio-faint">
          {disabled ? 'Sign up to get this link' : connected ? `${connected} connected` : hint}
        </span>
      </span>

      <button
        type="button"
        onClick={disabled ? undefined : copy}
        disabled={disabled}
        title={disabled ? 'Sign up to get your output link' : `Copy the ${label} link`}
        aria-label={`Copy the ${label} link`}
        className={cn(
          actionClass,
          disabled
            ? 'cursor-not-allowed text-studio-border'
            : 'text-studio-faint hover:bg-studio-lift hover:text-studio-text',
        )}
      >
        {copied ? <Check className="size-3.5 text-studio-go" /> : <Copy className="size-3.5" />}
      </button>

      {disabled ? (
        <span
          title="Sign up to get your output link"
          aria-disabled="true"
          className={cn(actionClass, 'cursor-not-allowed text-studio-border')}
        >
          <ExternalLink className="size-3.5" />
        </span>
      ) : (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          title={`Open ${label} in a new tab`}
          aria-label={`Open ${label} in a new tab`}
          className={cn(actionClass, 'text-studio-faint hover:bg-studio-lift hover:text-studio-text')}
        >
          <ExternalLink className="size-3.5" />
        </a>
      )}
    </div>
  );
};

/** The three outputs behind one button, so the bar keeps its room. */
const PresentMenu = () => {
  const { session, peers, isGuest } = useStudio();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const total = peers.show + peers.lower3rd + peers.stage;

  useEffect(() => {
    if (!open) return;

    const handleMouseDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <Button
        icon={<MonitorPlay className="size-3.5" />}
        onClick={() => setOpen(value => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        title="Present — screen, stream and stage links"
        className={cn(open && 'bg-studio-surface')}
      >
        Present
        <span
          className={cn('size-1.5 shrink-0 rounded-full', total ? 'bg-studio-go' : 'bg-studio-border')}
          title={total ? `${total} connected` : 'Nothing connected'}
        />
      </Button>

      {open ? (
        <div
          role="menu"
          aria-label="Present"
          className="absolute right-0 z-40 mt-1.5 w-72 rounded-studio border border-studio-border bg-studio-bg p-1.5
            shadow-studio"
        >
          <p className="px-2 pb-1 pt-1.5 text-[11px] font-medium uppercase tracking-wide text-studio-faint">
            Present to
          </p>

          {isGuest ? (
            <p className="px-2 pb-2 text-xs text-studio-faint">Sign up to get shareable output links.</p>
          ) : null}

          <OutputRow
            label="Screen"
            hint="The projector in the room"
            href={`/show/${session.outputKey}`}
            connected={peers.show}
            disabled={isGuest}
          />
          <OutputRow
            label="Stream"
            hint="Lower third for the broadcast"
            href={`/lower3rd/${session.outputKey}`}
            connected={peers.lower3rd}
            disabled={isGuest}
          />
          <OutputRow
            label="Stage"
            hint="The monitor facing the platform"
            href={`/stage/${session.outputKey}`}
            connected={peers.stage}
            disabled={isGuest}
          />
        </div>
      ) : null}
    </div>
  );
};

export const AppBar = ({
  onSettings,
  onOpenNav,
  sidebarCollapsed,
  onToggleSidebar,
}: {
  onSettings: () => void;
  onOpenNav: () => void;
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}) => {
  const { tab, setTab, timer, isAdmin } = useStudio();
  const router = useRouter();

  return (
    <header
      className="flex shrink-0 flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b border-studio-border
        bg-studio-bg px-3 py-2 sm:px-4 lg:h-12 lg:flex-nowrap lg:gap-4 lg:py-0"
    >
      <div className="flex min-w-0 items-center gap-2">
        <button
          type="button"
          onClick={onOpenNav}
          aria-label="Open setup"
          title="Setup — languages, projector, stream"
          className="-ml-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-studio text-studio-muted
            transition-colors duration-150 hover:bg-studio-surface hover:text-studio-text focus:outline-none
            focus-visible:ring-2 focus-visible:ring-studio-accent/40 lg:hidden"
        >
          <Menu className="size-4" />
        </button>

        {/* The mobile button above opens setup as a drawer; on a wide enough
            window it already sits in view, so this only ever shrinks it to
            icons or widens it back out. */}
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label={sidebarCollapsed ? 'Expand setup' : 'Collapse setup'}
          title={sidebarCollapsed ? 'Expand setup — languages, projector, stream' : 'Collapse setup to icons'}
          className="-ml-1 hidden h-8 w-8 shrink-0 items-center justify-center rounded-studio text-studio-muted
            transition-colors duration-150 hover:bg-studio-surface hover:text-studio-text focus:outline-none
            focus-visible:ring-2 focus-visible:ring-studio-accent/40 lg:inline-flex"
        >
          {sidebarCollapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
        </button>

        {/* Home for the console is the console. An operator mid-service who
            clicks the logo out of habit must not land on the marketing page
            with the running order behind them. */}
        <Link
          href="/studio"
          aria-label="LlamaPresenter — the console"
          className="rounded-studio focus:outline-none focus-visible:ring-2 focus-visible:ring-studio-accent/40"
        >
          <Wordmark className="truncate text-base" />
        </Link>
      </div>

      {/* Five tabs and two buttons do not share a row until the window is wide.
          Below that the tabs take a line of their own and split it evenly,
          which is the only way "Lower3rd" stays on screen on a phone. */}
      <nav
        aria-label="Workspace"
        className="order-last flex w-full items-center gap-0.5 rounded-studio border border-studio-border
          bg-studio-surface p-0.5 lg:order-none lg:w-auto"
      >
        {TABS.map(({ id, label, Icon, beta }) => {
          // A run started on the Stage tab keeps going while the operator is
          // off in Bible or Lyrics, and nothing else in the bar says so. The
          // tab that owns the timer wears the run.
          const running = id === 'stage' && timer.running;

          // Read out as part of the tab's own name rather than hidden from it:
          // "Lower3rd, beta" and "Stage, timer running" are what a screen
          // reader should say, because they are what the sighted operator is
          // being told by the badge and the dot.
          const name = [label, beta ? 'beta' : null, running ? 'timer running' : null].filter(Boolean).join(', ');

          return (
            <button
              key={id}
              type="button"
              aria-current={tab === id ? 'page' : undefined}
              aria-label={name}
              title={name}
              onClick={() => setTab(id)}
              className={cn(
                'inline-flex h-7 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-[4px] px-2 text-xs',
                'font-medium transition-colors duration-150 focus:outline-none',
                'focus-visible:ring-2 focus-visible:ring-studio-accent/40 sm:flex-none sm:justify-start sm:pl-3',
                beta ? 'sm:pr-2' : 'sm:pr-3',
                tab === id
                  ? 'bg-studio-lift text-studio-text shadow-studio'
                  : running
                    ? 'text-studio-text'
                    : 'text-studio-muted hover:text-studio-text',
              )}
            >
              <span className="relative flex shrink-0 items-center">
                <Icon className="size-3.5" />

                {/* The same beat as the on-screen badge, so a running timer
                    and a live slide read as one language. */}
                {running ? (
                  <span
                    aria-hidden
                    className="absolute -right-1 -top-1 size-1.5 animate-pulse rounded-full bg-studio-live
                      ring-2 ring-studio-surface"
                  />
                ) : null}
              </span>

              <span className="hidden truncate sm:inline">{label}</span>

              {/* On a phone the label is gone and the badge with it: the tab is
                  an icon, and one dot beside it is already the run. */}
              {beta ? (
                <span
                  aria-hidden
                  className={cn(
                    'hidden rounded-[3px] px-1 py-px text-[9px] font-semibold uppercase leading-[1.4]',
                    'tracking-[0.08em] sm:inline',
                    tab === id ? 'bg-studio-accent/12 text-studio-accent' : 'bg-studio-border/70 text-studio-faint',
                  )}
                >
                  Beta
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
        <PresentMenu />

        {isAdmin ? (
          <Button
            icon={<ShieldCheck className="size-3.5" />}
            onClick={() => router.push('/admin')}
            title="Admin — every signed-up operator and their plan"
          >
            <span className="hidden md:inline">Admin</span>
          </Button>
        ) : null}

        <Button icon={<Settings className="size-3.5" />} onClick={onSettings} title="Settings — background, type, stream">
          <span className="hidden md:inline">Settings</span>
        </Button>
      </div>
    </header>
  );
};

/** What the room is seeing, for the foot of the preview rail. */
export const LiveBadge = () => {
  const { live, peers } = useStudio();

  return (
    <span className="flex items-center gap-2 text-xs text-studio-muted">
      {live ? (
        <>
          <span className="size-1.5 shrink-0 animate-pulse rounded-full bg-studio-live" />
          On screen
        </>
      ) : (
        <>
          <Monitor className="size-3.5 text-studio-faint" />
          Screen is clear
        </>
      )}

      {peers.show ? (
        <span className="text-studio-faint">
          · {peers.show} output{peers.show > 1 ? 's' : ''}
        </span>
      ) : null}
    </span>
  );
};
