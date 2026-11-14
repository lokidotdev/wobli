// Certificate Earned
import { ellipse, line, pill, poly, rect, rosette, star } from '../engine.ts'
import { IN, springTurn, sparkle } from '../motions.ts'
import { EXT, FACE, LINE, facePoint, glow, hit, outAndBack, popIn } from '../parts.ts'
import type { Icon, Shape, Track, Vec } from '../engine.ts'

// The certificate waits rolled up under its top curl. The roll travels down the face and the paper unrolls behind it, the roll
// thinning as it goes, until the whole certificate lies open. A ribbon seal grows in above its corner and drops onto it; the
// paper takes the hit on the same frame and the ribbon tails swing on after. After a long hold the seal shrinks away and the
// roll climbs back up, rolling the certificate away on the mirror of the way it came.
const W = 280
const H = 196
const TOP = -H / 2
const ROLL_R = 18 // the bottom roll's radius
const MASK_TOP = TOP - 60 // the reveal starts above the top curl
const MASK_H = H + 60 // down to where the roll comes to rest

const UNROLL = 6 // the roll sets off down the face
const ROLL_LEN = 40
const SEAL_IN = 54 // the seal grows in above the corner
const LAND = 72 // and hits the paper
const SEAL_OUT = 128
const ROLL_UP = 140 // the roll climbs back
const ROLL_BACK = 34

const ROLL_TOP = TOP + 6 // where the roll waits, tucked under the top curl
const ROLL_END = TOP + H // where it comes to rest, at the paper's bottom edge

const SEAL: Vec = [W / 2 - 52, H / 2 - 48] // seal centre on the certificate face
const SEAL_SEEN = facePoint(...SEAL)
const SEAL_UP: Vec = [SEAL_SEEN[0] + 8, SEAL_SEEN[1] - 76] // above the paper, against the extrusion

// the roll and the reveal share one track, so the paper ends exactly under the roll
const ROLL_P: Track<Vec> = outAndBack<Vec>(facePoint(0, ROLL_TOP), facePoint(0, ROLL_END), UNROLL, ROLL_LEN, ROLL_UP, ROLL_BACK)
const REVEAL: Track<Vec> = outAndBack<Vec>(
  [100, ((ROLL_TOP - MASK_TOP) / MASK_H) * 100],
  [100, ((ROLL_END - MASK_TOP) / MASK_H) * 100],
  UNROLL,
  ROLL_LEN,
  ROLL_UP,
  ROLL_BACK,
)

// the certificate face: paper, an inset border, the title plate, a name line, two lines of text and a signature line
const paper = (): ReadonlyArray<Shape> => [
  { d: rect(-W / 2, TOP, W, H, 6), fill: 'white', depth: 0.3 },
  { d: rect(-W / 2 + 14, TOP + 14, W - 28, H - 28, 4), line: 3 },
  { d: rect(-64, TOP + 32, 128, 26, 8), fill: 'main', depth: 0.25 },
  { d: pill(-40, TOP + 40, 80, 10), fill: 'white', line: 3 },
  { d: line([-84, TOP + 86], [84, TOP + 86]), line: 4 },
  { d: pill(-70, TOP + 102, 140, 10), fill: 'grey', depth: 0.1 },
  { d: pill(-50, TOP + 120, 100, 10), fill: 'grey', depth: 0.1 },
  { d: line([-W / 2 + 34, TOP + 168], [-30, TOP + 168]), line: 3 },
]

// the curl the paper hangs from, and the roll that carries the rest of it
const curl = (y: number, r: number): ReadonlyArray<Shape> => [
  { d: pill(-W / 2 - 8, y - r, W + 16, r * 2), fill: 'white', depth: 0.8 },
  { d: ellipse(W / 2 + 8 - r, y, r * 0.55), line: 3 },
]

// the seal: two ribbon tails swinging under a scalloped gold rosette with a white face and an ink star
const tails = ([x, y]: Vec): ReadonlyArray<Shape> => [
  { d: poly([[x - 10, y + 10], [x - 38, y + 74], [x - 24, y + 68], [x - 14, y + 82], [x + 6, y + 20]], 3), fill: 'main', depth: 0.3 },
  { d: poly([[x + 10, y + 10], [x + 38, y + 74], [x + 24, y + 68], [x + 14, y + 82], [x - 6, y + 20]], 3), fill: 'main', depth: 0.3 },
]
const medal = ([x, y]: Vec): ReadonlyArray<Shape> => [
  { d: rosette(x, y, 42, 12), fill: 'gold', depth: 0.6 },
  { d: ellipse(x, y, 26), fill: 'white', depth: 0.2 },
  { d: star(x, y + 1, 15, 0.46, 5, 2), fill: 'ink', line: false },
]

const certificateEarned: Icon = {
  name: 'certificate-earned',
  frames: 180,
  still: 112,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [256, 248], s: [104, 104], shapes: [] },
    // untilted carrier for the certificate: takes the seal's hit and springs home
    { id: 'cert', parent: 'root', m: hit(LAND, [3, 9]), shapes: [] },
    // an invisible matte that grows down with the roll: only the paper above the roll shows
    { id: 'reveal', parent: 'cert', tilt: FACE, a: [0, MASK_TOP], p: facePoint(0, MASK_TOP), s: REVEAL, shapes: [{ d: rect(-W, MASK_TOP, W * 2, MASK_H), line: false }] },
    { parent: 'cert', tilt: FACE, clip: 'reveal', shapes: paper() },
    { parent: 'cert', tilt: FACE, shapes: curl(TOP, 12) },
    // the roll: down the face on SOFT, thinning as the paper leaves it, home on its mirror
    {
      parent: 'cert',
      tilt: FACE,
      a: [0, 0],
      p: ROLL_P,
      s: outAndBack<Vec>([100, 100], [100, 76], UNROLL + 4, ROLL_LEN, ROLL_UP - 4, ROLL_BACK),
      shapes: curl(0, ROLL_R),
    },
    // the seal drops in on an ease in; its tails swing on after the hit
    {
      id: 'seal',
      parent: 'cert',
      tilt: FACE,
      a: SEAL,
      ip: SEAL_IN,
      op: SEAL_OUT + 31,
      p: [[SEAL_IN, SEAL_UP, 0], [LAND - 14, SEAL_UP, IN], [LAND, SEAL_SEEN]],
      m: popIn(SEAL_IN, SEAL_OUT),
      shapes: [],
    },
    { parent: 'seal', a: SEAL, p: SEAL, m: { r: springTurn(0, LAND - 2, 0.8, 12) }, shapes: tails(SEAL) },
    { parent: 'seal', shapes: medal(SEAL) },
    glow('root', [-160, -120], 24, sparkle(LAND + 2)),
    glow('root', [178, 120], 16, sparkle(LAND + 10)),
  ],
}

export default certificateEarned
