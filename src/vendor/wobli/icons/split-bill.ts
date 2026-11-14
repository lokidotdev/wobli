// Split Bill
import { ellipse, line, poly, rect } from '../engine.ts'
import { IN, SOFT } from '../motions.ts'
import { EXT, FACE, LINE, glow, hit, popIn } from '../parts.ts'
import type { Icon, Key, Layer, Shape, Track, Vec } from '../engine.ts'

// The receipt tears into three along its perforations, the pieces easing a hair apart; then each slides down to its own
// person, left first, shrinking into a little ticket held over their head, and each person takes the arrival on that frame.
// After a long hold the pieces go back up, last out first home, and close up into one receipt again.
const TOP = -168 // receipt top edge, face space
const BOTTOM = 24 // receipt torn bottom edge
const EDGE = 90 // half width
const CUTS = [-30, 30] // the two tear lines
const TOOTH = 6 // zigzag depth on the tears and the bottom
const MID_Y = (TOP + BOTTOM) / 2

const TEAR = 6 // the receipt tears
const TEAR_LEN = 10
const GAP = 9 // how far the outer pieces pull away on the tear
const LEAVE = 18 // first piece starts down
const STAGGER = 6
const TRAVEL = 30
const HOME = 116 // the last piece out starts home first
const HOME_LEN = 26
const CLOSE = 166 // the pieces close up into one
const CLOSE_LEN = 10
const SMALL = 66 // ticket scale, percent

const PEOPLE: ReadonlyArray<Vec> = [[-128, 120], [0, 138], [128, 120]]
const HELD = -90 // the ticket's centre sits this far above the person's centre

// a vertical tear from top to bottom at x, zigzagging TOOTH either side
const tearPoints = (x: number): ReadonlyArray<Vec> => {
  const n = 10
  return Array.from({ length: n + 1 }, (_, i): Vec => [x + (i % 2 ? TOOTH : i === 0 || i === n ? 0 : -TOOTH) * 0.6, TOP + ((BOTTOM - TOP) * i) / n])
}
// the receipt's torn bottom between x0 and x1, right to left
const bottomPoints = (x0: number, x1: number): ReadonlyArray<Vec> => {
  const n = Math.max(2, Math.round((x1 - x0) / 15))
  return Array.from({ length: n + 1 }, (_, i): Vec => [x1 - ((x1 - x0) * i) / n, BOTTOM + (i % 2 ? -TOOTH : 0)])
}

// one piece of the receipt, between two edges (a straight outer edge or a tear), with its own items
const piece = (i: number): ReadonlyArray<Shape> => {
  const left: ReadonlyArray<Vec> = i === 0 ? [[-EDGE, BOTTOM], [-EDGE, TOP]] : [...tearPoints(CUTS[i - 1])].reverse()
  const right: ReadonlyArray<Vec> = i === 2 ? [[EDGE, TOP], [EDGE, BOTTOM]] : tearPoints(CUTS[i])
  const [x0, x1] = [i === 0 ? -EDGE : CUTS[i - 1], i === 2 ? EDGE : CUTS[i]]
  const pts = [...left, ...right, ...bottomPoints(x0, x1).slice(1, -1)]
  const [l, r] = [x0 + 14, x1 - 14]
  return [
    { d: poly(pts, 2), fill: 'white', depth: 0.45 },
    ...(i === 1 ? [{ d: rect(-20, TOP + 22, 40, 22, 6), fill: 'deep', depth: 0.25 } as Shape] : [{ d: line([l, TOP + 33], [r, TOP + 33]) }]),
    { d: line([l, TOP + 74], [r, TOP + 74]) },
    { d: line([l, TOP + 100], [r - 10, TOP + 100]) },
    { d: rect(l, TOP + 130, r - l, 26, 6), fill: 'main', depth: 0.25 },
  ]
}

// a person: slab disc, raised white head and shoulders (as in team-invite)
const person = (r: number, fill: Shape['fill']): ReadonlyArray<Shape> => [
  { d: ellipse(0, 0, r), fill, depth: 1 },
  { d: ellipse(0, -r * 0.24, r * 0.3), fill: 'white', depth: 0.3 },
  { d: `M${-r * 0.56} ${r * 0.62}A${r * 0.56} ${r * 0.46} 0 0 1 ${r * 0.56} ${r * 0.62}Z`, fill: 'white', depth: 0.3 },
]

const centreOf = (i: number): Vec => [i === 0 ? (-EDGE + CUTS[0]) / 2 : i === 2 ? (CUTS[1] + EDGE) / 2 : 0, MID_Y]
const leave = (i: number) => LEAVE + i * STAGGER
const arrive = (i: number) => leave(i) + TRAVEL
const home = (i: number) => HOME + (2 - i) * STAGGER

// tear apart, down to the person on SOFT, hold, back up on IN (its mirror), close up
const pieceTrack = (i: number): Track<Vec> => {
  const c = centreOf(i)
  const gap: Vec = [c[0] + (i - 1) * GAP, c[1]]
  const held: Vec = [PEOPLE[i][0], PEOPLE[i][1] + HELD]
  const keys: Array<Key<Vec>> = [
    [TEAR, c, SOFT],
    [TEAR + TEAR_LEN, gap, 0],
    [leave(i), gap, SOFT],
    [arrive(i), held, 0],
    [home(i), held, IN],
    [home(i) + HOME_LEN, gap, 0],
    [CLOSE, gap, IN],
    [CLOSE + CLOSE_LEN, c],
  ]
  return keys
}
const scaleTrack = (i: number): Track<Vec> => [
  [leave(i), [100, 100], SOFT],
  [arrive(i), [SMALL, SMALL], 0],
  [home(i), [SMALL, SMALL], IN],
  [home(i) + HOME_LEN, [100, 100]],
]

const splitBill: Icon = {
  name: 'split-bill',
  frames: 180,
  still: 100,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [226, 214], shapes: [] },
    { id: 'face', parent: 'root', tilt: FACE, shapes: [] },
    ...[0, 1, 2].map((i): Layer => ({ parent: 'face', a: centreOf(i), p: pieceTrack(i), s: scaleTrack(i), shapes: piece(i) })),
    // each person takes the arrival of their piece on the frame it lands
    ...PEOPLE.map((p, i): Layer => ({
      parent: 'face',
      p,
      m: hit(arrive(i), [0, 7], 0.6),
      shapes: person(i === 1 ? 50 : 44, i === 1 ? 'deep' : 'main'),
    })),
    glow('root', [150, -40], 20, popIn(arrive(2) - 2, HOME - 8)),
  ],
}

export default splitBill
