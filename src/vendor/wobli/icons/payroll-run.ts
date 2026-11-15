// Payroll Run
import { ellipse, line, pill, rect } from '../engine.ts'
import { EASY, OUT } from '../motions.ts'
import { EXT, FACE, LINE, facePoint, glow, hit, laptop, popIn, popScale } from '../parts.ts'
import type { Icon, Layer, Shape, Track, Vec } from '../engine.ts'

// The run bar on the laptop fills and the laptop kicks as each pay slip is thrown off its screen, three in a row, all speed up
// front along an arc. Each avatar takes the hit on the frame its slip lands and a sparkle pops over the last one: everyone is
// paid. After the hold the slips shrink into the avatars' hands, last paid first gone, and the bar empties for the next run.
const RUN: Track<number> = [[2, 0, EASY], [26, 1], [150, 1, EASY], [172, 0]] // the run bar fills, then empties after the hold
const LAUNCH = [20, 30, 40] // each slip leaves the screen
const FLY = 30 // frames in the air
const LAND = LAUNCH.map((t) => t + FLY) // each avatar takes its slip
const GONE = [146, 140, 134] // the slips shrink away, last paid first

const LAPTOP: Vec = [184, 386] // where the laptop stands, front left
const LAP_SIZE: Vec = [78, 78] // drawn smaller so the team fits behind it
const SCREEN: Vec = (([x, y]) => [LAPTOP[0] + x, LAPTOP[1] + y])(facePoint(0, (-100 * LAP_SIZE[1]) / 100)) // the slips leave from the middle of its display

// where each avatar stands, a row along the back of the face; the slip lands in front of its chest
const FEET: ReadonlyArray<Vec> = [[242, 244], [336, 222], [430, 200]]
const PERSON: Vec = [86, 86] // the avatars drawn smaller, to stand three in a row
const CATCH = FEET.map(([x, y]): Vec => [x - 22, y - 30])

// a standing avatar, upright and untilted, feet at 0 0: a base disc, the shoulders and the head
const avatar = (fill: Shape['fill']): ReadonlyArray<Shape> => [
  { d: ellipse(0, 2, 44, 18), fill: 'white', depth: 0.4 },
  { d: 'M-36 0L-36 -34A36 34 0 0 1 36 -34L36 0Z', fill, depth: 0.7 },
  { d: ellipse(0, -94, 25), fill, depth: 0.6 },
]

// a pay slip on the leaned plane, centred on 0 0: the paper, a gold coin stamped on it, two lines of figures
const slip = (): ReadonlyArray<Shape> => [
  { d: rect(-34, -24, 68, 48, 6), fill: 'white', depth: 0.3 },
  { d: ellipse(-16, -4, 10), fill: 'gold', depth: 0.2 },
  { d: line([2, -8], [22, -8]) },
  { d: line([-24, 12], [22, 12]) },
]

// out of the screen and up on OUT, all speed up front, landing in front of the avatar
const flight = (i: number): Layer => ({
  parent: 'root',
  p: [[LAUNCH[i], SCREEN, OUT, [[10, -160], [-30, -60]]], [LAND[i], CATCH[i]]],
  r: [[LAUNCH[i], -20, OUT], [LAND[i], 0]],
  s: popScale(LAUNCH[i], GONE[i]),
  tilt: FACE,
  shapes: slip(),
})

const person = (i: number): Layer => ({
  parent: 'root',
  p: FEET[i],
  s: PERSON,
  m: hit(LAND[i], [6, 4], 0.6),
  shapes: avatar(i === 1 ? 'deep' : 'main'),
})

const payrollRun: Icon = {
  name: 'payroll-run',
  frames: 180,
  still: 104,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', shapes: [] },
    person(0),
    person(1),
    person(2),
    {
      id: 'desk',
      parent: 'root',
      p: LAPTOP,
      s: LAP_SIZE,
      m: LAUNCH.map((t) => hit(t, [-3, 2], 0.5)),
      shapes: [],
    },
    { parent: 'desk', tilt: FACE, shapes: laptop('deep') },
    {
      parent: 'desk',
      tilt: FACE,
      shapes: [
        { d: pill(-62, -66, 124, 22), fill: 'white' },
        { d: line([-51, -55], [51, -55]), line: 9, round: true, trim: RUN },
      ],
    },
    flight(0),
    flight(1),
    flight(2),
    glow('root', [FEET[2][0] - 4, FEET[2][1] - 140], 20, popIn(LAND[2] + 2, 124)),
    glow('root', [FEET[0][0] - 60, FEET[0][1] - 100], 16, popIn(LAND[2] + 8, 128)),
  ],
}

export default payrollRun
