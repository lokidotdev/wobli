import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import type { CSSProperties } from 'react'
import { LiveSticker, illustrationQuery } from '~/features/illustrations'
import { useGlobalLook } from '~/features/style'
import { cn } from '~/shared/lib/cn'
import { BAND, FILLED, GHOST, LG } from '~/shared/ui/SlushChrome'

/** The catalogue's own "No Results" drawing stands in for the 0. */
const ZERO = 'no-results'

// The 404, as a sticker-book page (DESIGN.md): one sky band, crushed display type, and a live sticker standing in the type
// the way the landing headline's I does. The 4s turn into stickers under the pointer like every other headline letter.
export function NotFoundPage() {
  const look = useGlobalLook()
  // the band simply shows a plain 0 if the drawing cannot be loaded
  const { data: zero } = useQuery(illustrationQuery(ZERO))
  return (
    <section className="flex min-h-[100svh] flex-col overflow-x-clip bg-slush-sky pt-[72px]">
      <div className={cn(BAND, 'flex flex-1 flex-col items-center justify-center pt-10 pb-20 text-center sm:pt-6 sm:pb-24')}>
        <span className="inline-flex h-8 -rotate-[4deg] items-center rounded-full border border-black bg-slush-sunburst px-4 text-[12px] slush-label sm:h-10 sm:px-5 sm:text-[13px]">
          Error 404
        </span>

        <h1 aria-label="404, page not found" className="mt-4 text-[clamp(7rem,38vw,22rem)] slush-display">
          <span aria-hidden className="flex items-center justify-center whitespace-nowrap">
            <Letter ch="4" c="var(--color-slush-blue)" r={-7} />
            {zero ? (
              <span className="relative mx-[-0.06em] inline-block w-[0.86em] rotate-[6deg] self-center">
                <LiveSticker illustration={zero} look={look} enter={0.2} priority sizes="(min-width: 640px) 300px, 34vw" />
              </span>
            ) : (
              <Letter ch="0" c="var(--color-slush-mint)" r={5} />
            )}
            <Letter ch="4" c="var(--color-slush-ember)" r={8} />
          </span>
        </h1>

        <p className="mt-2 text-[clamp(1.75rem,5vw,3.25rem)] slush-display">This page peeled off</p>
        <p className="mt-4 max-w-md text-[18px] leading-[1.3] font-medium tracking-[-0.01em] text-balance sm:text-[20px]">
          The link may be old, or the page has moved. Every illustration is still in the catalogue.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          <Link to="/illustrations" className={cn(FILLED, LG, 'slush-pill [--c:var(--color-slush-sunburst)] [--r:-2deg] hover:text-black focus-visible:text-black')}>
            Browse Illustrations
          </Link>
          <Link to="/" className={cn(GHOST, LG, 'slush-pill [--c:var(--color-slush-mint)] [--r:2deg]')}>
            Back Home
          </Link>
        </div>
      </div>
    </section>
  )
}

/** A headline letter that becomes a sticker under the pointer (.slush-letter, app.css). */
function Letter({ ch, c, r }: { ch: string; c: string; r: number }) {
  return (
    <span className="slush-letter" style={{ '--c': c, '--r': `${r}deg` } as CSSProperties}>
      {ch}
    </span>
  )
}
