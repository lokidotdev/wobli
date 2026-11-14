import { queryOptions } from '@tanstack/react-query'
import type { QueryClient } from '@tanstack/react-query'
import { siteSettingsSchema } from 'wobli-api/contracts'
import type { SiteSettings } from 'wobli-api/contracts'
import { apiGet, isUnreachable } from '~/shared/lib/api'

// Site-wide settings the admin panel edits: the starting look (palette, stroke, depth, recoloured palettes) and page SEO.
// Without an API (a fresh clone running only the site) everything falls back to the built-in defaults.

export type { SiteSettings }

const DEFAULTS = siteSettingsSchema.parse({})

async function getSettings(): Promise<SiteSettings> {
  try {
    return await apiGet('/v1/settings', siteSettingsSchema)
  } catch (e) {
    if (isUnreachable(e)) return DEFAULTS
    throw e
  }
}

export const settingsQuery = () => queryOptions({ queryKey: ['settings'], queryFn: getSettings, staleTime: 5 * 60_000 })

/** The admin's title and description for one of the site's pages, each falling back to the page's own copy when empty. */
export async function pageSeo(queryClient: QueryClient, page: keyof SiteSettings['seo'], fallback: { title: string; description: string }) {
  const seo = (await queryClient.ensureQueryData(settingsQuery())).seo[page]
  return { title: seo.title || fallback.title, description: seo.description || fallback.description }
}
