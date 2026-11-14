// Live Dashboard
import { at, ellipse, line, pill, rect, ring } from '../engine.ts'
import { glint } from '../motions.ts'
import { EXT, FACE, glow, LINE, numeral, outAndBack, popIn } from '../parts.ts'
import type { Icon, Track, Vec } from '../engine.ts'

// The live dot pings as data arrives, the sparkline draws across the panel and the number above counts up in step with it,
// one tick for each stretch of line. The tip dot lands where the line ends and the trend chip pops a beat after. After a long
// hold the way home retraces the way out: the chip and the tip go, the line draws back and the number counts down with it.
const LIVE: Vec = [-106, -88]
const CHIP: Vec = [84, -88]
const SPARK: ReadonlyArray<Vec> = [[-92, 70], [-66, 40], [-42, 54], [-14, 10], [12, 28], [40, -8], [64, 6], [92, -28]]
const TIP = SPARK[SPARK.length - 1]

const PING = 4 // the live dot pings: data arrives
const DRAW = 12 // the line starts drawing
const ARRIVE = 50 // it reaches the tip: tip dot, chip and sparkle land here
const UNDO = 124 // the way home starts: chip and tip go
const UNDRAW = 132 // the line draws back, the number counts down with it
const LEN = ARRIVE - DRAW
const TREND: Track<number> = outAndBack(0, 1, DRAW, LEN, UNDRAW, LEN)

// a digit as one round ink stroke of eight points, so any two digits morph into each other
const DIGIT_H = 30
const DIGIT_W = 17

// the count: one value per stretch of line, ticking on the frame the line passes each stretch, going and coming home
const COUNT = [24, 29, 33, 38, 41, 45, 48]
const STEPS = COUNT.length - 1
// the first frame from `from` on where the drawn share of the line has reached `share` (going) or fallen to it (coming home)
const passes = (from: number, share: number, home = false) => {
  let f = from
  while (home ? at(TREND, f) > share + 1e-6 : at(TREND, f) < share - 1e-6) f++
  return f
}
const NUM_X = -72
const NUM_Y = -88 - DIGIT_H / 2
const DIGIT_X = (i: number) => NUM_X + i * (DIGIT_W + 9)
const ticks = (place: 0 | 1): Track<string> => {
  const digit = (v: number) => (place === 0 ? Math.floor(v / 10) : v % 10)
  const d = (v: number) => numeral(digit(v), DIGIT_X(place + 1), NUM_Y, DIGIT_W, DIGIT_H)
  const up = COUNT.slice(1).map((v, i) => [passes(DRAW, (i + 1) / STEPS), d(v), 0] as const)
  const down = COUNT.slice(0, -1).reverse().map((v, i) => [passes(UNDRAW, 1 - (i + 1) / STEPS, true), d(v), 0] as const)
  return [[0, d(COUNT[0]), 0], ...up, ...down, [180, d(COUNT[0])]]
}

const dashboardLive: Icon = {
  name: 'dashboard-live',
  frames: 180,
  still: 96,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [256, 256], s: [86, 86], shapes: [] },
    {
      id: 'card',
      parent: 'root',
      tilt: FACE,
      shapes: [
        { d: rect(-130, -122, 260, 238, 24), fill: 'white', depth: 1 },
        { d: rect(-110, -50, 220, 146, 14), fill: 'tint' },
        { d: ellipse(LIVE[0], LIVE[1], 9), fill: 'hot', depth: 0.4 },
      ],
    },
    { parent: 'card', a: LIVE, p: LIVE, m: glint(PING, 90), shapes: [{ d: ring(LIVE[0], LIVE[1], 20, 14), fill: 'hot', line: 3 }] },
    { parent: 'card', shapes: [{ d: numeral(1, DIGIT_X(0), NUM_Y, DIGIT_W, DIGIT_H), line: 6, round: true }, { d: ticks(0), line: 6, round: true }, { d: ticks(1), line: 6, round: true }] },
    { parent: 'card', shapes: [{ d: line(...SPARK), line: 8, round: true, trim: TREND }] },
    { parent: 'card', a: TIP, p: TIP, m: popIn(ARRIVE - 4, UNDO + 4), shapes: [{ d: ellipse(TIP[0], TIP[1], 12), fill: 'hot', depth: 0.5 }] },
    {
      parent: 'card',
      a: CHIP,
      p: CHIP,
      m: popIn(ARRIVE + 2, UNDO),
      shapes: [
        { d: pill(CHIP[0] - 28, CHIP[1] - 17, 56, 34), fill: 'ok', depth: 0.5 },
        { d: line([CHIP[0] - 11, CHIP[1] + 6], [CHIP[0], CHIP[1] - 6], [CHIP[0] + 11, CHIP[1] + 6]), line: 5 },
      ],
    },
    glow('root', [150, -140], 22, popIn(ARRIVE + 4, UNDO - 8)),
  ],
}

export default dashboardLive
