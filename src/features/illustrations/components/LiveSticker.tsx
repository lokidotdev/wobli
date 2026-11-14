import { useEffect, useRef, useState } from 'react'
import { Sticker } from 'wobli/react'
import type { Style } from 'wobli'
import { useInView } from '~/shared/hooks/useInView'
import { cn } from '~/shared/lib/cn'
import { useLazyIcon } from '../hooks/useIcon'
import { illustrationLabel } from '../lib/illustration'
import type { Illustration } from '../schemas/illustration.schema'

// Posters bundled with the site also come as WebP at 300px and 600px (`pnpm posters` makes them). The browser picks between
// them from `sizes`, the width the sticker is drawn at, so each place that draws one says how wide it is: a small pin on a
// phone fetches the 300, a full-width card on a 2× screen the 600. Posters served by the API are left as they are.
const LOCAL_POSTER = /^\/posters\/([^/]+)\.png$/
const DEFAULT_SIZES = '300px'
function posterSrcSet(poster: string, sizes: string) {
  const slug = LOCAL_POSTER.exec(poster)?.[1]
  if (!slug) return {}
  return { srcSet: `/posters/${slug}-300.webp 300w, /posters/${slug}.webp 600w`, sizes }
}

type Props ={ illustration: Illustration; look?: Style; offset?: number; enter?: number; priority?: boolean; sizes?: string; className?: string }

// The server sends the poster. Near the viewport the drawing's chunk loads and the live canvas mounts over the poster, which
// steps away once the canvas has painted (the engine sizes the canvas on its first paint, so watching the width attribute tells
// us exactly when). Scrolled far away, the canvas unmounts again: a grid of hundreds holds only the canvases around the screen.
export function LiveSticker({ illustration, look, offset, enter, priority, sizes = DEFAULT_SIZES, className }: Props) {
  const box = useRef<HTMLDivElement>(null)
  const near = useInView(box, '400px')
  const icon = useLazyIcon(illustration, near)
  const mounted = near && !!icon
  const [live, setLive] = useState(false)
  useEffect(() => {
    if (!mounted) return setLive(false)
    const canvas = box.current?.querySelector('canvas')
    if (!canvas) return
    const mo = new MutationObserver(() => (setLive(true), mo.disconnect()))
    mo.observe(canvas, { attributes: true, attributeFilter: ['width'] })
    return () => mo.disconnect()
  }, [mounted])
  return (
    <div ref={box} className={cn('relative aspect-square', className)}>
      <img
        src={illustration.poster}
        {...posterSrcSet(illustration.poster, sizes)}
        alt=""
        width={600}
        height={600}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        aria-hidden
        className={cn('absolute inset-0 size-full transition-opacity duration-200', live && 'opacity-0')}
      />
      {mounted && (
        <Sticker
          icon={icon}
          palette={look?.palette}
          line={look?.line}
          depth={look?.depth}
          offset={offset}
          enter={enter}
          label={illustrationLabel(illustration.title)}
          className="relative"
        />
      )}
    </div>
  )
}
