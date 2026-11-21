import { useQuery, useSuspenseQuery } from '@tanstack/react-query'
import savingsJar from 'wobli/icons/savings-jar'
import { Sticker } from 'wobli/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { facetsQuery } from '~/features/illustrations'
import { DEFAULT_STYLE, toEngineStyle } from '~/features/style'
import { cn } from '~/shared/lib/cn'
import { BAND, FILLED, GHOST, LG, SM } from '~/shared/ui/slush'
import { compact, money, requestManageLink, sponsorStatsQuery, sponsorsQuery, track } from '../lib/data'
import type { Plan, SponsorsPage as Data, Tier } from '../lib/data'
import { SponsorSheet } from './SponsorSheet'

// A sticker-book page (DESIGN.md): a sky poster with the numbers, a white wall of sponsors, a mint band of plans, and a
// lavender closer. Every card is cut out in black; colour comes from the sticker palette.

const CARD = 'rounded-[20px] border border-black' // plus a background: cn() doesn't merge, so a card names its own
const TILT = ['-rotate-2', 'rotate-1', '-rotate-1', 'rotate-2']

export function SponsorsPage({ thanks }: { thanks: boolean }) {
  const { data } = useSuspenseQuery(sponsorsQuery())
  const [plan, setPlan] = useState<Plan | null>(null)
  const close = useCallback(() => setPlan(null), [])
  const choose = (next: Plan) => {
    if (!data.open) return document.getElementById('plans')?.scrollIntoView({ behavior: 'smooth' })
    track('sponsor-open', next.billing === 'one_time' ? { billing: 'one_time' } : { billing: next.billing, tier: next.tier.id })
    setPlan(next)
  }

  return (
    <>
      <Poster thanks={thanks} />
      <Wall data={data} onChoose={choose} />
      <Plans data={data} onChoose={choose} />
      <Closer data={data} />
      <SponsorSheet plan={plan} onClose={close} />
    </>
  )
}

// ── Band one, sky: the poster and the numbers ───────────────────────────────────────────────────────────────────────────

function Poster({ thanks }: { thanks: boolean }) {
  const LOOK = toEngineStyle(DEFAULT_STYLE)
  return (
    <section className="bg-slush-sky pt-(--nav-h)">
      <div className={cn(BAND, 'pt-10 pb-14 sm:pt-14 sm:pb-20')}>
        <div className="flex items-center gap-4 sm:gap-8">
          <h1 className="min-w-0 text-[clamp(3rem,11.5vw,11rem)] slush-display">Sponsors</h1>
          <div aria-hidden className="pointer-events-none -my-[5vw] w-[24vw] max-w-[340px] shrink-0 rotate-[-8deg]">
            <Sticker icon={savingsJar} palette={LOOK.palette} line={LOOK.line} depth={LOOK.depth} enter={0.3} />
          </div>
        </div>
        <p className="mt-6 max-w-2xl text-[20px] leading-[1.2] font-medium text-balance sm:text-[24px]">
          Your support keeps wobli free and open source: every illustration, the editor and the package, for anything you build.
        </p>
        {thanks ? (
          <p role="status" className={cn(CARD, 'mt-8 inline-flex items-center gap-3 bg-slush-mint px-5 py-3 text-[16px] font-medium')}>
            <span aria-hidden className="grid size-7 place-items-center rounded-full border border-black bg-white">
              ✓
            </span>
            Thank you! We&rsquo;ll verify your payment and put your logo up shortly.
          </p>
        ) : (
          <a href="#plans" className={cn(FILLED, LG, 'mt-8 active:scale-[0.97] motion-reduce:active:scale-100')}>
            Become a sponsor
          </a>
        )}
        <Stats />
      </div>
    </section>
  )
}

/** Counts up to `to` once known, easing out; straight there under reduced motion. */
function useCountUp(to: number | null, ms = 900) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (to === null) return
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return setValue(to)
    let frame = 0
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / ms)
      setValue(Math.round(to * (1 - (1 - t) ** 3)))
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    // rAF pauses in background tabs; land on the real number regardless
    const settle = setTimeout(() => setValue(to), ms + 100)
    return () => {
      cancelAnimationFrame(frame)
      clearTimeout(settle)
    }
  }, [to, ms])
  return value
}

