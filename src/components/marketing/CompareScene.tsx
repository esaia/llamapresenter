import Image from 'next/image';

import { Wordmark } from '@/components/brand/Wordmark';

/**
 * The two of us, on a table.
 *
 * The banner every comparison page has: our console lit up in a browser on one
 * machine, and on the other the thing this page is about — an application
 * somebody installed, licensed and has to keep updating.
 *
 * The second screen is drawn rather than screenshotted, and it is deliberately
 * nobody's product. We do not have {ProPresenter}'s interface to show and would
 * not put words in its mouth if we did; what the drawing shows is the part that
 * is true of every desktop presenter and is the whole argument of the page —
 * the machine is the licence. The name goes in the caption, where it can be
 * read as the comparison it is.
 *
 * Both laptops are drawn in CSS. A picture of a laptop would be one more
 * screenshot to re-cut every time the console moves, and this one is sharp on
 * a projector.
 */
export const CompareScene = () => (
  <div className="relative overflow-hidden rounded-studio-lg">
    {/* The ground: our yellow, warmed and thinned into the paper, so two dark
        screens sit on it without a border to hold them. Built from the site
        tokens rather than colours of its own. */}
    <div
      aria-hidden
      className="absolute inset-0"
      style={{
        background: [
          'radial-gradient(90% 120% at 15% -10%, color-mix(in oklab, var(--color-site-accent) 78%,'
            + ' var(--color-site-bg)) 0%, transparent 62%)',
          'radial-gradient(80% 110% at 100% 110%, color-mix(in oklab, var(--color-site-band) 60%,'
            + ' var(--color-site-ink)) 0%, transparent 58%)',
          'linear-gradient(135deg, color-mix(in oklab, var(--color-site-accent) 45%, var(--color-site-bg)) 0%,'
            + ' color-mix(in oklab, var(--color-site-band) 85%, var(--color-site-accent)) 100%)',
        ].join(', '),
      }}
    />

    <div className="relative grid items-end gap-10 px-6 py-12 sm:px-10 sm:py-16 lg:grid-cols-[1.08fr_0.92fr] lg:gap-8">
      <figure>
        <figcaption className="mb-5 flex flex-col gap-1.5">
          <Wordmark on="light" className="text-[19px] sm:text-[22px]" />
          <span className="text-[13px] text-site-muted">A browser tab. Nothing installed.</span>
        </figcaption>

        <Laptop>
          <Image
            src="/images/console-studio.webp"
            alt="The LlamaPresenter console in a browser: the language panel, the passage broken into verse cards, and
              the live projector preview beside the outputs"
            fill
            sizes="(min-width: 1024px) 44rem, 100vw"
            className="object-cover"
            priority
          />
        </Laptop>
      </figure>

      {/* Set back a little, the way the second machine in the booth is. */}
      <figure className="lg:pb-6">
        <figcaption className="mb-5 flex flex-col gap-1.5">
          <span className="inline-flex items-center gap-2 text-[19px] font-semibold tracking-tight text-site-ink sm:text-[22px]">
            <AppIcon />A desktop presenter
          </span>
          <span className="text-[13px] text-site-muted">Installed, licensed and updated on that machine.</span>
        </figcaption>

        <Laptop>
          <DesktopAppScreen />
        </Laptop>
      </figure>
    </div>
  </div>
);

/**
 * The shell: a lid with a bezel, and a deck the lid stands on.
 *
 * The screen keeps the console screenshot's own shape so nothing is cropped,
 * and the deck is drawn a little wider than the lid — which is the whole of
 * what makes a rectangle read as a laptop.
 */
const Laptop = ({ children }: { children: React.ReactNode }) => (
  <div className="drop-shadow-[0_24px_40px_rgb(25_24_24/0.28)]">
    <div className="mx-auto w-[96%] rounded-t-[14px] bg-studio-bar p-[6px] pb-0 ring-1 ring-studio-border/60">
      <div className="relative aspect-[900/481] overflow-hidden rounded-[6px] bg-studio-slide">{children}</div>
    </div>

    <div className="h-[10px] rounded-b-[12px] bg-gradient-to-b from-studio-bar to-studio-panel" />
    <div className="mx-auto h-[5px] w-[16%] rounded-b-[6px] bg-studio-panel/90" />
  </div>
);

