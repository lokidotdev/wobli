// Thermostat Dial
import { at, ellipse, line, poly } from '../engine.ts'
import { EXT, FACE, LINE, glow, numeral, outAndBack, popIn } from '../parts.ts'
import type { Icon, Key, Shape, Track, Vec } from '../engine.ts'

// The thermostat's ring turns clockwise, its pointer sweeping along the scale, and the reading on the display ticks up a degree
// at a time, 68 to 72, each digit flipping the moment the pointer passes a mark. When the ring stops a flame pops under the
// reading and a sparkle follows. After the hold the flame goes out and the ring turns home the way it came, counting back down.
const TURN = 16 // the ring starts to turn
const TURN_LEN = 56
const LANDED = TURN + TURN_LEN
const BACK = 116 // the ring turns home
const SWEEP = 72 // degrees the ring turns, 18 per degree of heat
const FROM = 68
const TO = 72

const BODY_R = 132
const RING_R = 120
const FACE_R = 84
const POINTER = -126 // where the ring's pointer rests, degrees from three o'clock

const TURN_R: Track<number> = outAndBack(0, SWEEP, TURN, TURN_LEN, BACK)

// the reading at each frame: a degree more for every 18 the ring has turned, flipped on the frame the pointer passes a mark
const STEP = SWEEP / (TO - FROM)
const reading = (f: number) => FROM + Math.round(at(TURN_R, f) / STEP)
const FLIPS = Array.from({ length: 180 }, (_, f) => f).filter((f) => f === 0 || reading(f) !== reading(f - 1))

const TENS = { x: -42, y: -34, w: 28, h: 48 }
const UNITS = { ...TENS, x: -4 }
const digitTrack = (box: typeof TENS, place: (n: number) => number): Track<string> => {
  const keys = FLIPS.map((f): Key<string> => [f, numeral(place(reading(f)), box.x, box.y, box.w, box.h), 0])
  return keys.filter((k, i) => i === 0 || k[1] !== keys[i - 1][1])
}
const TENS_D = digitTrack(TENS, (n) => Math.floor(n / 10))
const UNITS_D = digitTrack(UNITS, (n) => n % 10)

const polar = (deg: number, r: number): Vec => [Math.cos((deg * Math.PI) / 180) * r, Math.sin((deg * Math.PI) / 180) * r]

const POINTER_AT = polar(POINTER, 104)

// the scale printed round the top of the display, one mark per degree of heat and one between
const SCALE: ReadonlyArray<Shape> = Array.from({ length: 2 * (TO - FROM) + 1 }, (_, i): Shape => {
  const deg = POINTER + (i * STEP) / 2
  const long = i % 2 === 0
  return { d: line(polar(deg, long ? 62 : 66), polar(deg, 74)), line: 4, round: true }
})

// the grip round the ring: short ink notches, so the turn reads
const GRIP: ReadonlyArray<Shape> = Array.from({ length: 16 }, (_, i): Shape => {
  const deg = POINTER + 11.25 + i * 22.5
  return { d: line(polar(deg, 100), polar(deg, 110)), line: 4, round: true }
})

// a little flame: a round belly, its tip leaning right and a short tongue licking up on the left
const FLAME: Vec = [0, 44]
const flame = ([x, y]: Vec) =>
  poly([[x + 4, y - 20], [x + 13, y - 2], [x + 10, y + 12], [x - 10, y + 12], [x - 13, y - 1], [x - 8, y - 12], [x - 3, y - 4]], [2, 10, 8, 8, 8, 2, 3])

const thermostatDial: Icon = {
  name: 'thermostat-dial',
  frames: 180,
  still: 96,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [254, 248], shapes: [] },
    // the housing on the wall
    { id: 'stat', parent: 'root', tilt: FACE, shapes: [{ d: ellipse(0, 0, BODY_R), fill: 'white', depth: 1 }] },
    // the ring, turning on its centre and carrying its pointer and grip
    {
      parent: 'stat',
      m: { r: TURN_R },
      shapes: [
        { d: ellipse(0, 0, RING_R), fill: 'main', depth: 0.6 },
        ...GRIP,
        { d: ellipse(...POINTER_AT, 8), fill: 'white', depth: 0.3 },
      ],
    },
    // the display, which stays put while the ring turns round it
    {
      id: 'display',
      parent: 'stat',
      shapes: [
        { d: ellipse(0, 0, FACE_R), fill: 'tint', depth: 0.3 },
        ...SCALE,
        { d: ellipse(UNITS.x + UNITS.w + 14, TENS.y + 6, 5), line: 4 }, // the degree sign
      ],
    },
    { parent: 'display', shapes: [{ d: TENS_D, line: 6, round: true }] },
    { parent: 'display', shapes: [{ d: UNITS_D, line: 6, round: true }] },
    // the flame, growing out of the display once the ring has stopped
    { parent: 'display', a: FLAME, p: FLAME, m: popIn(LANDED + 2, BACK - 2), shapes: [{ d: flame(FLAME), fill: 'hot', depth: 0.3 }] },
    glow('root', [-150, -150], 22, popIn(LANDED + 8, BACK - 8)),
    glow('root', [164, -60], 15, popIn(LANDED + 14, BACK - 4)),
  ],
}

export default thermostatDial
