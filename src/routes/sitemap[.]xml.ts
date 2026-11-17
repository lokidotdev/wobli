import { createFileRoute } from '@tanstack/react-router'
import { getSitemap } from '~/features/illustrations'
import { PAGES, site } from '~/shared/config/site'

const url = (path: string, lastmod?: string) => `  <url><loc>${new URL(path, site.url)}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}<changefreq>weekly</changefreq></url>`

export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: async () => {
        const illustrations = await getSitemap()
        const urls = [...['/', ...PAGES.map((p) => p.to)].map((p) => url(p)), ...illustrations.map((i) => url(`/illustrations/${i.slug}`, i.updatedAt))].join('\n')
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
        return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } })
      },
    },
  },
})
