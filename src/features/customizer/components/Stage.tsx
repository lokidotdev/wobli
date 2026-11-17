import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { FPS, paint } from 'wobli'
import type { Icon, Style } from 'wobli'
import { cn } from '~/shared/lib/cn'
import { IconButton } from '~/shared/ui/IconButton'
import { Pause, Play } from '~/shared/ui/icons'
import { backgroundColor } from '~/features/style'
import type { Background } from '~/features/style'

export type StageHandle = { currentFrame: () => number }
type Props = { icon: Icon; look: Style; bg: Background; speed: number; loop: boolean; label: string; className?: string }

/**
 * The editor's canvas. Unlike the grid, it keeps its own playhead: play, pause, scrub and speed belong to this sticker only.
 * It paints with paint() each frame while playing, and once on any change while paused. Reduced motion starts paused on the
 * icon's still frame; play still works when asked for.
 */
export const Stage = forwardRef<StageHandle, Props>(function Stage({ icon, look, bg, speed, loop, label, className }, ref) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const scrub = useRef<HTMLInputElement>(null)
  const time = useRef<HTMLOutputElement>(null)
  const frame = useRef(0)
  const dirty = useRef(true)
  const [playing, setPlaying] = useState(true)
  // what the animation loop reads each frame; refreshed after every render so the loop itself never restarts
  const latest = useRef({ icon, look, speed, loop, playing })
  useEffect(() => {
    latest.current = { icon, look, speed, loop, playing }
  })
  useImperativeHandle(ref, () => ({ currentFrame: () => frame.current }), [])

  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      frame.current = icon.still ?? 0
      setPlaying(false)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => void (dirty.current = true), [icon, look])

  useEffect(() => {
    let [raf, last] = [0, 0]
    const ro = new ResizeObserver(() => (dirty.current = true))
    if (canvas.current) ro.observe(canvas.current)
    const tick = (now: number) => {
      const dt = last ? Math.min(100, now - last) : 0
      last = now
      const state = latest.current
      if (state.playing) {
        frame.current += (dt / 1000) * FPS * state.speed
        if (!state.loop && frame.current >= state.icon.frames) {
          frame.current = state.icon.still ?? 0
          setPlaying(false)
        }
        frame.current %= state.icon.frames
        dirty.current = true
      }
      if (dirty.current && canvas.current) {
        paint(canvas.current, state.icon, frame.current, 1, state.look)
        if (scrub.current) {
          scrub.current.value = String(Math.floor(frame.current))
          scrub.current.style.setProperty('--fill', `${(frame.current / (state.icon.frames - 1)) * 100}%`)
        }
        if (time.current) time.current.textContent = `${(frame.current / FPS).toFixed(1)}s`
        dirty.current = false
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => (cancelAnimationFrame(raf), ro.disconnect())
  }, [])

  const toggle = () => {
    if (!playing && !loop && frame.current >= (icon.still ?? 0) - 1) frame.current = 0 // play once replays from the top
    setPlaying((p) => !p)
  }

  return (
    // one sticker-book card (DESIGN.md): the drawing on top, its transport under a black hairline
    <div className={cn('flex flex-col overflow-hidden rounded-[30px] border border-black bg-white', className)}>
      <div className={cn('relative transition-colors duration-300', bg === 'none' && 'checker')} style={{ background: backgroundColor(bg) }}>
        <canvas
          ref={canvas}
          role="img"
          aria-label={label}
          tabIndex={0}
          onKeyDown={(e) => e.key === ' ' && (e.preventDefault(), toggle())}
          className="mx-auto block aspect-square w-full max-w-[min(100%,72dvh)] outline-none"
        />
      </div>
      <div className="flex items-center gap-3 border-t border-black py-3 pr-5 pl-3">
        <IconButton label={playing ? 'Pause Animation' : 'Play Animation'} size="md" tone="solid" onClick={toggle}>
          {playing ? <Pause className="size-4.5" /> : <Play className="size-4.5 translate-x-px" />}
        </IconButton>
        <input
          ref={scrub}
          type="range"
          aria-label="Frame"
          min={0}
          max={icon.frames - 1}
          step={1}
          defaultValue={0}
          onPointerDown={() => setPlaying(false)}
          onInput={(e) => {
            frame.current = Number(e.currentTarget.value)
            dirty.current = true
            setPlaying(false)
          }}
          className="range flex-1"
          style={{ ['--fill' as string]: '0%' }}
        />
        <output ref={time} className="w-12 shrink-0 text-right font-mono text-[13px] font-medium tabular-nums text-label">
          0.0s
        </output>
      </div>
    </div>
  )
})
