import { site } from '~/shared/config/site'

type MetaInput = {
  title: string
  description?: string
  path: string // canonical path, e.g. "/illustrations"
  image?: string
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>
}

const absolute = (path: string) => new URL(path, site.url).toString()

/** Everything a route's head() needs: title, description, canonical, Open Graph, Twitter, JSON-LD. */
export function buildMeta({ title, description = site.description, path, image = site.ogImage, jsonLd }: MetaInput) {
  const url = absolute(path)
  const img = absolute(image)
  return {
    meta: [
      { title },
      { name: 'description', content: description },
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: site.name },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:url', content: url },
      { property: 'og:image', content: img },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:site', content: site.twitter },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: img },
    ],
    links: [{ rel: 'canonical', href: url }],
    scripts: jsonLd ? [{ type: 'application/ld+json', children: JSON.stringify(jsonLd) }] : [],
  }
}

export { absolute }
