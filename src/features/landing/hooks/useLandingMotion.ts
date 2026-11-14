import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useEffect } from 'react'
import type { RefObject } from 'react'

// The landing page's motion, all of it in one place. The page is a sticker book, so things move the way stickers do:
// they get slapped on with a little overshoot, cards are dealt onto the table, and loose stickers drift at their own
// speed as the page scrolls under them. Apart from the hero's entrance at load, everything is scrubbed to the scrollbar. Elements opt in with data attributes; nothing here runs under reduced motion,
// where the page is simply still.
//
//   data-pin="hero"            hero stickers: slapped on at load, then drift apart on scroll
//   data-pin="take-left|right" the closing stickers: fly in from the sides as the band arrives
//   data-hero-title            the headline: sinks back a little, so the stickers read as nearer
//   data-ribbon="hero|take"    the ribbon behind a headline: drawn along its own path, at load or as the band arrives
//   data-tag="hero|take"       the facts stuck on a headline: slapped on after it, one by one
//   data-lines > data-line     a stacked headline: lines land one after another
//   data-rise                  a small supporting element: rises into place
//   data-steps > data-step     the three steps: dealt in order, each with its sticker (data-step-sticker)
//   data-cards > data-card     the featured grid: dealt row by row
//   data-grow                  the closing headline: swells to full size as it reaches the middle of the screen
//   data-wordmark              the footer wordmark: rises out of the bottom edge
/**
 * How long a ribbon path is on screen, in CSS pixels. The ribbon's SVG stretches to its band (preserveAspectRatio none)
 * and its stroke does not scale, so dashes are measured on screen, not in the path's own units: getTotalLength alone
 * would be wrong on every screen that is not exactly the viewBox's shape.
 */
function screenLength(path: SVGPathElement) {
  const svg = path.ownerSVGElement
  if (!svg) return 0
  const box = svg.getBoundingClientRect()
  const view = svg.viewBox.baseVal
  const [sx, sy] = [box.width / view.width, box.height / view.height]
  const steps = polyline(path)
  let length = 0
  for (let i = 0; i < steps.length; i += 2) length += Math.hypot(steps[i]! * sx, steps[i + 1]! * sy)
  return Math.ceil(length * 1.02) // a little over, so the far end is never left a dash short
}

/**
 * The path as a polyline, in the path's own units, stored as the step between each pair of points (dx, dy, dx, dy…).
 * Measured once per path shape: the screen scale is applied afterwards, so a resize only multiplies. The ribbons are
 * one move and a run of absolute cubics, sampled here in plain maths; getPointAtLength walks the whole path on every
 * call, which froze the page for a second at load and again on every scroll refresh.
 */
const POLYLINES = new Map<string, Float64Array>()
function polyline(path: SVGPathElement) {
  const d = path.getAttribute('d') ?? ''
  let steps = POLYLINES.get(d)
  if (steps) return steps
  const n = d.match(/-?\d*\.?\d+(?:e[-+]?\d+)?/gi)?.map(Number) ?? []
  const SEG = 32
  const out: number[] = []
  if (/^\s*M[\s\d.,eE+-]*(C[\s\d.,eE+-]*)+$/.test(d) && n.length >= 8 && (n.length - 2) % 6 === 0) {
    let [x0, y0] = [n[0]!, n[1]!]
    for (let k = 2; k < n.length; k += 6) {
      const [x1, y1, x2, y2, x3, y3] = n.slice(k, k + 6) as [number, number, number, number, number, number]
      let [px, py] = [x0, y0]
      for (let s = 1; s <= SEG; s++) {
        const t = s / SEG
        const u = 1 - t
        const [a, b, c, e] = [u * u * u, 3 * u * u * t, 3 * u * t * t, t * t * t]
        const [x, y] = [a * x0 + b * x1 + c * x2 + e * x3, a * y0 + b * y1 + c * y2 + e * y3]
        out.push(x - px, y - py)
        ;[px, py] = [x, y]
      }
      ;[x0, y0] = [x3, y3]
    }
  } else {
    // any other shape: walk it with the browser, once
    const total = path.getTotalLength()
    let prev = path.getPointAtLength(0)
    for (let i = 1; i <= 240; i++) {
      const p = path.getPointAtLength((total * i) / 240)
      out.push(p.x - prev.x, p.y - prev.y)
      prev = p
    }
  }
  steps = Float64Array.from(out)
  POLYLINES.set(d, steps)
  return steps
}

