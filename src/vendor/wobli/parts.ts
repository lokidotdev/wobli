// Shared parts for the idea bank stickers: line weight, the house view, sparkles, badges, devices and sheets.
import { VIEWS, arc, ellipse, line, onFace, pill, poly, rect, spark, star } from './engine.ts'
import { EASY, IN, SOFT, glint, spring, twinkle } from './motions.ts'
import type { Layer, Motion, Shape, Track, Vec } from './engine.ts'

export const LINE = 5
export const { tilt: FACE, extrude: EXT } = VIEWS.right

// a white sparkle riding a parent, popped by whatever motion it is given
export const glow = (parent: string, p: Vec, r: number, m: Motion | ReadonlyArray<Motion>, extra: { ip?: number; op?: number } = {}): Layer => ({
  parent,
  a: p,
  p,
  m,
  ...extra,
  shapes: [{ d: spark(p[0], p[1], r), fill: 'white' }],
})

// pops in at a, out at b
export const popIn = (a: number, b: number): ReadonlyArray<Motion> => [twinkle(a), twinkle(b, true)]
// pops out at a, back in at b
export const outIn = (a: number, b: number): Motion => ({ s: [...(twinkle(a, true).s ?? []), ...(twinkle(b).s ?? [])] })
// a phone or watch buzz: quick rocks on the easy ease, settling home
export const buzz = (start: number, amp = 3, n = 4): Motion => ({
  r: [[start, 0, EASY], ...Array.from({ length: n }, (_, i) => [start + 3 + i * 4, (i % 2 ? -amp : amp) * (1 - i / (n + 1)), EASY] as const), [start + 3 + n * 4, 0]],
})
// a ring wave swelling out from a centre, on the glint keys
export const wave = (parent: string, c: Vec, r: number, start: number, from = -70, to = -20): Layer => ({
  parent,
  a: c,
  p: c,
  m: glint(start, 100),
  shapes: [
    { d: arc(c[0], c[1], r, from, to), round: true },
    { d: arc(c[0], c[1], r, from + 180, to + 180), round: true },
  ],
})

export const check = ([x, y]: Vec, r: number) => line([x - r * 0.45, y + r * 0.02], [x - r * 0.12, y + r * 0.34], [x + r * 0.48, y - r * 0.32])
export const checkBadge = (c: Vec, r: number, depth = 0.7): ReadonlyArray<Shape> => [{ d: ellipse(c[0], c[1], r), fill: 'ok', depth }, { d: check(c, r), line: Math.max(5, r * 0.17) }]

// the screen pointer, tip at x y
export const CURSOR = (x: number, y: number) => poly([[x, y], [x, y + 66], [x + 17, y + 52], [x + 29, y + 78], [x + 43, y + 72], [x + 31, y + 46], [x + 52, y + 46]], 3)

// a file sheet with a folded corner and a coloured tag
export const sheet = (w: number, h: number, tag: Shape['fill'], kind: 'doc' | 'img' | 'pdf' = 'doc', cx = 0, cy = 0): ReadonlyArray<Shape> => {
  const [x, y] = [cx - w / 2, cy - h / 2]
  const fold = Math.min(w, h) * 0.26
  return [
    { d: poly([[x, y], [x + w - fold, y], [x + w, y + fold], [x + w, y + h], [x, y + h]], [8, 2, 2, 8, 8]), fill: 'white', depth: 0.35 },
    { d: poly([[x + w - fold, y], [x + w - fold, y + fold], [x + w, y + fold]], 2), fill: 'grey' },
    { d: rect(x + w * 0.16, y + h - h * 0.24, w * 0.4, h * 0.13, 4), fill: tag },
    ...(kind === 'img'
      ? [{ d: poly([[x + w * 0.16, y + h * 0.62], [x + w * 0.4, y + h * 0.3], [x + w * 0.58, y + h * 0.5], [x + w * 0.7, y + h * 0.4], [x + w * 0.84, y + h * 0.62]], 3), fill: tag }]
      : kind === 'pdf'
        ? [{ d: rect(x + w * 0.16, y + h * 0.22, w * 0.5, h * 0.2, 4), fill: tag }, { d: line([x + w * 0.16, y + h * 0.56], [x + w * 0.8, y + h * 0.56]) }]
        : [{ d: line([x + w * 0.16, y + h * 0.3], [x + w * 0.62, y + h * 0.3]) }, { d: line([x + w * 0.16, y + h * 0.5], [x + w * 0.8, y + h * 0.5]) }]),
  ] as ReadonlyArray<Shape>
}

