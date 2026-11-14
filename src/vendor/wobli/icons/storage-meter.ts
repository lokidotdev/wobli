// Storage Meter
import { ellipse, line, rect } from '../engine.ts'
import { DROP, IN, SOFT } from '../motions.ts'
import { EXT, FACE, LINE, glow, hit, popIn, popScale, sheet } from '../parts.ts'
import type { Icon, Layer, Shape, Track, Vec } from '../engine.ts'

// Three files drop onto the drive one after another; it takes each landing and the meter climbs a step on the same frame, until
// it is nearly full and the alert pops. Then the files squash flat and draw together, the meter falls back to a sliver of what it
// was and the alert gives way to a sparkle. After the hold the files pop away and the meter drains to empty.
const LANDS = [22, 38, 54] as const // each file touches the drive
const FALL = 14
const FULL = LANDS[2] + 2 // the alert pops
const SQUASH = 74 // the files flatten, outer ones a beat behind
const SQUASH_LEN = 16
const SHRINK = SQUASH + 6 // the meter falls back
const CLEAR = 140 // the files pop away, left first
const DRAIN = 148

const FILE_W = 92
const FILE_H = 118
const TOP = -26 // the drive's top edge, where the files stand
const BADGE: Vec = [172, TOP] // the alert, on the drive's top right corner
const HIGH: Vec = [0, -70] // where a file starts its drop

// the meter: one rect growing from the track's left end, so every key shares its commands
const LEFT = -142
const bar = (w: number) => rect(LEFT, 38, w, 32, 16)
const LEVELS = [32, 110, 196, 284] as const
const SLIM = 96
const STEP = 12
const METER: Track<string> = [
  [0, bar(LEVELS[0]), 0],
  [LANDS[0], bar(LEVELS[0]), SOFT],
  [LANDS[0] + STEP, bar(LEVELS[1]), 0],
  [LANDS[1], bar(LEVELS[1]), SOFT],
  [LANDS[1] + STEP, bar(LEVELS[2]), 0],
  [LANDS[2], bar(LEVELS[2]), SOFT],
  [LANDS[2] + STEP, bar(LEVELS[3]), 0],
  [SHRINK, bar(LEVELS[3]), SOFT],
  [SHRINK + 20, bar(SLIM), 0],
  [DRAIN, bar(SLIM), IN],
  [DRAIN + 24, bar(LEVELS[0])],
]

// a file that drops in from above, squashes flat toward the middle, and later pops away
const file = (i: number, tag: Shape['fill'], kind: 'doc' | 'img' | 'pdf'): Layer => {
  const x = (i - 1) * 104
  const lag = Math.abs(i - 1) * 4
  const t = LANDS[i]
  return {
    parent: 'face',
    a: [x, TOP],
    p: [x, TOP],
    m: [
      { p: [[t - FALL, HIGH, DROP], [t, [0, 0], 0], [SQUASH + lag, [0, 0], SOFT], [SQUASH + lag + SQUASH_LEN, [-x * 0.22, 0]]] },
      { s: [[SQUASH + lag, [100, 100], SOFT], [SQUASH + lag + SQUASH_LEN, [92, 44]]] },
      { s: [[0, [0, 0], 0], ...popScale(t - FALL, CLEAR + i * 4)] },
    ],
    shapes: sheet(FILE_W, FILE_H, tag, kind, x, TOP - FILE_H / 2 - 4),
  }
}

const storageMeter: Icon = {
  name: 'storage-meter',
  frames: 180,
  still: 112,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [250, 250], shapes: [] },
    { id: 'drive', parent: 'root', m: LANDS.map((t) => hit(t, [0, 6], 0.5)), shapes: [] },
    { id: 'face', parent: 'drive', tilt: FACE, shapes: [] },
    // the drive: body, meter track, a label plate and its light
    {
      parent: 'face',
      shapes: [
        { d: rect(-180, TOP, 360, 150, 28), fill: 'deep', depth: 1 },
        { d: rect(-152, 28, 304, 52, 26), fill: 'white', depth: 0.3 },
        { d: METER, fill: 'main', line: 4 },
        { d: rect(-152, 96, 96, 14, 7), fill: 'grey', depth: 0.2 },
        { d: ellipse(144, 103, 9), fill: 'ok', line: 4 },
      ],
    },
    file(0, 'main', 'doc'),
    file(2, 'gold', 'pdf'),
    file(1, 'ok', 'img'),
    // the alert on the drive's corner, out as the files flatten
    {
      parent: 'face',
      a: BADGE,
      p: BADGE,
      m: { s: [[0, [0, 0], 0], ...popScale(FULL, SQUASH + 4)] },
      shapes: [
        { d: ellipse(BADGE[0], BADGE[1], 30), fill: 'hot', depth: 0.7 },
        { d: line([BADGE[0], BADGE[1] - 14], [BADGE[0], BADGE[1] + 4]), line: 6 },
        { d: ellipse(BADGE[0], BADGE[1] + 13, 3.5), fill: 'ink', line: false },
      ],
    },
    glow('root', [150, -150], 24, popIn(SHRINK + 16, CLEAR - 8)),
    glow('root', [-168, -60], 16, popIn(SHRINK + 22, CLEAR - 4)),
  ],
}

export default storageMeter
