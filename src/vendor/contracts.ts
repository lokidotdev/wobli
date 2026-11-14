// Copied from backend/src/contracts/index.ts by scripts/sync-vendor.sh. Edit the original, then re-run the script.
import { z } from 'zod'

// What crosses the wire, in one place. The API validates requests and shapes responses with these; the site parses what it
// receives with the same schemas (`import … from 'wobli-api/contracts'`). Depends on zod and nothing else.

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/

/** An illustration's identity: its file name, URL and import path. */
export const slugSchema = z.string().regex(SLUG, 'lowercase letters, digits and single hyphens').max(64)

/** A tag as stored and searched: "Face ID" and "face_id" both become "face-id". */
export const tagSchema = z
  .string()
  .trim()
  .toLowerCase()
  .transform((s) => s.replace(/[\s_]+/g, '-'))
  .pipe(z.string().regex(SLUG, 'letters, digits and hyphens').max(32))

export const categorySchema = z.object({ slug: slugSchema, name: z.string().min(1).max(40) })
export type Category = z.infer<typeof categorySchema>

export const MAX_TAGS = 12

/** Per-illustration SEO. Every field may be empty; the site then falls back to the title and description. */
export const seoSchema = z.object({
  title: z.string().trim().max(70).default(''),
  description: z.string().trim().max(170).default(''),
  content: z.string().trim().max(5000).default(''), // longer copy shown on the illustration's page, paragraphs split by blank lines
})
export type Seo = z.infer<typeof seoSchema>

const tagsSchema = z
  .array(tagSchema)
  .min(1, 'at least one tag, so the illustration can be found')
  .transform((tags) => [...new Set(tags)])
  .pipe(z.array(z.string()).max(MAX_TAGS))

export const illustrationSchema = z.object({
  slug: slugSchema,
  title: z.string(),
  description: z.string(),
  category: categorySchema,
  tags: z.array(z.string()),
  featured: z.boolean(),
  frames: z.number().int().positive(), // loop length at 60fps
  poster: z.url(), // the still frame in the default style: SSR, LCP and crawlers get this, visitors get the live sticker
  icon: z.url(), // the drawing as JSON; the engine draws it
  seo: seoSchema.prefault({}), // page-level SEO the admin sets; empty strings mean "use the generated default"
})
export type Illustration = z.infer<typeof illustrationSchema>

export const sortSchema = z.enum(['featured', 'az'])
export type Sort = z.infer<typeof sortSchema>

export const PAGE_SIZE = 24
/** How many categories, or tags, one request may ask for at once. */
export const MAX_FILTER_VALUES = 12

/** A filter that takes several values in one parameter, comma separated: `tag=chat,inbox`. Duplicates and blanks are dropped. */
export const listOf = <T extends z.ZodType<string, string>>(item: T) =>
  z
    .string()
    .max(512)
    .transform((s) => s.split(',').map((v) => v.trim()).filter(Boolean))
    .pipe(z.array(item).min(1).max(MAX_FILTER_VALUES))
    .transform((values) => [...new Set(values)])
export const MAX_PAGE_SIZE = 48

/** GET /v1/illustrations?… `category` and `tag` widen: any one of their values is enough. `q` and `featured` narrow what that leaves. */
export const listQuerySchema = z.object({
  q: z.string().trim().max(64).optional(), // words matched against title, description, category and tags; all must match
  category: listOf(slugSchema).optional(), // in any of these
  tag: listOf(tagSchema).optional(), // carrying any of these
  featured: z.literal('1').optional(),
  sort: sortSchema.optional(),
  cursor: z.string().max(32).optional(), // nextCursor of the page before; opaque
  limit: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).optional(),
})
export type ListQuery = z.infer<typeof listQuerySchema>

export const illustrationPageSchema = z.object({
  items: z.array(illustrationSchema),
  nextCursor: z.string().nullable(), // null on the last page
  total: z.number().int(), // matches across every page
})
export type IllustrationPage = z.infer<typeof illustrationPageSchema>

