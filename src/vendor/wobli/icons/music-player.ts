// Music Player
import { ellipse, line, pill, rect } from '../engine.ts'
import { IN, SNAP, SOFT } from '../motions.ts'
import { EXT, FACE, LINE, glow, hit, outAndBack, popIn } from '../parts.ts'
import type { Icon, Key, Layer, Track, Vec } from '../engine.ts'

// The tone arm swings in and drops its needle on the record, the deck takes the touch and the disc winds up into its spin.
// The equalizer bars jump to a new level on every beat while it plays; a sparkle lands on the first one. The bars fall
// last first, the disc slows to a stop on the pose it started from, and the arm swings home the way it came.
const DISC: Vec = [-45, 0] // the record's centre on the deck face
const R = 96
const PIVOT: Vec = [122, -82] // where the tone arm hinges
const SWING = 55 // degrees the arm turns to reach the outer groove

const ARM_ON = 6 // the arm sets off
const ARM_LEN = 18
const DROP = ARM_ON + ARM_LEN // the needle touches the record
const SPIN = DROP - 2 // the disc winds up as the needle lands
const STOP = 142 // the disc has slowed home
const BEATS = [34, 52, 70, 88, 106] // the bars jump
const QUIET = 118 // the bars fall, last first
const ARM_OFF = 140 // the arm swings home

// each bar's height as a percent of its full height, on waking and on every beat
const BAR_X = [64, 90, 116, 142]
const BAR_FOOT = 96
const BAR_H = 64
const LEVELS = [
  [55, 85, 65, 40],
  [90, 50, 100, 60],
  [45, 100, 60, 90],
  [80, 60, 95, 50],
  [100, 75, 45, 85],
  [60, 95, 80, 55],
]

const level = (i: number): Track<Vec> => {
  const rise = DROP + 2 + i * 2
  const fall = QUIET + (BAR_X.length - 1 - i) * 3
  const keys: Array<Key<Vec>> = [[rise, [100, 12], SOFT], [rise + 8, [100, LEVELS[0][i]], 0]]
  BEATS.forEach((b, n) => keys.push([b + i, [100, LEVELS[n][i]], SOFT], [b + i + 8, [100, LEVELS[n + 1][i]], 0]))
  keys.push([fall, [100, LEVELS[BEATS.length][i]], IN], [fall + 10, [100, 12]])
  return keys
}

const bar = (x: number, i: number): Layer => {
  const foot: Vec = [x, BAR_FOOT]
  return { parent: 'deck', a: foot, p: foot, s: level(i), shapes: [{ d: rect(x - 9, BAR_FOOT - BAR_H, 18, BAR_H, 4), fill: i % 2 ? 'gold' : 'white', depth: 0.4 }] }
}

// two full turns, wound up and slowed on the same curve, so the last frame is the first pose
const DISC_R: Track<number> = [[SPIN, 0, SNAP], [STOP, 720]]

const musicPlayer: Icon = {
  name: 'music-player',
  frames: 180,
  still: 72,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [258, 258], s: [92, 92], shapes: [] },
    {
      id: 'deck',
      parent: 'root',
      tilt: FACE,
      m: hit(DROP, [0, 4], 0.5),
      shapes: [
        { d: rect(-175, -118, 350, 236, 30), fill: 'main', depth: 1 },
        { d: ellipse(DISC[0], DISC[1], R + 8), fill: 'grey', depth: 0.3 },
        { d: ellipse(PIVOT[0], PIVOT[1], 22), fill: 'white', depth: 0.5 },
      ],
    },
    {
      parent: 'deck',
      a: DISC,
      p: DISC,
      r: DISC_R,
      shapes: [
        { d: ellipse(DISC[0], DISC[1], R), fill: 'deep', depth: 0.4 },
        { d: ellipse(DISC[0], DISC[1], R - 24), line: 3 },
        { d: ellipse(DISC[0], DISC[1], 34), fill: 'gold', depth: 0.2 },
        { d: line([DISC[0], DISC[1] - 30], [DISC[0], DISC[1] - 12]) },
        { d: ellipse(DISC[0], DISC[1], 6), fill: 'ink', line: false },
      ],
    },
    ...BAR_X.map(bar),
    // the tone arm, hinged on its post, swings out on SOFT and home on IN along the same arc
    {
      parent: 'deck',
      a: PIVOT,
      p: PIVOT,
      r: outAndBack<number>(0, SWING, ARM_ON, ARM_LEN, ARM_OFF, ARM_LEN),
      shapes: [
        { d: pill(PIVOT[0] - 7, PIVOT[1], 14, 104), fill: 'white', depth: 0.4 },
        { d: rect(PIVOT[0] - 13, PIVOT[1] + 92, 26, 30, 6), fill: 'deep', depth: 0.5 },
        { d: ellipse(PIVOT[0], PIVOT[1], 12), fill: 'grey', depth: 0.6 },
      ],
    },
    glow('root', [-170, -150], 24, popIn(BEATS[0] + 4, QUIET - 4)),
    glow('root', [175, -130], 16, popIn(BEATS[1] + 4, QUIET)),
  ],
}

export default musicPlayer
