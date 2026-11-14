// KPI Counter
import { at, line, pill, rect } from '../engine.ts'
import { IN, SOFT } from '../motions.ts'
import { EXT, FACE, glow, LINE, numeral, outAndBack, popIn } from '../parts.ts'
import type { Icon, Layer, Track, Vec } from '../engine.ts'

// The number on the card counts up, ticking fast at first and slowing as it nears its value, the way a rolled counter
// settles. On the frame it lands the falling trend chip flips edge on and turns over into a rising one, with a sparkle a beat
// after. After a long hold the way home retraces the way out: the chip flips back and the number counts down to where it began.
const CHIP: Vec = [76, -50]
const COUNT_FROM = 38
const COUNT_TO = 86
const STEPS = 12

const COUNT = 8 // the number starts counting up
const LAND = 58 // it reaches its value: the chip flips here
const FLIP = 7 // frames for each half of the flip, edge on in the middle
const TURN = 122 // the way home starts: the chip flips back
const UNCOUNT = 132 // the number counts back down
const UNCOUNT_LEN = 30

// the share of the count shown, out on a soft start that slows into its value, home on its mirror
const PROGRESS: Track<number> = [[COUNT, 0, SOFT], [LAND, 1, 0], [UNCOUNT, 1, IN], [UNCOUNT + UNCOUNT_LEN, 0]]
const VALUE = (i: number) => Math.round(COUNT_FROM + ((COUNT_TO - COUNT_FROM) * i) / STEPS)
// the first frame from `from` on where the count has reached step `i` (going) or fallen back to it (coming home)
const passes = (from: number, i: number, home = false) => {
  const share = i / STEPS
  let f = from
  while (home ? at(PROGRESS, f) > share + 1e-6 : at(PROGRESS, f) < share - 1e-6) f++
  return f
}

const DIGIT_H = 70
const DIGIT_W = 38
const NUM_X = -96
const NUM_Y = -86
const DIGIT_X = (place: number) => NUM_X + place * (DIGIT_W + 18)
const ticks = (place: 0 | 1): Track<string> => {
  const d = (v: number) => numeral(place === 0 ? Math.floor(v / 10) : v % 10, DIGIT_X(place), NUM_Y, DIGIT_W, DIGIT_H)
  const steps = Array.from({ length: STEPS }, (_, i) => i + 1)
  const up = steps.map((i) => [passes(COUNT, i), d(VALUE(i)), 0] as const)
  const down = steps.map((i) => STEPS - i).map((i) => [passes(UNCOUNT, i, true), d(VALUE(i)), 0] as const)
  return [[0, d(VALUE(0)), 0], ...up, ...down, [180, d(VALUE(0))]]
}

// the trend chip, edge on at x scale 0: the falling side shows at rest, the rising side after the flip
const chip = (rising: boolean): Layer => {
  const [cx, cy] = CHIP
  const tip = rising ? -10 : 10
  return {
    parent: 'card',
    a: CHIP,
    p: CHIP,
    s: rising
      ? outAndBack<Vec>([0, 100], [100, 100], LAND + FLIP, FLIP + 4, TURN, FLIP)
      : outAndBack<Vec>([100, 100], [0, 100], LAND, FLIP, TURN + FLIP, FLIP + 4),
    shapes: [
      { d: pill(cx - 36, cy - 23, 72, 46), fill: rising ? 'ok' : 'white', depth: 0.5 },
      { d: line([cx - 13, cy - tip * 0.8], [cx, cy + tip * 0.8], [cx + 13, cy - tip * 0.8]), line: 6, round: true },
    ],
  }
}

const kpiCounter: Icon = {
  name: 'kpi-counter',
  frames: 180,
  still: 100,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [248, 254], shapes: [] },
    {
      id: 'card',
      parent: 'root',
      tilt: FACE,
      shapes: [
        { d: rect(-128, -116, 256, 222, 26), fill: 'white', depth: 1 },
        { d: rect(-104, 22, 208, 60, 14), fill: 'main', depth: 0.3 },
        { d: line([-84, 43], [-18, 43]), line: 5, round: true },
        { d: line([-84, 61], [20, 61]), line: 5, round: true },
      ],
    },
    { parent: 'card', shapes: [{ d: ticks(0), line: 9, round: true }, { d: ticks(1), line: 9, round: true }] },
    chip(false),
    chip(true),
    glow('root', [148, -150], 22, popIn(LAND + FLIP + 6, TURN - 10)),
  ],
}

export default kpiCounter
