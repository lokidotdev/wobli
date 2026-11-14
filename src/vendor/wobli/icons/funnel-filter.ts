// Filter Funnel
import { arc, ellipse, line, poly, rect } from '../engine.ts'
import { DROP, IN, SOFT, impact, spring, twinkle } from '../motions.ts'
import { EXT, FACE, LINE, facePoint, glow, popIn } from '../parts.ts'
import type { Icon, Layer, Motion, Shape, Track, Vec } from '../engine.ts'

// Four mixed shapes pop in above the mouth one after another and drop in. The funnel takes the hit of the first; the square,
// triangle and diamond get caught in the mouth, the green circle slips through and a green ball springs out of the spout.
// After a long hold it all rewinds, last out first home: the ball rises back into the spout, the caught shapes lift out and pop away.
const TOP = -200 // where the shapes pop in, on the face
const CAUGHT = -92 // where the caught shapes rest, peeking over the rim
const SPOUT: Vec = [0, 68] // where the ball comes from and goes back to
const DROP_LEN = 24
const PASS_LEN = 30
const STAGGER = 12
const BALL_OUT = 58 // the frame the green one reaches the spout
const BALL_HOME = 140
const RISE = 150 // first caught shape lifts out
const RISE_LEN = 22

const DROPS: ReadonlyArray<readonly [x: number, shape: Shape, caught: boolean]> = [
  [-58, { d: rect(-19, -19, 38, 38, 6), fill: 'gold', depth: 0.6 }, true],
  [0, { d: ellipse(0, 0, 20), fill: 'ok', depth: 0.6 }, false],
  [58, { d: poly([[0, -22], [22, 17], [-22, 17]], 4), fill: 'hot', depth: 0.6 }, true],
  [0, { d: poly([[0, -22], [22, 0], [0, 22], [-22, 0]], 4), fill: 'deep', depth: 0.6 }, true],
]

// a shape popped in at the top, dropped in, and (if caught) lifted back out the way it came
const drop = ([x, shape, caught]: (typeof DROPS)[number], i: number): Layer => {
  const t = 2 + i * STAGGER
  const fallAt = t + 14
  const down = caught ? CAUGHT - TOP : SPOUT[1] - TOP
  const len = caught ? DROP_LEN : PASS_LEN
  // last in, first out: the diamond (i 3) rises first
  const back = RISE + (3 - i) * 6
  const p: Track<Vec> = caught
    ? [[fallAt, [0, 0], DROP], [fallAt + len, facePoint(0, down), 0], [back, facePoint(0, down), SOFT], [back + RISE_LEN, [0, 0]]]
    : [[fallAt, [0, 0], DROP], [fallAt + len, facePoint(0, down)]]
  const m: ReadonlyArray<Motion> = [twinkle(t), { p }, ...(caught ? [twinkle(back + 6, true)] : [])]
  return { parent: 'root', tilt: FACE, p: facePoint(x, TOP), m, ...(caught ? {} : { ip: 0, op: fallAt + len }), shapes: [shape] }
}

const BALL_DROP: Vec = facePoint(0, 84)

const funnelFilter: Icon = {
  name: 'funnel-filter',
  frames: 210,
  still: 120,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [252, 236], shapes: [] },
    // the green ball, behind the funnel so it slides out of the spout; dropped, so it springs
    {
      parent: 'root',
      tilt: FACE,
      a: SPOUT,
      p: facePoint(...SPOUT),
      ip: BALL_OUT - 2,
      op: BALL_HOME + 24,
      s: [[BALL_OUT, [60, 60], SOFT], [BALL_OUT + 20, [100, 100], 0], [BALL_HOME, [100, 100], IN], [BALL_HOME + 24, [60, 60]]],
      m: { p: [...spring(BALL_DROP, BALL_OUT, 0.55), [BALL_HOME, BALL_DROP, IN], [BALL_HOME + 24, [0, 0]]] },
      shapes: [{ d: ellipse(SPOUT[0], SPOUT[1], 22), fill: 'ok', depth: 0.7 }, { d: arc(SPOUT[0], SPOUT[1], 13, 200, 255), line: 4 }],
    },
    ...DROPS.map(drop),
    {
      id: 'funnel',
      parent: 'root',
      tilt: FACE,
      m: { ...impact(facePoint(1, 8)), at: 16 + DROP_LEN - 24 },
      shapes: [
        { d: rect(-24, 20, 48, 64, 6), fill: 'main', depth: 1 },
        { d: poly([[-100, -60], [100, -60], [28, 26], [-28, 26]], [6, 6, 4, 4]), fill: 'main', depth: 1 },
        ...[-1, 0, 1].map((k): Shape => ({ d: line([k * 54, -46], [k * 14, 14]), line: 4 })),
        { d: rect(-32, 40, 64, 18, 6), fill: 'deep', depth: 0.8 },
        { d: rect(-112, -86, 224, 30, 12), fill: 'deep', depth: 1 },
      ],
    },
    glow('root', facePoint(78, 138), 20, popIn(BALL_OUT + 12, BALL_HOME - 8)),
  ],
}

export default funnelFilter
