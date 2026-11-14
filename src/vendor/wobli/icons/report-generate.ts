// Report Generated
import { line, rect } from '../engine.ts'
import { checkBadge, EXT, FACE, glow, LINE, outAndBack, popIn, sheet } from '../parts.ts'
import type { Icon, Layer, Shape, Vec } from '../engine.ts'

// Three lines of text write themselves onto the sheet one after another, the chart panel unfolds below them and its bars rise
// out of the baseline in turn; the check lands on the corner as the last bar tops out. After a long hold it all goes home the
// way it came: the check shrinks, the bars sink last up first down, the lines draw back and the panel folds away.
const W = 208
const H = 272
const TEXT = [60, 76, 30] // right end of each text line
const TEXT_Y = (i: number) => -66 + i * 22
const WRITE = 6 // first line starts writing, the others follow 7 apart
const UNWRITE = 148 // last line starts drawing back, the others follow 6 apart

const PANEL_TOP = 4
const PANEL_IN = 30
const PANEL_OUT = 160

const BASE = 90 // the baseline bars grow out of and sink back into
const BARS = [36, 60, 48, 78]
const BAR_X = (i: number) => -62 + i * 34
const BAR_W = 24
const RISE = 42
const SINK = 140

const CHECK: Vec = [96, 116]
const LAND = 78 // the last bar tops out and the check lands
const CHECK_OUT = 132

const FLAT: Vec = [100, 0]
const FULL: Vec = [100, 100]

const text = (end: number, i: number): Layer => ({
  parent: 'doc',
  shapes: [{ d: line([-80, TEXT_Y(i)], [end, TEXT_Y(i)]), trim: outAndBack(0, 1, WRITE + i * 7, 16, UNWRITE + (TEXT.length - 1 - i) * 6, 12) }],
})

const bar = (h: number, i: number): Layer => {
  const start = RISE + i * 6
  const down = SINK + (BARS.length - 1 - i) * 5
  const x = BAR_X(i) + BAR_W / 2
  return {
    parent: 'doc',
    a: [x, BASE],
    p: [x, BASE],
    ip: start,
    op: down + 14,
    s: outAndBack<Vec>(FLAT, FULL, start, 20, down, 14),
    shapes: [{ d: rect(BAR_X(i), BASE - h, BAR_W, h, 4), fill: i === BARS.length - 1 ? 'ok' : 'main', depth: 0.4 }],
  }
}

const reportGenerate: Icon = {
  name: 'report-generate',
  frames: 180,
  still: 110,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [232, 270], s: [86, 86], shapes: [] },
    {
      id: 'doc',
      parent: 'root',
      tilt: FACE,
      shapes: [
        ...sheet(W, H, 'deep').slice(0, 2), // the sheet's body and folded corner; its own tag and lines are replaced below
        { d: rect(-80, -112, 64, 22, 6), fill: 'deep', depth: 0.3 },
      ] as ReadonlyArray<Shape>,
    },
    ...TEXT.map(text),
    {
      parent: 'doc',
      a: [0, PANEL_TOP],
      p: [0, PANEL_TOP],
      ip: PANEL_IN,
      op: PANEL_OUT + 14,
      s: outAndBack<Vec>(FLAT, FULL, PANEL_IN, 16, PANEL_OUT, 14),
      shapes: [{ d: rect(-80, PANEL_TOP, 160, 100, 12), fill: 'tint', depth: 0.2 }],
    },
    ...BARS.map(bar),
    { parent: 'doc', a: CHECK, p: CHECK, m: popIn(LAND, CHECK_OUT), shapes: checkBadge(CHECK, 36) },
    glow('root', [150, -150], 24, popIn(LAND + 4, CHECK_OUT - 6)),
  ],
}

export default reportGenerate
