// Meditation Timer
import { ellipse, line, rect, ring } from '../engine.ts'
import { EASY } from '../motions.ts'
import { EXT, FACE, LINE, glow, outAndBack, popIn } from '../parts.ts'
import type { Icon, Shape, Track, Vec } from '../engine.ts'

// The crown of a round timer is pressed, and on the frame it bottoms out the breathing circle on the screen starts to swell:
// a slow inhale out to the guide ring, the inner core following a beat behind, a sparkle at the top of the breath. It holds,
// then exhales on the same easy curve back to its resting size and the timer sits still until the loop comes round.
const PRESS = 4 // the crown goes in
const PUSH = 6 // frames it takes to bottom out
const INHALE = PRESS + PUSH // the breath starts as the crown lands
const BREATH = 54 // frames the inhale and the exhale each take
const FULL = INHALE + BREATH // the top of the breath
const EXHALE = FULL + 22 // the hold before letting go
const LAG = 6 // the core follows the circle this much later

const CENTRE: Vec = [0, 14]
const BODY_R = 132
const SCREEN_R = 104
const GUIDE_R = 92
const GUIDE_HOLE = 84
const CIRCLE_R = 76
const CORE_R = 34
const REST = 52 // the circle's resting scale, in percent

// in on the easy ease, held, out on the same ease so the exhale retraces the inhale
const breathe = (start: number, rest = REST): Track<Vec> => [
  [0, [rest, rest], 0],
  [start, [rest, rest], EASY],
  [start + BREATH, [100, 100], 0],
  [EXHALE + start - INHALE, [100, 100], EASY],
  [EXHALE + start - INHALE + BREATH, [rest, rest]],
]

// four ticks around the bezel, at the quarter hours
const TICKS: ReadonlyArray<Shape> = [0, 90, 180, 270].map((deg) => {
  const a = (deg * Math.PI) / 180
  const p = (r: number): Vec => [CENTRE[0] + Math.sin(a) * r, CENTRE[1] - Math.cos(a) * r]
  return { d: line(p(SCREEN_R + 8), p(BODY_R - 8)), line: 5 }
})

const meditationTimer: Icon = {
  name: 'meditation-timer',
  frames: 180,
  still: 72,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [252, 262], shapes: [] },
    // the crown and its stem, pressed into the body and home without overshoot
    {
      parent: 'root',
      tilt: FACE,
      p: outAndBack<Vec>([0, 0], [0, 14], PRESS, PUSH, PRESS + PUSH + 4, 9),
      shapes: [
        { d: rect(-14, -BODY_R + CENTRE[1] - 48, 28, 52, 4), fill: 'grey', depth: 0.6 },
        { d: rect(-38, -BODY_R + CENTRE[1] - 78, 76, 32, 12), fill: 'gold', depth: 0.9 },
      ],
    },
    {
      id: 'face',
      parent: 'root',
      tilt: FACE,
      shapes: [
        { d: rect(96, -86, 36, 26, 6), fill: 'grey', depth: 0.6 }, // side button
        { d: ellipse(CENTRE[0], CENTRE[1], BODY_R), fill: 'deep', depth: 1 },
        ...TICKS,
        { d: ellipse(CENTRE[0], CENTRE[1], SCREEN_R), fill: 'tint', depth: 0.3 },
        { d: ring(CENTRE[0], CENTRE[1], GUIDE_R, GUIDE_HOLE), fill: 'white', depth: 0.2 },
      ],
    },
    // the breathing circle swells from the screen's centre
    { parent: 'face', a: CENTRE, p: CENTRE, s: breathe(INHALE), shapes: [{ d: ellipse(CENTRE[0], CENTRE[1], CIRCLE_R), fill: 'main', depth: 0.5 }] },
    // its core follows a beat behind
    { parent: 'face', a: CENTRE, p: CENTRE, s: breathe(INHALE + LAG, 70), shapes: [{ d: ellipse(CENTRE[0], CENTRE[1], CORE_R), fill: 'white', depth: 0.4 }] },
    glow('root', [150, -150], 24, popIn(FULL - 2, EXHALE + 6)),
    glow('root', [-156, 104], 15, popIn(FULL + 6, EXHALE + 12)),
  ],
}

export default meditationTimer
