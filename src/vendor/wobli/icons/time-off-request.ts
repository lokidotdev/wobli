// Time-Off Request
import { ellipse, line, pill, poly, rect } from '../engine.ts'
import { IN, SOFT, sparkle, springTurn, twinkle } from '../motions.ts'
import { EXT, FACE, LINE, facePoint, glow, hit, popIn, popScale } from '../parts.ts'
import type { Icon, Shape, Vec } from '../engine.ts'

// Three days in a row light up gold one after another across the calendar, and a palm tree grows up out of the page behind
// them. The rubber stamp comes down faster and faster and strikes the corner: the calendar takes the hit and the fronds shake
// on the same frame, leaving an approved mark. The stamp lifts off the way it came; after the hold the mark, the palm and the
// days go back in the order they came and the loop closes on the blank calendar.
const CELL = 38
const COLS = [-100, -48, 4, 56] // left edge of each column on the calendar face
const ROWS = [-20, 34] // top edge of each row
const RANGE = [1, 2, 3] // the requested days, in the top row

const PICK = 8 // the first day lights up
const STEP = 7 // and the next follows this many frames later
const GROW = 30 // the palm grows out of the page
const STRIKE = 64 // the stamp touches the calendar
const MARK_OFF = 126 // the mark pops away
const SHRINK = 132 // the palm goes back into the page
const CLEAR = 140 // the days clear, first to last

const BASE: Vec = [-62, -86] // where the trunk meets the top of the calendar
const CROWN: Vec = [-44, -196] // where the fronds meet the trunk
const MARK: Vec = [58, 62] // the approved mark on the lower right of the page
const MARK_SEEN = facePoint(...MARK)
const STAMP_UP: Vec = [60, -140]

// the trunk leans right as it rises, a couple of rings across it
const trunk = (): ReadonlyArray<Shape> => [
  { d: poly([[BASE[0] - 14, BASE[1]], [CROWN[0] - 9, CROWN[1]], [CROWN[0] + 9, CROWN[1]], [BASE[0] + 14, BASE[1]]], 4), fill: 'white', depth: 0.6 },
  { d: line([BASE[0] - 12, -126], [BASE[0] + 15, -128]), line: 4 },
  { d: line([BASE[0] - 8, -160], [BASE[0] + 18, -162]), line: 4 },
]

// a frond: a fat leaf from the crown out to its tip, bowed on one side
const frond = ([x, y]: Vec, [tx, ty]: Vec, bow: number): string => {
  const mx = (x + tx) / 2
  const my = (y + ty) / 2
  const nx = -(ty - y)
  const ny = tx - x
  const k = bow / Math.hypot(nx, ny)
  return `M${x} ${y}Q${mx + nx * k} ${my + ny * k} ${tx} ${ty}Q${mx - nx * k * 0.2} ${my - ny * k * 0.2} ${x} ${y}Z`
}
const fronds = (): ReadonlyArray<Shape> => {
  const [x, y] = CROWN
  return [
    { d: frond(CROWN, [x - 78, y + 34], -30), fill: 'ok', depth: 0.5 },
    { d: frond(CROWN, [x + 80, y + 30], 30), fill: 'ok', depth: 0.5 },
    { d: frond(CROWN, [x - 52, y - 40], -26), fill: 'ok', depth: 0.5 },
    { d: frond(CROWN, [x + 56, y - 38], 26), fill: 'ok', depth: 0.5 },
    { d: ellipse(x - 10, y + 10, 11), fill: 'gold', depth: 0.4 },
    { d: ellipse(x + 10, y + 12, 11), fill: 'gold', depth: 0.4 },
  ]
}

// the calendar page: a white slab, a header band, two binder rings and a grid of blank days
const calendar = (): ReadonlyArray<Shape> => [
  { d: rect(-122, -90, 244, 200, 26), fill: 'white', depth: 1 },
  { d: poly([[-122, -90], [122, -90], [122, -36], [-122, -36]], [26, 26, 0, 0]), fill: 'main' },
  ...[8, 64].map((x): Shape => ({ d: pill(x - 12, -112, 24, 44), fill: 'grey', depth: 0.5 })),
  ...COLS.flatMap((x) => ROWS.map((y): Shape => ({ d: rect(x, y, CELL, CELL, 9), fill: 'paper', depth: 0.3 }))),
]

// the mark: a raised ring, a white field and a check
const approved = ([x, y]: Vec): ReadonlyArray<Shape> => [
  { d: ellipse(x, y, 42), fill: 'ok', depth: 0.2 },
  { d: ellipse(x, y, 30), fill: 'white', line: 3 },
  { d: line([x - 13, y + 1], [x - 3, y + 11], [x + 15, y - 9]), line: 6 },
]

const timeOffRequest: Icon = {
  name: 'time-off-request',
  frames: 180,
  still: 122,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [236, 292], s: [88, 88], shapes: [] },
    // untilted carrier for the calendar and the palm, so both take the strike together
    { id: 'desk', parent: 'root', m: hit(STRIKE, [3, 9]), shapes: [] },
    // the palm stands behind the page and grows up out of its top edge; its fronds lag and shake on the strike
    { id: 'palm', parent: 'desk', tilt: FACE, a: BASE, p: BASE, m: popIn(GROW, SHRINK), shapes: trunk() },
    {
      parent: 'palm',
      a: CROWN,
      p: CROWN,
      m: [{ r: springTurn(-9, GROW + 4, 0.8, 12) }, { r: springTurn(0, STRIKE, 0.7, 8) }],
      shapes: fronds(),
    },
    { id: 'page', parent: 'desk', tilt: FACE, shapes: calendar() },
    // the requested days light up one after another, and clear in the same order
    ...RANGE.map((c, i) => {
      const at: Vec = [COLS[c] + CELL / 2, ROWS[0] + CELL / 2]
      return {
        parent: 'page',
        a: at,
        p: at,
        m: popIn(PICK + i * STEP, CLEAR + i * STEP / 2),
        shapes: [{ d: rect(COLS[c], ROWS[0], CELL, CELL, 9), fill: 'gold', depth: 0.3 } satisfies Shape],
      }
    }),
    { parent: 'page', a: MARK, p: MARK, r: -14, ip: STRIKE, m: twinkle(MARK_OFF, true), shapes: approved(MARK) },
    // the stamp: pops in above the mark, down on an ease in to the strike, a beat pressed, up on its mirror and pops away
    {
      parent: 'desk',
      p: [MARK_SEEN[0] + 4, MARK_SEEN[1] + 4],
      tilt: FACE,
      m: [
        { p: [[STRIKE - 24, STAMP_UP, IN], [STRIKE, [0, 0], 0], [STRIKE + 8, [0, 0], SOFT], [STRIKE + 32, STAMP_UP]] },
        { s: popScale(STRIKE - 40, STRIKE + 26) },
      ],
      shapes: [
        { d: rect(-46, -6, 92, 16, 6), fill: 'ok', depth: 0.4 },
        { d: rect(-58, -46, 116, 42, 12), fill: 'white', depth: 1 },
        { d: rect(-14, -94, 28, 50, 4), fill: 'white', depth: 0.8 },
        { d: ellipse(0, -114, 28), fill: 'main', depth: 1 },
      ],
    },
    glow('root', [-178, 10], 22, sparkle(STRIKE + 6)),
    glow('root', [190, 120], 15, sparkle(STRIKE + 14)),
  ],
}

export default timeOffRequest
