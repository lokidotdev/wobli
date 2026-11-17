import type { Icon, Style } from 'wobli'
import { drawFrame } from './frame'

/** One frame at any size, drawn fresh (not copied off the stage), transparent unless a background is given. */
export async function renderPng(icon: Icon, frame: number, style: Style, size: number, bg?: string): Promise<Blob> {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('no 2d context')
  drawFrame(ctx, icon, frame, style, size, bg)
  return new Promise((ok, no) => canvas.toBlob((b) => (b ? ok(b) : no(new Error('toBlob failed'))), 'image/png'))
}

export function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob)
  const a = Object.assign(document.createElement('a'), { href: url, download: name })
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
