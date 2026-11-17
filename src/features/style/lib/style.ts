import { ACCENTS, PALETTES, RISO, brand, hue, mono } from 'wobli'
import type { Palette, PaletteName, Style } from 'wobli'
import type { StyleSearch } from '../schemas/style.schema'

export type Slot = keyof Palette
export type Recolor = { mode: 'off' } | { mode: 'hue'; deg: number } | { mode: 'brand'; a: string; b: string } | { mode: 'mono'; c: string }
export type Background = 'none' | 'paper' | `#${string}`

/** Everything the editor can change. Engine Style plus the stage background and the transport. */
export type EditorStyle = {
  preset: PaletteName
  recolor: Recolor
  colors: Partial<Record<Slot, string>> // per slot overrides, laid over the preset and the recolour
  ink: string // stroke colour
  line: number // outline multiplier, within LINE_RANGE
  depth: number // extrusion multiplier, within DEPTH_RANGE
  bg: Background
  speed: number // one of SPEEDS
  loop: boolean
}

/**
 * The palettes this site draws with: the package's PALETTES with the admin's colour overrides laid on top (see
 * applySiteStyle in globalStyle.ts). Mutated in place when settings arrive, so every reader sees the same object.
 */
export const SITE_PALETTES: Record<PaletteName, Palette> = { ...PALETTES }

export const PALETTE_PRESETS: ReadonlyArray<{ name: PaletteName; label: string }> = [
  { name: 'system', label: 'System' },
  { name: 'riso', label: 'Riso' },
  { name: 'candy', label: 'Candy' },
  { name: 'matcha', label: 'Matcha' },
  { name: 'sunset', label: 'Sunset' },
  { name: 'clay', label: 'Clay' },
  { name: 'aqua', label: 'Aqua' },
]

export const DEFAULT_STYLE: EditorStyle = {
  preset: 'system',
  recolor: { mode: 'off' },
  colors: {},
  ink: '#000000',
  line: 0.25, // the house look is a thin outline; every Reset comes back here
  depth: 1,
  bg: 'none',
  speed: 1,
  loop: true,
}

/** The one definition of how far each control goes: sliders, the URL decoder and the docs all read these. */
export const LINE_RANGE = { min: 0, max: 2.5, step: 0.05 } as const
export const DEPTH_RANGE = { min: 0, max: 1.5, step: 0.05 } as const
export const HUE_RANGE = { min: -180, max: 180, step: 1 } as const
/** The playback speeds on offer; a speed from a URL snaps to the nearest. */
export const SPEEDS = [0.25, 0.5, 1, 1.5, 2] as const

/** `v` brought inside `range`. */
export const clamp = (v: number, range: { min: number; max: number }) => Math.min(range.max, Math.max(range.min, v))
/** Whether `name` is one of the palettes on offer (URLs, storage and the admin's settings can all hold stale names). */
export const isPreset = (name: unknown): name is PaletteName => PALETTE_PRESETS.some((p) => p.name === name)

export const formatMultiplier = (v: number) => `${+v.toFixed(2)}×`

export const SLOT_LABEL: Record<Slot, string> = {
  main: 'Main',
  gold: 'Gold',
  tint: 'Tint',
  ok: 'Success',
  hot: 'Alert',
  deep: 'Deep',
  white: 'White',
  grey: 'Grey',
  paper: 'Paper',
  ink: 'Stroke',
}

/** The 'paper' background: the engine's own paper. */
const PAPER_COLOR = RISO.paper
export const backgroundColor = (bg: Background) => (bg === 'none' ? undefined : bg === 'paper' ? PAPER_COLOR : bg)

/** The whole palette a style draws with: preset, then the quick recolour, then single slot overrides, then the stroke. */
export function paletteOf(s: Pick<EditorStyle, 'preset' | 'recolor' | 'colors' | 'ink'>): Palette {
  let p: Palette = SITE_PALETTES[s.preset]
  const r = s.recolor
  if (r.mode === 'hue' && r.deg) p = hue(r.deg, p)
  if (r.mode === 'brand') p = brand(r.a, r.b, p)
  if (r.mode === 'mono') p = mono(r.c, p)
  return { ...p, ...s.colors, ink: s.ink }
}

/** What the engine, <Sticker> and the exporters take. */
export const toEngineStyle = (s: EditorStyle): Style & { palette: Palette; line: number; depth: number } => ({ palette: paletteOf(s), line: s.line, depth: s.depth })

