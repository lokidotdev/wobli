// Target Audience
import { ellipse } from '../engine.ts'
import { EXT, FACE, LINE, facePoint, glow, outAndBack, popIn, popScale } from '../parts.ts'
import type { Icon, Layer, Shape, Vec } from '../engine.ts'

// Three avatars grow out of the crowd beyond the target and slide in one after another: the first settles on the outer ring,
// the second on the middle ring, the last right on the bullseye. Each ring swells under its avatar on the frame it lands, and
// the bullseye brings a sparkle. After the hold they slide back out the way they came, last in first out, and the rings rest.
const JOIN = [10, 32, 54] // each avatar grows out and starts its slide
const TRAVEL = 30 // from the crowd to its seat
const LAND = JOIN.map((t) => t + TRAVEL)
const LEAVE = [142, 128, 114] // the last one in leaves first
const HOME_LEN = 22
const PULSE = 6 // the ring swells this long under a landing
const SETTLE = 14 // and settles back

// the board: radii of the outer ring, middle ring, inner ring and bullseye, each raised on the last
const RINGS = [150, 108, 66, 28]
const RING_FILL: ReadonlyArray<Shape['fill']> = ['main', 'white', 'main', 'white']
const RING_DEPTH = [1, 0.3, 0.3, 0.3]

// where each avatar settles (on the outer band, the middle band, the bullseye), which ring answers it, and where it comes from
const polar = (r: number, deg: number): Vec => [r * Math.cos((deg * Math.PI) / 180), r * Math.sin((deg * Math.PI) / 180)]
const SEATS: ReadonlyArray<{ seat: Vec; ring: number; from: Vec }> = [
  { seat: polar(129, 200), ring: 0, from: [-76, -14] },
  { seat: polar(87, -12), ring: 1, from: [104, -40] },
  { seat: [0, 0], ring: 3, from: [104, 112] },
]
// a standing avatar, upright and untilted, feet at 0 0: a base disc on the board, the shoulders and the head
const avatar = (): ReadonlyArray<Shape> => [
  { d: ellipse(0, 2, 36, 15), fill: 'white', depth: 0.4 },
  { d: 'M-28 0L-28 -26A28 26 0 0 1 28 -26L28 0Z', fill: 'deep', depth: 0.6 },
  { d: ellipse(0, -72, 20), fill: 'deep', depth: 0.5 },
]

// a ring of the board: swells under the avatar that lands on it, out on SOFT and home on IN
const ring = (i: number): Layer => {
  const lands = SEATS.findIndex((s) => s.ring === i)
  const t = lands < 0 ? -1 : LAND[lands] - 2
  return {
    parent: 'face',
    ...(t < 0 ? {} : { s: outAndBack<Vec>([100, 100], [106, 106], t, PULSE, t + PULSE, SETTLE) }),
    shapes: [{ d: ellipse(0, 0, RINGS[i]), fill: RING_FILL[i], depth: RING_DEPTH[i] }],
  }
}

// an avatar slides in from the crowd growing as it comes, and slides back out shrinking the way it came
// it stands upright on the untilted root, its feet gliding along the board's plane
const member = (i: number): Layer => {
  const { seat, from } = SEATS[i]
  return {
    parent: 'root',
    p: facePoint(...seat),
    m: { p: outAndBack<Vec>(facePoint(...from), [0, 0], JOIN[i], TRAVEL, LEAVE[i], HOME_LEN), s: popScale(JOIN[i] - 4, LEAVE[i] + 2) },
    shapes: avatar(),
  }
}
// back to front, by where each one stands
const BY_DEPTH = [0, 1, 2].sort((a, b) => facePoint(...SEATS[a].seat)[1] - facePoint(...SEATS[b].seat)[1])

const targetAudience: Icon = {
  name: 'target-audience',
  frames: 180,
  still: 104,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [250, 276], shapes: [] },
    { id: 'face', parent: 'root', tilt: FACE, shapes: [] },
    ...RINGS.map((_, i) => ring(i)),
    ...BY_DEPTH.map(member),
    glow('root', facePoint(-150, -150), 24, popIn(LAND[2], LEAVE[2] - 8)),
    glow('root', facePoint(170, 110), 16, popIn(LAND[2] + 6, LEAVE[2] - 2)),
  ],
}

export default targetAudience
