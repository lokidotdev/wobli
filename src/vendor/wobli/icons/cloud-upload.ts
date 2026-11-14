// Cloud Upload
import { arc, ellipse, line, pill } from '../engine.ts'
import { EASY, hop, IN, OUT, spring } from '../motions.ts'
import { checkBadge, EXT, FACE, glow, laptop, LINE, outIn, popIn, sheet } from '../parts.ts'
import type { Icon, Layer, Track, Vec } from '../engine.ts'

// The file is thrown off the laptop, all speed up front along an arc, the cloud takes the hit with the spring, the progress
// ring and the laptop's bar fill together, a check lands. The file comes back where it came from: the laptop.
const UP_FROM: Vec = [176, 280]
const UP_TO: Vec = [318, 176]
const UP_ARC: readonly [Vec, Vec] = [[0, -110], [-110, 0]]
const cubic = (s: number): Vec => {
  const [c1, c2]: [Vec, Vec] = [[UP_FROM[0] + UP_ARC[0][0], UP_FROM[1] + UP_ARC[0][1]], [UP_TO[0] + UP_ARC[1][0], UP_TO[1] + UP_ARC[1][1]]]
  const u = 1 - s
  const w = [u * u * u, 3 * u * u * s, 3 * u * s * s, s * s * s]
  return [w[0] * UP_FROM[0] + w[1] * c1[0] + w[2] * c2[0] + w[3] * UP_TO[0], w[0] * UP_FROM[1] + w[1] * c1[1] + w[2] * c2[1] + w[3] * UP_TO[1]]
}
const CLOUD = 'M-84 48A40 40 0 0 1 -87 -28A54 54 0 0 1 15 -57A48 48 0 0 1 93 -13A33 33 0 0 1 84 48Z'
const ARRIVE = 62
const PROGRESS: Track<number> = [[ARRIVE, 0, EASY], [114, 1], [146, 1, EASY], [168, 0]]

const cloudUpload: Icon = {
  name: 'cloud-upload',
  frames: 180,
  still: 124,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', shapes: [] },
    { parent: 'root', p: [184, 372], tilt: FACE, shapes: laptop('grey').map((sh, i) => (i === 0 ? { ...sh, fill: 'white' } : sh)) },
    {
      parent: 'root',
      p: [184, 372],
      tilt: FACE,
      shapes: [
        { d: line([0, -108], [0, -140]), line: 6, round: true },
        { d: line([-13, -127], [0, -140], [13, -127]), line: 6, round: true },
        { d: pill(-62, -86, 124, 22), fill: 'white' },
        { d: line([-51, -75], [51, -75]), line: 9, round: true, trim: PROGRESS },
      ],
    },
    ...[0.3, 0.5, 0.7].map((t, i): Layer => {
      const c = cubic(t)
      return { parent: 'root', a: c, p: c, m: popIn(12 + i * 6, 128 + i * 4), shapes: [{ d: ellipse(c[0], c[1], 6), fill: 'ink', line: false }] }
    }),
    {
      id: 'sky',
      parent: 'root',
      a: [318, 216],
      p: [318, 216],
      m: [{ p: [[ARRIVE - 6, [0, 0], IN], [ARRIVE, [5, 12], 0], ...spring([0, 0], ARRIVE, 0.7, [5, 12])] }, { ...hop, at: 118, k: 0.4 }],
      shapes: [],
    },
    { parent: 'sky', p: UP_TO, tilt: FACE, shapes: [{ d: CLOUD, fill: 'white', depth: 1 }] },
    { parent: 'sky', p: UP_TO, tilt: FACE, shapes: [{ d: arc(0, -4, 108, -90, 269.9), line: 9, round: true, trim: PROGRESS }] },
    { parent: 'sky', a: UP_TO, p: UP_TO, m: popIn(116, 148), shapes: checkBadge(UP_TO, 34) },
    {
      parent: 'root',
      p: [[18, UP_FROM, OUT, UP_ARC], [ARRIVE + 4, UP_TO], [140, UP_TO, 0], [141, UP_FROM]],
      m: outIn(ARRIVE - 2, 148),
      tilt: FACE,
      shapes: sheet(64, 82, 'main'),
    },
    glow('sky', [430, 96], 20, popIn(122, 150)),
  ],
}

export default cloudUpload
