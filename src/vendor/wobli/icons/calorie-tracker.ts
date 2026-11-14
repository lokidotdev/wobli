// Calorie Tracker
import { at, ellipse, line, poly, rect, ring } from '../engine.ts'
import { IN, SOFT, fall, twinkle } from '../motions.ts'
import { EXT, FACE, LINE, glow, hit, popIn, popScale } from '../parts.ts'
import type { Icon, Key, Layer, Motion, Shape, Track, Vec } from '../engine.ts'

// Three helpings pop in over an empty plate and drop onto it one after another: toast, an egg, two cherry tomatoes. The
// plate takes each landing, and on that frame the calorie ring around it fills a third out of where it stood; the third
// closes the ring, a flame badge pops where it meets and a sparkle follows. After the hold the food shrinks away last in,
// first out, and the ring unwinds on the mirror of its fill, so the plate is empty again at the seam.
const APPEAR = 6 // the first helping pops in
const GAP = 24 // each next helping follows this much later
const WAIT = 8 // frames a helping hangs before it drops
const DROP_LEN = 14 // frames it takes to drop onto the plate
const landAt = (i: number) => APPEAR + i * GAP + WAIT + DROP_LEN // helping i (0 to 2) lands
const FILL = 16 // frames the ring takes to fill each third
const DONE = landAt(2) + FILL // the ring is closed
const BACK = 128 // the food starts to leave
const CLEAR = 6 // each helping leaves this much after the one above it
const UNWIND = 30
const UNWIND_AT = BACK + 2 * CLEAR // the ring starts to unwind as the last helping goes

const RING_R = 168
const RING_HOLE = 138
const PLATE_R = 124
const DROP_H = 150
const FOOD_K = 124 // the helpings are drawn small and set on the plate at this scale // how far above its spot a helping appears, along the face

// the ring's share, a third per landing out of where it stood on SOFT; home in one sweep on IN, its mirror
const PROGRESS: Track<number> = [
  [0, 0, 0],
  ...[0, 1, 2].flatMap((i): ReadonlyArray<Key<number>> => [
    [landAt(i), i / 3, SOFT],
    [landAt(i) + FILL, (i + 1) / 3, 0],
  ]),
  [UNWIND_AT, 1, IN],
  [UNWIND_AT + UNWIND, 0],
]

// the filled ring: an annulus sector from twelve o'clock, the same points every frame so the keys morph
const FRAMES = Array.from({ length: 181 }, (_, f) => f)
const SECTOR_N = 32
const sector = (raw: number) => {
  const share = Math.max(raw, 0.004) // a sliver, never zero, so the points stay real; hidden while empty
  const a = (i: number) => ((-90 + (360 * share * i) / SECTOR_N) * Math.PI) / 180
  const pts = (r: number) => Array.from({ length: SECTOR_N + 1 }, (_, i): Vec => [Math.cos(a(i)) * r, Math.sin(a(i)) * r])
  return poly([...pts(RING_R - 2), ...pts(RING_HOLE + 2).reverse()], 0)
}
// keyed every other frame while it moves, held still between
const RING_FILL: Track<string> = FRAMES.filter((f, i) => i % 2 === 0 || f === 180)
  .filter((f) => f === 0 || f === 180 || at(PROGRESS, f) !== at(PROGRESS, f - 2) || at(PROGRESS, f + 2) !== at(PROGRESS, f))
  .map((f) => [f, sector(at(PROGRESS, f))] as const)

// a flame: a round belly under a tip that leans over
const flamePath = (x: number, y: number, k: number) => {
  const P = (px: number, py: number) => `${x + px * k} ${y + py * k}`
  return `M${P(2, -30)}C${P(16, -14)} ${P(22, -2)} ${P(22, 10)}C${P(22, 24)} ${P(12, 32)} ${P(0, 32)}C${P(-12, 32)} ${P(-22, 24)} ${P(-22, 10)}C${P(-22, 0)} ${P(-15, -7)} ${P(-10, -14)}C${P(-7, -6)} ${P(-4, -3)} ${P(0, -2)}C${P(5, -12)} ${P(5, -21)} ${P(2, -30)}Z`
}

