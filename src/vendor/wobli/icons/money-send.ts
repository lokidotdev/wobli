// Send Money
import { ellipse, line, pill } from '../engine.ts'
import { IN, SOFT } from '../motions.ts'
import { buzz, checkBadge, coin, EXT, FACE, facePoint, glow, LINE, outAndBack, PHONE_SCREEN, phoneBody, popIn, wave } from '../parts.ts'
import type { Icon, Layer, Shape, Vec } from '../engine.ts'

// The send button sinks under the thumb and a coin pops up out of the sender's screen. It rises, slowing to the top of its
// arc, and drops faster and faster onto the other phone, which buzzes on the frame it lands; a check pops beside it. After a
// long hold the coin, the check and the trail go, last in first out, ready for the next send.
const PRESS = 4 // the send button sinks
const LAUNCH = 12 // the coin pops out of the sender's screen
const TOP = LAUNCH + 20 // the top of the arc
const LAND = TOP + 18 // the coin lands and the receiver buzzes
const CLEAR = 140 // the coin, check and trail go

const PHONE = 0.68 // both phones, at the shared phone's proportions
const SIZE: Vec = [PHONE * 100, PHONE * 100]
const FROM: Vec = [-86, 72] // the sender, in root
const TO: Vec = [86, -18] // the receiver, in root

// the coin's path, in the receiver's space: out of the sender's screen, up to the top, down onto the receiver's screen
const START: Vec = [FROM[0] - TO[0], FROM[1] - TO[1] - 10]
const LANDING = facePoint(0, 24) // on the receiver's screen, below the contact
const APEX: Vec = [-80, -156]
const RISE: readonly [Vec, Vec] = [[10, -90], [-50, 0]]
const FALL: readonly [Vec, Vec] = [[44, 0], [-6, -80]]
const cubic = (a: Vec, [to, ti]: readonly [Vec, Vec], b: Vec, s: number): Vec => {
  const [c1, c2]: [Vec, Vec] = [[a[0] + to[0], a[1] + to[1]], [b[0] + ti[0], b[1] + ti[1]]]
  const u = 1 - s
  const w = [u * u * u, 3 * u * u * s, 3 * u * s * s, s * s * s]
  return [w[0] * a[0] + w[1] * c1[0] + w[2] * c2[0] + w[3] * b[0], w[0] * a[1] + w[1] * c1[1] + w[2] * c2[1] + w[3] * b[1]]
}
const inRoot = ([x, y]: Vec): Vec => [x + TO[0], y + TO[1]]

// three trail dots on the arc, popping in as the coin passes and out in the same order
const DOTS = [
  { c: inRoot(cubic(START, RISE, APEX, 0.55)), t: LAUNCH + 12 },
  { c: inRoot(cubic(APEX, FALL, LANDING, 0.08)), t: TOP + 2 },
  { c: inRoot(cubic(APEX, FALL, LANDING, 0.5)), t: TOP + 14 },
]

// the shared phone with its outline kept at the house weight after scaling
const phone = (): ReadonlyArray<Shape> => ([...phoneBody(32, 'deep'), { d: PHONE_SCREEN(), fill: 'tint' }] as ReadonlyArray<Shape>).map((s): Shape => ({ ...s, line: LINE / PHONE }))
const contact = (): ReadonlyArray<Shape> => [
  { d: ellipse(0, -74, 30), fill: 'white', depth: 0.3, line: LINE / PHONE },
  { d: line([-40, -20], [40, -20]), line: LINE / PHONE },
  { d: line([-26, 6], [26, 6]), line: LINE / PHONE },
]
const BUTTON: Vec = [0, 82]
const DONE: Vec = [58, -100] // the check, by the receiver's top corner

const moneySend: Icon = {
  name: 'money-send',
  frames: 180,
  still: 126,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [250, 262], shapes: [] },
    { id: 'from', parent: 'root', p: FROM, shapes: [] },
    { parent: 'from', s: SIZE, tilt: FACE, shapes: [...phone(), ...contact()] },
    {
      parent: 'from',
      tilt: FACE,
      a: BUTTON,
      p: facePoint(BUTTON[0] * PHONE, BUTTON[1] * PHONE),
      s: outAndBack<Vec>(SIZE, [SIZE[0] * 0.88, SIZE[1] * 0.88], PRESS, 8, PRESS + 12, 8),
      shapes: [{ d: pill(BUTTON[0] - 46, BUTTON[1] - 18, 92, 36), fill: 'ok', depth: 0.5, line: LINE / PHONE }],
    },
    { id: 'to', parent: 'root', p: TO, m: buzz(LAND, 3), shapes: [] },
    { parent: 'to', s: SIZE, tilt: FACE, shapes: [...phone(), ...contact()] },
    ...DOTS.map(({ c, t }, i): Layer => ({ parent: 'root', a: c, p: c, m: popIn(t, CLEAR + i * 5), shapes: [{ d: ellipse(c[0], c[1], 7), fill: 'ink', line: false }] })),
    {
      parent: 'to',
      tilt: FACE,
      p: [[LAUNCH, START, SOFT, RISE], [TOP, APEX, IN, FALL], [LAND, LANDING]],
      r: [[LAUNCH, 0, SOFT], [TOP, -180, IN], [LAND, -360]],
      m: popIn(LAUNCH - 4, CLEAR + 12),
      shapes: coin(34),
    },
    { parent: 'to', tilt: FACE, a: DONE, p: facePoint(...DONE), m: popIn(LAND + 4, CLEAR + 6), shapes: checkBadge(DONE, 22, 0.4) },
    wave('to', LANDING, 96, LAND),
    glow('root', [-180, -120], 20, popIn(LAND + 6, CLEAR - 4)),
  ],
}

export default moneySend
