import { Link, useRouterState } from '@tanstack/react-router'
import { useEffect, useId, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { site } from '~/shared/config/site'
import { cn } from '~/shared/lib/cn'
import { GitHubMark, GitHubStar } from './GitHubStar'
import { Logo, useLogoShuffle } from './Logo'

// The sticker-book chrome (DESIGN.md): a floating pill nav and a black footer ending in the wordmark, around
// pages built from full-bleed colour bands. Everything inside `.slush` is light, outlined in black and pill-shaped: the
// class re-points the shared tokens (app.css), so shared controls dropped into these pages take the look on their own.

export const PILL = 'inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-full border border-black slush-label transition-colors duration-150'
export const GHOST = cn(PILL, 'bg-white text-black hover:bg-slush-mist')
export const FILLED = cn(PILL, 'bg-black text-white hover:bg-black/80')
export const SM = 'h-10 px-4 text-[12px] sm:text-[13px]'
export const LG = 'h-12 px-6 text-[14px]'
// GitHubStar is a Geist button underneath: these win over its own box
const STAR = 'rounded-full! border border-black font-bold! tracking-[0.032em] uppercase shadow-none!'
export const STAR_GHOST = cn(STAR, 'bg-white! text-black! hover:bg-slush-mist!')
export const STAR_FILLED = cn(STAR, 'bg-black! text-white! hover:bg-black/80!')

export const BAND = 'mx-auto w-full max-w-[1440px] px-4 sm:px-8 lg:px-12'

// The nav name's letters, while the logo shuffles: each pops up as a sticker in turn (.nav-letter, app.css)
const NAME_COLOURS = ['var(--color-slush-sunburst)', 'var(--color-slush-blue)', 'var(--color-slush-mint)', 'var(--color-slush-ember)', 'var(--color-slush-lavender)']
const NAME_TILT = [-8, 6, -5, 9, -6]

// Floating pills: logo left, nav centre, the one filled CTA right. No bar behind them, so every band shows through.
function Nav() {
  const shuffle = useLogoShuffle()
  return (
    <header className="sticky top-0 z-40 -mb-[72px] h-[72px]">
      <div className={cn(BAND, 'flex h-full items-center justify-between gap-2')}>
        <Link to="/" aria-label={`${site.name} home`} className={cn(GHOST, 'h-10 gap-2 px-2.5 text-[13px] normal-case sm:pr-4')} {...shuffle}>
          <Logo className="size-5" />
          <span className="text-[16px] tracking-[-0.02em] max-sm:sr-only">
            {[...site.name].map((ch, i) => (
              <span key={i} className="nav-letter" style={{ '--c': NAME_COLOURS[i % NAME_COLOURS.length], '--r': `${NAME_TILT[i % NAME_TILT.length]}deg`, '--i': i } as CSSProperties}>
                {ch}
              </span>
            ))}
          </span>
        </Link>
        <nav aria-label="Main" className="flex items-center gap-1 max-sm:hidden">
          <Link to="/illustrations" className={cn(GHOST, SM, 'slush-pill')} style={{ '--c': 'var(--color-slush-sunburst)', '--r': '-4deg' } as CSSProperties}>
            Illustrations
          </Link>
          <Link to="/docs" className={cn(GHOST, SM, 'slush-pill')} style={{ '--c': 'var(--color-slush-mint)', '--r': '3deg' } as CSSProperties}>
            Docs
          </Link>
          <Link to="/how-its-made" className={cn(GHOST, SM, 'slush-pill')} style={{ '--c': 'var(--color-slush-lavender)', '--r': '-3deg' } as CSSProperties}>
            How It&rsquo;s Made
          </Link>
        </nav>
        <GitHubStar compact size="md" label="Star" className={cn(STAR_FILLED, 'slush-pill text-[13px]! [--c:var(--color-slush-blue)] [--r:-3deg] hover:text-black! focus-visible:text-black! max-sm:hidden')} />
        <PhoneMenu />
      </div>
    </header>
  )
}

// A phone has no room for the pill row, so every link moves into one menu: at most four rows, big enough to hit with a thumb.
const MENU = [
  { to: '/illustrations', label: 'Illustrations', fill: 'bg-slush-sunburst', tilt: '-1.5deg' },
  { to: '/docs', label: 'Docs', fill: 'bg-slush-mint', tilt: '1.5deg' },
  { to: '/how-its-made', label: 'How It\u2019s Made', fill: 'bg-slush-lavender', tilt: '-1deg' },
] as const
const ROW = 'menu-row flex h-16 items-center justify-between rounded-[22px] border border-black px-5 text-[26px] slush-display'

/**
 * Below sm: the logo stays, everything else sits behind a Menu pill. The panel grows out of the pill (spatial: it belongs to
 * that button) and the rows follow it in, one after another. Closes on a pick, a route change, Escape or a tap outside.
 */
function PhoneMenu() {
  const [open, setOpen] = useState(false)
  const id = useId()
  const root = useRef<HTMLDivElement>(null)
  const button = useRef<HTMLButtonElement>(null)
  const path = useRouterState({ select: (s) => s.location.pathname })
  useEffect(() => setOpen(false), [path])
  useEffect(() => {
    if (!open) return
    const down = (e: PointerEvent) => !root.current?.contains(e.target as Node) && setOpen(false)
    const key = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setOpen(false)
      button.current?.focus()
    }
    document.addEventListener('pointerdown', down)
    document.addEventListener('keydown', key)
    return () => {
      document.removeEventListener('pointerdown', down)
      document.removeEventListener('keydown', key)
    }
  }, [open])
  return (
    <div ref={root} className="sm:hidden">
      <button
        ref={button}
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        className={cn(open ? FILLED : GHOST, SM, 'relative z-10 gap-2.5 pr-3.5 pl-4 active:scale-[0.96] motion-reduce:active:scale-100')}
      >
        {open ? 'Close' : 'Menu'}
        <span aria-hidden data-open={open} className="menu-icon relative block h-2.5 w-4">
          <span />
          <span />
        </span>
      </button>
      <div id={id} data-open={open} inert={!open} className={cn('menu-panel absolute inset-x-4 top-[64px] flex flex-col gap-2 rounded-[30px] border border-black bg-white p-2')}>
        <nav aria-label="Main" className="contents">
          {MENU.map((m, i) => (
            <Link
              key={m.to}
              to={m.to}
              onClick={() => setOpen(false)}
              className={cn(ROW, m.fill)}
              style={{ '--i': i, '--r': m.tilt } as CSSProperties}
              activeProps={{ 'aria-current': 'page' }}
            >
              {m.label}
              <Arrow />
            </Link>
          ))}
          <a href={`https://github.com/${site.repo}`} target="_blank" rel="noreferrer" aria-label="Star on GitHub" className={cn(ROW, 'bg-black text-white')} style={{ '--i': MENU.length, '--r': '1deg' } as CSSProperties}>
            <span className="flex items-center gap-3">
              <span className="[&_svg]:size-6">
                <GitHubMark />
              </span>
              GitHub
              <span aria-hidden className="text-slush-sunburst">★</span>
            </span>
            <Arrow dark />
          </a>
        </nav>
      </div>
    </div>
  )
}