// the helpings, drawn on the plate's face around their own centres
const TOAST: Vec = [42, -24]
const EGG: Vec = [-44, -20]
const TOMATO: Vec = [4, 54]
const toast = ([x, y]: Vec): ReadonlyArray<Shape> => [
  { d: rect(x - 32, y - 30, 64, 60, 14), fill: 'gold', depth: 0.6 },
  { d: rect(x - 21, y - 19, 42, 38, 8), fill: 'paper', depth: 0.2 }, // the crumb inside the crust
]
const egg = ([x, y]: Vec): ReadonlyArray<Shape> => [
  {
    d: poly([[x - 40, y - 10], [x - 22, y - 36], [x + 14, y - 34], [x + 40, y - 14], [x + 36, y + 22], [x + 6, y + 36], [x - 30, y + 26]], 18),
    fill: 'white',
    depth: 0.3,
    crease: false,
  },
  { d: ellipse(x + 2, y - 2, 16), fill: 'gold', depth: 0.5 },
]
const tomatoes = ([x, y]: Vec): ReadonlyArray<Shape> =>
  [[-20, 2], [18, -4]].flatMap(([dx, dy]): ReadonlyArray<Shape> => [
    { d: ellipse(x + dx, y + dy, 19), fill: 'hot', depth: 0.5 },
    { d: line([x + dx - 5, y + dy - 12], [x + dx + 5, y + dy - 12]), round: true }, // the stalk scar
  ])

// helping i: pops in above its spot, hangs, drops onto the plate and stays; shrinks away last in, first out
const helping = (i: number, c: Vec, shapes: ReadonlyArray<Shape>): Layer => {
  const t = APPEAR + i * GAP
  const m: ReadonlyArray<Motion> = [twinkle(t), fall([0, DROP_H], t + WAIT, DROP_LEN), twinkle(BACK + (2 - i) * CLEAR, true)]
  return { parent: 'plate', a: c, p: [c[0], c[1] - DROP_H], s: [FOOD_K, FOOD_K], m, shapes }
}

const BADGE: Vec = [0, -(RING_R + RING_HOLE) / 2] // where the ring starts and closes

const calorieTracker: Icon = {
  name: 'calorie-tracker',
  frames: 180,
  still: 110,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [254, 262], shapes: [] },
    {
      id: 'tray',
      parent: 'root',
      tilt: FACE,
      shapes: [
        { d: ring(0, 0, RING_R, RING_HOLE), fill: 'grey', depth: 0.3 },
      ],
    },
    // the fill, shown only while the ring holds something
    {
      parent: 'tray',
      s: [[0, [0, 0], 0], [landAt(0) + 1, [100, 100], 0], [UNWIND_AT + UNWIND - 1, [0, 0], 0]],
      shapes: [{ d: RING_FILL, fill: 'hot', depth: 0.5, crease: false }],
    },
    // the plate takes each landing and springs home
    {
      id: 'plate',
      parent: 'tray',
      m: [0, 1, 2].map((i) => hit(landAt(i), [0, 7 - i], 0.6)),
      shapes: [
        { d: ellipse(0, 0, PLATE_R), fill: 'white', depth: 1 },
        { d: ellipse(0, 0, PLATE_R - 30) }, // the inset rim of the well
      ],
    },
    helping(0, TOAST, toast(TOAST)),
    helping(1, EGG, egg(EGG)),
    helping(2, TOMATO, tomatoes(TOMATO)),
    // the flame badge, growing out of the point where the ring closes
    {
      parent: 'tray',
      a: BADGE,
      p: BADGE,
      s: popScale(DONE, UNWIND_AT - 4),
      shapes: [
        { d: ellipse(BADGE[0], BADGE[1], 30), fill: 'white', depth: 0.7 },
        { d: flamePath(BADGE[0], BADGE[1] + 1, 0.62), fill: 'hot', depth: 0.3 },
      ],
    },
    glow('root', [-178, -126], 22, popIn(DONE + 2, BACK - 10)),
    glow('root', [184, 104], 15, popIn(DONE + 8, BACK - 4)),
  ],
}

export default calorieTracker
