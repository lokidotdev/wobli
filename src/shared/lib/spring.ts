// Apple's two-parameter spring (damping ratio + response) on rAF. Animates from the live value and carries velocity through a
// re-target, so anything it drives can be grabbed mid-flight and thrown again with no seam.
export type SpringConfig = { damping: number; response: number }
export const SNAPPY: SpringConfig = { damping: 1, response: 0.35 } // default: critically damped, no overshoot
export const THROWN: SpringConfig = { damping: 0.8, response: 0.35 } // only after a flick: momentum earns a little bounce

/** Where a flick comes to rest, the way scroll views decelerate (Designing Fluid Interfaces). v in px/s. */
export const project = (v: number, rate = 0.998) => ((v / 1000) * rate) / (1 - rate)

/** Progressive resistance past a boundary, so an edge reads as soft rather than frozen. */
export const rubberband = (over: number, dim: number, c = 0.55) => (over * dim * c) / (dim + c * Math.abs(over))

export type SpringHandle = { stop: () => void }
export function animateSpring(
  from: number,
  to: number,
  velocity: number,
  cfg: SpringConfig,
  onFrame: (v: number, vel: number) => void,
  onDone?: () => void,
): SpringHandle {
  const k = (2 * Math.PI / cfg.response) ** 2
  const c = (4 * Math.PI * cfg.damping) / cfg.response
  let [x, v, last, raf] = [from, velocity, 0, 0]
  const step = (now: number) => {
    const dt = last ? Math.min(0.064, (now - last) / 1000) : 1 / 60
    last = now
    // a few sub steps keep a stiff spring stable at 60 and 120 Hz alike
    for (let i = 0; i < 4; i++) {
      const a = -k * (x - to) - c * v
      v += a * (dt / 4)
      x += v * (dt / 4)
    }
    if (Math.abs(x - to) < 0.3 && Math.abs(v) < 8) {
      onFrame(to, 0)
      onDone?.()
      return
    }
    onFrame(x, v)
    raf = requestAnimationFrame(step)
  }
  raf = requestAnimationFrame(step)
  return { stop: () => cancelAnimationFrame(raf) }
}
