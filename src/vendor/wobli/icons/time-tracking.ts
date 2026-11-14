// Time Tracking
import { ellipse, line, pill, poly, rect } from '../engine.ts'
import { IN, SNAP } from '../motions.ts'
import { buzz, EXT, FACE, LINE, glow, outAndBack, popIn } from '../parts.ts'
import type { Icon, Layer, Shape, Track, Vec } from '../engine.ts'

// The crown is pressed and the stopwatch starts: its hand ticks round one step at a time while the timesheet rows fill one
// after another, each bar extending out of its row's start. A second press stops it on the frame the last bar lands; the watch
// gives a small jolt and a sparkle pops. After the hold the crown is pressed a third time: the hand flies back to the top and the
// bars draw back into their starts, last first.
const START = 12 // first press: the hand begins to tick
const TICK = 7 // frames between ticks
const TICKS = 9 // 30 degrees each
const STOP = START + TICKS * TICK // second press: the watch stops as the last bar lands
const RESET = 130 // third press: hand flies home, bars draw back
const PRESSES = [START - 4, STOP - 4, RESET - 4] as const

const SW: Vec = [92, 62] // the stopwatch's centre on the face
const SW_R = 62

const ROW_X = -116 // where every bar grows out of
const ROWS = [
  { y: -42, w: 122, at: START, len: 22, fill: 'main' },
  { y: -2, w: 156, at: START + 18, len: 24, fill: 'deep' },
  { y: 38, w: 86, at: START + 42, len: STOP - START - 42, fill: 'main' },
] as const
const BAR_H = 24
const EMPTY: Vec = [0, 100]
const FULL: Vec = [100, 100]

// the hand ticks round in steps, holds, then flies home
const HAND: Track<number> = [
  ...Array.from({ length: TICKS }, (_, i) => [
    [START + i * TICK, i * 30, SNAP] as const,
    [START + i * TICK + 3, (i + 1) * 30, 0] as const,
  ]).flat(),
  [RESET, TICKS * 30, IN],
  [RESET + 14, 0],
]

// a timesheet row: its bar grows out of the row's start and draws back in, last row first
const bar = ({ y, w, at, len, fill }: (typeof ROWS)[number], i: number): Layer => {
  const back = RESET + 2 + (ROWS.length - 1 - i) * 6
  return {
    parent: 'sheet',
    a: [ROW_X, y],
    p: [ROW_X, y],
    ip: at,
    op: back + 16,
    s: outAndBack<Vec>(EMPTY, FULL, at, len, back, 16),
    shapes: [{ d: rect(ROW_X, y - BAR_H / 2, w, BAR_H, 7), fill, depth: 0.4 }],
  }
}

const timeTracking: Icon = {
  name: 'time-tracking',
  frames: 180,
  still: 100,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [254, 250], shapes: [] },
    // the timesheet: a white board, a title pill and a dash at the start of each row
    {
      id: 'sheet',
      parent: 'root',
      tilt: FACE,
      shapes: [
        { d: rect(-162, -112, 250, 196, 22), fill: 'white', depth: 1 },
        { d: pill(-140, -94, 84, 16), fill: 'grey', depth: 0.3 },
        ...ROWS.map(({ y }): Shape => ({ d: line([-142, y], [-128, y]), line: 4 })),
      ],
    },
    ...ROWS.map(bar),
    // the stopwatch, jolting when it is stopped
    { id: 'watch', parent: 'sheet', a: SW, p: SW, m: buzz(STOP, 4, 3), shapes: [] },
    // the crown on its stem: pushed into the stem on each press
    {
      parent: 'watch',
      shapes: [{ d: rect(SW[0] - 9, SW[1] - SW_R - 16, 18, 24, 3), fill: 'grey', depth: 0.6 }],
    },
    {
      parent: 'watch',
      p: PRESSES.flatMap((t) => outAndBack<Vec>([0, 0], [0, 8], t, 4, t + 6, 6)),
      shapes: [{ d: rect(SW[0] - 22, SW[1] - SW_R - 30, 44, 16, 6), fill: 'main', depth: 0.6 }],
    },
    // the side button, still
    {
      parent: 'watch',
      shapes: [
        {
          d: poly([[SW[0] + 38, SW[1] - 58], [SW[0] + 50, SW[1] - 70], [SW[0] + 64, SW[1] - 56], [SW[0] + 52, SW[1] - 44]], 3),
          fill: 'main',
          depth: 0.5,
        },
      ],
    },
    {
      parent: 'watch',
      shapes: [
        { d: ellipse(SW[0], SW[1], SW_R), fill: 'deep', depth: 1 },
        { d: ellipse(SW[0], SW[1], SW_R - 14), fill: 'white', depth: 0.3 },
        ...[0, 90, 180, 270].map((deg): Shape => {
          const [c, s] = [Math.cos((deg * Math.PI) / 180), Math.sin((deg * Math.PI) / 180)]
          return { d: line([SW[0] + c * 32, SW[1] + s * 32], [SW[0] + c * 40, SW[1] + s * 40]), line: 4 }
        }),
      ],
    },
    // the hand, ticking round the dial
    {
      parent: 'watch',
      a: SW,
      p: SW,
      r: HAND,
      shapes: [
        { d: line(SW, [SW[0], SW[1] - 34]), line: 6, round: true },
        { d: ellipse(SW[0], SW[1], 8), fill: 'main', depth: 0.3 },
      ],
    },
    glow('root', [-158, -148], 22, popIn(STOP + 2, RESET - 8)),
    glow('root', [178, -70], 15, popIn(STOP + 8, RESET - 2)),
  ],
}

export default timeTracking
