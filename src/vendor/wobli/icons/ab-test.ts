// A/B Test
import { ellipse, line, poly, rect } from '../engine.ts'
import { DROP, SOFT, springTurn, twinkle } from '../motions.ts'
import { EXT, FACE, LINE, facePoint, glow, hit, outAndBack, popIn } from '../parts.ts'
import type { Icon, Layer, Shape, Vec } from '../engine.ts'

// Two page variants stand side by side. Their result bars rise out of each card's baseline, A first and short, B a beat later
// and tall. A crown pops in over B's bar and drops onto it; the card takes the hit and the crown rocks to a jaunty tilt.
// After a long hold it all goes home the way it came: the crown lifts off and shrinks, the bars sink, B first.
const W = 124
const H = 216
const GAP = 70 // each card's centre, either side of the middle
const TOP = -H / 2
const BASE = 86 // the baseline the bars grow out of and sink back into
const BAR_W = 58
const FLAT: Vec = [100, 0]
const FULL: Vec = [100, 100]

const RISE_A = 8
const RISE_B = 16
const SINK_B = 142
const SINK_A = 148
const SINK_LEN = 20

const CROWN_IN = 56 // pops in above B as its bar tops out
const DROP_AT = 66
const LAND = 80 // crown lands on B's bar
const LIFT = 126 // crown lifts back off
const LIFT_LEN = 18
const ABOVE: Vec = [0, -124] // clear of the card top, so it drops in from above the page
const PERCH = BASE - 96 // top of B's bar, where the crown lands

// the variant letters, as ink strokes centred on 0 0
const LETTER_A = (x: number, y: number): ReadonlyArray<string> => [line([x - 9, y + 11], [x, y - 12], [x + 9, y + 11]), line([x - 5, y + 3], [x + 5, y + 3])]
const LETTER_B = (x: number, y: number): ReadonlyArray<string> => [
  `M${x - 7} ${y - 12}L${x + 2} ${y - 12}A6 6 0 0 1 ${x + 2} ${y}L${x - 7} ${y}M${x + 2} ${y}A6 6 0 0 1 ${x + 2} ${y + 12}L${x - 7} ${y + 12}L${x - 7} ${y - 12}`,
]
const CHIP: Vec = [-W / 2 + 32, TOP + 32]

// a page card: white slab, a letter chip in the corner, two text lines beside it, and the baseline the bar grows from
const card = (letter: typeof LETTER_A, chip: Shape['fill']): ReadonlyArray<Shape> => [
  { d: rect(-W / 2, TOP, W, H, 16), fill: 'white', depth: 1 },
  { d: rect(-W / 2 + 14, TOP + 14, 36, 36, 9), fill: chip, depth: 0.5 },
  ...letter(...CHIP).map((d): Shape => ({ d, line: 4 })),
  { d: line([-2, TOP + 24], [44, TOP + 24]), line: 4 },
  { d: line([-2, TOP + 40], [30, TOP + 40]), line: 4 },
  { d: line([-W / 2 + 14, BASE], [W / 2 - 14, BASE]), line: 4 },
]

const bar = (parent: string, h: number, fill: Shape['fill'], rise: number, len: number, sink: number): Layer => ({
  parent,
  a: [0, BASE],
  p: [0, BASE],
  ip: rise,
  op: sink + SINK_LEN,
  s: outAndBack<Vec>(FLAT, FULL, rise, len, sink, SINK_LEN),
  shapes: [{ d: rect(-BAR_W / 2, BASE - h, BAR_W, h, 6), fill, depth: 0.5 }],
})

// a three point crown sitting on y 0, offset to the bar top by its layer, with an ink band and gems on its tips
const CROWN: ReadonlyArray<Shape> = [
  { d: poly([[-28, 0], [-33, -36], [-15, -20], [0, -43], [15, -20], [33, -36], [28, 0]], [4, 3, 3, 3, 3, 3, 4]), fill: 'gold', depth: 0.7 },
  { d: line([-29, -10], [29, -10]), line: 4 },
  ...[[-33, -36], [0, -43], [33, -36]].map(([x, y]): Shape => ({ d: ellipse(x, y, 5), fill: 'white' })),
]

const abTest: Icon = {
  name: 'ab-test',
  frames: 180,
  still: 112,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [250, 252], shapes: [] },
    { id: 'cardA', parent: 'root', tilt: FACE, p: facePoint(-GAP, 0), shapes: card(LETTER_A, 'grey') },
    { id: 'cardB', parent: 'root', tilt: FACE, p: facePoint(GAP, 0), m: hit(LAND, facePoint(0, 7)), shapes: card(LETTER_B, 'main') },
    bar('cardA', 46, 'grey', RISE_A, 28, SINK_A),
    bar('cardB', 96, 'main', RISE_B, 40, SINK_B),
    {
      parent: 'cardB',
      a: [0, PERCH],
      p: [0, PERCH],
      ip: CROWN_IN,
      op: LIFT + LIFT_LEN + 10,
      m: [
        { s: [...(twinkle(CROWN_IN).s ?? []), ...(twinkle(LIFT + 4, true).s ?? [])] },
        { p: [[CROWN_IN, ABOVE, 0], [DROP_AT, ABOVE, DROP], [LAND, [0, 0], 0], [LIFT, [0, 0], SOFT], [LIFT + LIFT_LEN, ABOVE]] },
        { r: [...springTurn(-12, LAND, 0.45), [LIFT, -12, SOFT], [LIFT + LIFT_LEN, 0]] },
      ],
      shapes: CROWN,
    },
    glow('root', [150, -150], 22, popIn(LAND + 2, LIFT - 6)),
    glow('root', [-10, -128], 15, popIn(LAND + 6, LIFT - 10)),
  ],
}

export default abTest