export function useLandingMotion(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    // the page shell, so the footer's wordmark (outside the page's own bands) is in reach
    const el = root.current?.closest<HTMLElement>('.slush') ?? root.current
    if (!el) return
    gsap.registerPlugin(ScrollTrigger)
    const mm = gsap.matchMedia(el)

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const all = (sel: string, within: Element = el) => gsap.utils.toArray<HTMLElement>(sel, within)
      // every scroll animation is scrubbed: it plays with the scrollbar and runs backwards on the way up, eased over this long
      const SCRUB = 0.6

      // ── hero ──
      const heroPins = all('[data-pin="hero"]')
      // CSS holds these at opacity 0 until now, so there is no flash of the settled page before the stickers land
      gsap.fromTo(
        heroPins,
        { opacity: 0, scale: 0.2, rotation: (i) => (i % 2 ? 40 : -40) },
        { opacity: 1, scale: 1, rotation: 0, duration: 0.7, ease: 'back.out(2.2)', stagger: 0.09, delay: 0.1 },
      )
      // the ribbon unrolls behind the headline, then the tags are stuck on last
      // drawn along the path itself (one dash as long as the line, slid into view), so it loops and crosses over itself
      // the way a pen would, instead of being wiped in from the left
      for (const path of gsap.utils.toArray<SVGPathElement>('[data-ribbon="hero"] path', el)) {
        const length = screenLength(path)
        gsap.fromTo(
          path,
          { strokeDasharray: length, strokeDashoffset: length },
          // once drawn the dash is dropped, so a resize cannot leave the line short
          { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut', delay: 0.15, onComplete: () => void gsap.set(path, { clearProps: 'strokeDasharray,strokeDashoffset' }) },
        )
      }
      // CSS hides the ribbon until its dash is in place; show it now that nothing of the line is in view yet
      gsap.set(all('[data-ribbon="hero"]'), { opacity: 1 })
      gsap.fromTo(
        all('[data-tag="hero"]'),
        { opacity: 0, scale: 0, rotation: (i) => (i % 2 ? -50 : 50) },
        { opacity: 1, scale: 1, rotation: 0, duration: 0.55, ease: 'back.out(2.4)', stagger: 0.12, delay: 0.75 },
      )
      const hero = el.querySelector('[data-hero]')
      if (hero) {
        const scrub = { trigger: hero, start: 'top top', end: 'bottom top', scrub: SCRUB }
        // each sticker leaves at its own speed, outwards from the headline
        heroPins.forEach((pin, i) => {
          const side = i % 2 ? 1 : -1
          gsap.to(pin, { y: -(70 + i * 45), x: side * (30 + i * 12), ease: 'none', scrollTrigger: scrub })
        })
        gsap.to(all('[data-hero-title]'), { y: 90, scale: 0.94, ease: 'none', scrollTrigger: scrub })
      }

      // ── stacked headlines and their supporting lines ──
      for (const block of all('[data-lines]')) {
        gsap.from(all('[data-line]', block), {
          xPercent: -18,
          opacity: 0,
          ease: 'power2.out',
          stagger: 0.25,
          scrollTrigger: { trigger: block, start: 'top 92%', end: 'top 35%', scrub: SCRUB },
        })
      }
      for (const rise of all('[data-rise]')) {
        gsap.from(rise, { y: 50, opacity: 0, ease: 'power2.out', scrollTrigger: { trigger: rise, start: 'top 96%', end: 'top 70%', scrub: SCRUB } })
      }

      // ── the three steps, dealt in order ──
      for (const steps of all('[data-steps]')) {
        const tl = gsap.timeline({ scrollTrigger: { trigger: steps, start: 'top 95%', end: 'top 35%', scrub: SCRUB } })
        all('[data-step]', steps).forEach((step, i) => {
          const at = i * 0.16
          tl.from(step, { y: 140, rotation: [-7, 5, -5][i % 3], opacity: 0, duration: 0.75, ease: 'back.out(1.5)' }, at)
          tl.from(all('[data-step-sticker]', step), { scale: 0, rotation: 60, duration: 0.6, ease: 'back.out(2.4)' }, at + 0.35)
        })
      }

      // ── the featured grid ──
      for (const grid of all('[data-cards]')) {
        // each card is tied to its own place on the page, and a card further along its row lands a little later
        all('[data-card]', grid).forEach((card, i) => {
          const late = (i % 4) * 4
          gsap.from(card, {
            y: 110,
            opacity: 0,
            rotation: i % 2 ? 4 : -4,
            ease: 'back.out(1.4)',
            scrollTrigger: { trigger: card, start: `top ${100 - late}%`, end: `top ${72 - late}%`, scrub: SCRUB },
          })
        })
      }

      // ── the closing band ──
      for (const grow of all('[data-grow]')) {
        const scrub = { trigger: grow, start: 'top bottom', end: 'center 55%', scrub: SCRUB }
        gsap.from(grow, { scale: 0.55, ease: 'none', scrollTrigger: scrub })
        const band = grow.parentElement ?? el
        gsap.from(all('[data-pin="take-left"]', band), { xPercent: -220, rotation: -70, ease: 'none', scrollTrigger: scrub })
        gsap.from(all('[data-pin="take-right"]', band), { xPercent: 220, rotation: 70, ease: 'none', scrollTrigger: scrub })
        // scrubbed, so the length is measured again whenever the layout is (invalidateOnRefresh)
        for (const path of gsap.utils.toArray<SVGPathElement>('[data-ribbon="take"] path', band)) {
          gsap.fromTo(
            path,
            { strokeDasharray: () => screenLength(path), strokeDashoffset: () => screenLength(path) },
            { strokeDashoffset: 0, ease: 'none', scrollTrigger: { ...scrub, invalidateOnRefresh: true } },
          )
        }
        // the tags go on last, once the headline is nearly full size
        gsap.from(all('[data-tag="take"]', band), { scale: 0, rotation: (i) => (i % 2 ? -50 : 50), ease: 'back.out(2.4)', stagger: 0.15, scrollTrigger: { ...scrub, start: 'top 60%' } })
      }

      // ── footer ──
      for (const mark of all('[data-wordmark]')) {
        // triggered off the footer, not the mark: the mark sits in the last few pixels of the page, so measured from
        // itself the range to 'max' is tiny (or empty after a late layout shift) and the rise never finishes
        gsap.from(mark, {
          yPercent: 55,
          ease: 'none',
          scrollTrigger: { trigger: mark.closest('footer') ?? mark, start: 'top bottom', end: 'max', scrub: SCRUB, invalidateOnRefresh: true },
        })
      }
    })

    // the page keeps growing after the triggers are measured (stickers and fonts load in), and a window resize is the
    // only thing ScrollTrigger re-measures on; without this, 'max' goes stale and the footer wordmark stops short
    let last = el.offsetHeight
    let timer = 0
    const grown = new ResizeObserver(() => {
      if (el.offsetHeight === last) return
      last = el.offsetHeight
      clearTimeout(timer)
      timer = window.setTimeout(() => ScrollTrigger.refresh(), 150)
    })
    grown.observe(el)

    return () => {
      grown.disconnect()
      clearTimeout(timer)
      mm.revert()
    }
  }, [root])
}
