// Voice Assistant
import { ellipse, pill, ring } from '../engine.ts'
import { IN, SOFT } from '../motions.ts'
import { EXT, FACE, LINE, glow, outAndBack, popIn, wave } from '../parts.ts'
import type { Icon, Key, Layer, Track, Vec } from '../engine.ts'

// The assistant wakes: the light ring on its base comes on and the orb lifts out of it as a voice level rises in its middle.
// It answers in three beats: on each one the orb swells and settles, the bars jump to a new level and a pair of sound waves
// leaves its sides. After a long hold the bars fall last first, the ring goes dark and the orb sinks home.
const ORB: Vec = [0, -142] // the orb's centre, in the root's untilted space
const R = 88
const LIFT: Vec = [0, -20]

const WAKE = 6 // the ring lights, the orb lifts
const BEATS = [26, 50, 74] // each one: the orb swells, the bars jump, a wave leaves
const SWELL = 7 // frames out to the swell
const SETTLE = 14 // frames back
const QUIET = 118 // the bars fall
const SLEEP = 136 // the ring goes dark, the orb sinks

// each bar's height (percent of its full height) at rest after waking and on each beat
const BARS = [48, 76, 98, 76, 48]
const LEVELS = [
  [60, 70, 100, 70, 60],
  [90, 60, 70, 100, 50],
  [55, 100, 60, 80, 95],
  [80, 65, 100, 60, 70],
]
const GAP = 24

// a bar's height track: rises on waking, jumps on every beat, falls last first
const level = (i: number): Track<Vec> => {
  const rise = WAKE + 8 + i * 2
  const fall = QUIET + (BARS.length - 1 - i) * 3
  const keys: Array<Key<Vec>> = [[rise, [100, 0], SOFT], [rise + 14, [100, LEVELS[0][i]], 0]]
  BEATS.forEach((b, n) => keys.push([b, [100, LEVELS[n][i]], SOFT], [b + SWELL + 2, [100, LEVELS[n + 1][i]], 0]))
  keys.push([fall, [100, LEVELS[BEATS.length][i]], IN], [fall + 12, [100, 0]])
  return keys
}

// the orb's swell on each beat: out on SOFT, home on IN
const SWELLS: Track<Vec> = BEATS.flatMap((b): Array<Key<Vec>> => [[b, [100, 100], SOFT], [b + SWELL, [107, 107], IN], [b + SWELL + SETTLE, [100, 100]]])

const bar = (h: number, i: number): Layer => {
  const c: Vec = [ORB[0] + (i - 2) * GAP, ORB[1]]
  return { parent: 'orb', a: c, p: c, s: level(i), shapes: [{ d: pill(c[0] - 8, c[1] - h / 2, 16, h), fill: 'white', line: 4, depth: 0.3 }] }
}

const voiceAssistant: Icon = {
  name: 'voice-assistant',
  frames: 180,
  still: 84,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [250, 336], shapes: [] },
    {
      id: 'base',
      parent: 'root',
      tilt: FACE,
      shapes: [
        { d: ellipse(0, 0, 132), fill: 'deep', depth: 1 },
        { d: ring(0, 0, 112, 90), fill: 'white', depth: 0.3 },
      ],
    },
    { parent: 'base', m: popIn(WAKE, SLEEP), shapes: [{ d: ring(0, 0, 112, 90), fill: 'main', depth: 0.3 }] },
    ...BEATS.map((b, n) => wave('root', ORB, 128 + n * 14, b - 6, -32, 32)), // glint swells slow: start early so it is out on the beat
    { id: 'lift', parent: 'root', m: { p: outAndBack<Vec>([0, 0], LIFT, WAKE, 20, SLEEP, 22) }, shapes: [] },
    {
      id: 'orb',
      parent: 'lift',
      a: ORB,
      p: ORB,
      s: SWELLS,
      shapes: [
        { d: ellipse(ORB[0], ORB[1], R), fill: 'main', depth: 1 },
        { d: ellipse(ORB[0], ORB[1], R - 18), fill: 'main' },
      ],
    },
    ...BARS.map(bar),
    glow('root', [-140, -236], 22, popIn(BEATS[0] + 4, QUIET - 6)),
  ],
}

export default voiceAssistant
