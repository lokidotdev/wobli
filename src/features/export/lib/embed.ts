import { encodeStyle } from '~/features/style'
import type { EditorStyle } from '~/features/style'

/** The hosted player for this exact look: no chrome, transparent unless the look has a background. */
export function embedUrl(origin: string, slug: string, style: EditorStyle) {
  const q = new URLSearchParams(encodeStyle(style) as Record<string, string>).toString()
  return `${origin}/embed/${slug}${q ? `?${q}` : ''}`
}

export const iframeSnippet = (url: string, title: string, size = 320) =>
  `<iframe src="${url}" width="${size}" height="${size}" title="${title}" loading="lazy" style="border:0;background:transparent"></iframe>`
