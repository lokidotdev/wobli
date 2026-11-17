import { illustrationPath } from '~/features/illustrations'
import type { Illustration } from '~/features/illustrations'
import { site } from '~/shared/config/site'
import { absolute } from './meta'

export const websiteJsonLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: site.name,
  url: site.url,
  description: site.description,
  potentialAction: {
    '@type': 'SearchAction',
    target: `${site.url}/illustrations?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
})

const image = (item: Illustration) => ({
  '@type': 'ImageObject',
  name: item.title,
  description: item.description,
  contentUrl: absolute(item.poster),
  url: absolute(illustrationPath(item.slug)),
  keywords: item.tags.join(', '),
  license: absolute('/docs#licence'),
})

/** How many entries a collection page lists in its structured data; numberOfItems carries the full count. */
const LISTED = 24

export const collectionJsonLd = (name: string, path: string, items: Illustration[], total = items.length) => ({
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name,
  url: absolute(path),
  mainEntity: {
    '@type': 'ItemList',
    numberOfItems: total,
    itemListElement: items.slice(0, LISTED).map((item, i) => ({ '@type': 'ListItem', position: i + 1, item: image(item) })),
  },
})

export const illustrationJsonLd = (item: Illustration) => ({ '@context': 'https://schema.org', ...image(item) })
