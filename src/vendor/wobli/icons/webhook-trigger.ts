// Webhook Trigger
import { ellipse, line, poly, rect } from '../engine.ts'
import { SNAP } from '../motions.ts'
import { EXT, FACE, LINE, facePoint, glow, hit, popIn, popScale } from '../parts.ts'
import type { Icon, Shape, Vec } from '../engine.ts'

// A lightning bolt pops out of the left app tile, which kicks back as it leaves; the bolt leaps over on an arc and strikes
// the right tile's empty plate, which takes the hit with the spring, and settles there as its glyph; a sparkle lands on the
// strike. After a long hold the sparkle and then the bolt pop away, leaving the plate empty for the next event.
const SIZE = 152 // an app tile's side on the face
const LEFT = -112 // the tiles' centres on the face
const RIGHT = 112
const FROM = facePoint(LEFT, -20) // where the bolt appears, over the left tile's glyph, in the root's space
const TO = facePoint(RIGHT, 0) // where it strikes: the middle of the right tile's plate

const APPEAR = 6 // the bolt pops out
const LAUNCH = 16 // it leaves; the left tile kicks back
const STRIKE = 56 // it hits the right tile
const RESET = 140 // the bolt pops away
const KNOCK: Vec = [9, -3] // the right tile's knock, on the face

// a lightning bolt centred on 0 0
const BOLT = poly([[8, -50], [-25, 8], [-3, 8], [-13, 50], [27, -10], [5, -10], [21, -50]], 3)

// an app tile: a rounded slab with a raised white plate
const tile = (x: number, fill: Shape['fill']): ReadonlyArray<Shape> => [
  { d: rect(x - SIZE / 2, -SIZE / 2, SIZE, SIZE, 30), fill, depth: 1 },
  { d: rect(x - 50, -50, 100, 100, 20), fill: 'white', depth: 0.3 },
]

// the webhook mark: three nodes joined in a triangle
const NODES: ReadonlyArray<Vec> = [[LEFT, -26], [LEFT - 28, 22], [LEFT + 28, 22]]

const webhookTrigger: Icon = {
  name: 'webhook-trigger',
  frames: 180,
  still: 100,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [248, 276], shapes: [] },
    { id: 'face', parent: 'root', tilt: FACE, shapes: [] },
    {
      parent: 'face',
      m: hit(STRIKE, KNOCK),
      shapes: tile(RIGHT, 'deep'),
    },
    {
      parent: 'face',
      m: hit(LAUNCH, [-8, 3]),
      shapes: [
        ...tile(LEFT, 'main'),
        { d: line(NODES[0], NODES[1], NODES[2], NODES[0]) },
        ...NODES.map(([x, y]): Shape => ({ d: ellipse(x, y, 11), fill: 'main', depth: 0.2 })),
      ],
    },
    // the bolt leaps on a high arc in the root's space, leaning into the jump and over into the strike; its face stays leaned
    {
      id: 'bolt',
      parent: 'root',
      p: [[LAUNCH, FROM, SNAP, [[40, -200], [-40, -200]]], [STRIKE, TO]],
      r: [[LAUNCH, -20, SNAP], [STRIKE, 0]],
      s: popScale(APPEAR, RESET),
      m: hit(STRIKE, facePoint(...KNOCK)), // rides the right tile's knock once it lands
      shapes: [],
    },
    { parent: 'bolt', tilt: FACE, shapes: [{ d: BOLT, fill: 'gold', depth: 0.7 }] },
    glow('root', [168, -146], 24, popIn(STRIKE + 4, RESET - 12)),
  ],
}

export default webhookTrigger