function Arrow({ dark }: { dark?: boolean }) {
  return (
    <span aria-hidden className={cn('grid size-9 place-items-center rounded-full border text-[18px] leading-none font-bold', dark ? 'border-white bg-white text-black' : 'border-black bg-white')}>
      →
    </span>
  )
}

const creator = [
  { href: 'https://designeng.tools', label: 'designeng.tools' },
  { href: 'https://oxyn.space', label: 'oxyn.space' },
]
const FOOT_LINK = 'w-fit text-[15px] font-medium text-white/70 transition-colors duration-150 hover:text-white'

function FootNav({ label, title, children }: { label: string; title: string; children: ReactNode }) {
  return (
    <nav aria-label={label} className="flex flex-col gap-3">
      <h2 className="text-[12px] text-white slush-label">{title}</h2>
      {children}
    </nav>
  )
}

function Foot() {
  return (
    <footer className="overflow-hidden bg-black text-white">
      <div className={cn(BAND, 'pt-16 sm:pt-20')}>
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <p className="max-w-md text-[24px] leading-[1.2] font-medium tracking-[-0.01em]">{site.description}</p>
          <div className="grid grid-cols-2 gap-x-12 gap-y-8 sm:grid-cols-3">
            <FootNav label="Footer" title="Product">
              <Link to="/illustrations" className={FOOT_LINK}>
                Illustrations
              </Link>
              <Link to="/docs" className={FOOT_LINK}>
                Docs
              </Link>
              <Link to="/how-its-made" className={FOOT_LINK}>
                How It&rsquo;s Made
              </Link>
              <Link to="/docs" hash="licence" className={FOOT_LINK}>
                Licence
              </Link>
            </FootNav>
            <FootNav label="More from the creator" title="More from the Creator">
              {creator.map((l) => (
                <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className={FOOT_LINK}>
                  {l.label}
                </a>
              ))}
            </FootNav>
            <FootNav label="Social" title="Follow">
              <a href="https://x.com/lokidotdev" target="_blank" rel="noreferrer" className={FOOT_LINK}>
                X (@lokidotdev)
              </a>
              <a href={`https://github.com/${site.repo}`} target="_blank" rel="noreferrer" className={FOOT_LINK}>
                GitHub
              </a>
            </FootNav>
          </div>
        </div>
        <p className="mt-14 text-[13px] font-medium text-white/60">
          © {new Date().getFullYear()} {site.name}.
        </p>
        {/* the wordmark as a slab, cropped by the bottom edge of the page */}
        <p aria-hidden data-wordmark className="mt-6 -mb-[0.14em] text-center text-[22vw] text-white slush-display min-[1440px]:text-[317px]">
          {site.name}
        </p>
      </div>
    </footer>
  )
}

/** The page shell for sticker-book pages: nav, the page's own colour bands, footer. */
export function SlushLayout({ children }: { children: ReactNode }) {
  return (
    <div className="slush overflow-x-clip">
      <Nav />
      <main>{children}</main>
      <Foot />
    </div>
  )
}