/** The generic app's icon, so the caption beside it reads as a piece of software. */
const AppIcon = () => (
  <span className="grid size-6 shrink-0 place-items-center rounded-[6px] bg-studio-bar">
    <span className="size-2.5 rounded-[2px] bg-studio-faint" />
  </span>
);

/* Drawn at 1x and scaled by the lid, so every rule and gap here is in the
   screen's own terms rather than the page's. */
const ROW = 'rounded-[2px] bg-studio-border/70';

/**
 * A desktop application, asking the two things a web page never asks: which
 * computer it is allowed to run on, and whether you have a minute to update.
 *
 * Nobody's product. The window furniture is the generic kind — a title bar,
 * a menu strip, a library down one side, a grid of slides — and the two panels
 * over it are what the page is arguing about.
 */
const DesktopAppScreen = () => (
  <div className="absolute inset-0 flex flex-col bg-studio-bg text-studio-faint">
    {/* title bar */}
    <div className="flex items-center gap-1.5 border-b border-studio-border/60 bg-studio-bar px-2 py-1.5">
      <span className="size-[5px] rounded-full bg-studio-faint/60" />
      <span className="size-[5px] rounded-full bg-studio-faint/40" />
      <span className="size-[5px] rounded-full bg-studio-faint/25" />
      <span className="ml-2 text-[7px] tracking-wide">Presenter — Sunday Morning</span>
      <span className="ml-auto flex gap-3 text-[7px]">
        <span>File</span>
        <span>Screens</span>
        <span>Library</span>
        <span>Help</span>
      </span>
    </div>

    <div className="flex min-h-0 flex-1">
      {/* the library down the side */}
      <div className="hidden w-[22%] shrink-0 flex-col gap-[5px] border-r border-studio-border/60 bg-studio-panel/60 p-2 sm:flex">
        <span className="text-[6px] tracking-[0.12em] uppercase">Library</span>
        {[70, 55, 82, 48, 64, 40].map((width, index) => (
          <span key={index} className={`h-[5px] ${ROW}`} style={{ width: `${width}%` }} />
        ))}
      </div>

      {/* the slides, and the two things the app wants from you */}
      <div className="relative min-w-0 flex-1 p-2">
        <div className="grid grid-cols-4 gap-[5px] opacity-40">
          {Array.from({ length: 8 }).map((_, index) => (
            <span key={index} className="aspect-16/9 rounded-[3px] bg-studio-panel ring-1 ring-studio-border/60" />
          ))}
        </div>

        {/* the licence, which is the point of the drawing */}
        <div
          className="absolute inset-x-[8%] top-[18%] rounded-[6px] border border-studio-border bg-studio-panel p-3
            shadow-[0_10px_24px_rgb(0_0_0/0.35)]"
        >
          <p className="text-[9px] font-medium text-studio-text">Activate this computer</p>
          <p className="mt-1 text-[7px] leading-relaxed">
            This licence is in use on another machine. Deactivate it there, or add a seat.
          </p>

          <div className="mt-2 flex items-center gap-2">
            <span className="h-[13px] flex-1 rounded-[3px] border border-studio-border bg-studio-bg" />
            <span className="rounded-[3px] bg-studio-accent px-2 py-[3px] text-[7px] font-medium text-studio-onaccent">
              Activate
            </span>
          </div>
        </div>

        {/* and the update, which is the other one */}
        <div
          className="absolute inset-x-2 bottom-2 flex items-center gap-2 rounded-[5px] border border-studio-border
            bg-studio-bar px-2 py-[6px]"
        >
          <span className="size-[6px] shrink-0 rounded-full bg-studio-accent" />
          <span className="truncate text-[7px]">Version 7.14 is available — 1.4 GB. Install before Sunday.</span>
          <span className="ml-auto shrink-0 rounded-[3px] border border-studio-border px-1.5 py-[2px] text-[7px]">
            Later
          </span>
        </div>
      </div>
    </div>
  </div>
);
