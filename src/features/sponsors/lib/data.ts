import { queryOptions } from '@tanstack/react-query'
import { checkoutResponseSchema, sponsorFieldsSchema, sponsorStatsSchema, sponsorsPageSchema } from 'wobli-api/contracts'
import { z } from 'zod'
import type { SponsorFields, SponsorStats, SponsorsPage } from 'wobli-api/contracts'
import { apiGetOr, apiPost } from '~/shared/lib/api'

// The sponsors page's data. Without an API it renders the plans as closed, so a site running on its own still has the page.

export type { SponsorStats, SponsorsPage }
export type Tier = SponsorsPage['tiers'][number]
export type Plan = { billing: 'monthly' | 'one_month'; tier: Tier } | { billing: 'one_time'; amount: number }

const CLOSED: SponsorsPage = {
  tiers: [],
  backers: [],
  oneTime: { enabled: false, min: 100, suggested: [] },
  oneMonth: { enabled: false },
  platform: [],
  contactEmail: null,
  currency: 'USD',
  open: false,
}
const NO_STATS: SponsorStats = { pageviewsMonth: null, pageviewsTotal: null, stars: null, updatedAt: null }

export const sponsorsQuery = () =>
  queryOptions({ queryKey: ['sponsors'], queryFn: () => apiGetOr('/v1/sponsors', sponsorsPageSchema, {}, () => CLOSED).then(withDevDemo), staleTime: 60_000 })

/** Whether anyone is sponsoring yet: a tier sponsor or a platform sponsor. */
export const hasSponsors = (data: SponsorsPage) => data.tiers.some((t) => t.sponsors.length > 0) || data.platform.length > 0

// ── Demo sponsors, `vite dev` only ──────────────────────────────────────────────────────────────────────────────────────
// With no real sponsors, local dev fills the first two tiers and the platform row so the sponsor UI can be seen. Never in a
// build: `import.meta.env.DEV` is false there and this is dropped. Turn it off in dev with VITE_SPONSOR_DEMO=0.

const DEMO_ON = import.meta.env.DEV && import.meta.env.VITE_SPONSOR_DEMO !== '0'

function withDevDemo(data: SponsorsPage): SponsorsPage {
  if (!DEMO_ON || hasSponsors(data) || data.tiers.length === 0) return data
  const demo = (id: number, name: string) => ({ id: -id, name, website: 'https://example.com', logoUrl: null })
  return {
    ...data,
    tiers: data.tiers.map((t, i) =>
      i === 0 ? { ...t, sponsors: [demo(1, 'Demo Sponsor Co.')] } : i === 1 ? { ...t, sponsors: [demo(2, 'Example Labs'), demo(3, 'Acme Studio')] } : t,
    ),
    platform: [{ name: 'Demo Platform', logoUrl: 'https://wobli.space/favicon.svg', href: 'https://example.com', label: 'Hosting sponsor (demo)' }],
  }
}

export const sponsorStatsQuery = () =>
  queryOptions({ queryKey: ['sponsor-stats'], queryFn: () => apiGetOr('/v1/sponsors/stats', sponsorStatsSchema, {}, () => NO_STATS), staleTime: 5 * 60_000 })

/** The form's own rules are the API's: the same schema, from the contracts. */
export const formSchema = sponsorFieldsSchema
export type FormValues = Required<{ [K in keyof SponsorFields]: string }>
export type FormField = keyof FormValues

export function startCheckout(plan: Plan, form: SponsorFields) {
  const body = plan.billing === 'one_time' ? { ...form, billing: 'one_time', amount: plan.amount } : { ...form, billing: plan.billing, tierId: plan.tier.id }
  return apiPost('/v1/sponsors/checkout', body, checkoutResponseSchema)
}

/** $1,500 or $12.50 */
export const money = (cents: number) => `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: cents % 100 ? 2 : 0 })}`

/** 223,412 → "223K", 1,104,000 → "1.1M". */
export const compact = (n: number) =>
  n < 1000 ? String(n) : new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: n < 10_000 || (n >= 1e6 && n < 1e7) ? 1 : 0 }).format(n)

declare global {
  interface Window {
    umami?: { track: (event: string, data?: Record<string, string | number>) => void }
  }
}

/** A custom event in Umami, when its script is on the page. */
export const track = (event: string, data?: Record<string, string | number>) => {
  try {
    window.umami?.track(event, data)
  } catch {}
}

/** Asks Dodo to email the sponsor a link to manage or cancel. The answer never says whether the email sponsors anything. */
export const requestManageLink = (email: string) => apiPost('/v1/sponsors/manage', { email }, z.object({ ok: z.literal(true) }))

/** "$250/month", "$250 for 1 month", "$40 once": what a plan costs, in words. */
export function planPrice(plan: Plan) {
  if (plan.billing === 'one_time') return `${money(plan.amount)} once`
  return plan.billing === 'monthly' ? `${money(plan.tier.monthlyPrice)}/month` : `${money(plan.tier.monthlyPrice)} for 1 month`
}
