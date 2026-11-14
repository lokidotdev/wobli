// Size Picker
import { line, pill, poly, rect } from '../engine.ts'
import { SNAP } from '../motions.ts'
import { EXT, FACE, LINE, glow, outAndBack, popIn } from '../parts.ts'
import type { Icon, Shape, Track, Vec } from '../engine.ts'

// The selector ring hops along the size row of the shirt card, S to M to L to XL, then steps back and settles on L. The L button
// is pressed in on the frame it lands, the card gives with it and the add-to-cart bar fills a beat later. After the hold the bar
// empties and the selector slides back to S the way it browsed out.
const ROW_Y = 12 // top of the size buttons
const BTN = 38 // a size button's side
const SIZES = [-81, -27, 27, 81] // centres of S M L XL on the card face
const STEP = SIZES[1] - SIZES[0]
const PICK = 2 // L
const HOP = 12 // frames one hop takes
const REST = 6 // frames it pauses on each size

const BROWSE = 8 // the selector sets off from S
const ARRIVE = (i: number) => BROWSE + i * (HOP + REST) + HOP // lands on the i-th hop
const LOCK = ARRIVE(3) + 4 // back on L: the button goes down
const CLEAR = 138 // the cart bar empties
const HOME = 146 // the selector slides home to S
const PUSH: Vec = [-1.3, 6] // a third of the extrusion: the button sinks along its own side

// S, M, L, XL, back to L: snapping slot to slot, then home after the hold
const at = (i: number): Vec => [i * STEP, 0]
const HOPS: Track<Vec> = [
  ...[1, 2, 3, PICK].flatMap((to, n) => {
    const from = n === 0 ? 0 : [1, 2, 3][n - 1]
    const start = BROWSE + n * (HOP + REST)
    return [[start, at(from), SNAP], [start + HOP, at(to), 0]] as const
  }),
  [HOME, at(PICK), SNAP],
  [HOME + 24, at(0)],
]

const TEE = poly(
  ([[-34, -58], [-12, -58], [0, -48], [12, -58], [34, -58], [62, -30], [46, -10], [34, -20], [34, 50], [-34, 50], [-34, -20], [-46, -10], [-62, -30]] as const).map(
    ([x, y]): Vec => [x * 0.82, y * 0.82 - 78],
  ),
  4,
)

// the size letters, ink strokes about the button centre
const CY = ROW_Y + BTN / 2
const S = (x: number) => `M${x + 7} ${CY - 7}C${x + 4} ${CY - 11} ${x - 7} ${CY - 11} ${x - 7} ${CY - 4}C${x - 7} ${CY + 2} ${x + 7} ${CY - 2} ${x + 7} ${CY + 5}C${x + 7} ${CY + 12} ${x - 4} ${CY + 12} ${x - 8} ${CY + 7}`
const LETTERS: ReadonlyArray<(x: number) => ReadonlyArray<string>> = [
  (x) => [S(x)],
  (x) => [line([x - 8, CY + 10], [x - 8, CY - 10], [x, CY + 2], [x + 8, CY - 10], [x + 8, CY + 10])],
  (x) => [line([x - 5, CY - 10], [x - 5, CY + 10], [x + 7, CY + 10])],
  (x) => [line([x - 12, CY - 10], [x - 2, CY + 10]), line([x - 2, CY - 10], [x - 12, CY + 10]), line([x + 3, CY - 10], [x + 3, CY + 10], [x + 12, CY + 10])],
]
const button = (i: number): ReadonlyArray<Shape> => [
  { d: rect(SIZES[i] - BTN / 2, ROW_Y, BTN, BTN, 9), fill: 'white', depth: 0.4 },
  ...LETTERS[i](SIZES[i]).map((d): Shape => ({ d, line: 5 })),
]

// a frame round the first button: outer edge clockwise, inner edge the other way round, so the button shows through
const box = (m: number): ReadonlyArray<Vec> => [[SIZES[0] - BTN / 2 - m, ROW_Y - m], [SIZES[0] + BTN / 2 + m, ROW_Y - m], [SIZES[0] + BTN / 2 + m, ROW_Y + BTN + m], [SIZES[0] - BTN / 2 - m, ROW_Y + BTN + m]]
const RING = poly(box(11), 16) + poly([...box(3)].reverse(), 10)

const sizePicker: Icon = {
  name: 'size-picker',
  frames: 180,
  still: 110,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [256, 256], m: { p: outAndBack<Vec>([0, 0], [2, 5], LOCK - 4, 4, LOCK, 16) }, shapes: [] },
    {
      id: 'card',
      parent: 'root',
      tilt: FACE,
      shapes: [
        { d: rect(-118, -164, 236, 316, 26), fill: 'white', depth: 1 },
        { d: rect(-100, -146, 200, 128, 16), fill: 'tint' },
        { d: TEE, fill: 'main', depth: 0.4 },
                { d: pill(-100, 88, 200, 36), fill: 'grey', depth: 0.3 },
      ],
    },
    ...[0, 1, 3].map((i) => ({ parent: 'card', shapes: button(i) })),
    // the picked size sinks under the press, the ring a beat behind it
    { parent: 'card', m: { p: outAndBack<Vec>([0, 0], PUSH, LOCK - 4, 4, LOCK, 10) }, shapes: button(PICK) },
    // the selector ring rides over the row and hops from size to size
    {
      parent: 'card',
      m: [{ p: HOPS }, { p: outAndBack<Vec>([0, 0], PUSH, LOCK - 2, 4, LOCK + 2, 10) }],
      shapes: [{ d: RING, fill: 'deep', depth: 0.3, crease: false }],
    },
    // the add-to-cart bar fills once the size is in
    {
      parent: 'card',
      a: [0, 106],
      p: [0, 106],
      m: popIn(LOCK + 4, CLEAR),
      shapes: [{ d: pill(-100, 88, 200, 36), fill: 'main', depth: 0.3 }, { d: line([-34, 106], [34, 106]), line: 6 }],
    },
    glow('root', [-186, 10], 18, popIn(LOCK + 2, CLEAR - 8)),
    glow('root', [160, -150], 24, popIn(LOCK + 8, CLEAR - 2)),
  ],
}

export default sizePicker
