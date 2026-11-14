// Step Counter
import { at, ellipse, line, poly, rect, ring } from '../engine.ts'
import { IN, SOFT } from '../motions.ts'
import { EXT, FACE, LINE, check, facePoint, glow, numeral, outAndBack, popIn, popScale } from '../parts.ts'
import type { Icon, Key, Layer, Track, Vec } from '../engine.ts'

// A sneaker taps its toe three times in front of a step card. On the frame each toe lands the count ticks up a thousand,
// and the ring around the card's goal fills a tenth out of where it stood; the third tap reaches 10k, the ring closes, a
// check pops inside it and a sparkle follows. After the hold the ring unwinds on the mirror of its fill, the count ticking
// back down as it passes each tenth, so the card is at 7k again at the seam.
const TAP = 8 // the first toe lift
const GAP = 22 // each next tap follows this much later
const LIFT = 7 // frames the toe takes to rise
const DROP = 5 // frames it takes to come down
const HOLD = 2 // frames it hangs at the top
const landAt = (i: number) => TAP + i * GAP + LIFT + HOLD + DROP // toe i (0 to 2) lands
const FILL = 14 // frames the ring takes to fill each tenth
const DONE = landAt(2) + FILL // the ring is closed
const BACK = 128 // the ring starts to unwind
const UNWIND = 30

const RING_C: Vec = [0, -40]
const RING_R = 68
const RING_HOLE = 44
const GOAL = 10 // thousands of steps
const START = 7

// the ring's share, a tenth per tap, out of where it stood on SOFT; home in one sweep on IN, its mirror
const PROGRESS: Track<number> = [
  ...[0, 1, 2].flatMap((i): ReadonlyArray<Key<number>> => [
    [landAt(i), (START + i) / GOAL, SOFT],
    [landAt(i) + FILL, (START + i + 1) / GOAL, 0],
  ]),
  [BACK, 1, IN],
  [BACK + UNWIND, START / GOAL],
]

// the count: ticks on the frame each toe lands, and on the way home as the ring passes back under each tenth
const countAt = (f: number) => {
  if (f >= BACK) return Math.ceil(at(PROGRESS, f) * GOAL - 1e-6)
  return START + [0, 1, 2].filter((i) => f >= landAt(i)).length
}
const FRAMES = Array.from({ length: 181 }, (_, f) => f)
// holds a value until the frame it changes
const steps = <T>(value: (f: number) => T): Track<T> =>
  FRAMES.filter((f) => f === 0 || f === 180 || value(f) !== value(f - 1)).map((f) => [f, value(f), 0] as const)

// the filled ring: an annulus sector from twelve o'clock, the same points every frame so the keys morph
const SECTOR_N = 28
const sector = (share: number) => {
  const a = (i: number) => ((-90 + (360 * share * i) / SECTOR_N) * Math.PI) / 180
  const pts = (r: number) => Array.from({ length: SECTOR_N + 1 }, (_, i): Vec => [RING_C[0] + Math.cos(a(i)) * r, RING_C[1] + Math.sin(a(i)) * r])
  return poly([...pts(RING_R), ...pts(RING_HOLE).reverse()], 0)
}
// keyed every other frame while it moves, held still between
const RING_FILL: Track<string> = FRAMES.filter((f, i) => i % 2 === 0 || f === 180)
  .filter((f) => f === 0 || f === 180 || at(PROGRESS, f) !== at(PROGRESS, f - 2) || at(PROGRESS, f + 2) !== at(PROGRESS, f))
  .map((f) => [f, sector(at(PROGRESS, f))] as const)

// the count row: a right aligned number and a k, the tens digit only there at 10k
const DIGIT_W = 26
const DIGIT_H = 40
const COUNT_Y = 58
const TENS_X = -50
const UNITS_X = -12
const TENS_MID: Vec = [TENS_X + DIGIT_W / 2, COUNT_Y + DIGIT_H / 2]
const UNITS: Track<string> = steps((f) => numeral(countAt(f) % 10, UNITS_X, COUNT_Y, DIGIT_W, DIGIT_H))
const TEN_FROM = landAt(2) - 1 // a frame ahead, so it is there as the units roll to 0
const TEN_TO = FRAMES.find((f) => f > BACK && countAt(f) < GOAL) ?? BACK

