// Smart Speaker
import { ellipse, pill, rect } from '../engine.ts'
import { IN, SOFT } from '../motions.ts'
import { EXT, FACE, LINE, facePoint, glow, outAndBack, popIn, wave } from '../parts.ts'
import type { Icon, Key, Layer, Shape, Track, Vec } from '../engine.ts'

// The speaker hears its name: the light ring round its top unrolls from the middle out and its lights rise to a voice level.
// It answers in three beats: on each one the ring swells, the lights jump to a new level and a pair of sound waves leaves
// its sides. After a long hold the lights fall last first and the ring rolls back into its middle, dark again at the seam.
const WAKE = 8 // the ring lights from its middle out
const WAKE_LEN = 16
const BEATS = [34, 58, 82] // each one: the ring swells, the lights jump, a wave leaves
const SWELL = 7 // frames out to the swell
const SETTLE = 14 // frames back
const QUIET = 122 // the lights fall
const SLEEP = 140 // the ring rolls back dark

// the speaker: one upright silhouette on the house face, cap over a fabric body on a foot
const BODY = { x: -82, y: -128, w: 164, h: 252 }
const RING = { x: -74, y: -110, w: 148, h: 40 }
const RING_MID: Vec = [0, RING.y + RING.h / 2]

// the lights on the ring, percent of full height at rest after waking and on each beat
const DOTS = 5
const DOT_GAP = 26
const DOT_H = 24
const LEVELS = [
  [40, 70, 100, 70, 40],
  [90, 50, 70, 100, 45],
  [50, 100, 55, 80, 95],
  [75, 60, 100, 55, 70],
]

// a light's height: rises after waking, jumps on every beat, falls last first
const level = (i: number): Track<Vec> => {
  const rise = WAKE + WAKE_LEN + i * 2
  const fall = QUIET + (DOTS - 1 - i) * 3
  const keys: Array<Key<Vec>> = [[rise, [100, 0], SOFT], [rise + 12, [100, LEVELS[0][i]], 0]]
  BEATS.forEach((b, n) => keys.push([b + 2, [100, LEVELS[n][i]], SOFT], [b + SWELL + 4, [100, LEVELS[n + 1][i]], 0]))
  keys.push([fall, [100, LEVELS[BEATS.length][i]], IN], [fall + 12, [100, 0]])
  return keys
}

// the ring's swell on each beat: out on SOFT, home on IN
const SWELLS: Track<Vec> = BEATS.flatMap((b): Array<Key<Vec>> => [[b, [100, 100], SOFT], [b + SWELL, [103, 112], IN], [b + SWELL + SETTLE, [100, 100]]])

const dot = (i: number): Layer => {
  const c: Vec = [RING_MID[0] + (i - (DOTS - 1) / 2) * DOT_GAP, RING_MID[1]]
  return { parent: 'lit', a: c, p: c, s: level(i), shapes: [{ d: pill(c[0] - 5, c[1] - DOT_H / 2, 10, DOT_H), fill: 'white', line: 4, depth: 0.3 }] }
}

// the fabric grille: staggered rows of little holes
const GRILLE: ReadonlyArray<Shape> = [-30, 4, 38, 72].flatMap((y, row) =>
  [-36, 0, 36].slice(0, row % 2 ? 2 : 3).map((x): Shape => ({ d: ellipse(x + (row % 2 ? 18 : 0), y, 6), fill: 'white', line: 4 })),
)

const smartSpeaker: Icon = {
  name: 'smart-speaker',
  frames: 180,
  still: 96,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [244, 262], shapes: [] },
    ...BEATS.map((b, n) => wave('root', facePoint(...RING_MID), 150 + n * 16, b - 6, -32, 32)), // glint swells slow: start early
    {
      id: 'speaker',
      parent: 'root',
      tilt: FACE,
      shapes: [
        { d: rect(-62, BODY.y + BODY.h - 8, 124, 30, 12), fill: 'grey', depth: 0.6 }, // the foot
        { d: rect(BODY.x, BODY.y, BODY.w, BODY.h, 60), fill: 'deep', depth: 1 },
        ...GRILLE,
        { d: pill(BODY.x + 14, -40, 14, 100), fill: 'white', line: 4 }, // a glint down the round side
        { d: rect(BODY.x - 4, BODY.y - 22, BODY.w + 8, 40, 20), fill: 'white', depth: 0.8 }, // the cap
        { d: pill(-34, BODY.y - 8, 20, 10), fill: 'ink', line: false },
        { d: pill(14, BODY.y - 8, 20, 10), fill: 'ink', line: false },
        { d: pill(RING.x, RING.y, RING.w, RING.h), fill: 'grey', depth: 0.4 }, // the ring, dark
      ],
    },
    // the ring lit: unrolls from its middle, swells on each beat
    { id: 'wake', parent: 'speaker', a: RING_MID, p: RING_MID, s: outAndBack<Vec>([0, 100], [100, 100], WAKE, WAKE_LEN, SLEEP, WAKE_LEN), shapes: [] },
    { id: 'lit', parent: 'wake', a: RING_MID, p: RING_MID, s: SWELLS, shapes: [{ d: pill(RING.x, RING.y, RING.w, RING.h), fill: 'main', depth: 0.4 }] },
    ...Array.from({ length: DOTS }, (_, i) => dot(i)),
    glow('root', [-150, -170], 22, popIn(BEATS[0] + 4, QUIET - 6)),
    glow('root', [158, 96], 15, popIn(BEATS[1] + 4, QUIET - 2)),
  ],
}

export default smartSpeaker
