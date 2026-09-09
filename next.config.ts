import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Two use cases turned out to be congregations rather than jobs and moved
     under /solutions. They were live only briefly, but a link that was shared
     once is shared forever. */
  redirects: async () => [
    { source: '/use-cases/church-plants', destination: '/solutions/church-plants', permanent: true },
    { source: '/use-cases/volunteer-tech-teams', destination: '/solutions/volunteer-teams', permanent: true },
  ],
  images: {
    /* Next's default is 'attachment' — every optimized image on the site
       (Art, Frame, Monitor) came back Content-Disposition: attachment and
       downloaded instead of rendering. All of it is our own artwork under
       public/, never an upload, so there is nothing to defend against here. */
    contentDispositionType: 'inline',
  },
};

export default nextConfig;
