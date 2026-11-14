import { infiniteQueryOptions, queryOptions, useSuspenseInfiniteQuery, useSuspenseQuery } from '@tanstack/react-query'
import { getFacets, getFeatured, getIllustration, getIllustrations } from '../api/illustrations.api'
import type { ListFilters } from '../schemas/illustration.schema'

export const illustrationKeys = {
  all: ['illustrations'] as const,
  list: (filters: ListFilters) => [...illustrationKeys.all, 'list', filters] as const,
  featured: (limit: number) => [...illustrationKeys.all, 'featured', limit] as const,
  detail: (slug: string) => [...illustrationKeys.all, 'detail', slug] as const,
  facets: () => ['facets'] as const,
}

const FIVE_MINUTES = 5 * 60_000
/** How many the landing page shows. */
export const FEATURED_COUNT = 5

/** The catalogue under a set of filters, a page at a time. */
export const illustrationsQuery = (filters: ListFilters = {}) =>
  infiniteQueryOptions({
    queryKey: illustrationKeys.list(filters),
    queryFn: ({ pageParam }) => getIllustrations(filters, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    staleTime: FIVE_MINUTES,
  })

export const featuredQuery = (limit = FEATURED_COUNT) =>
  queryOptions({ queryKey: illustrationKeys.featured(limit), queryFn: () => getFeatured(limit), staleTime: FIVE_MINUTES })

export const illustrationQuery = (slug: string) =>
  queryOptions({ queryKey: illustrationKeys.detail(slug), queryFn: () => getIllustration(slug), staleTime: FIVE_MINUTES })

export const facetsQuery = () => queryOptions({ queryKey: illustrationKeys.facets(), queryFn: getFacets, staleTime: FIVE_MINUTES })

export const useIllustrations = (filters: ListFilters = {}) => useSuspenseInfiniteQuery(illustrationsQuery(filters))
export const useFeatured = (limit = FEATURED_COUNT) => useSuspenseQuery(featuredQuery(limit))
export const useIllustration = (slug: string) => useSuspenseQuery(illustrationQuery(slug))
export const useFacets = () => useSuspenseQuery(facetsQuery())
