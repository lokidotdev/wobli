// fun-isometric in React: one canvas sized by css, on the shared page clock, restyled and replayed without remounting.
import { useEffect, useRef } from 'react'
import { play } from './engine.ts'
import type { CSSProperties } from 'react'
import type { Icon, PlayOptions, Player } from './engine.ts'

type Props = PlayOptions & {
  icon: Icon
  replayOnHover?: boolean
  label?: string // accessible name, the icon's name by default
  className?: string
  style?: CSSProperties
}

export function Sticker({ icon, palette, line, depth, loop, offset, enter, replayOnHover, label, className, style }: Props) {
  const ref = useRef<HTMLCanvasElement>(null)
  const player = useRef<Player | null>(null)
  const opts = useRef<PlayOptions>({ palette, line, depth, loop, offset, enter })
  // kept current after every render (and before the effects below read it), so the player never restarts for a new option
  useEffect(() => {
    opts.current = { palette, line, depth, loop, offset, enter }
  })
  // a new icon starts a new player; options reach the running one through set(), so the entrance never replays
  useEffect(() => {
    if (!ref.current) return
    const p = play(ref.current, icon, opts.current)
    player.current = p
    return () => p.stop()
  }, [icon])
  // keyed on the palette's content, so an inline object does not repaint every render
  const tone = JSON.stringify(palette ?? null)
  useEffect(() => player.current?.set(opts.current), [tone, line, depth, loop, offset])
  return (
    <canvas
      ref={ref}
      role="img"
      aria-label={label ?? icon.name}
      className={className}
      style={{ display: 'block', width: '100%', aspectRatio: '1', ...style }}
      onPointerEnter={replayOnHover ? () => player.current?.replay() : undefined}
    />
  )
}
