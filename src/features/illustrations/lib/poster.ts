// A poster is the still an illustration shows before its live drawing mounts (and the share image). Masters are square PNGs
// of POSTER_SIZE; the ones bundled with the site also come as WebP at 300px and 600px, made by `pnpm posters`
// (scripts/posters.mjs). Posters served by the API are used as they are.

export const POSTER_SIZE = 600

/** The bundled poster of an illustration. */
export const localPoster = (slug: string) => `/posters/${slug}.png`

const LOCAL = /^\/posters\/([^/]+)\.png$/

/**
 * For a bundled poster, the WebP variants the browser picks between from `sizes` (the width it is drawn at): a small pin on
 * a phone fetches the 300, a full-width card on a 2× screen the 600. Nothing for a poster from the API.
 */
export function posterSrcSet(poster: string, sizes: string) {
  const slug = LOCAL.exec(poster)?.[1]
  if (!slug) return {}
  return { srcSet: `/posters/${slug}-300.webp 300w, /posters/${slug}.webp ${POSTER_SIZE}w`, sizes }
}
