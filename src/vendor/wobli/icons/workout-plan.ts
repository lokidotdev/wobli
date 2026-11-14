// Workout Plan
import { line, rect } from '../engine.ts'
import { IN, twinkle } from '../motions.ts'
import { EXT, FACE, LINE, check, glow, outAndBack, popIn } from '../parts.ts'
import type { Icon, Layer, Shape, Track, Vec } from '../engine.ts'

// A dumbbell lies in front of a clipboard plan. It is lifted three times; on the frame each rep reaches the top, the next
// row's box turns green and a tick draws into it, the dumbbell's tilt trailing the lift a few frames behind. The third tick
// brings a sparkle. After the hold the ticks wipe out last first, so the plan is blank again at the seam.
const REP = 10 // the first lift starts
const GAP = 30 // each next rep follows this much later
const UP = 12 // frames a lift takes
const TOP = 4 // frames it holds at the top
const DOWN = 12 // frames it takes to lower
const LAG = 5 // the tilt trails the lift by this much
const repAt = (i: number) => REP + i * GAP
const topAt = (i: number) => repAt(i) + UP // rep i (0 to 2) reaches the top, its tick lands
const DRAW = 10 // frames a tick takes to draw
const DONE = topAt(2) + DRAW
const BACK = 138 // the ticks start to wipe out
const WIPE = 10
const backAt = (i: number) => BACK + (2 - i) * 6 // last tick first

const ROWS = [-62, -2, 58]
const BOX_X = -52
const BOX = 34
const boxMid = (y: number): Vec => [BOX_X, y]

// the lift: up and back down three times, out on SOFT, home on IN, no overshoot
const RISE: Vec = [-6, -84]
const LIFT: Track<Vec> = [0, 1, 2].flatMap((i) => outAndBack<Vec>([0, 0], RISE, repAt(i), UP, topAt(i) + TOP, DOWN))
const TILT: Track<number> = [0, 1, 2].flatMap((i) => outAndBack(0, -9, repAt(i) + LAG, UP, topAt(i) + TOP + LAG, DOWN))

// the dumbbell drawn side on in the house face: handle, collars, two plates a side
const plate = (x: number, h: number, w: number): Shape => ({ d: rect(x - w / 2, -h / 2, w, h, 8), fill: 'deep', depth: 1 })
const dumbbell: Layer = {
  parent: 'swing',
  tilt: FACE,
  shapes: [
    { d: rect(-112, -9, 224, 18, 6), fill: 'grey', depth: 0.6 }, // the bar, end to end
    plate(-92, 64, 20),
    plate(92, 64, 20),
    plate(-66, 96, 28),
    plate(66, 96, 28),
    { d: rect(-48, -16, 12, 32, 4), fill: 'grey', depth: 0.7 }, // collars
    { d: rect(36, -16, 12, 32, 4), fill: 'grey', depth: 0.7 },
    // knurling on the grip
    ...[-14, 0, 14].map((x): Shape => ({ d: line([x, -9], [x, 9]), line: 3 })),
  ],
}

// one row's tick: the box pops green as it lands and the tick draws over it; on the way out the tick wipes, then the box
// shrinks away on IN
const row = (y: number, i: number): ReadonlyArray<Layer> => [
  {
    parent: 'plan',
    a: boxMid(y),
    p: boxMid(y),
    s: [...(twinkle(topAt(i) - 2).s ?? []), [backAt(i) + WIPE - 2, [100, 100], IN], [backAt(i) + WIPE + 8, [0, 0]]],
    shapes: [{ d: rect(BOX_X - BOX / 2, y - BOX / 2, BOX, BOX, 8), fill: 'ok', depth: 0.35 }],
  },
  {
    parent: 'plan',
    shapes: [{ d: check(boxMid(y), 36), line: 7, trim: outAndBack(0, 1, topAt(i), DRAW, backAt(i), WIPE) }],
  },
]

const workoutPlan: Icon = {
  name: 'workout-plan',
  frames: 180,
  still: 110,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [250, 236], shapes: [] },
    {
      id: 'plan',
      parent: 'root',
      tilt: FACE,
      p: [74, -44],
      shapes: [
        { d: rect(-104, -136, 208, 272, 24), fill: 'main', depth: 1 }, // the board
        { d: rect(-84, -110, 168, 228, 10), fill: 'white', depth: 0.3 }, // the sheet
        { d: rect(-46, -152, 92, 36, 10), fill: 'grey', depth: 0.7 }, // the clip
        { d: rect(-18, -142, 36, 12, 6), fill: 'white', depth: 0.2 },
        // each row: an empty box and a line of text
        ...ROWS.flatMap((y): ReadonlyArray<Shape> => [
          { d: rect(BOX_X - BOX / 2, y - BOX / 2, BOX, BOX, 8), fill: 'paper', depth: 0.2 },
          { d: rect(-20, y - 7, 78, 14, 7), fill: 'grey', depth: 0.15 },
        ]),
      ],
    },
    ...ROWS.flatMap((y, i) => row(y, i)),
    // the lift carries the dumbbell up; the swing tilts it a beat later from the grip
    { id: 'lift', parent: 'root', p: [-124, 128], m: { p: LIFT }, shapes: [] },
    { id: 'swing', parent: 'lift', a: [0, 0], r: TILT, shapes: [] },
    dumbbell,
    glow('root', [178, -190], 22, popIn(DONE, BACK - 8)),
    glow('root', [-186, -96], 15, popIn(DONE + 6, BACK - 2)),
  ],
}

export default workoutPlan
