import { useEffect, useEffectEvent, useRef } from 'react'
import type { Style } from 'wobli'
import { PAGE_SIZE } from '../schemas/illustration.schema'
import type { Illustration } from '../schemas/illustration.schema'
import { StickerCard } from './StickerCard'

type Props = {
  items: ReadonlyArray<Illustration>
  look?: Style
  /** Called as the end of the grid nears the viewport, for as long as it is given: pass it only while there is more to load. */
  onMore?: () => void
}

// Shows what it is handed and asks for the next page as the end nears the viewport, so the DOM and the requests grow with
// the scroll rather than with the catalogue.
export function IllustrationGrid({ items, look, onMore }: Props) {
  const more = useRef<HTMLDivElement>(null)
  const more$ = useEffectEvent(() => onMore?.())
  const hasMore = !!onMore
  useEffect(() => {
    if (!hasMore || !more.current) return
    // re-observed after every page, so a tall screen keeps filling until the sentinel is pushed out of reach
    const io = new IntersectionObserver(([e]) => e?.isIntersecting && more$(), { rootMargin: '800px' })
    io.observe(more.current)
    return () => io.disconnect()
  }, [hasMore, items.length]) // more$ is an effect event: always the latest onMore, never a dependency
  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item, i) => (
          <StickerCard key={item.slug} illustration={item} look={look} offset={(i % PAGE_SIZE) * 20} priority={i < 3} />
        ))}
      </div>
      {hasMore && <div ref={more} aria-hidden className="h-px" />}
    </>
  )
}
