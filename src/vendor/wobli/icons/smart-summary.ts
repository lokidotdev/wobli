// Smart Summary
import { ellipse, line, poly, rect, spark } from '../engine.ts'
import { EXT, FACE, LINE, glow, outAndBack, popIn } from '../parts.ts'
import type { Icon, Layer, Shape, Vec } from '../engine.ts'

// A long document stands with seven lines of text under its spark-marked header. The page squeezes in from both ends and its
// lines slide together, a beat behind the paper, until they merge into three short lines; a bullet pops in at the head of each,
// top to bottom, and a sparkle marks the summary. After the hold the bullets shrink away last first, the lines part and the page
// stretches back out to its full length on the mirror of the way it came.
const W = 200
const X = -W / 2
const FOLD = 46
const TALL = 150 // half height, long
const SHORT = 100 // half height, summarised
const SHIFT = TALL - SHORT

const SQUEEZE = 12 // the lines start to slide together
const PAGE = SQUEEZE + 6 // the page follows them in
const LEN = 32
const STRETCH = 132 // the page starts back out, the lines a beat behind
const BACK = 30
const BULLET = 44 // first bullet pops in, the others follow BULLET_GAP apart
const BULLET_GAP = 6
const BULLET_OUT = 100

// seven long lines, ragged at the right, and which summary line each one merges into
const LONG_Y = (i: number) => -76 + i * 32
const LONG_END = [78, 60, 80, 44, 74, 82, 28]
const GROUP = [0, 0, 1, 1, 1, 2, 2]
const SHORT_Y = (g: number) => -18 + g * 44
const SHORT_END = [62, 38, 54]
const DOT_X = -70
const TEXT_X = -50

// the page body for a half height h: square corners, top right cut where the fold sits
const body = (h: number) => poly([[X, -h], [X + W - FOLD, -h], [X + W, -h + FOLD], [X + W, h], [X, h]], [8, 2, 2, 8, 8])

const text = (end: number, i: number): Shape => {
  const g = GROUP[i]
  const lag = g * 2 // the text leads, the page follows it in
  const back = STRETCH + 4 + (2 - g) * 2 // and on the way out the page leads
  return {
    d: outAndBack(line([X + 20, LONG_Y(i)], [end, LONG_Y(i)]), line([TEXT_X, SHORT_Y(g)], [SHORT_END[g], SHORT_Y(g)]), SQUEEZE + lag, LEN, back, BACK),
  }
}

const bullet = (g: number): Layer => {
  const c: Vec = [DOT_X, SHORT_Y(g)]
  return {
    parent: 'face',
    a: c,
    p: c,
    m: popIn(BULLET + g * BULLET_GAP, BULLET_OUT + (2 - g) * BULLET_GAP),
    shapes: [{ d: ellipse(c[0], c[1], 9), fill: 'main', depth: 0.5 }],
  }
}

const smartSummary: Icon = {
  name: 'smart-summary',
  frames: 180,
  still: 96,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [256, 262], s: [92, 92], shapes: [] },
    { id: 'face', parent: 'root', tilt: FACE, shapes: [] },
    // the page: its body squeezes from both ends; the header and fold ride the top edge down
    { parent: 'face', shapes: [{ d: outAndBack(body(TALL), body(SHORT), PAGE, LEN, STRETCH, BACK), fill: 'white', depth: 0.4 }] },
    { parent: 'face', shapes: LONG_END.map(text) },
    {
      parent: 'face',
      p: outAndBack<Vec>([0, 0], [0, SHIFT], PAGE, LEN, STRETCH, BACK),
      shapes: [
        { d: poly([[X + W - FOLD, -TALL], [X + W - FOLD, -TALL + FOLD], [X + W, -TALL + FOLD]], 2), fill: 'grey' },
        { d: rect(X + 18, -TALL + 18, 92, 30, 8), fill: 'deep', depth: 0.3 },
        { d: spark(X + 36, -TALL + 33, 10), fill: 'white', line: 3 },
        { d: rect(X + 54, -TALL + 29, 42, 8, 4), fill: 'white', line: 3 },
      ],
    },
    ...[0, 1, 2].map(bullet),
    glow('root', [150, -130], 24, popIn(BULLET + 14, BULLET_OUT - 8)),
    glow('root', [-146, 70], 16, popIn(BULLET + 20, BULLET_OUT - 4)),
  ],
}

export default smartSummary
