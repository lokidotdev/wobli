// Storage Cleanup
import { line, pill, poly, rect } from '../engine.ts'
import { IN, OUT, SNAP, SOFT, twinkle } from '../motions.ts'
import { EXT, FACE, LINE, PHONE_SCREEN, glow, hit, phoneBody, popIn, popScale, sheet } from '../parts.ts'
import type { Icon, Layer, Shape, Track, Vec } from '../engine.ts'

// The broom leaning on the phone winds back and sweeps across the screen; each junk file flies off the left edge as the bristles
// reach it, the phone takes the brush on the same frames and the storage bar falls to a sliver. The broom swings back to where it
// leant along the way it came and a sparkle lands on the clean screen. After a long hold the files pop back in and the bar refills.
const WIND = 6 // the broom winds back
const SWEEP = 16 // and sweeps
const SWEPT = 36 // the bristles are past the screen
const BACK = 46 // the broom swings home, out of the way before the hold
const REFILL = 146 // the junk pops back in, one after another
const FLY_LEN = 22
const DRAIN = SWEPT - 4 // the storage bar falls as the last file leaves

// the broom, drawn leaning at rest: the hand at the top of the handle is its pivot
const HAND: Vec = [60, -250]
const DIR: Vec = [0.406, 0.914] // down the handle
const NRM: Vec = [0.914, -0.406] // across it
const along = (t: number, s: number): Vec => [HAND[0] + DIR[0] * t + NRM[0] * s, HAND[1] + DIR[1] * t + NRM[1] * s]
const band = (t0: number, t1: number, w0: number, w1 = w0) => [along(t0, -w0 / 2), along(t0, w0 / 2), along(t1, w1 / 2), along(t1, -w1 / 2)] as Vec[]

const BROOM: ReadonlyArray<Shape> = [
  { d: poly(band(0, 212, 18), 6), fill: 'main', depth: 0.6 },
  { d: poly(band(254, 330, 66, 124), [4, 4, 10, 10]), fill: 'gold', depth: 1 },
  ...[-28, 0, 28].map((s): Shape => ({ d: line(along(272, s * 0.8), along(318, s * 1.15)) })),
  { d: poly(band(206, 258, 56, 66), 10), fill: 'deep', depth: 0.8 },
]

// the storage bar: one rect shrinking from its left end, so every key shares its commands
const bar = (w: number) => rect(-52, -96, w, 18, 9)
const FULL = 104
const SLIVER = 22
const STORAGE: Track<string> = [
  [DRAIN, bar(FULL), SOFT],
  [DRAIN + 18, bar(SLIVER), 0],
  [REFILL + 8, bar(SLIVER), IN],
  [REFILL + 26, bar(FULL)],
]

// a junk file: knocked off the left edge on the frame the bristles reach it, popped back in where it lay
const JUNK = [
  { c: [24, 36] as Vec, tag: 'hot', kind: 'img', hit: 22, fly: [-250, 70] as Vec, turn: -40 },
  { c: [-26, -14] as Vec, tag: 'grey', kind: 'doc', hit: 26, fly: [-220, 20] as Vec, turn: -30 },
  { c: [-20, 84] as Vec, tag: 'gold', kind: 'pdf', hit: 28, fly: [-230, 110] as Vec, turn: -50 },
] as const
const junk = (i: number): Layer => {
  const { c, tag, kind, hit: t, fly, turn } = JUNK[i]
  const back = REFILL + i * 6
  return {
    parent: 'phone',
    a: c,
    p: c,
    r: [[t, 0, OUT], [t + FLY_LEN, turn, 0], [back - 2, turn, 0], [back - 1, 0]],
    m: [
      { p: [[t, [0, 0], OUT], [t + FLY_LEN, fly, 0], [back - 2, fly, 0], [back - 1, [0, 0]]] },
      { s: [[0, [100, 100], 0], ...(twinkle(t + FLY_LEN - 8, true).s ?? []), ...(twinkle(back).s ?? [])] },
    ],
    shapes: sheet(52, 64, tag, kind, c[0], c[1]),
  }
}

const storageCleanup: Icon = {
  name: 'storage-cleanup',
  frames: 180,
  still: 96,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [236, 268], s: [80, 80], shapes: [] },
    { id: 'face', parent: 'root', tilt: FACE, shapes: [] },
    // the phone takes the brush as each file leaves
    { id: 'phone', parent: 'face', m: JUNK.map((j) => hit(j.hit, [-3, 0], 0.5)), shapes: [] },
    { parent: 'phone', shapes: phoneBody(32, 'deep') },
    {
      parent: 'phone',
      shapes: [
        { d: PHONE_SCREEN(22), fill: 'tint' },
        { d: pill(-26, -126, 52, 12), fill: 'ink', line: false },
        { d: rect(-56, -100, 112, 26, 13), fill: 'white', depth: 0.3 },
        { d: [[0, bar(FULL), 0], ...STORAGE], fill: 'main', line: 4 },
        { d: pill(-36, 116, 72, 8), fill: 'ink', line: false },
      ],
    },
    junk(1),
    junk(0),
    junk(2),
    // the broom: winds back, sweeps across the screen, holds, swings home the way it went
    {
      parent: 'face',
      a: HAND,
      p: HAND,
      r: [[WIND, 0, SOFT], [SWEEP, -8, 0], [SWEEP + 1, -8, SNAP], [SWEPT, 58, 0], [BACK, 58, SNAP], [BACK + 26, 0]],
      shapes: BROOM,
    },
    glow('root', [-150, -150], 24, popIn(SWEPT + 4, REFILL - 16)),
    glow('root', [120, 110], 16, popIn(SWEPT + 10, REFILL - 10)),
  ],
}

export default storageCleanup
