// Invoice Paid
import { ellipse, line, onFace, pill, poly, rect } from '../engine.ts'
import { EASY, IN, SOFT, impact, sparkle, spring } from '../motions.ts'
import { EXT, FACE, LINE, checkBadge, glow, popIn } from '../parts.ts'
import type { Icon, Layer, Shape, Vec } from '../engine.ts'

// The rubber stamp comes down faster and faster and strikes the invoice, which takes the hit with the spring on the same frame;
// the PAID mark is left behind and little checks and confetti burst out of it. The stamp lifts off on the mirror of the way it
// came and the invoice holds, paid, before the mark and the confetti pop away for the loop.
const STRIKE = 26 // the frame the stamp touches the paper
const MARK: Vec = [6, 14] // centre of the mark on the invoice face
const MARK_SEEN = onFace(FACE, MARK)
const STAMP_UP: Vec = [76, -164]

// the invoice: paper slab with a folded corner, a header block, two item lines, a rule and the total
const invoice = (): ReadonlyArray<Shape> => [
  { d: poly([[-112, -144], [64, -144], [112, -96], [112, 144], [-112, 144]], [14, 2, 2, 14, 14]), fill: 'white', depth: 0.5 },
  { d: poly([[64, -144], [64, -96], [112, -96]], 2), fill: 'grey' },
  { d: rect(-84, -116, 70, 26, 7), fill: 'deep', depth: 0.2 },
  { d: line([-84, -58], [70, -58]) },
  { d: line([-84, -32], [30, -32]) },
  { d: line([-84, 76], [84, 76]) },
  { d: line([-84, 106], [-10, 106]) },
  { d: rect(34, 92, 50, 28, 7), fill: 'deep', depth: 0.2 },
]

// the PAID mark: a raised green plate, a white field and the four letters in ink
const paidMark = ([x, y]: Vec): ReadonlyArray<Shape> => [
  { d: rect(x - 76, y - 34, 152, 68, 14), fill: 'ok', depth: 0.2 },
  { d: rect(x - 62, y - 20, 124, 40, 6), fill: 'white', line: 3 },
  { d: line([x - 39, y + 11], [x - 39, y - 11], [x - 25, y - 11], [x - 25, y], [x - 39, y]), line: 4 },
  { d: line([x - 13, y + 11], [x - 5, y - 11], [x + 3, y + 11]), line: 4 },
  { d: line([x - 9, y + 3], [x - 1, y + 3]), line: 4 },
  { d: line([x + 13, y - 11], [x + 13, y + 11]), line: 4 },
  { d: `M${x + 23} ${y - 11}L${x + 30} ${y - 11}C${x + 41} ${y - 11} ${x + 41} ${y + 11} ${x + 30} ${y + 11}L${x + 23} ${y + 11}Z`, line: 4 },
]

// confetti thrown out of the mark: where it lands, its colour (ok is a check badge), and how far it turns
const BITS: ReadonlyArray<readonly [Vec, Shape['fill'], number]> = [
  [[-116, -62], 'ok', 0],
  [[118, -34], 'ok', 0],
  [[-96, 58], 'gold', 30],
  [[126, 34], 'main', -20],
  [[-30, -104], 'main', 60],
  [[56, -98], 'gold', -40],
]

const invoicePaid: Icon = {
  name: 'invoice-paid',
  frames: 180,
  still: 92,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [246, 300], s: [86, 86], shapes: [] },
    // untilted carrier for the invoice and the stamp: takes the hit on the strike frame, holds, eases back
    { id: 'paper', parent: 'root', m: { ...impact([3, 9]), at: STRIKE - 24 }, shapes: [] },
    { id: 'doc', parent: 'paper', tilt: FACE, shapes: invoice() },
    { parent: 'doc', a: MARK, p: MARK, r: -14, m: popIn(STRIKE, 150), shapes: paidMark(MARK) },
    ...BITS.map(([v, c, turn], i): Layer => {
      const at = STRIKE + 2 + (i % 3) * 3
      return {
        parent: 'root',
        a: MARK_SEEN,
        p: MARK_SEEN,
        m: [{ p: spring(v, at, 0.6), r: [[at, 0, EASY], [at + 40, turn]] }, ...popIn(at, 116 + i * 4)],
        shapes: c === 'ok' ? checkBadge(MARK_SEEN, 22, 0.5) : [{ d: pill(MARK_SEEN[0] - 16, MARK_SEEN[1] - 7, 32, 14), fill: c, depth: 0.4 }],
      }
    }),
    {
      parent: 'paper',
      p: [MARK_SEEN[0] + 4, MARK_SEEN[1] + 4],
      tilt: FACE,
      // down on an ease in to the strike, a beat pressed, then up on its mirror
      m: { p: [[4, STAMP_UP, IN], [STRIKE, [0, 0], 0], [STRIKE + 10, [0, 0], SOFT], [STRIKE + 44, STAMP_UP]] },
      shapes: [
        { d: rect(-58, -6, 116, 16, 5), fill: 'ok', depth: 0.4 },
        { d: rect(-70, -46, 140, 42, 12), fill: 'deep', depth: 1 },
        { d: rect(-16, -94, 32, 50, 4), fill: 'deep', depth: 0.8 },
        { d: ellipse(0, -114, 30), fill: 'main', depth: 1 },
      ],
    },
    glow('root', [-150, -150], 24, sparkle(STRIKE + 6)),
    glow('root', [170, 120], 16, sparkle(STRIKE + 14)),
  ],
}

export default invoicePaid
