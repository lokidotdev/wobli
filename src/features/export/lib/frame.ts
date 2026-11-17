import { FPS, draw } from 'wobli'
import type { Icon, Style } from 'wobli'

/** The ground a frame goes on when it cannot be transparent (an MP4, or a browser that cannot encode alpha). */
export const OPAQUE_GROUND = '#ffffff'

/** How many output frames one loop takes at this speed: 2× takes half as many, and the loop still closes seamlessly. */
export const framesPerLoop = (icon: Icon, speed: number) => Math.round(icon.frames / speed)

/** How long a video of `loops` loops runs, in seconds. */
export const videoSeconds = (icon: Icon, speed: number, loops: number) => (framesPerLoop(icon, speed) * loops) / FPS

/**
 * One frame onto a square canvas `size` pixels wide, over `ground` if one is given (transparent otherwise). Resets the
 * context first, so the same canvas can be drawn into again and again. Every export (PNG, video) draws through this.
 */
export function drawFrame(ctx: CanvasRenderingContext2D, icon: Icon, frame: number, style: Style, size: number, ground?: string) {
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.clearRect(0, 0, size, size)
  if (ground) {
    ctx.fillStyle = ground
    ctx.fillRect(0, 0, size, size)
  }
  const unit = size / (icon.size ?? 500) // the engine's own default canvas
  ctx.scale(unit, unit)
  draw(ctx, icon, frame, style)
}
