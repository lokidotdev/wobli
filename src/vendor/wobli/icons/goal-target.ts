// Goal Target
import { arc, ellipse, poly, rect, ring } from '../engine.ts'
import { IN, springTurn, twinkle } from '../motions.ts'
import { EXT, FACE, LINE, facePoint, glow, hit, popIn, popScale } from '../parts.ts'
import type { Icon, Layer, Track, Vec } from '../engine.ts'

// An arrow flies in, growing as it comes, and strikes the bullseye: the board takes the hit and the shaft quivers on the
// spring. Then the progress ring round the board fills segment by segment from the top, and a sparkle lands as it closes.
// After the hold the ring empties last in, first out, and the arrow shrinks away.
const FLY = 6 // the arrow pops in, far off
const HIT = 26 // and strikes
const FILL = HIT + 8 // the first ring segment pops
const GAP = 3 // between segments
const SEGMENTS = 12
const FULL = FILL + (SEGMENTS - 1) * GAP + 8 // the ring has closed
const EMPTY = 110 // the last segment leaves first
const OUT_GAP = 2
const ARROW_OUT = EMPTY + SEGMENTS * OUT_GAP + 10

const ANGLE = 38 // the arrow leans this far clockwise from straight up
const AWAY: Vec = [Math.sin((ANGLE * Math.PI) / 180) * 120, -Math.cos((ANGLE * Math.PI) / 180) * 120] // where it flies in from

// the progress ring: a white track and twelve annular segments, each its own slab
const [R_OUT, R_IN] = [150, 122]
const segment = (i: number) => {
  const a = -90 + i * (360 / SEGMENTS) + 2.5
  const b = a + 360 / SEGMENTS - 5
  return `${arc(0, 0, R_OUT, a, b)}${arc(0, 0, R_IN, b, a).replace('M', 'L')}Z`
}
const segMid = (i: number): Vec => {
  const m = ((-90 + (i + 0.5) * (360 / SEGMENTS)) * Math.PI) / 180
  const r = (R_OUT + R_IN) / 2
  return [Math.cos(m) * r, Math.sin(m) * r]
}
const ringSegment = (i: number): Layer => {
  const c = segMid(i)
  return {
    parent: 'face',
    a: c,
    p: c,
    s: [[0, [0, 0], 0], ...popScale(FILL + i * GAP, EMPTY + (SEGMENTS - 1 - i) * OUT_GAP)],
    shapes: [{ d: segment(i), fill: 'deep', depth: 0.4 }],
  }
}

// the arrow scale: grows in on the flight, shrinks away at the end
const ARROW_SCALE: Track<Vec> = [[0, [0, 0], 0], ...popScale(FLY, ARROW_OUT)]

const goalTarget: Icon = {
  name: 'goal-target',
  frames: 180,
  still: 96,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [250, 280], shapes: [] },
    { id: 'board', parent: 'root', m: hit(HIT, [-3, 8], 0.6), shapes: [] },
    { id: 'face', parent: 'board', tilt: FACE, shapes: [] },
    // the board: track ring, body, alternating rings and the bullseye, each raised on the last
    {
      parent: 'face',
      shapes: [
        { d: ring(0, 0, R_OUT, R_IN), fill: 'white', depth: 0.3 },
        { d: ellipse(0, 0, 104), fill: 'main', depth: 1 },
        { d: ellipse(0, 0, 76), fill: 'white', depth: 0.3 },
        { d: ellipse(0, 0, 48), fill: 'main', depth: 0.3 },
        { d: ellipse(0, 0, 21), fill: 'white', depth: 0.3 },
      ],
    },
    ...Array.from({ length: SEGMENTS }, (_, i) => ringSegment(i)),
    // the arrow: flies in along its own line, then rides the board and quivers from its buried tip
    {
      id: 'arrow',
      parent: 'board',
      p: [[FLY, AWAY, IN], [HIT, [0, 0]]],
      r: [[0, 0, 0], ...springTurn(0, HIT, 0.55, 7)],
      s: ARROW_SCALE,
      shapes: [],
    },
    {
      parent: 'arrow',
      r: ANGLE,
      shapes: [
        { d: poly([[-7, -4], [7, -4], [7, -156], [-7, -156]]), fill: 'deep', depth: 0.3 },
        { d: poly([[0, -128], [26, -160], [26, -200], [0, -168]], 3), fill: 'white', depth: 0.3 },
        { d: poly([[0, -128], [-26, -160], [-26, -200], [0, -168]], 3), fill: 'white', depth: 0.3 },
        { d: rect(-10, -146, 20, 12, 3), fill: 'deep', depth: 0.3 },
      ],
    },
    // the head shows only in flight; on the hit it is buried in the board
    { parent: 'arrow', r: ANGLE, op: HIT, shapes: [{ d: poly([[0, 26], [-17, -6], [17, -6]], 2), fill: 'deep', depth: 0.3 }] },
    glow('root', facePoint(-130, -170), 24, popIn(FULL, EMPTY - 6)),
    glow('root', facePoint(185, 70), 16, popIn(FULL + 6, EMPTY - 2)),
  ],
}

export default goalTarget
