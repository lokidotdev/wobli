// Smart Bulb
import { arc, ellipse, line, pill, rect } from '../engine.ts'
import { CURSOR, EXT, FACE, LINE, PHONE_SCREEN, facePoint, glow, outAndBack, phoneBody, popIn, popScale } from '../parts.ts'
import type { Icon, Layer, Motion, Shape, Track, Vec } from '../engine.ts'

// The pointer glides onto the phone and taps the switch: it sinks under the tap, the knob slides across and the track fills.
// On the release the light grows out of the bulb's filament until the glass is lit, the rays spread out from behind it and the
// little bulb on the screen lights with it. After the hold the pointer comes back and taps again: the knob slides home, the
// light shrinks back into the filament and the rays draw in, the way they came.
const TAP_ON = 30 // the first tap goes down
const ON = TAP_ON + 6 // released: the switch flips and the light comes on
const TAP_OFF = 124 // the second tap goes down
const OFF = TAP_OFF + 6 // released: the switch flips back and the light goes out
const GLIDE = 22 // frames the pointer takes to reach the switch
const FLIP = 16 // frames the knob takes across
const LIGHT = 22 // frames the light takes to fill the glass

// the switch on the phone's screen
const TRACK = { x: -46, y: 52, w: 92, h: 48 }
const KNOB_R = 17
const KNOB: Vec = [TRACK.x + TRACK.h / 2, TRACK.y + TRACK.h / 2]
const TRAVEL = TRACK.w - TRACK.h
const PUSH: Vec = [-1.5, 7] // the switch sinks along its own side under the tap
const TIP = facePoint(10, KNOB[1] + 4) // the pointer's tip on the switch
const FROM: Vec = [104, 56] // where the pointer comes from, off the phone's right side

// the little bulb on the screen's tile
const GLYPH: Vec = [0, -62]

// the bulb: one upright silhouette, glass over a screw base, the light grows out of the filament
const BULB = 'M-44 64L-44 44C-78 22 -96 -8 -96 -48A96 96 0 0 1 96 -48C96 -8 78 22 44 44L44 64Z'
const FILAMENT: Vec = [0, -30]
const RAYS: ReadonlyArray<Shape> = [-160, -125, -90, -55, -20].map((deg): Shape => {
  const t = (deg * Math.PI) / 180
  const at = (r: number): Vec => [Math.cos(t) * r, -48 + Math.sin(t) * r]
  return { d: line(at(124), at(156)), line: 8, round: true }
})

const tap = (down: number, from: Vec): Track<Vec> => outAndBack<Vec>(from, [0, 0], down - GLIDE, GLIDE - 2, down + 18, 22)
const press = (down: number): Track<Vec> => outAndBack<Vec>([0, 0], PUSH, down, 5, down + 6, 6)
// a change a tap made: out on the first release, home on the second, never overshooting
const flip = <T,>(rest: T, to: T, delay: number, len: number): Track<T> => outAndBack(rest, to, ON + delay, len, OFF + delay, len)

const SWITCH: Motion = { p: [...press(TAP_ON), ...press(TAP_OFF)] }
const KNOB_MOVE: Motion = { p: flip<Vec>([0, 0], [TRAVEL, 0], 0, FLIP) }
const LIT: Track<Vec> = flip<Vec>([0, 0], [100, 100], 2, LIGHT)

// one pointer per tap, cut once it has shrunk away so its slab leaves no trace through the hold
const pointer = (down: number): Layer => ({
  parent: 'phone',
  p: TIP,
  ip: down - GLIDE - 4,
  op: down + 54,
  m: [{ p: tap(down, FROM) }, { p: press(down) }, { s: popScale(down - GLIDE - 4, down + 24) }],
  shapes: [{ d: CURSOR(0, 0), fill: 'white', depth: 0.5 }],
})

