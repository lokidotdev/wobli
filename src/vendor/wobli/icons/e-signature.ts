// E-Signature
import { ellipse, line, poly, rect, rosette } from '../engine.ts'
import { EASY, IN, SNAP, SOFT, sparkle } from '../motions.ts'
import { EXT, FACE, LINE, check, facePoint, glow, hit, popIn, sheet } from '../parts.ts'
import type { Icon, Key, Shape, Track, Vec } from '../engine.ts'

// The pen glides down to the signature line and signs it in one looping stroke, the ink following the nib, then steps back.
// The seal grows in above the corner and drops onto the contract, which takes the hit on the same frame. After a long hold
// the seal shrinks away, the signature draws back into its first stroke and the contract is ready to be signed again.
const W = 220
const H = 280
const LINE_Y = 86 // the signature line on the contract face
const SIGN_X = -82 // where the signature starts

const REACH = 4 // pen leaves its rest
const WRITE = 22 // nib touches the line
const SIGNED = 66 // last stroke done
const PARKED = 88 // pen back at rest
const SEAL_IN = 74 // seal grows in above the corner
const LAND = 96 // seal hits the contract
const SEAL_OUT = 146
const UNSIGN = 152

// the signature: a cursive run of loops (a looped cycloid whose loops shrink as it goes), then a flourish to the right
const SIGNATURE: ReadonlyArray<Vec> = [
  ...Array.from({ length: 49 }, (_, i): Vec => {
    const t = (i / 48) * 4.5 * Math.PI
    const h = 58 * (1 - t / (14 * Math.PI))
    return [SIGN_X + 8 * t + 16 * Math.sin(t), LINE_Y - 6 - (h * (1 - Math.cos(t))) / 2]
  }),
  [34, LINE_Y - 26],
  [44, LINE_Y - 4],
  [60, LINE_Y],
]

// the pen's nib follows the stroke at the speed the ink is drawn: one key per point, timed by its share of the length on screen
const SEEN = SIGNATURE.map((p) => facePoint(...p))
const RUN = SEEN.reduce<Array<number>>((acc, p, i) => [...acc, i ? acc[i - 1] + Math.hypot(p[0] - SEEN[i - 1][0], p[1] - SEEN[i - 1][1]) : 0], [])
const HOME: Vec = [138, -104]
const PEN: Track<Vec> = [
  [REACH, HOME, SNAP],
  ...SEEN.map((p, i): Key<Vec> => [WRITE + ((SIGNED - WRITE) * RUN[i]) / RUN[RUN.length - 1], p]),
  [SIGNED + 2, SEEN[SEEN.length - 1], SNAP],
  [PARKED, HOME],
]

const SEAL: Vec = [74, 106] // seal centre on the contract face
const SEAL_LIFT: Vec = [8, -70] // above the contract, against the extrusion
const SEAL_SEEN = facePoint(...SEAL)
const SEAL_UP: Vec = [SEAL_SEEN[0] + SEAL_LIFT[0], SEAL_SEEN[1] + SEAL_LIFT[1]]

// the contract: the sheet's body and folded corner, a header tag, the clauses and the signature line with its mark
const contract = (): ReadonlyArray<Shape> => [
  ...sheet(W, H, 'deep').slice(0, 2),
  { d: rect(-84, -110, 78, 24, 6), fill: 'deep', depth: 0.25 },
  { d: line([-84, -58], [74, -58]) },
  { d: line([-84, -34], [84, -34]) },
  { d: line([-84, -10], [40, -10]) },
  { d: line([-88, LINE_Y + 8], [26, LINE_Y + 8]), line: 4 },
  { d: line([-94, LINE_Y - 22], [-82, LINE_Y - 10]), line: 4 },
  { d: line([-82, LINE_Y - 22], [-94, LINE_Y - 10]), line: 4 },
]

// the seal: two ribbon tails under a scalloped rosette, a white face and an ink check
const seal = ([x, y]: Vec): ReadonlyArray<Shape> => [
  { d: poly([[x - 10, y + 10], [x - 38, y + 72], [x - 24, y + 66], [x - 14, y + 80], [x + 6, y + 20]], 3), fill: 'deep', depth: 0.3 },
  { d: poly([[x + 10, y + 10], [x + 38, y + 72], [x + 24, y + 66], [x + 14, y + 80], [x - 6, y + 20]], 3), fill: 'deep', depth: 0.3 },
  { d: rosette(x, y, 44, 12), fill: 'main', depth: 0.6 },
  { d: ellipse(x, y, 27), fill: 'white', depth: 0.2 },
  { d: check([x, y], 24), line: 5 },
]

const eSignature: Icon = {
  name: 'e-signature',
  frames: 180,
  still: 120,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [230, 268], s: [92, 92], shapes: [] },
    // untilted carrier for the contract: takes the seal's hit and springs home
    { id: 'paper', parent: 'root', m: hit(LAND, [3, 9]), shapes: [] },
    {
      id: 'doc',
      parent: 'paper',
      tilt: FACE,
      shapes: [
        ...contract(),
        { d: line(...SIGNATURE), line: 5, round: true, trim: [[WRITE, 0], [SIGNED, 1, 0], [UNSIGN, 1, SNAP], [UNSIGN + 18, 0]] },
      ],
    },
    {
      parent: 'paper',
      tilt: FACE,
      a: SEAL,
      ip: SEAL_IN,
      op: SEAL_OUT + 31,
      p: [[SEAL_IN, SEAL_UP, 0], [LAND - 14, SEAL_UP, IN], [LAND, SEAL_SEEN]],
      m: popIn(SEAL_IN, SEAL_OUT),
      shapes: seal(SEAL),
    },
    {
      parent: 'root',
      p: PEN,
      s: [80, 80],
      r: [[REACH, 34, SNAP], [WRITE, 24], [SIGNED, 24, SOFT], [PARKED, 34]],
      shapes: [
        { d: rect(-17, -206, 34, 40, 15), fill: 'main', depth: 1 },
        { d: rect(-17, -170, 34, 94, 6), fill: 'deep', depth: 1 },
        { d: rect(-19, -80, 38, 16, 4), fill: 'grey', depth: 1 },
        { d: poly([[-15, -64], [15, -64], [3, -4], [-3, -4]], [4, 4, 2, 2]), fill: 'white', depth: 0.6 },
        { d: line([0, -44], [0, -14]), line: 3 },
      ],
    },
    glow('root', [-146, -140], 24, sparkle(LAND + 2)),
    glow('root', [168, 136], 16, sparkle(LAND + 10)),
  ],
}

export default eSignature
