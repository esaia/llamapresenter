import type { Metadata } from 'next';

import { previewModeScript } from '@/lib/studio/previewMode';
import { railWidthScript } from '@/lib/studio/railWidth';
import { sidebarWidthScript } from '@/lib/studio/sidebarCollapse';

import './globals.css';

const DESCRIPTION =
  'Put scripture on the screen — in any language, up to three at once, on any machine in the room.';

export const metadata: Metadata = {
  // The card in app/opengraph-image.tsx is unfurled by other people's servers,
  // so its URL has to be absolute. Vercel hands us the deployment host; the
  // production domain is the fallback for anywhere else.
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ??
      (process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
        : 'https://llamapresenter.com'),
  ),
  title: { default: 'LlamaPresenter', template: '%s · LlamaPresenter' },
  description: DESCRIPTION,
  openGraph: {
    type: 'website',
    siteName: 'LlamaPresenter',
    title: 'LlamaPresenter',
    description: DESCRIPTION,
  },
  twitter: { card: 'summary_large_image', title: 'LlamaPresenter', description: DESCRIPTION },
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  // Browser extensions stamp their own attributes onto <html> and <body> before
  // React hydrates (password managers, translators, the WebCRX bridge), which
  // React reports as a mismatch it will not patch up. Suppressing it here is
  // the documented remedy: it covers these two elements only, one level deep,
  // so a real mismatch anywhere inside the app is still reported.
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full" suppressHydrationWarning>
        {/* Parsed before anything below it, so the console's output rail is its
            saved width in the very first frame instead of snapping wider once
            React has hydrated. It has to live here rather than on the console
            page: a page's own markup can arrive inside a streaming boundary,
            and a script React swaps in from a template never runs. */}
        <script dangerouslySetInnerHTML={{ __html: railWidthScript }} />

        {/* And the tab the preview panel was left on, for the same reason: the
            server has no way to know it, so it is stamped on <html> here and
            the panes are shown from CSS. */}
        <script dangerouslySetInnerHTML={{ __html: previewModeScript }} />

        {/* And whether the left rail opens collapsed to icons — only the width,
            not the icons themselves, but the width is what moves everything
            else on the page. See `sidebarCollapse.ts`. */}
        <script dangerouslySetInnerHTML={{ __html: sidebarWidthScript }} />

        {children}
      </body>
    </html>
  );
}
