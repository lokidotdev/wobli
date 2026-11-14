// No Results
import { arc, ellipse, poly, ring, view } from '../engine.ts'
import { IN, SOFT, spring } from '../motions.ts'
import { EXT, FACE, LINE, glow, outAndBack, popIn } from '../parts.ts'
import type { Icon, Layer, Shape, Track, Vec } from '../engine.ts'

// An open box sits empty. The magnifier glides in over its left corner and peers in, slides across to peer in at the right,
// and finds nothing. On the frame it stops, a question mark springs up out of the empty box. After a long hold the question
// mark sinks back into the box and the magnifier retraces its path home.
const START = 8 // the lens sets off
const LEFT = 32 // over the left of the box, peering in
const MOVE = 46 // on across
const RIGHT = 68 // over the right: nothing there either
const ASK = 70 // the question mark springs up out of the box
const SINK = 126 // it sinks back in
const BACK = 136 // the lens leaves the way it came
const HOME = 164

// the box is modelled in 3d, x across, y deep, z up, seen from the house view, open on top with walls of thickness T
const cam = view(28, 30)
type P3 = readonly [number, number, number]
const face = (pts: ReadonlyArray<P3>, r = 4) => poly(pts.map(cam), r)
const [BW, BD, BH, T] = [86, 70, 108, 12]
const [IW, ID] = [BW - T, BD - T]
const FLAP = 52
const LEAN = (34 * Math.PI) / 180 // flaps fall open outward this far from upright

// the top: the rim strip round the opening, outer edge one way and the hole the other so the hole stays open
const TOP_OUT: ReadonlyArray<P3> = [[-BW, -BD, BH], [BW, -BD, BH], [BW, BD, BH], [-BW, BD, BH]]
const TOP_IN: ReadonlyArray<P3> = [[-IW, ID, BH], [IW, ID, BH], [IW, -ID, BH], [-IW, -ID, BH]]
const RIM = face(TOP_OUT, 4) + face(TOP_IN, 2)

// a flap hinged on a top edge, leaning out; s picks the side, onX hinges it on an x edge rather than a y edge
const flap = (onX: boolean, s: -1 | 1): string => {
  const [o, z] = [FLAP * Math.sin(LEAN) * s, BH + FLAP * Math.cos(LEAN)]
  return onX
    ? face([[s * BW, -BD, BH], [s * BW, BD, BH], [s * BW + o, BD, z], [s * BW + o, -BD, z]])
    : face([[-BW, s * BD, BH], [BW, s * BD, BH], [BW, s * BD + o, z], [-BW, s * BD + o, z]])
}

const INSIDE: ReadonlyArray<Shape> = [
  { d: face([[-IW, -ID, T], [IW, -ID, T], [IW, ID, T], [-IW, ID, T]], 2), fill: 'tint' },
  { d: face([[IW, -ID, T], [IW, ID, T], [IW, ID, BH], [IW, -ID, BH]], 2), fill: 'tint' },
  { d: face([[-IW, ID, T], [IW, ID, T], [IW, ID, BH], [-IW, ID, BH]], 2), fill: 'tint' },
]
const FRONT: ReadonlyArray<Shape> = [
  { d: face([[-BW, -BD, 0], [-BW, BD, 0], [-BW, BD, BH], [-BW, -BD, BH]]), fill: 'main' },
  { d: face([[-BW, -BD, 0], [BW, -BD, 0], [BW, -BD, BH], [-BW, -BD, BH]]), fill: 'main' },
  { d: RIM, fill: 'main' },
]

// the question mark: a hooked slab over a stem, and its dot
const QK = 1.1
const q = (x: number, y: number): string => `${x * QK} ${y * QK}`
const QMARK = `M${q(-36, -40)}A${36 * QK} ${36 * QK} 0 1 1 ${q(18, -8.8)}L${q(10, 0)}L${q(10, 20)}L${q(-10, 20)}L${q(-10, -4)}L${q(8, -26.1)}A${16 * QK} ${16 * QK} 0 1 0 ${q(-16, -40)}Z`
const DOT_Y = 40 * QK
const MARK_REST: Vec = [-40, -96] // down in the box, hidden behind the front wall
const MARK_UP: Vec = [-40, -232]

// where the lens peers in from, high over each side of the opening
const OVER = (x: number, y: number): Vec => {
  const [u, v] = cam([x, y, BH])
  return [u + 26, v - 96]
}
const PARK: Vec = [124, -236]
const AT_LEFT = OVER(-30, 10)
const AT_RIGHT = OVER(60, -20)
const LENS_PATH: Track<Vec> = [
  [START, PARK, SOFT],
  [LEFT, AT_LEFT, 0],
  [MOVE, AT_LEFT, SOFT],
  [RIGHT, AT_RIGHT, 0],
  [BACK, AT_RIGHT, IN],
  [HOME, PARK],
]
// it leans toward where it is looking, a little each way
const LENS_LEAN: Track<number> = [
  [START, 0, SOFT],
  [LEFT, -10, 0],
  [MOVE, -10, SOFT],
  [RIGHT, 8, 0],
  [BACK, 8, IN],
  [HOME, 0],
]

const MARK_RISE: Track<Vec> = [...spring(MARK_UP, ASK, 0.7, MARK_REST), [SINK, MARK_UP, IN], [SINK + 18, MARK_REST]]

const mark: Layer = {
  id: 'mark',
  parent: 'root',
  p: MARK_RISE,
  a: [0, -40],
  s: outAndBack<Vec>([0, 0], [100, 100], ASK, 16, SINK + 4, 16),
  shapes: [],
}

const noResults: Icon = {
  name: 'no-results',
  frames: 180,
  still: 110,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [236, 408], shapes: [] },
    { parent: 'root', shapes: [{ d: flap(true, 1), fill: 'main' }, { d: flap(false, 1), fill: 'main' }] },
    { parent: 'root', shapes: INSIDE },
    mark,
    { parent: 'mark', shapes: [{ d: QMARK, fill: 'white', depth: 1 }, { d: ellipse(0, DOT_Y, 12), fill: 'white', depth: 1 }] },
    { parent: 'root', shapes: FRONT },
    { parent: 'root', shapes: [{ d: flap(true, -1), fill: 'main' }, { d: flap(false, -1), fill: 'main' }] },
    { id: 'lens', parent: 'root', p: LENS_PATH, r: LENS_LEAN, shapes: [] },
    {
      parent: 'lens',
      tilt: FACE,
      shapes: [
        { d: poly([[30, 42], [42, 30], [96, 84], [84, 96]], [0, 0, 12, 12]), fill: 'deep', depth: 1 },
        { d: poly([[28, 44], [44, 28], [56, 40], [40, 56]], 4), fill: 'grey', depth: 1 },
        { d: ring(0, 0, 46, 34), fill: 'deep', depth: 1 },
        { d: arc(0, 0, 24, 200, 250), round: true },
      ],
    },
    glow('root', [-140, -250], 22, popIn(ASK + 6, SINK - 6)),
  ],
}

export default noResults
