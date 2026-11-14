// Growth Chart
import { line, poly, rect } from '../engine.ts'
import { EASY, IN } from '../motions.ts'
import { EXT, FACE, glow, LINE, outAndBack, popIn } from '../parts.ts'
import type { Icon, Layer, Shape, Track, Vec } from '../engine.ts'

// Four bars rise out of the baseline one after another, then the trend line climbs over them and its arrowhead pops at the
// tip with a sparkle. After a long hold it all goes home on the way it came: the head shrinks, the line draws back to its
// start, and the bars sink into the baseline last up first down.
const BASE = 66 // the baseline the bars grow out of and sink back into
const BAR_W = 32
const BARS = [40, 62, 86, 110]
const BAR_X = (i: number) => -72 + i * 40
const RISE = 8 // first bar starts growing
const STAGGER = 10
const GROW = 24
const SINK = 134 // tallest bar starts sinking, the others follow down in reverse order
const SINK_LEN = 20
const FLAT: Vec = [100, 0]
const FULL: Vec = [100, 100]

const ARROW: ReadonlyArray<Vec> = [[-84, -6], [-50, -36], [-16, -22], [22, -62], [72, -98]]
const TIP = ARROW[ARROW.length - 1]
const DRAWN = 48 // the line starts drawing as the third bar rises
const ARRIVE = 80 // the line reaches the tip: head and sparkle land here
const UNDRAW = 132
const TREND: Track<number> = [[DRAWN, 0, EASY], [ARRIVE, 1, 0], [UNDRAW, 1, IN], [UNDRAW + 20, 0]]

// an arrowhead on the last segment, pointing along it
const head = (): string => {
  const a = ARROW[ARROW.length - 2]
  const l = Math.hypot(TIP[0] - a[0], TIP[1] - a[1])
  const [ux, uy] = [(TIP[0] - a[0]) / l, (TIP[1] - a[1]) / l]
  const [nx, ny] = [-uy, ux]
  return poly([[TIP[0] + ux * 21, TIP[1] + uy * 21], [TIP[0] - ux * 10 + nx * 19, TIP[1] - uy * 10 + ny * 19], [TIP[0] - ux * 10 - nx * 19, TIP[1] - uy * 10 - ny * 19]], 3)
}

const bar = (h: number, i: number): Layer => {
  const start = RISE + i * STAGGER
  const down = SINK + (BARS.length - 1 - i) * 6
  const x = BAR_X(i)
  return {
    parent: 'board',
    a: [x + BAR_W / 2, BASE],
    p: [x + BAR_W / 2, BASE],
    ip: start,
    op: down + SINK_LEN,
    s: outAndBack<Vec>(FLAT, FULL, start, GROW, down, SINK_LEN),
    shapes: [{ d: rect(x, BASE - h, BAR_W, h, 6), fill: i === BARS.length - 1 ? 'ok' : 'main', depth: 0.4 }],
  }
}

const chartGrowth: Icon = {
  name: 'chart-growth',
  frames: 180,
  still: 104,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [250, 262], shapes: [] },
    {
      id: 'board',
      parent: 'root',
      tilt: FACE,
      shapes: [
        { d: rect(-106, -104, 212, 198, 22), fill: 'white', depth: 1 },
        { d: line([-86, -82], [-86, 72], [88, 72]) },
        ...[-44, 2].map((y): Shape => ({ d: line([-76, y], [-66, y]), line: 4 })),
      ],
    },
    ...BARS.map(bar),
    { parent: 'board', shapes: [{ d: line(...ARROW), line: 9, round: true, trim: TREND }] },
    { parent: 'board', a: TIP, p: TIP, m: popIn(ARRIVE, UNDRAW - 10), shapes: [{ d: head(), fill: 'ok', depth: 0.6 }] },
    glow('root', [122, -132], 22, popIn(ARRIVE + 4, UNDRAW - 14)),
  ],
}

export default chartGrowth