// one upright plane: lid with its display, keyboard deck below, like the calendar is one leaned silhouette
export const LAP = { x: -106, y: -156, w: 212, h: 136 }
export const laptop = (body: Shape['fill'] = 'deep'): ReadonlyArray<Shape> => [
  { d: rect(-122, -172, 244, 168, 18), fill: body, depth: 1 },
  { d: rect(LAP.x, LAP.y, LAP.w, LAP.h, 8), fill: 'tint' },
  { d: poly([[-128, -6], [128, -6], [156, 34], [-156, 34]], 8), fill: 'grey', depth: 1 },
  { d: pill(-34, 8, 68, 14), fill: 'white' },
]

// a phone body: side keys, slab, screen drawn separately so things can clip to it
export const phoneBody = (r = 32, color: Shape['fill'] = 'deep'): ReadonlyArray<Shape> => [
  ...[-90, -40].map((y): Shape => ({ d: rect(-92, y, 16, 36, 5), fill: color, depth: 0.9 })),
  { d: rect(-84, -150, 168, 300, r), fill: color, depth: 0.9 },
]
export const PHONE_SCREEN = (r = 22) => rect(-70, -136, 140, 272, r)

// ── Motion rules every illustration shares. Change one here and all of them follow. ─────────────────────────────────────────
//
// What changed from the first drawings (src/icons.ts), and why:
// - Tap and hover driven changes never overshoot: they go out on SOFT and come home on IN, its mirror, so the way back retraces
//   the way out (spatial consistency). The baked spring is kept for moments with momentum only: a thrown file, a card hitting a reader.
// - Things grow out of the thing that made them: the iPhone banner unfolds from the Dynamic Island and folds back into it, files
//   rise out of the folder and sink back in the order they left, last out first home.
// - Feedback lands on the cause: the folder lifts the moment the pointer arrives, the phone buzzes on the frame the banner lands,
//   the reply button sinks under the finger before the ripple, the reader takes the hit on the frame the card touches.
// - Restraint: fewer trail dots, one or two sparkles on the beat, a long still hold after the action.

/** A point or a move along the house face, in the untilted parent's space. */
export const facePoint = (x: number, y: number): Vec => onFace(FACE, [x, y])

/** Out to `to` on SOFT over `len`, hold, home on IN (SOFT's mirror) from `back` over `blen`: the path home retraces the path out. */
export function outAndBack<T>(rest: T, to: T, out: number, len: number, back: number, blen = len): Track<T> {
  return [[out, rest, SOFT], [out + len, to, 0], [back, to, IN], [back + blen, rest]]
}

/** Scale keys that pop in at `a` and out at `b`. */
export const popScale = (a: number, b: number): Track<Vec> => [...(twinkle(a).s ?? []), ...(twinkle(b, true).s ?? [])]

// ── Pieces more than one illustration draws. Moved here from the icons that first needed them. ──────────────────────────────