/** GET /v1/facets: what the catalogue can be filtered by, with how many illustrations sit behind each. */
export const facetsSchema = z.object({
  categories: z.array(categorySchema.extend({ count: z.number().int() })),
  tags: z.array(z.object({ slug: z.string(), count: z.number().int() })), // most used first
})
export type Facets = z.infer<typeof facetsSchema>

/** GET /v1/sitemap */
export const sitemapSchema = z.array(z.object({ slug: slugSchema, updatedAt: z.iso.datetime() }))

/** The `meta` part of PUT /v1/admin/illustrations/:slug (multipart, beside the `poster` PNG and the `icon` JSON). */
export const publishMetaSchema = z.object({
  slug: slugSchema,
  title: z.string().trim().min(1).max(80),
  description: z.string().trim().min(1).max(300),
  category: categorySchema,
  tags: tagsSchema,
  featured: z.boolean().default(false),
})
export type PublishMeta = z.infer<typeof publishMetaSchema>
export type PublishMetaInput = z.input<typeof publishMetaSchema>

// ── Admin: editing, ordering, site settings ──────────────────────────────────────────────────────────────────────────────

const HEX = /^#[0-9a-f]{6}$/i
export const hexSchema = z.string().regex(HEX, 'a #rrggbb colour').transform((s) => s.toLowerCase())

/** PATCH /v1/admin/illustrations/:slug: any subset of what an editor may change. */
export const illustrationPatchSchema = z
  .object({
    title: z.string().trim().min(1).max(80),
    description: z.string().trim().min(1).max(300),
    category: categorySchema,
    tags: tagsSchema,
    featured: z.boolean(),
    seo: seoSchema.partial(),
  })
  .partial()
export type IllustrationPatch = z.infer<typeof illustrationPatchSchema>

/** PUT /v1/admin/order: every slug, in the order the catalogue should show them. Slugs left out keep their place after these. */
export const orderSchema = z.object({ slugs: z.array(slugSchema).min(1).max(2000) })

/** The palette slots, the same names the wobli engine uses. */
export const PALETTE_SLOTS = ['main', 'gold', 'tint', 'ok', 'hot', 'deep', 'white', 'grey', 'paper', 'ink'] as const
export const PALETTE_NAMES = ['system', 'riso', 'candy', 'matcha', 'sunset', 'clay', 'aqua'] as const
export const paletteNameSchema = z.enum(PALETTE_NAMES)
const paletteOverrideSchema = z.partialRecord(z.enum(PALETTE_SLOTS), hexSchema)

const pageSeoSchema = z.object({ title: z.string().trim().max(70).default(''), description: z.string().trim().max(170).default('') })

/** GET /v1/settings, PUT /v1/admin/settings: the site-wide look and page SEO. Every field has a default, so {} is valid. */
export const siteSettingsSchema = z.object({
  style: z
    .object({
      preset: paletteNameSchema.default('system'), // the palette every visitor starts with
      line: z.number().min(0).max(2.5).default(0.25), // default stroke (outline multiplier)
      depth: z.number().min(0).max(1.5).default(1), // default extrusion multiplier
      palettes: z.partialRecord(paletteNameSchema, paletteOverrideSchema).default({}), // slot colours laid over the shipped palettes
    })
    .prefault({}),
  seo: z
    .object({
      home: pageSeoSchema.prefault({}),
      illustrations: pageSeoSchema.prefault({}),
      docs: pageSeoSchema.prefault({}),
    })
    .prefault({}),
})
export type SiteSettings = z.infer<typeof siteSettingsSchema>
export type SiteSettingsInput = z.input<typeof siteSettingsSchema>

/** GET /v1/admin/illustrations: the whole catalogue in display order, unpaged, for the admin list. */
export const adminIllustrationListSchema = z.array(illustrationSchema.extend({ position: z.number().int() }))
export type AdminIllustration = z.infer<typeof adminIllustrationListSchema>[number]

/** Every non-2xx response. */
export const errorSchema = z.object({ error: z.object({ code: z.string(), message: z.string(), details: z.unknown().optional() }) })
