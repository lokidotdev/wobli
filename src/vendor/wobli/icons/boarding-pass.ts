// Boarding Pass
import { ellipse, line, pill, poly, rect } from '../engine.ts'
import { SNAP } from '../motions.ts'
import { EXT, FACE, LINE, PHONE_SCREEN, buzz, checkBadge, glow, hit, outAndBack, phoneBody, popIn } from '../parts.ts'
import type { Icon, Shape, Vec } from '../engine.ts'

// The phone holding the boarding pass leans in to the gate reader, and a scan line grows out of its middle and sweeps down
// the pass's code. On the frame the scan lands the reader takes the hit, its light pops a check, the phone buzzes and the
// gate's flap slides back into the post. After a long hold the check shrinks away, the flap slides out again and the phone
// settles home along the path it leaned in on.
const LEAN = 0 // the phone starts leaning in
const PASS = 60 // the scan lands: the gate checks the pass
const RESET = 144 // the check leaves and the flap comes back

// the pass's code on the lower half of the screen
const QR_MID: Vec = [0, 58]
const QR = 84
const CELL = QR / 10
const [X0, Y0] = [QR_MID[0] - QR / 2, QR_MID[1] - QR / 2]
const MODULES: ReadonlyArray<string> = [
  '....10....',
  '....01....',
  '....11....',
  '.....0....',
  '1011.01101',
  '0.10110.10',
  '....1.01.1',
  '....01.11.',
  '....1.1..1',
  '....0.11.1',
]
const finder = (cx: number, cy: number): ReadonlyArray<Shape> => [
  { d: rect(X0 + cx * CELL, Y0 + cy * CELL, CELL * 3.4, CELL * 3.4, 3), fill: 'ink', line: false },
  { d: rect(X0 + cx * CELL + CELL * 0.7, Y0 + cy * CELL + CELL * 0.7, CELL * 2, CELL * 2, 2), fill: 'white', line: false },
  { d: rect(X0 + cx * CELL + CELL * 1.2, Y0 + cy * CELL + CELL * 1.2, CELL, CELL, 1), fill: 'ink', line: false },
]
const CODE: ReadonlyArray<Shape> = [
  { d: rect(X0 - 7, Y0 - 7, QR + 14, QR + 14, 8), fill: 'white', depth: 0.3 },
  ...finder(0, 0),
  ...finder(6.6, 0),
  ...finder(0, 6.6),
  ...MODULES.flatMap((row, y) => [...row].flatMap((c, x): ReadonlyArray<Shape> => (c === '1' ? [{ d: rect(X0 + x * CELL, Y0 + y * CELL, CELL, CELL), fill: 'ink', line: false }] : []))),
]

// a small plane, nose right, centred on x y
const plane = (x: number, y: number): string =>
  poly(
    [
      [x + 16, y], [x + 6, y + 3], [x - 2, y + 15], [x - 8, y + 15], [x - 4, y + 3], [x - 12, y + 3], [x - 16, y + 9],
      [x - 19, y + 9], [x - 17, y], [x - 19, y - 9], [x - 16, y - 9], [x - 12, y - 3], [x - 4, y - 3], [x - 8, y - 15], [x - 2, y - 15], [x + 6, y - 3],
    ],
    [3, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2],
  )

// the pass: a coloured header with the route, two detail lines, a torn-ticket perforation, then the code
const TEAR = -14 // the perforation's height
const HEADER: ReadonlyArray<Shape> = [
  { d: rect(-80, -146, 160, 84), fill: 'main', line: false },
  { d: line([-80, -62], [80, -62]) },
  { d: pill(-56, -112, 30, 14), fill: 'white', line: 3 },
  { d: pill(26, -112, 30, 14), fill: 'white', line: 3 },
  { d: plane(0, -105), fill: 'white', line: 3 },
]
const DETAILS: ReadonlyArray<Shape> = [
  { d: line([-50, -44], [10, -44]), line: 6 },
  { d: line([-50, -28], [30, -28]), line: 4 },
  ...[-48, -28, -8, 12, 32].map((x): Shape => ({ d: line([x, TEAR], [x + 12, TEAR]), line: 3 })),
  { d: ellipse(-70, TEAR, 10), fill: 'deep' },
  { d: ellipse(70, TEAR, 10), fill: 'deep' },
]
const SCAN_TOP: Vec = [0, QR_MID[1] - QR / 2 - 2]

