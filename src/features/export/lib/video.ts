import { BufferTarget, CanvasSource, Mp4OutputFormat, Output, QUALITY_HIGH, WebMOutputFormat, canEncodeVideo } from 'mediabunny'
import { draw } from 'wobli'
import type { Icon, Style } from 'wobli'

export type VideoFormat = 'mp4' | 'webm'
type Options = { format: VideoFormat; size: number; bg?: string; speed: number; loops: number; onProgress?: (p: number) => void; signal?: AbortSignal }

const FPS = 60
const CODEC = { mp4: 'avc', webm: 'vp9' } as const

/** Whether this browser can encodeStyle a transparent VP9 WebM (WebCodecs alpha support is still patchy). */
export const canTransparentWebm = (size: number) => canEncodeVideo('vp9', { width: size, height: size, alpha: 'keep', quality: QUALITY_HIGH }).catch(() => false)

/**
 * The editor's look as a video: every frame drawn fresh with draw() onto a canvas and handed to WebCodecs, so it is
 * deterministic and faster than real time. MP4 is H.264 on a solid ground (white when the look has none), playable
 * everywhere. WebM is VP9 and keeps the alpha when there is no background.
 */
export async function renderVideo(icon: Icon, style: Style, o: Options): Promise<Blob> {
  const transparent = o.format === 'webm' && !o.bg
  const ground = o.format === 'mp4' ? (o.bg ?? '#ffffff') : o.bg
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = o.size
  const ctx = canvas.getContext('2d', { alpha: transparent })
  if (!ctx) throw new Error('no 2d context')

  const output = new Output({
    format: o.format === 'mp4' ? new Mp4OutputFormat({ fastStart: 'in-memory' }) : new WebMOutputFormat(),
    target: new BufferTarget(),
  })
  const source = new CanvasSource(canvas, { codec: CODEC[o.format], quality: QUALITY_HIGH, alpha: transparent ? 'keep' : 'discard' })
  output.addVideoTrack(source, { frameRate: FPS })
  await output.start()

  // speed changes how far each output frame steps through the loop, so 2× is half as long and still seamless
  const perLoop = Math.round(icon.frames / o.speed)
  const total = perLoop * o.loops
  const unit = o.size / (icon.size ?? 500)
  for (let i = 0; i < total; i++) {
    if (o.signal?.aborted) {
      await output.cancel()
      throw new DOMException('cancelled', 'AbortError')
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, o.size, o.size)
    if (ground) (ctx.fillStyle = ground), ctx.fillRect(0, 0, o.size, o.size)
    ctx.scale(unit, unit)
    draw(ctx, icon, ((i % perLoop) / perLoop) * icon.frames, style)
    await source.add(i / FPS, 1 / FPS)
    if (i % 6 === 0) o.onProgress?.(i / total)
  }
  await output.finalize()
  o.onProgress?.(1)
  const buf = output.target.buffer
  if (!buf) throw new Error('nothing was written')
  return new Blob([buf], { type: o.format === 'mp4' ? 'video/mp4' : 'video/webm' })
}
