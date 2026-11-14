import { useEffect, useRef, useState } from 'react'

/** Where on the screen a section counts as "being read": just under the floating nav. */
const READING_LINE = 120

/**
 * How far the reader is through a list of sections, for the thread in the docs sidebar. The whole number is the section
 * being read (state: it only changes at a boundary); the fraction is how far through it they are, written straight to
 * `--thread` (0 to 1 across the whole list) on the element holding `ref`, so scrolling never re-renders the page.
 */
export function useThread<T extends HTMLElement | SVGElement>(ids: ReadonlyArray<string>) {
  const ref = useRef<T>(null)
  const [active, setActive] = useState(0)
  useEffect(() => {
    let frame = 0
    const measure = () => {
      frame = 0
      const tops = ids.map((id) => document.getElementById(id)?.getBoundingClientRect().top ?? Infinity)
      const last = tops.length - 1
      let at = 0
      // the end of the page reads as the last section, however short it is
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) at = last
      else {
        let i = 0
        while (i < last && tops[i + 1]! <= READING_LINE) i++
        const span = i < last ? tops[i + 1]! - tops[i]! : 0
        at = i + (span > 0 ? Math.min(1, Math.max(0, (READING_LINE - tops[i]!) / span)) : 0)
      }
      ref.current?.style.setProperty('--thread', String(last > 0 ? at / last : 0))
      setActive(Math.floor(at + 0.001))
    }
    const queue = () => {
      frame ||= requestAnimationFrame(measure)
    }
    measure()
    window.addEventListener('scroll', queue, { passive: true })
    window.addEventListener('resize', queue)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', queue)
      window.removeEventListener('resize', queue)
    }
  }, [ids])
  return { ref, active }
}
