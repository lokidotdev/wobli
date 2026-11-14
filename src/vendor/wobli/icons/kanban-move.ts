// Kanban Card Move
import { line, pill, rect } from '../engine.ts'
import { IN, SNAP, SOFT, spring } from '../motions.ts'
import { checkBadge, CURSOR, EXT, FACE, facePoint, glow, LINE, outIn, popIn, popScale } from '../parts.ts'
import type { Icon, Shape, Track, Vec } from '../engine.ts'

// The pointer comes in and grabs a card in To Do; the card lifts off the board, rides a step behind the pointer across to
// Done and is set down, and the board takes the drop on that frame. A check pops on the card, the pointer leaves the way it
// came. After the hold the card shrinks away in Done and pops back into To Do, ready to be moved again.
const card = (w: number, h: number, fill: Shape['fill'], depth: number, cx = 0, cy = 0): ReadonlyArray<Shape> => [
  { d: rect(cx - w / 2, cy - h / 2, w, h, 9), fill, depth },
  { d: line([cx - w / 2 + 14, cy - 5], [cx + w / 2 - 18, cy - 5]) },
  { d: line([cx - w / 2 + 14, cy + 9], [cx - 4, cy + 9]) },
]
const CARD = { w: 84, h: 40 }
const TODO_X = -61
const DONE_X = 61
const SLOT_Y = 18
const add = (a: Vec, b: Vec): Vec => [a[0] + b[0], a[1] + b[1]]

const FROM = facePoint(TODO_X, SLOT_Y) // the card's slot in To Do, in the base's untilted space
const TO = facePoint(DONE_X, SLOT_Y) // its slot in Done
const LIFT: Vec = [0, -18] // held off the board while it travels
const GRIP: Vec = [6, 4] // where the pointer holds the card
const AWAY: Vec = [54, 66] // where the pointer comes from and goes back to

const GRAB = 18 // pointer presses the card
const LAG = 4 // the card follows the pointer this many frames behind
const DROP = 82 // the card touches down in Done
const BADGE: Vec = [CARD.w / 2 - 6, -CARD.h / 2 + 2]

// the pointer: in, press, carry, set down, back out the way it came
const POINTER: Track<Vec> = [
  [2, add(FROM, add(GRIP, AWAY)), SOFT],
  [GRAB, add(FROM, GRIP), SOFT],
  [GRAB + 10, add(add(FROM, GRIP), LIFT), SNAP],
  [DROP - LAG - 10, add(add(TO, GRIP), LIFT), IN],
  [DROP - LAG, add(TO, GRIP), 0],
  [86, add(TO, GRIP), IN],
  [104, add(TO, add(GRIP, AWAY))],
]
// the card on the same beats, LAG frames later
const CARRY: Track<Vec> = [
  [GRAB + 2, FROM, SOFT],
  [GRAB + 2 + 12, add(FROM, LIFT), SNAP],
  [DROP - 10, add(TO, LIFT), IN],
  [DROP, TO, 0],
  [150, FROM],
]

const kanbanMove: Icon = {
  name: 'kanban-move',
  frames: 180,
  still: 118,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [254, 262], s: [94, 94], shapes: [] },
    // takes the drop with the spring, sits, eases home while the card is away
    { id: 'base', parent: 'root', m: { p: [...spring([1, 5], DROP, 0.8), [130, [1, 5], SOFT], [160, [0, 0]]] }, shapes: [] },
    {
      id: 'board',
      parent: 'base',
      tilt: FACE,
      shapes: [
        { d: rect(-130, -100, 260, 200, 24), fill: 'white', depth: 1 },
        { d: rect(-114, -84, 106, 172, 14), fill: 'tint', depth: 0.2 },
        { d: rect(8, -84, 106, 172, 14), fill: 'tint', depth: 0.2 },
        { d: pill(-102, -74, 48, 14), fill: 'hot', depth: 0.3 },
        { d: pill(20, -74, 48, 14), fill: 'ok', depth: 0.3 },
        ...card(CARD.w, CARD.h, 'white', 0.4, TODO_X, -28),
        ...card(CARD.w, CARD.h, 'white', 0.4, TODO_X, 64),
        ...card(CARD.w, CARD.h, 'white', 0.4, DONE_X, -28),
      ],
    },
    {
      id: 'carry',
      parent: 'base',
      p: CARRY,
      r: [[GRAB + 2, 0, SOFT], [GRAB + 14, -4, SNAP], [DROP, 0]],
      s: [[GRAB + 2, [100, 100], SOFT], [GRAB + 14, [105, 105], 0], [DROP - 10, [105, 105], IN], [DROP, [100, 100]]],
      shapes: [],
    },
    { id: 'card', parent: 'carry', tilt: FACE, m: outIn(120, 150), shapes: card(CARD.w, CARD.h, 'main', 0.6) },
    { parent: 'card', a: BADGE, p: BADGE, m: popIn(DROP + 2, 122), shapes: checkBadge(BADGE, 14, 0.4) },
    { parent: 'base', p: POINTER, s: popScale(0, 86), shapes: [{ d: CURSOR(0, 0), fill: 'white', depth: 0.5 }] },
    glow('root', [150, -120], 22, popIn(DROP + 4, 124)),
  ],
}

export default kanbanMove
