// Motion timings for components built on `motion` (the AvatarGroup and its tooltip). Apple's defaults: springs with
// no overshoot for anything that moves, a strong ease-out for fades.

/** Critically damped settle for layout moves. */
export const SPRING_LAYOUT = { type: 'spring', bounce: 0, duration: 0.35 } as const

/** A quick, firm settle for press feedback. */
export const SPRING_PRESS = { type: 'spring', bounce: 0, duration: 0.2 } as const

/** Strong ease-out for fades and small entrances. */
export const EASE_OUT = [0.23, 1, 0.32, 1] as const
