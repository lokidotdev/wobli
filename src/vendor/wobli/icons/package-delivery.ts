// Package Delivery
import { at, ellipse, line, poly, view } from '../engine.ts'
import { SNAP, glint } from '../motions.ts'
import { EXT, glow, LINE, mapPin, outAndBack, popIn } from '../parts.ts'
import type { Icon, Layer, Track, Vec } from '../engine.ts'

// The carton's flaps fold shut, the far one a beat after the near one, and tape runs along the seam and down the front. A
// tracking pin pops up out of the taped seam and arcs along the route to its stop, dots marking the way; the stop pings on
// the frame it lands. After the hold the pin pops away, the tape peels back the way it ran and the flaps open, last shut first.
const SHUT = 6 // the near flap folds shut; the far one follows
const LAG = 6
const TAPE_ON = 30 // tape along the top, then down the front
const PIN_IN = 48 // the pin pops out of the taped seam
const PIN_GO = 54 // and arcs along the route
const ARRIVE = 86
const PIN_OUT = 132
const PEEL = 138 // the front tape comes off first, then the top
const OPEN = 158 // the far flap opens first, once the tape is off

// the carton is modelled in 3d, x along the route, y across it, z up, so the flaps hinge on true edges
const K = 0.88
const cam = view(28, 30)
const bx = (x: number, y: number, z: number): Vec => cam([x * K, y * K, z * K])
type P3 = readonly [number, number, number]
const face = (pts: ReadonlyArray<P3>, r = 4) => poly(pts.map(([x, y, z]) => bx(x, y, z)), r)
const [BW, BD, BH] = [74, 58, 138]
const TAPE = 13

// a path rebuilt every other frame from an eased number, so a flap swings on its hinge instead of morphing straight across
const bake = (track: Track<number>, shape: (v: number) => string): Track<string> =>
  Array.from({ length: 91 }, (_, i) => [i * 2, shape(at(track, i * 2))] as const)

// a flap hinged on the top edge at x = s * BW, open at 115 degrees, shut flat at 0
const flapD = (s: -1 | 1) => (deg: number) => {
  const t = (deg * Math.PI) / 180
  const [fx, fz] = [s * BW * (1 - Math.cos(t)), BH + BW * Math.sin(t)]
  return face([[s * BW, -BD, BH], [s * BW, BD, BH], [fx, BD, fz], [fx, -BD, fz]])
}
const flap = (s: -1 | 1, shut: number, open: number): Layer => ({
  parent: 'box',
  shapes: [{ d: bake(outAndBack(115, 0, shut, 16, open, 16), flapD(s)), fill: 'gold' }],
})
// tape grown from 0 to 1 along its run; never quite 0 so the morph keeps its commands
const grow = (v: number) => Math.max(v, 0.05)
const TAPE_TOP = (v: number) => face([[-TAPE, BD, BH + 1], [TAPE, BD, BH + 1], [TAPE, BD - 2 * BD * grow(v), BH + 1], [-TAPE, BD - 2 * BD * grow(v), BH + 1]])
const TAPE_FRONT = (v: number) => face([[-TAPE, -BD - 1, BH], [TAPE, -BD - 1, BH], [TAPE, -BD - 1, BH - 50 * grow(v)], [-TAPE, -BD - 1, BH - 50 * grow(v)]])

// the route runs out of the box's far side along the ground; the pin rises from the taped seam and arcs over it to the stop
const ROAD = (x: number): Vec => bx(x, -20, 0)
const START = bx(0, -20, BH)
const STOP = ROAD(200)
const DOTS = [100, 126, 152].map(ROAD)
const ARC: readonly [Vec, Vec] = [[20, -80], [0, -70]]

const PIN_K = 0.38

const packageDelivery: Icon = {
  name: 'package-delivery',
  frames: 180,
  still: 112,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [200, 328], shapes: [] },
    { parent: 'root', shapes: [{ d: face([[20, -52, 0], [232, -52, 0], [232, 12, 0], [20, 12, 0]], 12), fill: 'white', depth: 0.4 }] },
    { parent: 'root', shapes: [{ d: ellipse(STOP[0], STOP[1], 22, 11), fill: 'main', depth: 0.3 }] },
    ...DOTS.map((c, i): Layer => ({ parent: 'root', a: c, p: c, m: popIn(PIN_GO + 8 + i * 7, PIN_OUT - 6 + i * 5), shapes: [{ d: ellipse(c[0], c[1], 7, 4), fill: 'ink', line: false }] })),
    { id: 'box', parent: 'root', shapes: [{ d: face([[-BW, -BD, BH], [BW, -BD, BH], [BW, BD, BH], [-BW, BD, BH]]), fill: 'grey' }] },
    flap(1, SHUT + LAG, OPEN),
    {
      parent: 'box',
      shapes: [
        { d: face([[-BW, -BD, 0], [-BW, BD, 0], [-BW, BD, BH], [-BW, -BD, BH]]), fill: 'gold' },
        { d: face([[-BW, -BD, 0], [BW, -BD, 0], [BW, -BD, BH], [-BW, -BD, BH]]), fill: 'gold' },
        { d: face([[22, -BD, 26], [62, -BD, 26], [62, -BD, 68], [22, -BD, 68]], 5), fill: 'white' },
        { d: line(bx(30, -BD, 55), bx(54, -BD, 55)) },
        { d: line(bx(30, -BD, 40), bx(46, -BD, 40)) },
      ],
    },
    flap(-1, SHUT, OPEN + LAG),
    { parent: 'box', ip: TAPE_ON, op: PEEL + 22, shapes: [{ d: bake(outAndBack(0, 1, TAPE_ON, 14, PEEL + 6, 14), TAPE_TOP), fill: 'main' }] },
    { parent: 'box', ip: TAPE_ON + 10, op: PEEL + 10, shapes: [{ d: bake(outAndBack(0, 1, TAPE_ON + 10, 10, PEEL, 10), TAPE_FRONT), fill: 'main' }] },
    // the stop pings on the frame the pin lands
    { parent: 'root', a: STOP, p: STOP, m: glint(ARRIVE), shapes: [{ d: ellipse(STOP[0], STOP[1], 40, 20), line: 4 }] },
    {
      parent: 'root',
      a: START,
      p: [[PIN_GO, START, SNAP, ARC], [ARRIVE, STOP]],
      m: popIn(PIN_IN, PIN_OUT),
      shapes: [{ d: mapPin(START[0], START[1], PIN_K), fill: 'main', depth: 0.6 }, { d: ellipse(START[0], START[1] - 160 * PIN_K, 12), fill: 'white', line: 4 }],
    },
    glow('root', [STOP[0] - 70, STOP[1] - 128], 20, popIn(ARRIVE, PIN_OUT - 4)),
  ],
}

export default packageDelivery
