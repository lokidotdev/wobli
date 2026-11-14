// Container Stack
import { ellipse, line, rect } from '../engine.ts'
import { DROP, SOFT, twinkle } from '../motions.ts'
import { EXT, FACE, LINE, facePoint, glow, hit, popIn } from '../parts.ts'
import type { Icon, Layer, Shape, Track, Vec } from '../engine.ts'

// Three containers pop in above an empty rack base and drop one after another; the stack takes each landing with the
// spring, until they stand as a server. Their lights come on bottom first and a sparkle lands on the last.
// After a long hold they come apart the way they came: top first, each lifts back to where it appeared and shrinks away.
const W = 206 // a container's width on the face
const H = 78 // and its height
const FLOOR = 112 // the base's top on the face
const CENTRE = (i: number) => FLOOR - H / 2 - i * H // each container's centre on the face, bottom first
const LIGHT = (i: number): Vec => [W / 2 - 34, CENTRE(i)]
const UP: Vec = [0, -116] // where a container appears, above its slot

const APPEAR = (i: number) => 4 + i * 18 // pops in
const FALL = 8 // frames hanging before it drops
const FALL_LEN = 14
const LAND = (i: number) => APPEAR(i) + FALL + FALL_LEN // the one below takes the hit on this frame
const LIT = LAND(2) + 4 // lights come on, bottom first
const LIFT = (i: number) => 116 + (2 - i) * 12 // top first
const LIFT_LEN = 20

// one container: a slab body, a raised white label with vents, a light socket
const container = (i: number): ReadonlyArray<Shape> => {
  const [y, x] = [CENTRE(i) - H / 2, -W / 2]
  return [
    { d: rect(x, y, W, H, 12), fill: 'main', depth: 1.4 },
    { d: rect(x + 18, y + 16, 104, H - 32, 8), fill: 'white', depth: 0.3 },
    ...[40, 60, 80].map((v): Shape => ({ d: line([x + v, y + 28], [x + v, y + H - 28]) })),
    { d: ellipse(LIGHT(i)[0], LIGHT(i)[1], 13), fill: 'white', depth: 0.3 },
  ]
}

// waits up high, drops on an ease in, sits; later rises back on the soft ease to where it came from
const travel = (i: number): Track<Vec> => [
  [APPEAR(i) + FALL, UP, DROP],
  [LAND(i), [0, 0], 0],
  [LIFT(i), [0, 0], SOFT],
  [LIFT(i) + LIFT_LEN, UP],
]

// holder i carries the drop; it rides the base, which takes every landing, so the whole stack dips together
const holder = (i: number): Layer => ({ id: `holder${i}`, parent: 'base', p: travel(i), shapes: [] })

// scaled around its own centre: pops in, and shrinks away a few frames into the lift
const scaler = (i: number): Layer => {
  const c = facePoint(0, CENTRE(i))
  return { id: `scaler${i}`, parent: `holder${i}`, a: c, p: c, m: [twinkle(APPEAR(i)), twinkle(LIFT(i) + 6, true)], shapes: [] }
}

const face = (i: number): Layer => ({ id: `box${i}`, parent: `scaler${i}`, tilt: FACE, shapes: container(i) })

const light = (i: number): Layer => {
  const c = LIGHT(i)
  return {
    parent: `box${i}`,
    a: c,
    p: c,
    m: [twinkle(LIT + i * 5), twinkle(LIFT(i) - 10, true)],
    shapes: [{ d: ellipse(c[0], c[1], 9), fill: 'ok', line: 4 }],
  }
}

const containerStack: Icon = {
  name: 'container-stack',
  frames: 180,
  still: 100,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [256, 262], shapes: [] },
    { id: 'base', parent: 'root', m: [0, 1, 2].map((i) => hit(LAND(i), [0, 6], 0.6)), shapes: [] },
    // top first, so each lower container's face covers the side of the one standing on it
    ...[2, 1, 0].flatMap((i) => [holder(i), scaler(i), face(i), light(i)]),
    {
      parent: 'base',
      tilt: FACE,
      shapes: [
        ...[-W / 2 + 6, W / 2 - 38].map((x): Shape => ({ d: rect(x, FLOOR + 24, 32, 20, 5), fill: 'grey', depth: 0.6 })),
        { d: rect(-W / 2 - 18, FLOOR, W + 36, 30, 10), fill: 'grey', depth: 1.2 },
      ],
    },
    glow('root', [136, -168], 24, popIn(LIT + 10, LIFT(2) - 4)),
  ],
}

export default containerStack
