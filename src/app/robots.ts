import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://llamapresenter.com';

/**
 * The console and the outputs are not for crawlers.
 *
 * `/show`, `/stage`, `/lower3rd` and `/timer` are unguessable links rather than
 * secrets a robot could find on its own, but a church that pastes one into a
 * public page should not have it indexed on top of that.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/studio', '/upgrade', '/auth/', '/api/', '/show/', '/stage/', '/lower3rd/', '/timer/'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
