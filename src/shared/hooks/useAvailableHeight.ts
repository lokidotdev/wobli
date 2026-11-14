import { useEffect, useRef } from 'react'

/**
 * Keeps a sticky panel exactly as tall as the room it has: from wherever its top edge currently sits down to `gap` px
 * above the bottom of the viewport. Before it sticks (its top is still far down the screen) it is short; once stuck it
 * fills the column. Publishes the figure as `--avail` on the element, so pair it with `max-h-[var(--avail,<fallback>)]`.
 */
export function useAvailableHeight<T extends HTMLElement>(gap = 20) {
  const ref = useRef<T>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    let frame = 0
    const measure = () => {
      frame = 0
      if (!el.offsetParent) return // hidden (below the breakpoint): nothing to size
      // near the end of its column a sticky box is carried above its offset; it must not grow to fill that
      const stuck = parseFloat(getComputedStyle(el).top) || 0
      const top = Math.max(el.getBoundingClientRect().top, stuck)
      el.style.setProperty('--avail', `${Math.max(0, Math.round(window.innerHeight - gap - top))}px`)
    }
    const queue = () => {
      frame ||= requestAnimationFrame(measure)
    }
    measure()
    window.addEventListener('scroll', queue, { passive: true })
    window.addEventListener('resize', queue)
    // content above can change height (filters, results) and move the panel without a scroll
    const ro = new ResizeObserver(queue)
    ro.observe(document.body)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', queue)
      window.removeEventListener('resize', queue)
      ro.disconnect()
    }
  }, [gap])
  return ref
}
