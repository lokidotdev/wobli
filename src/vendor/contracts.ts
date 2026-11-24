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

/** Lowercase, accents stripped: the form both the indexed text and a query are compared in. */
export const searchFold = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '')

const MAX_SEARCH_WORDS = 5
const MAX_SEARCH_WORD = 24 // D1 rejects LIKE patterns over 50 bytes; this leaves room for the wildcards and escapes

/** A word reduced to the stem it is matched by, so a plural finds the singular: "charts" → "chart", "boxes" → "box", "categories" → "categor". */
function stem(w: string) {
  if (w.length <= 3 || w.endsWith('ss')) return w
  if (w.endsWith('ies')) return w.slice(0, -3)
  if (/(x|z|ch|sh|ss)es$/.test(w)) return w.slice(0, -2)
  if (w.endsWith('s')) return w.slice(0, -1)
  return w
}

/**
 * A query as the words to look for. Every one must start a word in the indexed text (prefix, so "notif" finds "notification",
 * but "ai" no longer finds "again"); plurals are stemmed, punctuation splits words.
 */
export function searchWords(q: string | undefined): string[] {
  if (!q) return []
  const words = searchFold(q).split(/[^\p{L}\p{N}-]+/u).map((w) => w.replace(/^-+|-+$/g, '')).filter(Boolean)
  return [...new Set(words.map((w) => stem(w).slice(0, MAX_SEARCH_WORD)))].slice(0, MAX_SEARCH_WORDS)
}

/** Whether `text` (already folded) has a word starting with `word`. The same rule the API's LIKE patterns apply. */
export const startsAWord = (text: string, word: string) => (' ' + text.replace(/[^\p{L}\p{N}-]+/gu, ' ')).includes(' ' + word)

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
/** The highest `seed` a shuffled list takes: few enough that every seed's response stays warm in the cache. */
export const MAX_SEED = 999

/** GET /v1/illustrations?… Every filter narrows: in one of the `category` values, carrying every `tag`, matching every `q` word, and `featured`. */
export const listQuerySchema = z.object({
  q: z.string().trim().max(64).optional(), // words matched against title, description, category and tags; all must match
  category: listOf(slugSchema).optional(), // in any of these
  tag: listOf(tagSchema).optional(), // carrying all of these
  featured: z.literal('1').optional(),
  sort: sortSchema.optional(),
  // a shuffled order instead of `sort`, the same one for the same seed (so pages line up and responses cache); 0–999
  seed: z.coerce.number().int().min(0).max(MAX_SEED).optional(),
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

// ── Sponsors ────────────────────────────────────────────────────────────────────────────────────────────────────────────
// Money is integer cents, USD. A form on the site opens a Dodo checkout; Dodo's payment webhook puts the logo on the page
// at once. An admin can unpublish, edit or delete it afterwards.

const MAX_CENTS = 10_000_000 // $100,000
export const centsSchema = z.number().int().min(100, 'at least $1').max(MAX_CENTS)
const httpsSchema = z.url({ protocol: /^https$/, error: 'use a full https:// link' }).max(300)
/** An optional field from a form: an empty box means "not given". */
const optionalField = <T extends z.ZodType>(schema: T) => z.preprocess((v) => (typeof v === 'string' && v.trim() === '' ? undefined : v), schema.optional())

export const SPONSOR_STATUSES = ['pending', 'paid', 'active', 'rejected', 'failed', 'cancelled', 'refunded'] as const
export const sponsorStatusSchema = z.enum(SPONSOR_STATUSES)
export type SponsorStatus = z.infer<typeof sponsorStatusSchema>
/** monthly: renews until cancelled. one_month: one month in a tier slot, paid once. one_time: pay what you want, a backer. */
export const billingSchema = z.enum(['monthly', 'one_month', 'one_time'])
export type Billing = z.infer<typeof billingSchema>

/** Who the sponsor is: the fields of the form on /sponsors. `company` is a honeypot, hidden from people. */
export const sponsorFieldsSchema = z.object({
  name: z.string().trim().min(1, 'who should we thank?').max(80, 'keep it under 80 characters'),
  email: z.email('enter an email we can reach you at').max(254),
  website: optionalField(httpsSchema),
  logoUrl: optionalField(httpsSchema),
  message: optionalField(z.string().trim().max(500, 'keep it under 500 characters')),
  company: z.string().max(200).optional(),
})
export type SponsorFields = z.input<typeof sponsorFieldsSchema>

/** POST /v1/sponsors/checkout. Monthly picks a tier; one-time pays what it wants above the admin's minimum. */
export const checkoutSchema = z.discriminatedUnion('billing', [
  sponsorFieldsSchema.extend({ billing: z.literal('monthly'), tierId: z.string().min(1).max(32) }),
  sponsorFieldsSchema.extend({ billing: z.literal('one_month'), tierId: z.string().min(1).max(32) }),
  sponsorFieldsSchema.extend({ billing: z.literal('one_time'), amount: centsSchema }),
])
export type CheckoutInput = z.input<typeof checkoutSchema>
export const checkoutResponseSchema = z.object({ id: z.number().int(), url: z.url() })

export const sponsorTierSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]{1,32}$/, 'lowercase letters, digits and hyphens'),
  name: z.string().trim().min(1).max(40),
  monthlyPrice: centsSchema,
  perks: z.array(z.string().trim().min(1).max(120)).max(8),
  highlight: z.boolean().default(false),
  active: z.boolean().default(true),
  maxSponsors: z.number().int().min(1).max(1000).nullable().default(null), // null = unlimited
})
export type SponsorTier = z.infer<typeof sponsorTierSchema>