// the gate post behind: one upright silhouette, a reader window, a status light and the flap across the lane
const POST: Vec = [126, -32]
const LIGHT: Vec = [0, -112]
const FLAP_EDGE: Vec = [34, 30] // where the flap leaves the post

const boardingPass: Icon = {
  name: 'boarding-pass',
  frames: 180,
  still: 104,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [214, 252], s: [92, 92], shapes: [] },
    // the gate: the post takes the hit when the pass is read, the flap slides back into it
    { id: 'gate', parent: 'root', p: POST, m: hit(PASS, [3, -4]), shapes: [] },
    {
      parent: 'gate',
      tilt: FACE,
      a: FLAP_EDGE,
      p: FLAP_EDGE,
      s: outAndBack<Vec>([100, 100], [0, 100], PASS + 2, 20, RESET, 22),
      shapes: [{ d: rect(FLAP_EDGE[0] - 4, FLAP_EDGE[1], 96, 40, 12), fill: 'main', depth: 0.4 }],
    },
    {
      parent: 'gate',
      tilt: FACE,
      shapes: [
        { d: rect(-56, 120, 112, 34, 10), fill: 'grey', depth: 1 }, // the foot
        { d: rect(-40, -150, 80, 280, 18), fill: 'white', depth: 1 },
        { d: rect(-26, -62, 52, 64, 10), fill: 'deep', depth: 0.3 }, // the reader window
        { d: line([-14, -30], [14, -30]), line: 4 },
        { d: ellipse(LIGHT[0], LIGHT[1], 22), fill: 'grey', depth: 0.3 }, // the status light
      ],
    },
    { parent: 'gate', tilt: FACE, a: LIGHT, p: LIGHT, m: popIn(PASS, RESET), shapes: checkBadge(LIGHT, 24, 0.5) },
    // the phone leans in to the reader and buzzes on the frame the pass is read
    { id: 'phone', parent: 'root', p: [-62, 34], m: [{ p: outAndBack<Vec>([0, 0], [12, -8], LEAN, 26, RESET + 4, 26) }, buzz(PASS, 2.5)], shapes: [] },
    { parent: 'phone', tilt: FACE, s: [92, 92], shapes: phoneBody(32, 'deep') },
    { id: 'screen', parent: 'phone', tilt: FACE, s: [92, 92], shapes: [{ d: PHONE_SCREEN(22), fill: 'white' }] },
    { parent: 'phone', tilt: FACE, s: [92, 92], clip: 'screen', shapes: [...HEADER, ...DETAILS] },
    { parent: 'phone', tilt: FACE, s: [92, 92], shapes: [...CODE, { d: pill(-30, 122, 60, 7), fill: 'ink', line: false }] },
    // the scan line: grows out of its middle, sweeps down the code, shrinks back into itself
    {
      parent: 'phone',
      tilt: FACE,
      clip: 'screen',
      a: SCAN_TOP,
      p: SCAN_TOP,
      ip: 10,
      op: PASS,
      s: outAndBack<Vec>([0, 92], [92, 92], 10, 12, PASS - 14, 12),
      m: { p: [[16, [0, 0], SNAP], [PASS - 8, [0, QR * 0.92 + 4]]] },
      shapes: [{ d: pill(-60, SCAN_TOP[1] - 5, 120, 10), fill: 'ok', line: 4 }],
    },
    glow('root', [210, -166], 22, popIn(PASS + 6, RESET - 10)),
    glow('root', [-170, -110], 15, popIn(PASS + 12, RESET - 4)),
  ],
}

export default boardingPass
