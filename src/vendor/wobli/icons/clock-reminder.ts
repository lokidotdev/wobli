// Clock Reminder
import { ellipse, line, poly, rect } from '../engine.ts'
import { buzz, EXT, FACE, facePoint, glow, LINE, popIn, wave } from '../parts.ts'
import type { Icon, Layer, Shape, Vec } from '../engine.ts'

// The hammer starts beating between the bells and the whole clock shakes on its feet on the same frame; the bells take each hit
// a beat later and ring waves swell off the top. Two bursts of ringing, then the clock stands still for the long hold.
const RINGS = [10, 52] as const // the frames each burst of ringing starts
const BELL_Y = -96
const HAMMER: Vec = [0, -100] // where the hammer hinges, between the bells
const RING_MID: Vec = facePoint(0, -80) // where the waves swell from, in the untilted root

// a bell on its post, rocking on its post when the hammer hits it
const bell = (s: -1 | 1): Layer => ({
  parent: 'clock',
  a: [s * 60, BELL_Y],
  p: [s * 60, BELL_Y],
  r: s * 36,
  m: RINGS.map((t) => buzz(t + 2, 7, 6)),
  shapes: [
    { d: rect(s * 60 - 7, BELL_Y - 4, 14, 22, 3), fill: 'grey', depth: 0.5 },
    { d: `M${s * 60 - 36} ${BELL_Y}A36 36 0 0 1 ${s * 60 + 36} ${BELL_Y}Z`, fill: 'gold', depth: 0.8 },
  ],
})

const clockReminder: Icon = {
  name: 'clock-reminder',
  frames: 180,
  still: 66,
  line: LINE,
  extrude: EXT,
  layers: [
    // untilted, pivoting on the feet: carries the shake, the waves and the sparkles
    { id: 'root', a: [0, 130], p: [252, 390], m: RINGS.map((t) => buzz(t, 6, 6)), shapes: [] },
    ...RINGS.flatMap((t) => [wave('root', RING_MID, 136, t + 4, -64, -22), wave('root', RING_MID, 166, t + 10, -64, -22)]),
    {
      id: 'clock',
      parent: 'root',
      tilt: FACE,
      shapes: [...([-1, 1] as const).map((s): Shape => ({ d: poly([[s * 46, 76], [s * 72, 84], [s * 98, 128], [s * 74, 138]], 6), fill: 'deep', depth: 0.8 }))],
    },
    bell(-1),
    bell(1),
    {
      parent: 'clock',
      a: HAMMER,
      p: HAMMER,
      m: RINGS.map((t) => buzz(t, 20, 6)),
      shapes: [{ d: rect(-5, -134, 10, 36, 3), fill: 'grey', depth: 0.4 }, { d: ellipse(0, -136, 12), fill: 'gold', depth: 0.6 }],
    },
    {
      parent: 'clock',
      shapes: [
        { d: ellipse(0, 0, 104), fill: 'hot', depth: 1 },
        { d: ellipse(0, 0, 80), fill: 'white', depth: 0.2 },
        ...[0, 90, 180, 270].map((a): Shape => {
          const [c, s] = [Math.cos((a * Math.PI) / 180), Math.sin((a * Math.PI) / 180)]
          return { d: line([c * 58, s * 58], [c * 68, s * 68]) }
        }),
        { d: line([0, 0], [0, -52]), line: 7, round: true },
        { d: line([0, 0], [34, 16]), line: 7, round: true },
        { d: ellipse(0, 0, 9), fill: 'ink', line: false },
      ],
    },
    glow('root', [-150, -200], 22, popIn(RINGS[0] + 6, 120)),
    glow('root', [158, -110], 16, popIn(RINGS[1] + 6, 126)),
  ],
}

export default clockReminder
