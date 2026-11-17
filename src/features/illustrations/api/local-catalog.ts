import type { Icon } from 'wobli'
import { LOCAL_ICON as LOCAL } from './local-icon'
import { CATEGORIES } from '../../../vendor/wobli/catalog.ts'
import type { IconMeta } from '../../../vendor/wobli/catalog.ts'
import { searchFold, searchWords, startsAWord } from 'wobli-api/contracts'
import { localPoster } from '../lib/poster'
import { PAGE_SIZE } from '../schemas/illustration.schema'
import type { Facets, Illustration, IllustrationPage, ListFilters } from '../schemas/illustration.schema'

// The catalogue read straight from the bundled engine copy (src/vendor/wobli), for when the API isn't there (a fresh clone running only the site).
// It answers the same questions the API does, with the same rules: every filter narrows (the category, the tag, every search word
// starting a word), featured first unless sorted A–Z. Metadata is bundled (it is small); each drawing is its own chunk, loaded on demand.

const metas = import.meta.glob<IconMeta>('../../../vendor/wobli/icons/*.meta.ts', { eager: true, import: 'default' })
const drawings = import.meta.glob<Icon>(['../../../vendor/wobli/icons/*.ts', '!../../../vendor/wobli/icons/*.meta.ts'], { import: 'default' })

const slugOf = (file: string) => file.slice(file.lastIndexOf('/') + 1).replace(/(\.meta)?\.ts$/, '')
const drawingBySlug = new Map(Object.entries(drawings).map(([file, load]) => [slugOf(file), load]))

export function loadLocalIcon(url: string): Promise<Icon> {
  const slug = url.slice(LOCAL.length)
  const load = drawingBySlug.get(slug)
  return load ? load() : Promise.reject(new Error(`wobli: no local drawing for "${slug}"`))
}

const tagOf = (t: string) => t.trim().toLowerCase().replace(/[\s_]+/g, '-')

type Entry = { item: Illustration; searchText: string }
const entries: Entry[] = Object.entries(metas)
  .map(([file, meta]) => [slugOf(file), meta] as const)
  .filter(([slug]) => drawingBySlug.has(slug))
  .map(([slug, meta]) => {
    const tags = [...new Set(meta.tags.map(tagOf))]
    const category = { slug: meta.category, name: CATEGORIES[meta.category] }
    const item: Illustration = {
      slug,
      title: meta.title,
      description: meta.description,
      category,
      tags,
      featured: meta.featured ?? false,
      frames: 0, // not shown anywhere; the drawing carries its own
      poster: localPoster(slug),
      icon: LOCAL + slug,
      seo: { title: '', description: '', content: '' },
    }
    const searchTags = tags.flatMap((t) => (t.includes('-') ? [t, t.replaceAll('-', ' ')] : [t]))
    return { item, searchText: searchFold([meta.title, category.name, ...searchTags, meta.description].join(' ')) }
  })
  .sort((a, b) => a.item.slug.localeCompare(b.item.slug))

export function localList(filters: ListFilters & { featured?: boolean; limit?: number; seed?: number } = {}, cursor?: string): IllustrationPage {
  const words = searchWords(filters.q)
  const tag = filters.tag && tagOf(filters.tag)
  const found = entries
    .filter(
      ({ item, searchText }) =>
        (!filters.category || item.category.slug === filters.category) &&
        (!tag || item.tags.includes(tag)) &&
        (!filters.featured || item.featured) &&
        words.every((w) => startsAWord(searchText, w)),
    )
    .map((e) => e.item)
  const sorted =
    filters.seed !== undefined
      ? shuffle(found, filters.seed)
      : filters.sort === 'az'
      ? found.sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }) || a.slug.localeCompare(b.slug))
      : found.sort((a, b) => Number(b.featured) - Number(a.featured) || a.slug.localeCompare(b.slug))
  const offset = cursor ? Number(cursor) || 0 : 0
  const limit = filters.limit ?? PAGE_SIZE
  const items = sorted.slice(offset, offset + limit)
  return { items, nextCursor: offset + items.length < sorted.length ? String(offset + items.length) : null, total: sorted.length }
}

export const localGet = (slug: string): Illustration | null => entries.find((e) => e.item.slug === slug)?.item ?? null

export function localFacets(): Facets {
  const cats = new Map<string, Facets['categories'][number]>()
  const tagCounts = new Map<string, number>()
  for (const { item } of entries) {
    const c = cats.get(item.category.slug) ?? { ...item.category, count: 0 }
    cats.set(c.slug, { ...c, count: c.count + 1 })
    for (const t of item.tags) tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1)
  }
  return {
    categories: [...cats.values()].sort((a, b) => a.name.localeCompare(b.name)),
    tags: [...tagCounts]
      .map(([slug, count]) => ({ slug, count }))
      .sort((a, b) => b.count - a.count || a.slug.localeCompare(b.slug))
      .slice(0, 60),
  }
}

/** The same seeded order every time for a given seed (mulberry32), like the API's. Not the API's exact order, only as varied. */
function shuffle<T>(items: T[], seed: number): T[] {
  let t = seed + 0x6d2b79f5
  const next = () => {
    t = (t + 0x6d2b79f5) | 0
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1))
    ;[items[i], items[j]] = [items[j]!, items[i]!]
  }
  return items
}

const builtAt = new Date().toISOString()
export const localSitemap = () => entries.map((e) => ({ slug: e.item.slug, updatedAt: builtAt }))