/** A chat bubble path, box from x y, with its tail under the bottom left or bottom right corner. */
export const bubble = (x: number, y: number, w: number, h: number, tail: 'left' | 'right' = 'left', r = 24): string => {
  const R = [r, r, r, 3, 4, 3, r]
  return tail === 'left'
    ? poly([[x, y], [x + w, y], [x + w, y + h], [x + 46, y + h], [x + 6, y + h + 30], [x + 18, y + h], [x, y + h]], R)
    : poly([[x, y], [x + w, y], [x + w, y + h], [x + w - 18, y + h], [x + w - 6, y + h + 30], [x + w - 46, y + h], [x, y + h]], R)
}

/** A padlock shackle: an arch `w` wide of bar thickness `bar`, legs ending at `y`, arch starting `rise` above them. */
export const shackle = (w: number, bar: number, y: number, rise: number): string => {
  const [o, i] = [w / 2, w / 2 - bar]
  return `M${-o} ${y}L${-o} ${y - rise}A${o} ${o} 0 0 1 ${o} ${y - rise}L${o} ${y}L${i} ${y}L${i} ${y - rise}A${i} ${i} 0 0 0 ${-i} ${y - rise}L${-i} ${y}Z`
}

/** A map pin teardrop with its tip at x y, at scale k (k 1 is 192 wide, 256 tall). */
export const mapPin = (x: number, y: number, k: number): string => {
  const [r, w, top] = [96 * k, 24 * k, y - 160 * k]
  return `M${x} ${y}C${x - w} ${y - 42 * k} ${x - r} ${y - 96 * k} ${x - r} ${top}A${r} ${r} 0 0 1 ${x + r} ${top}C${x + r} ${y - 96 * k} ${x + w} ${y - 42 * k} ${x} ${y}Z`
}

/** A gold coin slab centred on 0 0: rim ring and an ink star. */
export const coin = (r: number, depth = 0.6): ReadonlyArray<Shape> => [
  { d: ellipse(0, 0, r), fill: 'gold', depth },
  { d: ellipse(0, 0, r * 0.7) },
  { d: star(0, 1, r * 0.36, 0.46, 5, 2), fill: 'ink', line: false },
]

/** Takes a hit on frame `t`: knocked along `v`, then the spring brings it home. For things struck by something with momentum. */
export const hit = (t: number, v: Vec, pace = 0.7): Motion => ({ p: [[t - 2, [0, 0], IN], [t, v, 0], ...spring([0, 0], t, pace, v)] })

/**
 * A digit 0 to 9 as one ink stroke in the box x y w h. Every digit is the same 8 points, so any two morph into each other
 * (key `d` between two numerals to roll a count).
 */
export const numeral = (n: number, x: number, y: number, w: number, h: number): string => {
  const P: Record<string, Vec> = { tl: [0, 0], tr: [w, 0], ml: [0, h / 2], mr: [w, h / 2], bl: [0, h], br: [w, h] }
  const ONE: ReadonlyArray<Vec> = [[w * 0.15, h * 0.18], [w * 0.6, 0], [w * 0.6, h]]
  const KEYS: Record<number, ReadonlyArray<string>> = {
    0: ['tl', 'tr', 'br', 'bl', 'tl'],
    2: ['tl', 'tr', 'mr', 'ml', 'bl', 'br'],
    3: ['tl', 'tr', 'mr', 'ml', 'mr', 'br', 'bl'],
    4: ['tl', 'ml', 'mr', 'tr', 'mr', 'br'],
    5: ['tr', 'tl', 'ml', 'mr', 'br', 'bl'],
    6: ['tr', 'tl', 'bl', 'br', 'mr', 'ml'],
    7: ['tl', 'tr', 'br'],
    8: ['ml', 'tl', 'tr', 'mr', 'ml', 'bl', 'br', 'mr'],
    9: ['mr', 'ml', 'tl', 'tr', 'br', 'bl'],
  }
  const pts = n === 1 ? ONE : KEYS[n].map((k) => P[k])
  const full = [...pts, ...Array.from({ length: 8 - pts.length }, () => pts[pts.length - 1])]
  return line(...full.map(([px, py]): Vec => [x + px, y + py]))
}
