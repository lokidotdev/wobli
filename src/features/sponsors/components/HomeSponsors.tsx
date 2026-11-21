import type { ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { cn } from '~/shared/lib/cn'
import { AvatarGroup } from '~/shared/ui/AvatarGroup'
import type { AvatarGroupMember } from '~/shared/ui/AvatarGroup'
import { hasSponsors, sponsorsQuery } from '../lib/data'
import type { SponsorsPage } from '../lib/data'

// The landing page's sponsor pieces: a "Backed by" badge in the hero and a closing band. Both show sponsors only once there
// are some; until then each is just a "Become a sponsor" button.

/** The one thing both pieces show while there are no sponsors. */
function BecomeSponsor({ className }: { className?: string }) {
  return (
    <Link
      to="/sponsors"
      className={cn(
        'group inline-flex h-12 items-center gap-2 rounded-full border border-black bg-white px-6 text-[13px] text-black slush-label transition-[background-color,scale] duration-150 hover:bg-slush-mist active:scale-[0.97] motion-reduce:active:scale-100',
        className,
      )}
    >
      Become a sponsor
      <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-0.5">
        →
      </span>
    </Link>
  )
}

/** Everyone the badge shows: tier sponsors top tier first, then platform sponsors. */
const badgeMembers = (data: SponsorsPage): AvatarGroupMember[] => [
  ...data.tiers.flatMap((t) => t.sponsors.map((s) => ({ id: `s${s.id}`, name: s.name, src: s.logoUrl ?? undefined, href: s.website ?? undefined }))),
  ...data.platform.map((p) => ({ id: `p${p.name}`, name: p.name, src: p.logoUrl, href: p.href })),
]

export function BackedBy({ className }: { className?: string }) {
  const data = useQuery(sponsorsQuery()).data
  if (!data) return null
  if (!hasSponsors(data)) return <BecomeSponsor className={className} />

  return (
    <div className={cn('inline-flex h-12 items-center gap-3 rounded-full border border-black bg-white pr-1.5 pl-5', className)}>
      <Link to="/sponsors" className="text-[12px] text-black/60 slush-label transition-colors hover:text-black">
        Backed by
      </Link>
      <span aria-hidden className="h-5 w-px bg-black/20" />
      <AvatarGroup members={badgeMembers(data)} max={5} size="md" fit="contain" tone="bg-slush-sunburst text-black" ring="ring-white" label="Sponsors" />
    </div>
  )
}

// ── The landing page's closing band ─────────────────────────────────────────────────────────────────────────────────
// The top two tiers (Diamond and Gold by default, whose perks promise a homepage logo), then the platform sponsors.
// A group shows once it has a sponsor, and ends in a dashed "Your logo here" tile while it has room.

const CARD = 'flex w-full items-center justify-center rounded-[20px] border border-black bg-white'
const LABEL_TINT = ['bg-slush-sunburst', 'bg-slush-blue', 'bg-slush-lavender']

const HOME_TIERS = 2
// Rows are centred, so a part-filled row sits in the middle like a full one. Widths: halves for the top tier, quarters
// (halves on phones) for the next, thirds for platform sponsors; 0.75rem is the gap.
const TOP = 'w-full sm:w-[calc((100%-0.75rem)/2)]'
const REST = 'w-[calc((100%-0.75rem)/2)] sm:w-[calc((100%-2.25rem)/4)]'
const THIRD = 'w-full sm:w-[calc((100%-1.5rem)/3)]'

export function HomeSponsors() {
  const data = useQuery(sponsorsQuery()).data
  if (!data) return null
  // only groups that have someone in them; with nobody at all, just the button
  const tiers = data.tiers.slice(0, HOME_TIERS).filter((t) => t.sponsors.length > 0)
  if (!tiers.length && !data.platform.length) {
    return (
      <section aria-label="Sponsors" className="flex justify-center border-t border-black bg-white py-16">
        <BecomeSponsor />
      </section>
    )
  }

  return (
    <section aria-labelledby="home-sponsors" className="border-t border-black bg-white">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col items-center gap-12 px-4 py-16 sm:px-8 sm:py-24 lg:px-12">
        <h2 id="home-sponsors" className="max-w-4xl text-center text-[clamp(2.5rem,7vw,5.5rem)] text-balance slush-display">
          wobli is backed by the finest
        </h2>

        {tiers.map((tier, i) => (
          <Group key={tier.id} title={tier.name} tint={LABEL_TINT[i % LABEL_TINT.length]!} tilt={i % 2 ? 'rotate-1' : '-rotate-1'}>
            <ul className="flex w-full flex-wrap justify-center gap-3">
              {tier.sponsors.map((s) => (
                <li key={s.id} className={i === 0 ? TOP : REST}>
                  <Tile href={s.website} title={s.name} className={i === 0 ? 'h-44' : 'h-28'}>
                    {s.logoUrl ? (
                      <img src={s.logoUrl} alt={s.name} className={cn('object-contain', i === 0 ? 'max-h-16 max-w-[60%]' : 'max-h-9 max-w-[70%]')} />
                    ) : (
                      <span className={cn('slush-display', i === 0 ? 'text-[44px]' : 'text-[24px]')}>{s.name}</span>
                    )}
                  </Tile>
                </li>
              ))}
              {tier.spotsLeft !== 0 && (
                <li className={i === 0 ? TOP : REST}>
                  <YourLogo className={i === 0 ? 'h-44' : 'h-28'} />
                </li>
              )}
            </ul>
          </Group>
        ))}

        {data.platform.length > 0 && (
          <Group title="Platform sponsors" tint="bg-slush-mint" tilt="rotate-1">
            <ul className="flex w-full flex-wrap justify-center gap-3">
              {data.platform.map((p) => (
                <li key={p.name} className={THIRD}>
                  <Tile href={p.href} title={p.name} className="h-36 flex-col gap-3">
                    <img src={p.logoUrl} alt={p.name} className="max-h-10 max-w-[60%] object-contain" />
                    {p.label && <span className="text-[11px] text-black/55 slush-label">{p.label}</span>}
                  </Tile>
                </li>
              ))}
              <li className={THIRD}>
                <YourLogo className="h-36" />
              </li>
            </ul>
          </Group>
        )}

        <Link
          to="/sponsors"
          className="inline-flex h-12 items-center gap-2 rounded-full border border-black bg-black px-6 text-[14px] text-white slush-label transition-colors duration-150 hover:bg-black/80 active:scale-[0.97] motion-reduce:active:scale-100"
        >
          Become a sponsor →
        </Link>
      </div>
    </section>
  )
}

function Group({ title, tint, tilt, children }: { title: string; tint: string; tilt: string; children: ReactNode }) {
  return (
    <div className="flex w-full max-w-5xl flex-col items-center gap-5">
      <h3 className={cn('rounded-full border border-black px-4 py-1.5 text-[13px] slush-label', tint, tilt)}>{title}</h3>
      {children}
    </div>
  )
}

function Tile({ href, title, className, children }: { href: string | null; title: string; className: string; children: ReactNode }) {
  return href ? (
    <a
      href={href}
      target="_blank"
      rel="noreferrer sponsored"
      title={title}
      className={cn(CARD, 'transition-[box-shadow,translate] duration-150 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_#000]', className)}
    >
      {children}
    </a>
  ) : (
    <div className={cn(CARD, className)}>{children}</div>
  )
}

function YourLogo({ className }: { className: string }) {
  return (
    <Link
      to="/sponsors"
      className={cn(
        'group flex w-full items-center justify-center gap-2 rounded-[20px] border border-dashed border-black/40 text-[13px] text-black/55 slush-label transition-[background-color,color,border-color] duration-150 hover:border-black hover:bg-slush-mist/50 hover:text-black',
        className,
      )}
    >
      <span aria-hidden className="text-[18px] transition-transform duration-200 group-hover:rotate-90">
        +
      </span>
      Your logo here
    </Link>
  )
}
