// Table Reservation
import { ellipse, line, pill, poly, rect } from '../engine.ts'
import { sparkle } from '../motions.ts'
import { CURSOR, EXT, FACE, LINE, checkBadge, facePoint, glow, outAndBack, popIn, popScale } from '../parts.ts'
import type { Icon, Shape, Vec } from '../engine.ts'

// The pointer glides in over the reservation card and taps a time slot, which sinks under it and fills in. A check badge grows
// out of the picked slot and settles on the card's corner, the table held. The pointer leaves the way it came; after the hold
// the badge goes back into its slot, the slot clears and the loop closes on the blank card.
const SLOT_W = 64
const SLOT_H = 32
const COLS = [-108, -32, 44] // left edge of each slot column on the card face
const ROWS = [-14, 30] // top edge of each slot row
const PICK: Vec = [COLS[2] + SLOT_W / 2, ROWS[0] + SLOT_H / 2] // the tapped slot's centre
const BADGE: Vec = [114, 100] // where the check lands, over the card's lower right corner
const TIP = facePoint(PICK[0] + 4, PICK[1] + 6) // the pointer's tip on the slot
const FROM: Vec = [130, 80] // where the pointer comes from, off the card's right side
const PUSH: Vec = [-1.3, 5.9] // 6px of the extrusion: the slot sinks along its own side

const GLIDE = 10 // the pointer sets off
const TAP = 36 // the slot goes down
const RELEASE = 42 // and comes up: the time is picked
const CONFIRM = 50 // the check grows out of the slot
const LEAVE = 70 // the pointer heads home
const UNDO = 138 // the check goes back into its slot
const CLEAR = 144 // the slot clears

const slot = (x: number, y: number, fill: Shape['fill']): Shape => ({ d: pill(x, y, SLOT_W, SLOT_H), fill, depth: 0.3 })

// the card: a white slab, a dark header band with a plate between a fork and a knife, a grid of times and a guests line
const card = (): ReadonlyArray<Shape> => [
  { d: rect(-136, -118, 272, 236, 26), fill: 'white', depth: 1 },
  { d: poly([[-136, -118], [136, -118], [136, -46], [-136, -46]], [26, 26, 0, 0]), fill: 'deep' },
  { d: ellipse(0, -82, 26), fill: 'white', depth: 0.3 },
  { d: ellipse(0, -82, 15), line: 4 },
  { d: pill(-52, -104, 12, 44), fill: 'white', depth: 0.3 },
  { d: line([-46, -104], [-46, -88]), line: 3 },
  { d: pill(40, -104, 12, 44), fill: 'white', depth: 0.3 },
  ...COLS.flatMap((x) => ROWS.filter((y) => x !== COLS[2] || y !== ROWS[0]).map((y) => slot(x, y, 'paper'))),
  { d: line([-108, 90], [-20, 90]) },
]

const tableReservation: Icon = {
  name: 'table-reservation',
  frames: 180,
  still: 110,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [240, 262], s: [94, 94], shapes: [] },
    { id: 'card', parent: 'root', tilt: FACE, shapes: card() },
    // the picked slot sinks under the tap, then fills in on its way up
    {
      parent: 'card',
      m: { p: outAndBack<Vec>([0, 0], PUSH, TAP, 4, RELEASE, 6), x: outAndBack(0, -6, TAP, 4, RELEASE, 6) },
      shapes: [slot(COLS[2], ROWS[0], 'paper')],
    },
    { parent: 'card', a: PICK, p: PICK, m: popIn(TAP + 2, CLEAR), shapes: [slot(COLS[2], ROWS[0], 'main')] },
    // the check grows out of the slot and slides down to the corner, and back the way it came
    {
      parent: 'card',
      a: BADGE,
      p: BADGE,
      ip: CONFIRM,
      op: UNDO + 14,
      m: {
        p: outAndBack<Vec>([PICK[0] - BADGE[0], PICK[1] - BADGE[1]], [0, 0], CONFIRM, 16, UNDO, 14),
        s: outAndBack<Vec>([0, 0], [100, 100], CONFIRM, 12, UNDO + 2, 12),
      },
      shapes: checkBadge(BADGE, 34),
    },
    {
      parent: 'root',
      p: TIP,
      m: [
        { p: outAndBack<Vec>(FROM, [0, 0], GLIDE, TAP - 4 - GLIDE, LEAVE, 22) },
        { p: outAndBack<Vec>([0, 0], PUSH, TAP, 4, RELEASE, 6) },
        { s: popScale(GLIDE - 4, LEAVE - 8) },
      ],
      shapes: [{ d: CURSOR(0, 0), fill: 'white', depth: 0.5 }],
    },
    glow('root', [-158, -118], 22, sparkle(CONFIRM + 10)),
    glow('root', [186, -70], 15, popIn(CONFIRM + 16, UNDO - 6)),
  ],
}

export default tableReservation