// ── URL ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────
const HEX = /^[0-9a-f]{6}$/i
const hex = (v: string | undefined) => (v && HEX.test(v) ? (`#${v.toLowerCase()}` as const) : undefined)
const num = (v: string | undefined, range: { min: number; max: number }) => {
  const n = v === undefined ? NaN : Number(v)
  return Number.isFinite(n) ? clamp(n, range) : undefined
}
const nearestSpeed = (v: number) => SPEEDS.reduce((best, s) => (Math.abs(s - v) < Math.abs(best - v) ? s : best))
const bare = (c: string) => c.replace('#', '').toLowerCase()
const round = (n: number) => String(+n.toFixed(2))
const SLOTS = new Set<string>([...ACCENTS, 'white', 'grey', 'paper'])

export function decodeStyle(q: StyleSearch): EditorStyle {
  const preset = isPreset(q.p) ? q.p : DEFAULT_STYLE.preset
  let recolor: Recolor = { mode: 'off' }
  const [mode, a, b] = (q.q ?? '').split('.')
  const deg = num(a, HUE_RANGE)
  if (mode === 'hue' && deg !== undefined) recolor = { mode: 'hue', deg }
  if (mode === 'brand' && hex(a)) recolor = { mode: 'brand', a: hex(a)!, b: hex(b) ?? hex(a)! }
  if (mode === 'mono' && hex(a)) recolor = { mode: 'mono', c: hex(a)! }
  const colors: EditorStyle['colors'] = {}
  for (const pair of (q.c ?? '').split('.')) {
    const [slot, v] = pair.split('-')
    if (slot && SLOTS.has(slot) && hex(v)) colors[slot as Slot] = hex(v)
  }
  const bg: Background = q.bg === 'paper' ? 'paper' : (hex(q.bg) ?? 'none')
  return {
    preset,
    recolor,
    colors,
    ink: hex(q.ink) ?? DEFAULT_STYLE.ink,
    line: num(q.lw, LINE_RANGE) ?? DEFAULT_STYLE.line,
    depth: num(q.d, DEPTH_RANGE) ?? DEFAULT_STYLE.depth,
    bg,
    speed: q.sp !== undefined && Number.isFinite(Number(q.sp)) ? nearestSpeed(Number(q.sp)) : DEFAULT_STYLE.speed,
    loop: q.once !== '1',
  }
}

/** Only the values that differ from the default, so a plain look has a bare URL. */
export function encodeStyle(s: EditorStyle): StyleSearch {
  const out: StyleSearch = {}
  if (s.preset !== DEFAULT_STYLE.preset) out.p = s.preset
  const r = s.recolor
  if (r.mode === 'hue' && r.deg) out.q = `hue.${Math.round(r.deg)}`
  if (r.mode === 'brand') out.q = `brand.${bare(r.a)}.${bare(r.b)}`
  if (r.mode === 'mono') out.q = `mono.${bare(r.c)}`
  const c = Object.entries(s.colors).map(([k, v]) => `${k}-${bare(v)}`)
  if (c.length) out.c = c.join('.')
  if (s.ink !== DEFAULT_STYLE.ink) out.ink = bare(s.ink)
  if (s.line !== DEFAULT_STYLE.line) out.lw = round(s.line)
  if (s.depth !== DEFAULT_STYLE.depth) out.d = round(s.depth)
  if (s.bg !== 'none') out.bg = s.bg === 'paper' ? 'paper' : bare(s.bg)
  if (s.speed !== DEFAULT_STYLE.speed) out.sp = round(s.speed)
  if (!s.loop) out.once = '1'
  return out
}

export const hasStyleParams = (q: StyleSearch) => Object.values(q).some((v) => v !== undefined)

/** A fresh look that still reads: a random preset, often turned around the wheel, an outline and depth near the house values. */
export function randomizeStyle(prev: EditorStyle): EditorStyle {
  const pick = <T,>(xs: ReadonlyArray<T>) => xs[Math.floor(Math.random() * xs.length)]!
  const r = Math.random()
  return {
    ...prev,
    preset: pick(PALETTE_PRESETS).name,
    recolor: r < 0.5 ? { mode: 'hue', deg: Math.round(Math.random() * 300 - 150) } : r < 0.65 ? { mode: 'mono', c: `#${Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0')}` } : { mode: 'off' },
    colors: {},
    line: pick([0.6, 0.8, 1, 1, 1.2, 1.5]),
    depth: pick([0.4, 0.7, 1, 1, 1.2]),
  }
}
