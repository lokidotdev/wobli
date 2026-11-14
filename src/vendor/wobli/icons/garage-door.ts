// Garage Door
import { ellipse, line, pill, poly, rect } from '../engine.ts'
import { CURSOR, EXT, FACE, LINE, PHONE_SCREEN, facePoint, glow, outAndBack, phoneBody, popIn, popScale } from '../parts.ts'
import type { Icon, Layer, Shape, Track, Vec } from '../engine.ts'

// The pointer glides onto the phone and presses the round button: it sinks under the tap, and on the release the garage door
// rolls up into the wall, slow and heavy, uncovering the car, whose headlights come on a beat later; the arrow on the button
// turns to point down. After the hold the pointer comes back and presses again: the door rolls down the way it went up, the
// headlights go out and the arrow turns back up.
const TAP_UP = 30 // the first press goes down
const UP = TAP_UP + 6 // released: the door starts up
const TAP_DOWN = 112 // the second press goes down
const DOWN = TAP_DOWN + 6 // released: the door starts down
const GLIDE = 22 // frames the pointer takes to reach the button
const ROLL = 40 // frames the door takes to roll all the way
const TURN = 14 // frames the arrow takes to turn

// the garage on the house's face: the opening, and how far the door rolls to clear it
const GAP = { x: -86, y: -20, w: 172, h: 142 }
const LIFT: Vec = [0, -GAP.h + 8]
const LAMPS: ReadonlyArray<Vec> = [[-42, 82], [42, 82]]

// the button on the phone's screen
const BUTTON: Vec = [0, 30]
const PUSH: Vec = [-1.5, 7] // the button sinks along its own side under the tap
const TIP = facePoint(12, BUTTON[1] + 6) // the pointer's tip on the button
const FROM: Vec = [104, 56] // where the pointer comes from, off the phone's right side

// the arrow on the button, pointing up (-1) or down (1): one head and one shaft, so the two morph into each other
const arrow = (dir: number) => {
  const [x, y] = BUTTON
  return { head: line([x - 13, y - dir * 1], [x, y + dir * 13], [x + 13, y - dir * 1]), shaft: line([x, y - dir * 16], [x, y + dir * 12]) }
}

const tap = (down: number): Track<Vec> => outAndBack<Vec>(FROM, [0, 0], down - GLIDE, GLIDE - 2, down + 18, 22)
const press = (down: number): Track<Vec> => outAndBack<Vec>([0, 0], PUSH, down, 5, down + 6, 6)
// a change a press made: out on the first release, home on the second, never overshooting
const flip = <T,>(rest: T, to: T, delay: number, len: number): Track<T> => outAndBack(rest, to, UP + delay, len, DOWN + delay, len)

// one pointer per press, cut once it has shrunk away so its slab leaves no trace through the hold
const pointer = (down: number): Layer => ({
  parent: 'phone',
  p: TIP,
  ip: down - GLIDE - 4,
  op: down + 54,
  m: [{ p: tap(down) }, { p: press(down) }, { s: popScale(down - GLIDE - 4, down + 24) }],
  shapes: [{ d: CURSOR(0, 0), fill: 'white', depth: 0.5 }],
})

// the door: four panels with a handle on the bottom one
const door = (): ReadonlyArray<Shape> => [
  { d: rect(GAP.x + 6, GAP.y, GAP.w - 12, GAP.h, 4), fill: 'white', depth: 0.3 },
  ...[1, 2, 3].map((i): Shape => ({ d: line([GAP.x + 6, GAP.y + (GAP.h / 4) * i], [GAP.x + GAP.w - 6, GAP.y + (GAP.h / 4) * i]), line: 4 })),
  { d: pill(-20, GAP.y + GAP.h - 24, 40, 10), fill: 'grey' },
]

const car = (): ReadonlyArray<Shape> => [
  { d: poly([[-40, 64], [-28, 34], [28, 34], [40, 64]], 8), fill: 'tint', depth: 0.4 },
  { d: rect(-66, 60, 132, 44, 14), fill: 'main', depth: 0.6 },
  ...[-48, 48].map((x): Shape => ({ d: rect(x - 12, 102, 24, 20, 4), fill: 'ink', line: false })),
  ...LAMPS.map(([x, y]): Shape => ({ d: ellipse(x, y, 10), fill: 'grey' })),
]

const garageDoor: Icon = {
  name: 'garage-door',
  frames: 180,
  still: 84,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [250, 262], shapes: [] },
    // the house stands behind, to the right
    { id: 'home', parent: 'root', p: [70, -40], s: [78, 78], shapes: [] },
    {
      id: 'house',
      parent: 'home',
      tilt: FACE,
      shapes: [
        { d: rect(-120, -76, 240, 198, 6), fill: 'white', depth: 1 },
        { d: poly([[-146, -64], [0, -168], [146, -64]], [6, 10, 6]), fill: 'main', depth: 1 },
        { d: rect(-100, -34, 200, 156, 6), fill: 'grey', depth: 0.4 },
        { d: rect(GAP.x, GAP.y, GAP.w, GAP.h), fill: 'deep' },
      ],
    },
    // the opening is the door's matte: the door rolls up behind the wall above it
    { id: 'gap', parent: 'house', o: 0, shapes: [{ d: rect(GAP.x, GAP.y, GAP.w, GAP.h) }] },
    { parent: 'house', clip: 'gap', shapes: car() },
    ...LAMPS.map(([x, y]): Layer => ({ parent: 'house', a: [x, y], p: [x, y], m: popIn(UP + 26, DOWN + 2), shapes: [{ d: ellipse(x, y, 10), fill: 'gold' }] })),
    { parent: 'house', clip: 'gap', m: { p: flip<Vec>([0, 0], LIFT, 0, ROLL) }, shapes: door() },
    // the phone in front, to the left
    { id: 'phone', parent: 'root', p: [-112, 70], s: [70, 70], shapes: [] },
    { parent: 'phone', tilt: FACE, shapes: phoneBody(32, 'deep') },
    {
      parent: 'phone',
      tilt: FACE,
      shapes: [
        { d: PHONE_SCREEN(22), fill: 'tint' },
        { d: pill(-22, -128, 44, 12), fill: 'ink', line: false },
        { d: poly([[-34, -52], [0, -84], [34, -52], [34, -30], [-34, -30]], [4, 6, 4, 4, 4]), fill: 'white', depth: 0.3 },
        { d: line([-46, 104], [46, 104]), line: 6 },
      ],
    },
    // the button sinks under each press; its arrow turns as the door goes
    {
      id: 'button',
      parent: 'phone',
      tilt: FACE,
      m: { p: [...press(TAP_UP), ...press(TAP_DOWN)] },
      shapes: [
        { d: ellipse(BUTTON[0], BUTTON[1], 40), fill: 'main', depth: 0.6 },
        { d: flip(arrow(-1).head, arrow(1).head, 8, TURN), line: 7 },
        { d: flip(arrow(-1).shaft, arrow(1).shaft, 8, TURN), line: 7 },
      ],
    },
    pointer(TAP_UP),
    pointer(TAP_DOWN),
    glow('root', [176, -178], 22, popIn(UP + 30, DOWN - 4)),
    glow('root', [-170, -60], 15, popIn(UP + 36, DOWN)),
  ],
}

export default garageDoor
