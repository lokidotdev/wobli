import { Link } from '@tanstack/react-router'
import type { CSSProperties, ReactNode } from 'react'
import { site } from '~/shared/config/site'
import { cn } from '~/shared/lib/cn'
import { GitHubStar } from './GitHubStar'
import { Logo } from './Logo'

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

// Floating pills: logo left, nav centre, the one filled CTA right. No bar behind them, so every band shows through.
function Nav() {
  return (
    <header className="sticky top-0 z-40 -mb-[72px] h-[72px]">
      <div className={cn(BAND, 'flex h-full items-center justify-between gap-2')}>
        <Link to="/" aria-label={`${site.name} home`} className={cn(GHOST, 'h-10 gap-2 px-2.5 text-[13px] normal-case sm:pr-4')}>
          <Logo className="size-5" />
          <span className="text-[16px] tracking-[-0.02em] max-sm:sr-only">{site.name}</span>
        </Link>
        <nav aria-label="Main" className="flex items-center gap-1">
          <Link to="/illustrations" className={cn(GHOST, SM, 'slush-pill')} style={{ '--c': 'var(--color-slush-sunburst)', '--r': '-4deg' } as CSSProperties}>
            Illustrations
          </Link>
          <Link to="/docs" className={cn(GHOST, SM, 'slush-pill')} style={{ '--c': 'var(--color-slush-mint)', '--r': '3deg' } as CSSProperties}>
            Docs
          </Link>
          {/* a phone has room for two pills; the guide is in the footer there */}
          <Link to="/how-its-made" className={cn(GHOST, SM, 'slush-pill max-sm:hidden')} style={{ '--c': 'var(--color-slush-lavender)', '--r': '-3deg' } as CSSProperties}>
            How It&rsquo;s Made
          </Link>
        </nav>
        <GitHubStar compact size="md" label="Star" className={cn(STAR_FILLED, 'slush-pill text-[13px]! [--c:var(--color-slush-blue)] [--r:-3deg] hover:text-black! focus-visible:text-black!')} />
      </div>
    </header>
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
