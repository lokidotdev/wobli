// API Connection
import { ellipse, line, poly, rect } from '../engine.ts'
import { IN, SNAP, SOFT } from '../motions.ts'
import { EXT, FACE, LINE, glow, hit, popIn, popScale } from '../parts.ts'
import type { Icon, Layer, Shape, Vec } from '../engine.ts'

// The plug leaves the left block faster and faster and strikes the right block's socket, which takes the hit with the spring;
// its light comes on and three data dots run along the cord and into the plug, one behind the other. After a long hold the light goes
// and the plug eases back out along the line it came in on.
const GO = 8 // the plug leaves
const CONNECT = 30 // it strikes the socket
const FLOW = CONNECT + 6 // the first dot sets off
const TRAVEL = 30
const GAP = 10 // between dots
const UNPLUG = 140 // the plug pulls out
const OUT = 30

const HOME: Vec = [0, 0]
const PLUGGED: Vec = [40, 0]
const DOT_FROM = -58
const DOT_TO = 30 // under the plug head, into the socket
const LED: Vec = [128, -56]

// a block: slab body, a raised screen, a light
const block = (x: number, fill: Shape['fill']): ReadonlyArray<Shape> => [
  { d: rect(x - 52, -80, 104, 160, 18), fill, depth: 1 },
  { d: rect(x - 36, -40, 72, 90, 10), fill: 'tint', depth: 0.25 },
  { d: ellipse(x - 24, -58, 7), fill: 'grey', depth: 0.2 },
]

const apiConnection: Icon = {
  name: 'api-connection',
  frames: 180,
  still: 96,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [252, 246], shapes: [] },
    { id: 'face', parent: 'root', tilt: FACE, shapes: [] },
    // the cord, long enough to stay under the plug head at both ends of its trip
    { parent: 'face', shapes: [{ d: rect(-70, -9, 70, 18, 4), fill: 'grey', depth: 0.4 }] },
    ...[0, 1, 2].map((i): Layer => {
      const t = FLOW + i * GAP
      return {
        parent: 'face',
        p: [[t, [DOT_FROM, 0], SNAP], [t + TRAVEL, [DOT_TO, 0]]],
        s: popScale(t - 4, t + TRAVEL - 8),
        shapes: [{ d: ellipse(0, 0, 10), fill: 'ok', depth: 0.3 }],
      }
    }),
    {
      parent: 'face',
      p: [[GO, HOME, IN], [CONNECT, PLUGGED, 0], [UNPLUG, PLUGGED, SOFT], [UNPLUG + OUT, HOME]],
      shapes: [
        ...[-14, 6].map((y): Shape => ({ d: rect(26, y, 34, 9, 2), fill: 'white', depth: 0.3 })),
        { d: rect(-24, -28, 52, 56, 10), fill: 'gold', depth: 0.7 },
        { d: line([-8, -12], [-8, 12]) },
        { d: line([8, -12], [8, 12]) },
      ],
    },
    {
      id: 'server',
      parent: 'face',
      m: hit(CONNECT, [7, 0]),
      shapes: [
        ...block(126, 'deep'),
        { d: rect(66, -34, 14, 68, 4), fill: 'grey', depth: 0.6 },
        ...[0, 1, 2].map((i): Shape => ({ d: line([102, -22 + i * 24], [i === 2 ? 128 : 150, -22 + i * 24]) })),
      ],
    },
    {
      parent: 'face',
      shapes: [
        ...block(-122, 'main'),
        { d: poly([[-130, -22], [-148, 4], [-130, 30]], 0), round: true },
        { d: poly([[-114, -22], [-96, 4], [-114, 30]], 0), round: true },
      ],
    },
    { parent: 'server', a: LED, p: LED, m: popIn(CONNECT + 2, UNPLUG - 8), shapes: [{ d: ellipse(LED[0], LED[1], 9), fill: 'ok', depth: 0.3 }] },
    glow('root', [136, -136], 22, popIn(CONNECT + 4, UNPLUG - 16)),
  ],
}

export default apiConnection