export const platformSponsorSchema = z.object({ name: z.string().trim().min(1).max(60), logoUrl: httpsSchema, href: httpsSchema, label: z.string().trim().max(40) })

/** GET and PUT /v1/admin/sponsors/pricing. New prices apply to new checkouts; existing subscriptions keep theirs. */
export const sponsorPricingSchema = z.object({
  // the go-live switch: off, /sponsors shows "Coming soon" in place of prices and checkout is refused
  live: z.boolean().default(false),
  tiers: z
    .array(sponsorTierSchema)
    .max(6)
    .refine((t) => new Set(t.map((x) => x.id)).size === t.length, 'tier ids must be unique'),
  oneTime: z.object({ enabled: z.boolean(), min: centsSchema, suggested: z.array(centsSchema).max(4) }),
  oneMonth: z.object({ enabled: z.boolean() }).prefault({ enabled: true }), // a tier slot for one month, paid once
  platform: z.array(platformSponsorSchema).max(6),
  contactEmail: z.email().nullable(),
})
export type SponsorPricing = z.infer<typeof sponsorPricingSchema>
export const sponsorPricingAdminSchema = sponsorPricingSchema.extend({
  payments: z.object({ configured: z.boolean(), mode: z.enum(['test', 'live']), webhook: z.boolean() }),
})

const publicSponsorSchema = z.object({ id: z.number().int(), name: z.string(), website: z.string().nullable(), logoUrl: z.string().nullable() })
export type PublicSponsor = z.infer<typeof publicSponsorSchema>

/** GET /v1/sponsors: tiers with their verified sponsors, backers (no tier), the one-time option and platform sponsors. */
export const sponsorsPageSchema = z.object({
  // spotsLeft: null = unlimited, 0 = sold out
  tiers: z.array(sponsorTierSchema.omit({ active: true }).extend({ sponsors: z.array(publicSponsorSchema), spotsLeft: z.number().int().nullable() })),
  backers: z.array(publicSponsorSchema),
  oneTime: sponsorPricingSchema.shape.oneTime,
  oneMonth: z.object({ enabled: z.boolean() }),
  platform: z.array(platformSponsorSchema),
  contactEmail: z.string().nullable(),
  currency: z.literal('USD'),
  open: z.boolean(), // false until sponsorships are switched live and the API has its Dodo keys: the plans show, prices and the form don't
})
export type SponsorsPage = z.infer<typeof sponsorsPageSchema>

/** GET /v1/sponsors/stats: pageviews (Umami) and stars (GitHub), refreshed hourly. null when unknown. */
export const sponsorStatsSchema = z.object({
  pageviewsMonth: z.number().nullable(),
  pageviewsTotal: z.number().nullable(),
  stars: z.number().nullable(),
  updatedAt: z.iso.datetime().nullable(),
})
export type SponsorStats = z.infer<typeof sponsorStatsSchema>

export const sponsorSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  email: z.string(),
  website: z.string().nullable(),
  logoUrl: z.string().nullable(),
  message: z.string().nullable(),
  billing: billingSchema,
  tierId: z.string().nullable(), // where the logo shows; null lists them as a backer
  amount: z.number().int(),
  currency: z.string(),
  status: sponsorStatusSchema,
  note: z.string().nullable(),
  paymentId: z.string().nullable(),
  subscriptionId: z.string().nullable(),
  paidAt: z.iso.datetime().nullable(),
  expiresAt: z.iso.datetime().nullable(), // one-month sponsors only
  verifiedAt: z.iso.datetime().nullable(),
  createdAt: z.iso.datetime(),
})
export type Sponsor = z.infer<typeof sponsorSchema>

/** PATCH /v1/admin/sponsors/:id: publish (active) or unpublish (paid), reject, fix the details, or move them to another tier. */
export const sponsorPatchSchema = z
  .object({
    name: z.string().trim().min(1).max(80),
    email: z.email().max(254),
    website: httpsSchema.nullable(),
    logoUrl: httpsSchema.nullable(),
    message: z.string().trim().max(500).nullable(),
    tierId: z.string().max(32).nullable(),
    status: sponsorStatusSchema,
    note: z.string().trim().max(1000).nullable(),
  })
  .partial()
export type SponsorPatch = z.infer<typeof sponsorPatchSchema>

/** POST /v1/admin/sponsors: someone who paid another way. Live at once unless a status says otherwise. */
export const manualSponsorSchema = sponsorFieldsSchema.omit({ company: true }).extend({
  billing: billingSchema,
  tierId: z.string().max(32).nullable().default(null),
  amount: z.number().int().min(0).max(MAX_CENTS),
  status: sponsorStatusSchema.default('active'),
  note: z.string().trim().max(1000).nullable().default(null),
})
export type ManualSponsorInput = z.input<typeof manualSponsorSchema>

/** POST /v1/sponsors/manage: Dodo emails the sponsor a link to its customer portal (manage the card, cancel). */
export const manageSchema = z.object({ email: z.email('enter a valid email').max(254) })
