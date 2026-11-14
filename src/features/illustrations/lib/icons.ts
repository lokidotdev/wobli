import { z } from 'zod'
import type { Icon } from 'wobli'
import type { Illustration } from '../schemas/illustration.schema'
import { isLocalIcon } from '../api/local-icon'

// Drawings are plain data, published as JSON next to the poster. They stay out of query data (they are not something to
// send down with the HTML) and load when a sticker first nears the viewport, so a page weighs the same at 5 illustrations
// as at 500. A drawing's URL carries a hash of its content, which makes the URL the cache key: a republished illustration
// has a new URL and is fetched afresh.

/** What is needed to find a drawing; any Illustration will do. */
export type IconRef = Pick<Illustration, 'slug' | 'icon'>

// just enough to know it is a drawing; the engine reads the rest
const drawingSchema = z.looseObject({ name: z.string(), frames: z.number().positive(), layers: z.array(z.unknown()).min(1) })

const ready = new Map<string, Icon>()
const pending = new Map<string, Promise<Icon>>()

/** The drawing, if it has already been loaded. */
export const peekIcon = (ref: IconRef) => ready.get(ref.icon)

/** Loads a drawing once; every later call gets the same promise. A failed load is forgotten, so the next call tries again. */
export function loadIcon(ref: IconRef): Promise<Icon> {
  let p = pending.get(ref.icon)
  if (!p) {
    const raw: Promise<unknown> = isLocalIcon(ref.icon)
      ? import('../api/local-catalog').then((m) => m.loadLocalIcon(ref.icon))
      : fetch(ref.icon).then((res) => (res.ok ? res.json() : Promise.reject(new Error(`wobli: the drawing for "${ref.slug}" answered ${res.status}`))))
    p = raw.then((json) => {
      const icon = drawingSchema.parse(json) as unknown as Icon
      ready.set(ref.icon, icon)
      return icon
    })
    p.catch(() => pending.delete(ref.icon))
    pending.set(ref.icon, p)
  }
  return p
}
