import { useEffect, useRef } from 'react'
import type { CSSProperties } from 'react'

const FADE = 40 // px of fade at an edge that has content beyond it

/** Fades a scroller's top and bottom edges only while there is more to scroll that way. Spread `style` on the scroller. */
export function useScrollFade<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => {
      const top = Math.min(el.scrollTop, FADE)
      const bottom = Math.min(el.scrollHeight - el.clientHeight - el.scrollTop, FADE)
      el.style.setProperty('--fade-top', `${Math.max(0, top)}px`)
      el.style.setProperty('--fade-bottom', `${Math.max(0, bottom)}px`)
    }
    update()
    el.addEventListener('scroll', update, { passive: true })
    const ro = new ResizeObserver(update)
    ro.observe(el)
    for (const c of el.children) ro.observe(c)
    return () => {
      el.removeEventListener('scroll', update)
      ro.disconnect()
    }
  }, [])
  const mask = 'linear-gradient(to bottom, transparent, #000 var(--fade-top, 0px), #000 calc(100% - var(--fade-bottom, 0px)), transparent)'
  const style: CSSProperties = { maskImage: mask, WebkitMaskImage: mask }
  return { ref, style }
}
