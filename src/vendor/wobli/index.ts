// wobli: the fun-isometric engine with Style (palette, line, depth) and its motion presets.
// Illustrations are not re-exported here: each one is its own entry, `wobli/icons/<slug>`, so an app ships only the ones it uses.
export * from './engine.ts'
export * as motions from './motions.ts'
export * as parts from './parts.ts'
export { CATEGORIES } from './catalog.ts'
export type { CategorySlug, IconMeta } from './catalog.ts'
