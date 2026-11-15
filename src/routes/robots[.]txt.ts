import { createFileRoute } from '@tanstack/react-router'
import { site } from '~/shared/config/site'

// A route rather than a file in public/, so the sitemap line follows VITE_SITE_URL.
export const Route = createFileRoute('/robots.txt')({
  server: {
    handlers: {
      GET: () =>
        new Response(`User-agent: *\nAllow: /\n\nSitemap: ${site.url}/sitemap.xml\n`, {
          headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
        }),
    },
  },
})
