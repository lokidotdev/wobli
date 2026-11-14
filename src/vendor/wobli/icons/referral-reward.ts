// Referral Reward
import { ellipse, pill, rect } from '../engine.ts'
import { IN, SOFT } from '../motions.ts'
import { EXT, FACE, LINE, facePoint, glow, hit, outIn, popIn, popScale } from '../parts.ts'
import type { Icon, Layer, Shape, Track, Vec } from '../engine.ts'

// The referrer tosses a gift over to the friend and recoils on the throw; it arcs across and the friend takes the catch on the
// frame it lands. A gold ring swells under the friend, then under the referrer, each with a sparkle: both are rewarded. After
// the hold the rings fold away, the gift shrinks into the friend's hands and a fresh one pops in beside the referrer.
const LAUNCH = 10 // the gift leaves the referrer
const TOP = LAUNCH + 20 // the top of its arc
const LAND = TOP + 18 // the friend catches it
const GLOW = [LAND + 2, LAND + 10] // the friend's ring, then the referrer's
const FADE = [112, 120] // the rings fold away, the friend's first
const GONE = 116 // the gift shrinks into the friend's hands
const RESET = GONE + 31 // unseen, it goes back beside the referrer
const BACK = 148 // and pops in there

// face points where each avatar stands: the referrer front left, the friend back right
const SEATS: ReadonlyArray<Vec> = [[-96, 58], [100, -54]]
const FEET = SEATS.map((s) => facePoint(...s))
const HAND = 70 // the gift rides this far above the feet
const GIFT_A: Vec = [FEET[0][0] + 84, FEET[0][1] - HAND]
const GIFT_B: Vec = [FEET[1][0] - 84, FEET[1][1] - HAND]
const APEX: Vec = [(GIFT_A[0] + GIFT_B[0]) / 2, Math.min(GIFT_A[1], GIFT_B[1]) - 64]

// out of the referrer's side on SOFT, up to the top, down on IN into the friend's arms; home again while it is shrunk away
const FLIGHT: Track<Vec> = [
  [LAUNCH, GIFT_A, SOFT, [[10, -60], [-60, 0]]],
  [TOP, APEX, IN, [[60, 0], [-10, -60]]],
  [LAND, GIFT_B, 0],
  [RESET, GIFT_A],
]

// a standing avatar, upright and untilted, feet at 0 0: a base disc, the shoulders and the head
const avatar = (fill: Shape['fill']): ReadonlyArray<Shape> => [
  { d: ellipse(0, 2, 52, 21), fill: 'white', depth: 0.4 },
  { d: 'M-42 0L-42 -40A42 40 0 0 1 42 -40L42 0Z', fill, depth: 0.7 },
  { d: ellipse(0, -110, 30), fill, depth: 0.6 },
]

// a small gift box on the leaned plane, centred on 0 0: box, ribbon, lid, bow
const gift = (): ReadonlyArray<Shape> => [
  { d: rect(-34, -20, 68, 50, 6), fill: 'gold', depth: 0.8 },
  { d: rect(-8, -20, 16, 50), fill: 'white', depth: 0.8 },
  { d: rect(-40, -36, 80, 18, 5), fill: 'gold', depth: 0.5 },
  { d: rect(-8, -36, 16, 18), fill: 'white', depth: 0.5 },
  { d: pill(-22, -52, 20, 16), fill: 'white', depth: 0.3 },
  { d: pill(2, -52, 20, 16), fill: 'white', depth: 0.3 },
]

// the reward ring under an avatar: grows out of the ground under its feet and folds back into it
const ring = (i: number): Layer => ({
  parent: 'face',
  a: SEATS[i],
  p: SEATS[i],
  s: popScale(GLOW[i ? 0 : 1], FADE[i ? 0 : 1]),
  shapes: [
    { d: ellipse(SEATS[i][0], SEATS[i][1], 80), fill: 'gold', depth: 0.3 },
    { d: ellipse(SEATS[i][0], SEATS[i][1], 60) },
  ],
})

// each avatar recoils from its beat: the referrer from the throw, the friend from the catch
const person = (i: number): Layer => ({
  parent: 'root',
  p: FEET[i],
  m: i ? hit(LAND, [5, 4], 0.6) : hit(LAUNCH, [-5, 3], 0.6),
  shapes: avatar(i ? 'deep' : 'main'),
})

const referralReward: Icon = {
  name: 'referral-reward',
  frames: 180,
  still: 100,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [250, 300], shapes: [] },
    { id: 'face', parent: 'root', tilt: FACE, shapes: [] },
    ring(1),
    ring(0),
    person(1),
    person(0),
    {
      parent: 'root',
      p: FLIGHT,
      r: [[LAUNCH, 0, SOFT], [TOP, -14, IN], [LAND, 0]],
      m: outIn(GONE, BACK),
      tilt: FACE,
      shapes: gift(),
    },
    glow('root', [FEET[1][0] + 72, FEET[1][1] - 150], 22, popIn(GLOW[0], FADE[0] - 6)),
    glow('root', [FEET[0][0] - 74, FEET[0][1] - 140], 18, popIn(GLOW[1], FADE[1] - 6)),
  ],
}

export default referralReward