// the sneaker drawn in profile on the house face, heel at -86, toe at +98, sole on y 0
const HEEL: Vec = [-86, 0]
const SHOE_AT: Vec = [-78, 132]
const sneaker: Layer = {
  parent: 'kick',
  tilt: FACE,
  p: facePoint(-HEEL[0], -HEEL[1]),
  shapes: [
    { d: rect(-100, -142, 20, 34, 7), fill: 'white', depth: 0.4 }, // heel pull tab
    { d: poly([[-52, -100], [-46, -146], [-20, -142], [-10, -96]], [4, 10, 10, 4]), fill: 'white', depth: 0.6 }, // tongue
    {
      d: poly([[-88, -26], [-92, -124], [-64, -130], [-50, -102], [-10, -100], [40, -82], [84, -60], [100, -26]], [8, 12, 10, 4, 6, 16, 18, 6]),
      fill: 'main',
      depth: 1,
    },
    { d: poly([[56, -26], [62, -62], [88, -52], [100, -26]], [2, 4, 14, 4]), fill: 'white', depth: 0.3 }, // toe cap
    { d: poly([[-72, -52], [8, -82], [18, -70], [-64, -40]], 5), fill: 'white', depth: 0.2 }, // side stripe
    { d: rect(-96, -28, 204, 28, 12), fill: 'white', depth: 1 }, // sole
    // laces down the instep
    ...[[-2, -96], [20, -88], [42, -78]].map(([x, y]) => ({ d: line([x - 6, y - 12], [x + 8, y + 8]), round: true })),
  ],
}

// the toe lifts off the heel and taps down, three times, no overshoot: out on SOFT, home on IN
const TOE_UP = -11
const TAPS: Track<number> = [0, 1, 2].flatMap((i) => outAndBack(0, TOE_UP, TAP + i * GAP, LIFT, TAP + i * GAP + LIFT + HOLD, DROP))

const stepCounter: Icon = {
  name: 'step-counter',
  frames: 180,
  still: 100,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [256, 236], shapes: [] },
    {
      id: 'card',
      parent: 'root',
      tilt: FACE,
      p: [62, -52],
      shapes: [
        { d: rect(-112, -132, 224, 262, 32), fill: 'white', depth: 1 },
        { d: ring(RING_C[0], RING_C[1], RING_R, RING_HOLE), fill: 'grey', depth: 0.2 },
        { d: RING_FILL, fill: 'ok', depth: 0.4, crease: false },
        { d: UNITS, line: 8, round: true },
        { d: line([30, COUNT_Y], [30, COUNT_Y + DIGIT_H]), line: 7, round: true },
        { d: line([54, COUNT_Y + 14], [32, COUNT_Y + 28], [56, COUNT_Y + DIGIT_H]), line: 7, round: true },
      ],
    },
    // the tens digit, popping up out of nothing the frame the count reaches 10k
    {
      parent: 'card',
      a: TENS_MID,
      p: TENS_MID,
      s: outAndBack<Vec>([0, 0], [100, 100], TEN_FROM, 6, TEN_TO - 6, 6),
      shapes: [{ d: numeral(1, TENS_X, COUNT_Y, DIGIT_W, DIGIT_H), line: 8, round: true }],
    },
    // the goal check, growing out of the ring's centre once it closes
    { parent: 'card', a: RING_C, p: RING_C, s: popScale(DONE, BACK - 4), shapes: [{ d: check(RING_C, 34), line: 8 }] },
    // the sneaker swings on an untilted pivot at its heel, so the tap turns the whole leaned silhouette
    { id: 'kick', parent: 'root', a: [0, 0], p: [SHOE_AT[0] + facePoint(...HEEL)[0], SHOE_AT[1] + facePoint(...HEEL)[1]], r: TAPS, shapes: [] },
    sneaker,
    glow('root', [184, -176], 22, popIn(DONE + 2, BACK - 10)),
    glow('root', [-160, -36], 15, popIn(DONE + 8, BACK - 4)),
  ],
}

export default stepCounter