function Stat({ value, label, className, style }: { value: number | null | string; label: string; className?: string; style?: CSSProperties }) {
  const n = useCountUp(typeof value === 'number' ? value : null)
  return (
    <div className={cn(CARD, 'flex flex-col items-center justify-center px-4 py-7 text-center', className)} style={style}>
      <span className="text-[clamp(2.5rem,6vw,4.5rem)] slush-display tabular-nums">
        {typeof value === 'string' ? value : value === null ? '—' : `${compact(n)}+`}
      </span>
      <span className="mt-3 text-[12px] slush-label">{label}</span>
    </div>
  )
}

function Stats() {
  const stats = useQuery(sponsorStatsQuery()).data
  // every illustration sits in exactly one category, so their counts add up to the catalogue
  const facets = useQuery(facetsQuery()).data
  const total = facets?.categories.reduce((n, c) => n + c.count, 0) || null
  return (
    <section aria-label="Reach" className="mt-14 grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Stat value={stats?.pageviewsMonth ?? null} label="Pageviews, last 30 days" className="bg-slush-sunburst" />
      <Stat value={stats?.stars ?? null} label="GitHub stars" className="bg-white" />
      <Stat value={total} label="Illustrations" className="bg-slush-lavender" />
      <Stat value="Free" label="For anything you build" className="bg-slush-mint" />
      <Stat value={stats?.pageviewsTotal ?? null} label="Pageviews since launch" className="col-span-2 bg-black py-10 text-white lg:col-span-4" />
      <p className="col-span-full text-center text-[12px] font-medium text-black/55">Live from our Umami analytics. Updated hourly.</p>
    </section>
  )
}

// ── Band two, white: the wall ──────────────────────────────────────────────────────────────────────────────────────────

// the first tier gets the biggest tiles; each one after steps down
const WALL = [
  { grid: 'sm:grid-cols-2', tile: 'h-40 sm:h-48', logo: 'max-h-16 max-w-[70%]', name: 'text-[44px]' },
  { grid: 'grid-cols-2 sm:grid-cols-3', tile: 'h-32', logo: 'max-h-11 max-w-[70%]', name: 'text-[30px]' },
  { grid: 'grid-cols-2 sm:grid-cols-4', tile: 'h-24', logo: 'max-h-8 max-w-[70%]', name: 'text-[22px]' },
]
const TIER_TINT = ['bg-slush-sunburst', 'bg-slush-blue', 'bg-slush-lavender', 'bg-slush-mint']

