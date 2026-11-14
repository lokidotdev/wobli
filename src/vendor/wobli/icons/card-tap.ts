// Card Tap
import { arc, line, rect } from '../engine.ts'
import { EASY, IN, slide, SOFT, spring } from '../motions.ts'
import { checkBadge, EXT, FACE, glow, LINE, outIn, popIn, wave } from '../parts.ts'
import type { Icon, Shape, Track, Vec } from '../engine.ts'

// The card comes down faster and faster and taps the reader, which takes the hit with the spring; waves ripple, a ring runs
// round the screen and resolves into a check, the receipt slides out. The card lifts off on the mirror of the way it came.
const SCREEN_MID: Vec = [0, -60]
const PAY: Track<number> = [[34, 0, EASY], [58, 1], [144, 1, EASY], [166, 0]]

const cardTap: Icon = {
  name: 'card-tap',
  frames: 180,
  still: 92,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [270, 336], m: { p: [...spring([3, 9], 30, 0.92), [127, [3, 9], SOFT], [170, [0, 0]]] }, shapes: [] },
    {
      parent: 'root',
      tilt: FACE,
      m: slide([0, -92], 56, 56, 30),
      shapes: [{ d: rect(-54, -150, 108, 120, 4), fill: 'white', depth: 0.2 }, ...[0, 1, 2].map((i): Shape => ({ d: line([-34, -130 + i * 20], [i === 2 ? 4 : 34, -130 + i * 20]) }))],
    },
    {
      id: 'reader',
      parent: 'root',
      tilt: FACE,
      shapes: [
        { d: rect(-92, -124, 184, 250, 26), fill: 'deep', depth: 1 },
        { d: rect(-70, -102, 140, 84, 12), fill: 'tint' },
        ...[0, 1, 2].flatMap((c) => [0, 1].map((r): Shape => ({ d: rect(-62 + c * 44, 12 + r * 40, 36, 28, 8), fill: 'white', depth: 0.3 }))),
      ],
    },
    {
      parent: 'reader',
      a: SCREEN_MID,
      p: SCREEN_MID,
      m: outIn(30, 150),
      shapes: [{ d: 'M12 -74C12 -84 -12 -84 -12 -70C-12 -58 12 -63 12 -50C12 -36 -12 -36 -12 -48', round: true, line: 6 }, { d: line([0, -90], [0, -30]), line: 5 }],
    },
    { parent: 'reader', shapes: [{ d: arc(SCREEN_MID[0], SCREEN_MID[1], 32, -90, 269.9), line: 6, round: true, trim: PAY }] },
    { parent: 'reader', a: SCREEN_MID, p: SCREEN_MID, m: popIn(56, 144), shapes: checkBadge(SCREEN_MID, 24, 0.3) },
    wave('root', [10, -120], 92, 30, -60, -10),
    wave('root', [10, -120], 122, 38, -60, -10),
    {
      parent: 'root',
      p: [24, -196],
      tilt: [-32, 52],
      m: { p: [[6, [0, 0], IN], [30, [-10, 66], 0], [42, [-10, 66], SOFT], [72, [0, 0]]], r: [[6, 0, IN], [30, -8, 0], [42, -8, SOFT], [72, 0]] },
      shapes: [
        { d: rect(-104, -64, 208, 128, 16), fill: 'main', depth: 0.45 },
        { d: rect(-104, -34, 208, 24), fill: 'deep' },
        { d: rect(-80, 6, 36, 28, 6), fill: 'gold', depth: 0.2 },
        { d: line([20, 30], [78, 30]) },
      ],
    },
    glow('root', [-150, -150], 24, popIn(60, 130)),
  ],
}

export default cardTap