const bulbLayers =(): ReadonlyArray<Layer> => [
  // the rays, behind the glass, spread out from the bulb's middle once the light is on
  { parent: 'lamp', tilt: FACE, a: [0, -48], p: facePoint(0, -48), s: flip<Vec>([0, 0], [100, 100], 8, LIGHT), shapes: RAYS },
  { parent: 'lamp', tilt: FACE, shapes: [{ d: BULB, fill: 'white', depth: 1 }] },
  // the light: a mask that is never painted, a disc swelling out of the filament, uncovers the lit glass slab by slab
  { id: 'beam', parent: 'lamp', o: 0, a: facePoint(...FILAMENT), p: facePoint(...FILAMENT), s: LIT, shapes: [{ d: ellipse(...facePoint(...FILAMENT), 150) }] },
  { parent: 'lamp', tilt: FACE, clip: 'beam', shapes: [{ d: BULB, fill: 'gold', depth: 1 }] },
  {
    parent: 'lamp',
    tilt: FACE,
    shapes: [
      { d: line([-34, -24], [-17, -46], [0, -24], [17, -46], [34, -24]), round: true },
      { d: line([-34, -24], [-30, 44]) },
      { d: line([34, -24], [30, 44]) },
      { d: arc(0, -48, 70, 196, 246) },
      { d: rect(-50, 60, 100, 28, 9), fill: 'grey', depth: 0.8 },
      { d: rect(-44, 84, 88, 26, 9), fill: 'grey', depth: 0.8 },
      { d: rect(-24, 106, 48, 22, 10), fill: 'deep', depth: 0.6 },
    ],
  },
]

const smartBulb: Icon = {
  name: 'smart-bulb',
  frames: 180,
  still: 90,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [250, 262], shapes: [] },
    // the bulb stands behind, to the right
    { id: 'lamp', parent: 'root', p: [86, -58], s: [74, 74], shapes: [] },
    ...bulbLayers(),
    // the phone in front, to the left
    { id: 'phone', parent: 'root', p: [-88, 46], s: [76, 76], shapes: [] },
    { parent: 'phone', tilt: FACE, shapes: phoneBody(32, 'deep') },
    { id: 'screen', parent: 'phone', tilt: FACE, shapes: [{ d: PHONE_SCREEN(22), fill: 'tint' }] },
    {
      parent: 'phone',
      tilt: FACE,
      shapes: [
        { d: pill(-22, -128, 44, 12), fill: 'ink', line: false },
        { d: rect(-50, -110, 100, 100, 18), fill: 'white', depth: 0.3 },
        { d: ellipse(GLYPH[0], GLYPH[1], 20), fill: 'grey' },
        { d: rect(-10, GLYPH[1] + 22, 20, 12, 4), fill: 'ink', line: false },
        { d: line([-30, 24], [30, 24]), line: 6 },
      ],
    },
    // the little bulb lights with the big one
    { parent: 'phone', tilt: FACE, a: GLYPH, p: facePoint(...GLYPH), s: LIT, shapes: [{ d: ellipse(GLYPH[0], GLYPH[1], 20), fill: 'gold' }] },
    // the switch sinks under each tap; the track fills from under the knob as it slides
    {
      id: 'switch',
      parent: 'phone',
      tilt: FACE,
      m: SWITCH,
      shapes: [
        { d: pill(TRACK.x, TRACK.y, TRACK.w, TRACK.h), fill: 'grey', depth: 0.6 },
        {
          d: flip(pill(KNOB[0] - 14, KNOB[1] - 14, 28, 28), pill(TRACK.x, TRACK.y, TRACK.w, TRACK.h), 0, FLIP),
          fill: 'gold',
          depth: 0.6,
        },
      ],
    },
    { parent: 'switch', m: KNOB_MOVE, shapes: [{ d: ellipse(KNOB[0], KNOB[1], KNOB_R), fill: 'white', depth: 0.5 }] },
    // the pointer: glides in, presses, leaves the way it came; once for each tap
    pointer(TAP_ON),
    pointer(TAP_OFF),
    glow('root', [196, -196], 22, popIn(ON + 14, OFF - 6)),
    glow('root', [-150, -116], 15, popIn(ON + 20, OFF - 2)),
  ],
}

export default smartBulb
