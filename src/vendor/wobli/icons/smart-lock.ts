// Smart Lock
import { ellipse, line, pill, rect } from '../engine.ts'
import { CURSOR, EXT, FACE, LINE, PHONE_SCREEN, facePoint, glow, outAndBack, phoneBody, popIn, popScale, shackle } from '../parts.ts'
import type { Icon, Layer, Motion, Track, Vec } from '../engine.ts'

// The pointer glides onto the phone and taps the unlock button, which sinks under it. On the release the deadbolt slides back
// out of the door frame into the door, the thumb turn follows it round a beat later and the lock's light comes on green, while
// the padlock on the screen lifts its shackle. After the hold a second tap sends the bolt back out into the frame, the way it came.
const TAP_ON = 30 // the first tap goes down
const ON = TAP_ON + 6 // released: the bolt draws back
const TAP_OFF = 124 // the second tap goes down
const OFF = TAP_OFF + 6 // released: the bolt slides home
const GLIDE = 22 // frames the pointer takes to reach the button
const SLIDE = 18 // frames the bolt takes to travel
const TURN_LAG = 5 // the thumb turn follows the bolt

// the button on the phone's screen
const BUTTON: Vec = [0, 52]
const PUSH: Vec = [-1.5, 7] // the button sinks along its own side under the tap
const TIP = facePoint(10, BUTTON[1] + 4) // the pointer's tip on the button
const FROM: Vec = [104, 56] // where the pointer comes from, off the phone's right side

// the padlock glyph on the screen's tile
const GLYPH: Vec = [0, -48]
const LIFT: Vec = [0, -12]

// the door: its edge at x 80, the frame beside it, the bolt crossing the gap at BOLT_Y
const BOLT_Y = -44
const THROW = 74 // how far the bolt draws back into the door
const TURN: Vec = [10, BOLT_Y] // the thumb turn's pivot on the lock plate
const LIGHT: Vec = [10, 34]

const tap = (down: number, from: Vec): Track<Vec> => outAndBack<Vec>(from, [0, 0], down - GLIDE, GLIDE - 2, down + 18, 22)
const press = (down: number): Track<Vec> => outAndBack<Vec>([0, 0], PUSH, down, 5, down + 6, 6)
// a change a tap made: out on the first release, home on the second, never overshooting
const flip = <T,>(rest: T, to: T, delay: number, len: number): Track<T> => outAndBack(rest, to, ON + delay, len, OFF + delay, len)

const BUTTON_MOVE: Motion = { p: [...press(TAP_ON), ...press(TAP_OFF)] }
const BOLT_MOVE: Motion = { p: flip<Vec>([0, 0], [-THROW, 0], 0, SLIDE) }
const TURN_MOVE: Motion = { r: flip(0, -90, TURN_LAG, SLIDE) }
const OPEN: Track<Vec> = flip<Vec>([0, 0], [100, 100], SLIDE - 4, 14)

// one pointer per tap, cut once it has shrunk away so its slab leaves no trace through the hold
const pointer = (down: number): Layer => ({
  parent: 'phone',
  p: TIP,
  ip: down - GLIDE - 4,
  op: down + 54,
  m: [{ p: tap(down, FROM) }, { p: press(down) }, { s: popScale(down - GLIDE - 4, down + 24) }],
  shapes: [{ d: CURSOR(0, 0), fill: 'white', depth: 0.5 }],
})

const smartLock: Icon = {
  name: 'smart-lock',
  frames: 180,
  still: 90,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [250, 262], shapes: [] },
    // the door stands behind, to the right
    { id: 'lockset', parent: 'root', p: [64, -50], s: [74, 74], shapes: [] },
    // the frame with its strike plate, the bolt crossing into it, then the door in front of the bolt's hidden end
    {
      parent: 'lockset',
      tilt: FACE,
      shapes: [
        { d: rect(98, -214, 50, 428, 8), fill: 'white', depth: 1 },
        { d: rect(104, BOLT_Y - 32, 38, 64, 6), fill: 'deep', depth: 0.3 },
      ],
    },
    { id: 'door', parent: 'lockset', tilt: FACE, shapes: [] },
    { parent: 'door', m: BOLT_MOVE, shapes: [{ d: rect(-4, BOLT_Y - 17, 136, 34, 8), fill: 'grey', depth: 0.6 }] },
    {
      parent: 'door',
      shapes: [
        { d: rect(-96, -200, 176, 400, 10), fill: 'main', depth: 1 },
        { d: rect(-76, -178, 40, 136, 6), line: 4 },
        { d: rect(-76, 0, 40, 178, 6), line: 4 },
        // the lock: a plate with the thumb turn and the status light
        { d: rect(-26, BOLT_Y - 48, 72, 150, 34), fill: 'white', depth: 0.8 },
        { d: ellipse(TURN[0], TURN[1], 24), fill: 'deep', depth: 0.4 },
        { d: ellipse(LIGHT[0], LIGHT[1], 9), fill: 'grey', depth: 0.2 },
      ],
    },
    { parent: 'door', a: TURN, p: TURN, m: TURN_MOVE, shapes: [{ d: pill(TURN[0] - 8, TURN[1] - 30, 16, 60), fill: 'white', depth: 0.5 }] },
    { parent: 'door', a: LIGHT, p: LIGHT, s: OPEN, shapes: [{ d: ellipse(LIGHT[0], LIGHT[1], 9), fill: 'ok', depth: 0.2 }] },
    // the phone in front, to the left
    { id: 'phone', parent: 'root', p: [-96, 50], s: [76, 76], shapes: [] },
    { parent: 'phone', tilt: FACE, shapes: phoneBody(32, 'deep') },
    {
      id: 'screen',
      parent: 'phone',
      tilt: FACE,
      shapes: [
        { d: PHONE_SCREEN(22), fill: 'tint' },
        { d: pill(-22, -128, 44, 12), fill: 'ink', line: false },
        { d: rect(-50, -110, 100, 100, 18), fill: 'white', depth: 0.3 },
        { d: line([-30, 104], [30, 104]), line: 6 },
      ],
    },
    // the padlock glyph: the shackle lifts as the door unlocks, the body turns green
    { parent: 'screen', m: { p: flip<Vec>([0, 0], LIFT, 0, SLIDE) }, shapes: [{ d: shackle(30, 7, GLYPH[1] + 2, 6), fill: 'grey', depth: 0.2 }] },
    { parent: 'screen', shapes: [{ d: rect(GLYPH[0] - 22, GLYPH[1], 44, 34, 7), fill: 'grey', depth: 0.3 }] },
    {
      parent: 'screen',
      a: [GLYPH[0], GLYPH[1] + 17],
      p: [GLYPH[0], GLYPH[1] + 17],
      s: OPEN,
      shapes: [{ d: rect(GLYPH[0] - 22, GLYPH[1], 44, 34, 7), fill: 'ok', depth: 0.3 }],
    },
    { parent: 'screen', shapes: [{ d: ellipse(GLYPH[0], GLYPH[1] + 15, 5), fill: 'ink', line: false }] },
    // the button sinks under each tap
    { parent: 'screen', m: BUTTON_MOVE, shapes: [{ d: ellipse(BUTTON[0], BUTTON[1], 30), fill: 'main', depth: 0.6 }] },
    pointer(TAP_ON),
    pointer(TAP_OFF),
    glow('root', [190, -200], 22, popIn(ON + SLIDE, OFF - 6)),
    glow('root', [-156, -124], 15, popIn(ON + SLIDE + 6, OFF - 2)),
  ],
}

export default smartLock
