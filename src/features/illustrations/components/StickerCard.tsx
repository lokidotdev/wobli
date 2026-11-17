import { Link } from '@tanstack/react-router'
import { memo } from 'react'
import type { Style } from 'wobli'
import { cn } from '~/shared/lib/cn'
import type { Illustration } from '../schemas/illustration.schema'
import { tagLabel } from '../lib/illustration'
import { LiveSticker } from './LiveSticker'

type Props = { illustration: Illustration; look?: Style; offset?: number; priority?: boolean; className?: string }

// the pastel ground a sticker sits on; picked from the slug, so a card keeps its colour however the grid is filtered
const WASH = ['bg-slush-sky', 'bg-slush-lavender', 'bg-slush-mist']
const washOf = (slug: string) => WASH[[...slug].reduce((n, c) => n + c.charCodeAt(0), 0) % WASH.length]

// A sticker-book card (DESIGN.md): white, 20px corners, a black hairline and no shadow; the sticker sits on a pastel wash.
// Memoised: a grid adds cards a page at a time, and the ones already there have nothing new to draw.
// content-visibility lets the browser skip layout and paint for cards far off screen, which is what keeps a long grid cheap.
export const StickerCard = memo(function StickerCard({ illustration, look, offset, priority, className }: Props) {
  return (
    <Link
      to="/illustrations/$slug"
      params={{ slug: illustration.slug }}
      className={cn(
        'group flex flex-col overflow-hidden rounded-[20px] border border-black bg-white text-black [contain-intrinsic-size:auto_26rem] [content-visibility:auto] transition-transform duration-200 ease-out hover:-translate-y-1',
        className,
      )}
    >
      <div className={cn('relative border-b border-black px-8 pt-10 pb-4', washOf(illustration.slug))}>
        <span className="absolute top-3 left-3 z-10 inline-flex h-7 items-center rounded-full border border-black bg-white px-3 text-[11px] slush-label">
          {illustration.category.name}
        </span>
        <LiveSticker illustration={illustration} look={look} offset={offset} priority={priority} sizes="(min-width: 640px) 300px, 80vw" className="transition-transform duration-300 ease-out group-hover:scale-105 group-hover:-rotate-3" />
      </div>
      <div className="flex items-center justify-between gap-3 px-5 py-4">
        <div className="min-w-0">
          <h3 className="truncate text-[20px] leading-[1.2] font-bold">{illustration.title}</h3>
          <p className="mt-1 truncate text-[13px] leading-4 font-medium text-[#4d4d4d]">{illustration.tags.slice(0, 3).map(tagLabel).join(' · ')}</p>
        </div>
        <span
          aria-hidden
          className="grid size-10 shrink-0 place-items-center rounded-full border border-black bg-white text-[18px] leading-none font-bold transition-colors duration-150 group-hover:bg-black group-hover:text-white"
        >
          +
        </span>
      </div>
    </Link>
  )
})
