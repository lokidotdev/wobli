import { ApiError, apiGet, apiGetOr, isUnreachable } from '~/shared/lib/api'
import { facetsSchema, illustrationPageSchema, illustrationSchema, sitemapSchema } from '../schemas/illustration.schema'
import type { Facets, Illustration, IllustrationPage, ListFilters } from '../schemas/illustration.schema'
// The bundled catalogue is only a fallback, so it loads only when the API is unreachable: it stays out of the entry chunk.
const local = () => import('./local-catalog')

// Fetchers: the only code that knows the API's paths. Everything is parsed on arrival.
// When the API can't be reached at all (not running, as in a fresh clone), they answer from the illustrations bundled
// with the site instead, so the catalogue always shows.

/** One page of the catalogue; pass the page's nextCursor to get the one after it. */
export const getIllustrations = (filters: ListFilters = {}, cursor?: string): Promise<IllustrationPage> =>
  apiGetOr('/v1/illustrations', illustrationPageSchema, { ...filters, sort: filters.sort === 'featured' ? undefined : filters.sort, cursor }, async () =>
    (await local()).localList(filters, cursor),
  )

/** A seeded random few from the whole catalogue: the same seed always gives the same ones. */
export const getShuffled = (seed: number, limit: number): Promise<Illustration[]> =>
  apiGetOr('/v1/illustrations', illustrationPageSchema, { seed, limit }, async () => (await local()).localList({ seed, limit })).then((page) => page.items)

/** The few shown on the landing page. */
export const getFeatured = (limit: number): Promise<Illustration[]> =>
  apiGetOr('/v1/illustrations', illustrationPageSchema, { featured: '1', limit }, async () => (await local()).localList({ featured: true, limit })).then((page) => page.items)

export async function getIllustration(slug: string): Promise<Illustration | null> {
  try {
    return await apiGet(`/v1/illustrations/${encodeURIComponent(slug)}`, illustrationSchema)
  } catch (e) {
    // an unknown slug, or one no slug could ever be: both are simply "no such illustration"
    if (e instanceof ApiError && (e.status === 404 || e.status === 400)) return null
    if (isUnreachable(e)) return (await local()).localGet(slug)
    throw e
  }
}

/** The categories and tags the catalogue can be filtered by. */
export const getFacets = (): Promise<Facets> => apiGetOr('/v1/facets', facetsSchema, {}, async () => (await local()).localFacets())

export const getSitemap = () => apiGetOr('/v1/sitemap', sitemapSchema, {}, async () => (await local()).localSitemap())
