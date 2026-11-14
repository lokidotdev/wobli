// QR Pay
import { line, pill, rect } from '../engine.ts'
import { SNAP } from '../motions.ts'
import { EXT, FACE, LINE, PHONE_SCREEN, buzz, checkBadge, glow, outAndBack, phoneBody, popIn } from '../parts.ts'
import type { Icon, Shape, Vec } from '../engine.ts'

// The phone leans in on the code as it locks on, a scan line grows out of its middle and sweeps down the code, then shrinks
// back into itself. On the frame the scan lands a check pops onto the code's corner and the phone buzzes. After a long hold the check
// shrinks away and the phone settles home along the path it leaned in on.
const QR_MID: Vec = [0, -8]
const QR = 96 // the code's side
const CELL = QR / 12
const BADGE: Vec = [50, 50] // the check lands on the code's corner, so the code still reads beside it
const SCAN_TOP: Vec = [0, -56]
const PAID = 56 // the scan lands: the code turns into a check
const RESET = 146 // the check leaves, the code comes back

// the code's data modules on a 12 by 12 grid, finder corners left clear
const MODULES: ReadonlyArray<string> = [
  '....1.01....',
  '....01.1....',
  '....1101....',
  '....0.1.....',
  '1.01101.1101',
  '.1.0..11.0.1',
  '11.1.01.11.0',
  '0.1..1.0..11',
  '....1.0.1.01',
  '....01.11.1.',
  '....1.1..011',
  '....0.11.1.1',
]
const [X0, Y0] = [QR_MID[0] - QR / 2, QR_MID[1] - QR / 2]
const finder = (cx: number, cy: number): ReadonlyArray<Shape> => [
  { d: rect(X0 + cx * CELL, Y0 + cy * CELL, CELL * 4, CELL * 4, 3), fill: 'ink', line: false },
  { d: rect(X0 + cx * CELL + CELL * 0.8, Y0 + cy * CELL + CELL * 0.8, CELL * 2.4, CELL * 2.4, 2), fill: 'white', line: false },
  { d: rect(X0 + cx * CELL + CELL * 1.4, Y0 + cy * CELL + CELL * 1.4, CELL * 1.2, CELL * 1.2, 1), fill: 'ink', line: false },
]
const CODE: ReadonlyArray<Shape> = [
  { d: rect(X0 - 6, Y0 - 6, QR + 12, QR + 12, 8), fill: 'white', depth: 0.3 },
  ...finder(0, 0),
  ...finder(8, 0),
  ...finder(0, 8),
  ...MODULES.flatMap((row, y) => [...row].flatMap((c, x): ReadonlyArray<Shape> => (c === '1' ? [{ d: rect(X0 + x * CELL, Y0 + y * CELL, CELL, CELL), fill: 'ink', line: false }] : []))),
]

// four corner brackets around the code, the camera's viewfinder
const BRACKETS: ReadonlyArray<Shape> = [-1, 1].flatMap((sx) =>
  [-1, 1].map((sy): Shape => ({ d: line([sx * 63, QR_MID[1] + sy * 42], [sx * 63, QR_MID[1] + sy * 66], [sx * 39, QR_MID[1] + sy * 66]), line: 7 })),
)

const qrPay: Icon = {
  name: 'qr-pay',
  frames: 180,
  still: 100,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [258, 252], s: [114, 114], shapes: [] },
    // the phone leans in as it locks on and buzzes on the frame the payment lands
    { id: 'phone', parent: 'root', m: [{ p: outAndBack<Vec>([0, 0], [-6, -10], 0, 26, RESET + 4, 26) }, buzz(PAID, 2.5)], shapes: [] },
    { parent: 'phone', tilt: FACE, shapes: phoneBody(32, 'deep') },
    { id: 'screen', parent: 'phone', tilt: FACE, shapes: [{ d: PHONE_SCREEN(22), fill: 'tint' }] },
    { parent: 'phone', tilt: FACE, shapes: [{ d: pill(-36, 116, 72, 8), fill: 'ink', line: false }] },
    // the viewfinder and the code inside it
    { parent: 'phone', tilt: FACE, shapes: [...CODE, ...BRACKETS] },
    // the scan line: grows out of its middle, sweeps down the code, shrinks back into itself
    {
      parent: 'phone',
      tilt: FACE,
      clip: 'screen',
      a: SCAN_TOP,
      p: SCAN_TOP,
      ip: 8,
      op: 58,
      s: outAndBack<Vec>([0, 100], [100, 100], 8, 12, 44, 12),
      m: { p: [[12, [0, 0], SNAP], [50, [0, 96]]] },
      shapes: [{ d: pill(-64, SCAN_TOP[1] - 5, 128, 10), fill: 'ok', line: 4 }],
    },
    { parent: 'phone', tilt: FACE, a: BADGE, p: BADGE, m: popIn(PAID, RESET), shapes: checkBadge(BADGE, 32, 0.6) },
    glow('root', [132, -146], 22, popIn(PAID + 8, RESET - 12)),
    glow('root', [-144, -40], 15, popIn(PAID + 14, RESET - 6)),
  ],
}

export default qrPay