function Wall({ data, onChoose }: { data: Data; onChoose: (p: Plan) => void }) {
  if (!data.tiers.length && !data.backers.length) return null
  return (
    <section aria-labelledby="wall-title" className="bg-white">
      <div className={cn(BAND, 'flex flex-col gap-14 py-16 sm:py-24')}>
        <h2 id="wall-title" className="sr-only">
          Our sponsors
        </h2>
        {data.tiers.map((tier, i) => {
          const size = WALL[Math.min(i, WALL.length - 1)]!
          return (
            <div key={tier.id} className="flex flex-col items-center gap-5">
              <h3
                className={cn('rounded-full border border-black px-4 py-1.5 text-[13px] slush-label', TIER_TINT[i % TIER_TINT.length], TILT[i % TILT.length])}
              >
                {tier.name}
              </h3>
              <ul className={cn('grid w-full max-w-5xl gap-3', size.grid)}>
                {tier.sponsors.map((s) => {
                  const body = s.logoUrl ? (
                    <img src={s.logoUrl} alt={s.name} className={cn('object-contain', size.logo)} />
                  ) : (
                    <span className={cn('slush-display', size.name)}>{s.name}</span>
                  )
                  const cls = cn(CARD, 'flex w-full items-center justify-center bg-white', size.tile)
                  return (
                    <li key={s.id}>
                      {s.website ? (
                        <a
                          href={s.website}
                          target="_blank"
                          rel="noreferrer sponsored"
                          title={s.name}
                          className={cn(cls, 'transition-[box-shadow,translate] duration-150 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_#000]')}
                        >
                          {body}
                        </a>
                      ) : (
                        <div className={cls}>{body}</div>
                      )}
                    </li>
                  )
                })}
                {tier.spotsLeft !== 0 && (
                  <li className={cn(tier.sponsors.length === 0 && 'col-span-full mx-auto w-full max-w-md')}>
                    <button
                      type="button"
                      onClick={() => onChoose({ billing: 'monthly', tier })}
                      className={cn(
                        'group flex w-full items-center justify-center gap-2 rounded-[20px] border border-dashed border-black/40 text-[13px] text-black/55 slush-label transition-[background-color,color,border-color] duration-150 hover:border-black hover:bg-slush-mist/50 hover:text-black active:scale-[0.98] motion-reduce:active:scale-100',
                        size.tile,
                      )}
                    >
                      <span aria-hidden className="text-[18px] transition-transform duration-200 group-hover:rotate-90">
                        +
                      </span>
                      {tier.sponsors.length ? 'Your logo here' : `Be the first ${tier.name} sponsor`}
                    </button>
                  </li>
                )}
              </ul>
            </div>
          )
        })}
        {data.backers.length > 0 && (
          <div className="flex flex-col items-center gap-5">
            <h3 className="-rotate-1 rounded-full border border-black bg-slush-ember px-4 py-1.5 text-[13px] text-white slush-label">Backers</h3>
            <ul className="flex max-w-3xl flex-wrap justify-center gap-2">
              {data.backers.map((s) => (
                <li key={s.id}>
                  <a href={s.website ?? undefined} target="_blank" rel="noreferrer sponsored" className={cn(GHOST, SM, 'normal-case')}>
                    {s.logoUrl && <img src={s.logoUrl} alt="" className="size-5 object-contain" />}
                    {s.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  )
}

// ── Band three, mint: the plans ────────────────────────────────────────────────────────────────────────────────────────

type Billing = 'monthly' | 'one_month' | 'one_time'

function Plans({ data, onChoose }: { data: Data; onChoose: (p: Plan) => void }) {
  const [billing, setBilling] = useState<Billing>('monthly')
  return (
    <section id="plans" aria-labelledby="plans-title" className="scroll-mt-(--nav-h) border-y border-black bg-slush-mint">
      <div className={cn(BAND, 'py-16 sm:py-24')}>
        <div className="flex flex-col items-center text-center">
          <h2 id="plans-title" className="max-w-4xl text-[clamp(2.5rem,7vw,5.5rem)] text-balance slush-display">
            Power a growing open-source library
          </h2>
          <p className="mt-5 max-w-xl text-[18px] leading-[1.3] font-medium text-balance">
            Pick a tier and put your logo in front of the people building with wobli. Cancel anytime.
          </p>
          {(data.oneTime.enabled || data.oneMonth.enabled) && (
            <BillingSwitch
              value={billing}
              onChange={setBilling}
              options={[
                ['monthly', 'Monthly'],
                ...(data.oneMonth.enabled ? [['one_month', '1 month'] as [Billing, string]] : []),
                ...(data.oneTime.enabled ? [['one_time', 'One-time'] as [Billing, string]] : []),
              ]}
            />
          )}
        </div>
        <div className="mx-auto mt-12 max-w-5xl">
          {billing !== 'one_time' ? (
            <ul className={cn('grid gap-4', data.tiers.length >= 3 ? 'lg:grid-cols-3' : data.tiers.length === 2 && 'sm:grid-cols-2')}>
              {data.tiers.map((t, i) => (
                <li key={t.id}>
                  <TierCard tier={t} index={i} billing={billing} open={data.open} onChoose={() => onChoose({ billing, tier: t })} />
                </li>
              ))}
            </ul>
          ) : (
            <OneTime data={data} onChoose={onChoose} />
          )}
        </div>
        <p className="mt-8 text-center text-[14px] font-medium text-black/70">
          {data.open
            ? billing === 'one_month'
              ? 'Billed in USD, once. Your logo stays up for 30 days, with nothing to cancel. Payments by Dodo Payments, our merchant of record.'
              : 'Billed in USD. Monthly plans renew until you cancel. Payments by Dodo Payments, our merchant of record.'
            : 'Sponsorships open soon. Email us below in the meantime.'}
        </p>
        {data.open && <ManageLink />}
      </div>
    </section>
  )
}

/** One pill holding every option, a black thumb that slides to the chosen one. */
function BillingSwitch({ value, onChange, options }: { value: Billing; onChange: (b: Billing) => void; options: [Billing, string][] }) {
  const index = Math.max(0, options.findIndex(([id]) => id === value))
  const n = options.length
  return (
    <div role="radiogroup" aria-label="Billing" className="relative mt-8 grid rounded-full border border-black bg-white p-1" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
      <span
        aria-hidden
        className="absolute inset-y-1 left-1 rounded-full bg-black transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
        style={{ width: `calc((100% - 8px) / ${n})`, transform: `translateX(${index * 100}%)` }}
      />
      {options.map(([id, label]) => (
        <button
          key={id}
          type="button"
          role="radio"
          aria-checked={value === id}
          onClick={() => onChange(id)}
          className="relative h-10 rounded-full px-6 text-[13px] slush-label transition-colors duration-200 aria-checked:text-white"
        >
          {label}
        </button>
      ))}
    </div>
  )
}

function TierCard({ tier, index, billing, open, onChoose }: { tier: Tier; index: number; billing: 'monthly' | 'one_month'; open: boolean; onChoose: () => void }) {
  return (
    <article className={cn(CARD, 'relative flex h-full flex-col bg-white p-6', tier.highlight && 'shadow-[6px_6px_0_0_#000]')}>
      {tier.highlight && (
        <span className="absolute -top-3.5 right-5 rotate-3 rounded-full border border-black bg-slush-sunburst px-3 py-1 text-[11px] slush-label">
          Most impact
        </span>
      )}
      <h3 className={cn('w-fit rounded-full border border-black px-3 py-1 text-[12px] slush-label', TIER_TINT[index % TIER_TINT.length])}>{tier.name}</h3>
      <p className="mt-5 flex items-end gap-1.5">
        <span className="text-[64px] slush-display tabular-nums">{money(tier.monthlyPrice)}</span>
        <span className="pb-1 text-[14px] font-medium text-black/60">{billing === 'monthly' ? '/month' : 'for 1 month'}</span>
      </p>
      {billing === 'one_month' && <p className="mt-1 text-[13px] font-medium text-black/60">Paid once. No renewal.</p>}
      {tier.spotsLeft !== null && tier.maxSponsors !== null && (
        <p
          className={cn(
            'mt-3 w-fit -rotate-1 rounded-full border border-black px-3 py-1 text-[11px] slush-label',
            tier.spotsLeft === 0 ? 'bg-slush-ember text-white' : 'bg-slush-mist',
          )}
        >
          {tier.spotsLeft === 0 ? 'Sold out' : `${tier.spotsLeft} of ${tier.maxSponsors} ${tier.maxSponsors === 1 ? 'spot' : 'spots'} left`}
        </p>
      )}
      <ul className="mt-6 flex flex-1 flex-col gap-3 border-t border-black pt-6">
        {tier.perks.map((p) => (
          <li key={p} className="flex items-start gap-3 text-[15px] leading-[1.3] font-medium">
            <span aria-hidden className="mt-px grid size-5 shrink-0 place-items-center rounded-full border border-black bg-slush-mint text-[11px]">
              ✓
            </span>
            {p}
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={onChoose}
        disabled={!open || tier.spotsLeft === 0}
        className={cn(
          tier.highlight ? FILLED : GHOST,
          LG,
          'mt-7 w-full active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:active:scale-100',
        )}
      >
        {tier.spotsLeft === 0 ? 'Sold out' : billing === 'monthly' ? `Sponsor as ${tier.name}` : `${tier.name} for 1 month`}
      </button>
    </article>
  )
}

function OneTime({ data, onChoose }: { data: Data; onChoose: (p: Plan) => void }) {
  const { min, suggested } = data.oneTime
  const [picked, setPicked] = useState<number | 'custom'>(suggested[0] ?? 'custom')
  const [custom, setCustom] = useState('')
  const input = useRef<HTMLInputElement>(null)
  const cents = picked === 'custom' ? Math.round(Number(custom) * 100) : picked
  const valid = Number.isFinite(cents) && cents >= min
  const error = picked === 'custom' && custom !== '' && !valid ? `At least ${money(min)}` : null
  const chip =
    'h-12 rounded-full border border-black text-[15px] font-bold tabular-nums transition-[background-color,color,scale] duration-150 active:scale-[0.96] aria-checked:bg-black aria-checked:text-white motion-reduce:active:scale-100'

  return (
    <div className={cn(CARD, 'mx-auto flex max-w-xl flex-col bg-white p-6 sm:p-8')}>
      <h3 className="text-[40px] slush-display">Give once</h3>
      <p className="mt-2 text-[16px] font-medium text-black/70">Any amount from {money(min)}. Your name joins the backers.</p>
      <div role="radiogroup" aria-label="Amount" className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {suggested.map((a) => (
          <button
            key={a}
            type="button"
            role="radio"
            aria-checked={picked === a}
            onClick={() => setPicked(a)}
            className={cn(chip, 'bg-white hover:bg-slush-mist')}
          >
            {money(a)}
          </button>
        ))}
        <button
          type="button"
          role="radio"
          aria-checked={picked === 'custom'}
          onClick={() => {
            setPicked('custom')
            requestAnimationFrame(() => input.current?.focus())
          }}
          className={cn(chip, 'bg-slush-sunburst')}
        >
          Other
        </button>
      </div>
      {picked === 'custom' && (
        <label className="mt-3 flex flex-col gap-1.5">
          <span className="sr-only">Amount in US dollars</span>
          <span className="relative">
            <span className="pointer-events-none absolute top-1/2 left-5 -translate-y-1/2 text-[16px] font-bold">$</span>
            <input
              ref={input}
              inputMode="decimal"
              placeholder={String(min / 100)}
              value={custom}
              onChange={(e) => setCustom(e.target.value.replace(/[^\d.]/g, ''))}
              aria-invalid={Boolean(error)}
              className="h-12 w-full rounded-full border border-black bg-white pr-5 pl-9 text-[16px] font-bold tabular-nums focus:shadow-[3px_3px_0_0_#000] focus:outline-none aria-invalid:bg-slush-ember/10"
            />
          </span>
          {error && <span className="px-1 text-[13px] font-medium text-slush-ember">{error}</span>}
        </label>
      )}
      <button
        type="button"
        disabled={!valid || !data.open}
        onClick={() => onChoose({ billing: 'one_time', amount: cents })}
        className={cn(FILLED, LG, 'mt-6 w-full active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:active:scale-100')}
      >
        {valid ? `Sponsor ${money(cents)} once` : 'Choose an amount'}
      </button>
    </div>
  )
}

// ── Band four, lavender: platform sponsors and contact ─────────────────────────────────────────────────────────────────

function Closer({ data }: { data: Data }) {
  if (!data.platform.length && !data.contactEmail) return null
  return (
    <section className="bg-slush-lavender">
      <div className={cn(BAND, 'flex flex-col items-center gap-16 py-16 text-center sm:py-24')}>
        {data.platform.length > 0 && (
          <div className="flex w-full flex-col items-center gap-3">
            <h2 className="text-[13px] slush-label">Platform sponsors</h2>
            <p className="text-[15px] font-medium text-black/70">Products that back wobli through their open-source programs.</p>
            <ul className="mt-4 grid w-full max-w-3xl gap-3 sm:grid-cols-2">
              {data.platform.map((p) => (
                <li key={p.name}>
                  <a
                    href={p.href}
                    target="_blank"
                    rel="noreferrer"
                    className={cn(
                      CARD,
                      'flex h-36 flex-col items-center justify-center gap-3 bg-white transition-[box-shadow,translate] duration-150 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_#000]',
                    )}
                  >
                    <img src={p.logoUrl} alt={p.name} className="max-h-10 max-w-[60%] object-contain" />
                    {p.label && <span className="text-[11px] text-black/55 slush-label">{p.label}</span>}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
        {data.contactEmail && (
          <div className="flex flex-col items-center">
            <h2 className="max-w-3xl text-[clamp(2.25rem,6vw,4.5rem)] text-balance slush-display">Questions, or need a custom package?</h2>
            <p className="mt-5 max-w-md text-[18px] leading-[1.3] font-medium">Happy to put something together that fits how your team wants to show up.</p>
            <a href={`mailto:${data.contactEmail}?subject=${encodeURIComponent('Sponsoring wobli')}`} className={cn(GHOST, LG, 'mt-8 normal-case')}>
              {data.contactEmail} →
            </a>
          </div>
        )}
      </div>
    </section>
  )
}

// ── Manage or cancel ─────────────────────────────────────────────────────────────────────────────────────────────────────

/**
 * For monthly sponsors: Dodo emails them a link to its customer portal, where they update the card or cancel. Opens in
 * place from a quiet link, and says the same thing whatever the email, so it can't reveal who sponsors.
 */
function ManageLink() {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [state, setState] = useState<{ kind: 'idle' | 'sending' | 'sent' } | { kind: 'error'; message: string }>({ kind: 'idle' })
  const input = useRef<HTMLInputElement>(null)
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!valid) return
    setState({ kind: 'sending' })
    track('sponsor-manage')
    const res = await startManage(email.trim())
    setState(res)
  }

  return (
    <div className="mt-5 flex flex-col items-center">
      {!open ? (
        <button
          type="button"
          onClick={() => {
            setOpen(true)
            requestAnimationFrame(() => input.current?.focus())
          }}
          className="text-[14px] font-medium text-black/70 underline-offset-4 transition-colors hover:text-black hover:underline"
        >
          Already sponsoring? Manage or cancel
        </button>
      ) : (
        <div className="manage-in w-full max-w-lg rounded-[20px] border border-black bg-white p-4">
          {state.kind === 'sent' ? (
            <p role="status" className="text-[15px] leading-[1.4] font-medium">
              If that email has a monthly sponsorship, Dodo Payments has sent it a link to manage or cancel. Check your inbox.
            </p>
          ) : (
            <form onSubmit={submit} className="flex flex-col gap-2 sm:flex-row" noValidate>
              <label className="sr-only" htmlFor="manage-email">
                The email you sponsored with
              </label>
              <input
                ref={input}
                id="manage-email"
                type="email"
                autoComplete="email"
                placeholder="The email you sponsored with"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 min-w-0 flex-1 rounded-full border border-black bg-white px-5 text-[15px] font-medium placeholder:text-black/35 focus:shadow-[3px_3px_0_0_#000] focus:outline-none"
              />
              <button type="submit" disabled={!valid || state.kind === 'sending'} className={cn(FILLED, 'h-11 px-5 text-[13px] disabled:opacity-40')}>
                {state.kind === 'sending' ? 'Sending…' : 'Email me a link'}
              </button>
            </form>
          )}
          {state.kind === 'error' && <p className="mt-2 px-1 text-[13px] font-medium text-slush-ember">{state.message}</p>}
        </div>
      )}
    </div>
  )
}

async function startManage(email: string): Promise<{ kind: 'sent' } | { kind: 'error'; message: string }> {
  const res = await requestManageLink(email)
  return res.ok ? { kind: 'sent' } : { kind: 'error', message: res.message }
}
