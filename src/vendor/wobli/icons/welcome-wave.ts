// Welcome Wave
import { ellipse, line, pill, poly, rect } from '../engine.ts'
import { EASY, spring, wiggle } from '../motions.ts'
import { EXT, FACE, LINE, PHONE_SCREEN, facePoint, glow, hit, phoneBody, popIn } from '../parts.ts'
import type { Icon, Layer, Shape, Vec } from '../engine.ts'

// A hand pops up out of the welcome screen from its wrist and waves: it rocks back, and on the first peak of the wave confetti
// bursts out from behind the palm and the phone takes the hello with a small nudge. Two more taps of the wave settle it, the
// confetti and the hand hold, then everything pops back into the screen it came from for the loop.
const WRIST: Vec = [0, 40] // where the hand hinges, on the screen face
const PALM: Vec = [0, -50] // where the confetti bursts from
const PALM_SEEN = facePoint(...PALM)
const HELLO = 46 // the wave's first peak: the confetti beat
const LEAVE = 146 // everything pops back into the screen

// the waving hand: four fingers behind the palm, the thumb, a sleeve cuff at the wrist
const hand = (): ReadonlyArray<Shape> => [
  ...([[-52, -112], [-26, -134], [0, -130], [26, -108]] as const).map(([x, y]): Shape => ({ d: pill(x, y, 24, -10 - y), fill: 'white', depth: 0.6 })),
  { d: poly([[-42, 18], [-98, -24], [-78, -50], [-22, -18]], 14), fill: 'white', depth: 0.6 },
  { d: rect(-54, -48, 104, 80, 30), fill: 'white', depth: 0.6 },
  { d: rect(-56, 26, 108, 30, 10), fill: 'main', depth: 0.7 },
]

// confetti thrown from behind the palm: where it lands, its colour, how far it turns
const BITS: ReadonlyArray<readonly [Vec, Shape['fill'], number]> = [
  [[-128, -70], 'gold', 40],
  [[112, -96], 'main', -30],
  [[-92, -136], 'main', 70],
  [[60, -150], 'gold', -50],
  [[138, -20], 'gold', 25],
  [[-142, 10], 'main', -60],
]

const welcomeWave: Icon = {
  name: 'welcome-wave',
  frames: 180,
  still: 100,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [254, 270], s: [96, 96], shapes: [] },
    // the phone takes the hello on the confetti beat, a small kick that springs home
    { id: 'phone', parent: 'root', m: hit(HELLO, [-3, 6]), shapes: [] },
    { parent: 'phone', tilt: FACE, shapes: phoneBody(32, 'deep') },
    {
      parent: 'phone',
      tilt: FACE,
      shapes: [
        { d: PHONE_SCREEN(22), fill: 'tint' },
        { d: line([-30, 84], [30, 84]) },
        { d: rect(-48, 104, 96, 24, 12), fill: 'main', depth: 0.3 },
        { d: pill(-24, -128, 48, 12), fill: 'ink', line: false },
      ],
    },
    ...BITS.map(([v, c, turn], i): Layer => {
      const at = HELLO + (i % 3) * 3
      return {
        parent: 'phone',
        a: PALM_SEEN,
        p: PALM_SEEN,
        m: [{ p: spring(v, at, 0.6), r: [[at, 0, EASY], [at + 40, turn]] }, ...popIn(at, LEAVE - 12 + i * 3)],
        shapes: i % 2 ? [{ d: ellipse(PALM_SEEN[0], PALM_SEEN[1], 9), fill: c, depth: 0.4 }] : [{ d: pill(PALM_SEEN[0] - 16, PALM_SEEN[1] - 7, 32, 14), fill: c, depth: 0.4 }],
      }
    }),
    // the hand grows out of the screen from its wrist, waves on the hand preset, and pops back in
    { parent: 'phone', tilt: FACE, a: WRIST, p: WRIST, m: [wiggle, ...popIn(4, LEAVE)], shapes: hand() },
    glow('root', [150, -170], 24, popIn(HELLO + 4, LEAVE - 20)),
    glow('root', [-156, -110], 16, popIn(HELLO + 12, LEAVE - 14)),
  ],
}

export default welcomeWave
