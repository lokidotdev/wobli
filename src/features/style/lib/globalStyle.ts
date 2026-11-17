import { useSyncExternalStore } from 'react'
import { PALETTES } from 'wobli'
import type { PaletteName } from 'wobli'
import type { SiteSettings } from 'wobli-api/contracts'
import { DEFAULT_STYLE, DEPTH_RANGE, LINE_RANGE, PALETTE_PRESETS, SITE_PALETTES, clamp, isPreset } from './style'

// The grid's global style bar: one preset, outline and depth for every card, kept per viewer in localStorage. It is also where
// the editor starts when an illustration is opened without a style in its URL.
export type GlobalStyle = { preset: PaletteName; line: number; depth: number }
const KEY = 'wobli.style'
let INITIAL: GlobalStyle = { preset: DEFAULT_STYLE.preset, line: DEFAULT_STYLE.line, depth: DEFAULT_STYLE.depth }

const within = (v: unknown, range: { min: number; max: number }, fallback: number) => (typeof v === 'number' && Number.isFinite(v) ? clamp(v, range) : fallback)

let state = INITIAL
let loaded = false
const listeners = new Set<() => void>()

function load() {
  if (loaded || typeof window === 'undefined') return
  loaded = true
  try {
    const stored = JSON.parse(localStorage.getItem(KEY) ?? 'null') as Partial<GlobalStyle> | null
    if (!stored) return
    // storage is the visitor's to edit: take only what is still a valid value
    state = {
      preset: isPreset(stored.preset) ? stored.preset : INITIAL.preset,
      line: within(stored.line, LINE_RANGE, INITIAL.line),
      depth: within(stored.depth, DEPTH_RANGE, INITIAL.depth),
    }
  } catch {
    /* storage blocked or corrupt: keep the default */
  }
}

export function setGlobalStyle(next: Partial<GlobalStyle>) {
  state = { ...state, ...next }
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* private mode: it still works for this visit */
  }
  listeners.forEach((notify) => notify())
}

/**
 * A random preset for one visit to a page, not saved: the landing page wears a fresh palette each time. Returns an undo that
 * puts the saved look back, unless the visitor picked a style themselves in the meantime (then theirs is kept).
 */
export function randomPresetForVisit() {
  load()
  const saved = state
  const others = PALETTE_PRESETS.filter((p) => p.name !== saved.preset)
  const preset = others[Math.floor(Math.random() * others.length)]!.name
  state = { ...state, preset }
  listeners.forEach((notify) => notify())
  return () => {
    if (state.preset !== preset || state.line !== saved.line || state.depth !== saved.depth) return
    state = saved
    listeners.forEach((notify) => notify())
  }
}

let applied = ''
/**
 * The admin's site-wide look (from GET /v1/settings): the default palette, stroke and depth, and recoloured palettes.
 * Called by the root route before anything renders, on the server and in the browser alike; repeat calls with the same
 * settings do nothing. A visitor who saved their own look keeps it.
 */
export function applySiteStyle(style: SiteSettings['style']) {
  const key = JSON.stringify(style)
  if (key === applied) return
  applied = key
  for (const p of PALETTE_PRESETS) SITE_PALETTES[p.name] = { ...PALETTES[p.name], ...style.palettes[p.name] }
  const preset = isPreset(style.preset) ? style.preset : DEFAULT_STYLE.preset
  Object.assign(DEFAULT_STYLE, { preset, line: style.line, depth: style.depth })
  const wasInitial = state === INITIAL
  INITIAL = { preset, line: style.line, depth: style.depth }
  if (wasInitial) state = INITIAL
  listeners.forEach((notify) => notify())
}

export const getGlobalStyle = () => (load(), state)
export const isDefaultGlobalStyle = (g: GlobalStyle) => g.preset === INITIAL.preset && g.line === INITIAL.line && g.depth === INITIAL.depth
export const resetGlobalStyle = () => setGlobalStyle(INITIAL)

export function useGlobalStyle(): GlobalStyle {
  return useSyncExternalStore(
    (listener) => (listeners.add(listener), () => listeners.delete(listener)),
    getGlobalStyle,
    () => INITIAL,
  )
}
