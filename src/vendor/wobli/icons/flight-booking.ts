// Flight Booking
import { bezier, ellipse, line, pill, poly, rect } from '../engine.ts'
import { EASY, IN, SNAP, glint, spring } from '../motions.ts'
import { EXT, FACE, LINE, facePoint, glow, hit, mapPin, popIn, popScale } from '../parts.ts'
import type { Icon, Key, Shape, Track, Vec } from '../engine.ts'

// The plane pops in just off the origin pin, which takes the push as it lifts off, and flies a high arc towards the
// destination, banking along the curve and laying a dashed trail between the two pins behind it. As it comes in over the
// destination the trail reaches the pin, which squashes and springs upright as rings spread on the map. After the hold the
// plane pops away there and the dashes clear back to the origin, where the plane comes from next time.
const FROM: Vec = [-110, -10] // the origin pin's spot, on the map's face
const TO: Vec = [110, 20] // the destination pin's spot
const FROM_TIP = facePoint(...FROM)
const TO_TIP = facePoint(...TO)
const PIN_K = 0.42
const HEAD = 160 * PIN_K // from a pin's tip up to the middle of its head
const TOP = HEAD + 50 // from a pin's tip to just over its head, where the trail starts and ends

// the trail, one quadratic arc from the top of one pin to the top of the other, high in the middle
const START: Vec = [FROM_TIP[0], FROM_TIP[1] - TOP]
const END: Vec = [TO_TIP[0], TO_TIP[1] - TOP]
const PEAK: Vec = [0, -360]
const quad = (t: number): Vec => {
  const u = 1 - t
  return [u * u * START[0] + 2 * u * t * PEAK[0] + t * t * END[0], u * u * START[1] + 2 * u * t * PEAK[1] + t * t * END[1]]
}
const SAMPLES: ReadonlyArray<Vec> = Array.from({ length: 201 }, (_, i) => quad(i / 200))
const LENS = SAMPLES.reduce<Array<number>>((acc, p, i) => (acc.push(i ? acc[i - 1] + Math.hypot(p[0] - SAMPLES[i - 1][0], p[1] - SAMPLES[i - 1][1]) : 0), acc), [])
const TOTAL = LENS[LENS.length - 1]
const along = (share: number): { p: Vec; turn: number } => {
  const goal = share * TOTAL
  let i = 1
  while (i < LENS.length - 1 && LENS[i] < goal) i++
  const k = (goal - LENS[i - 1]) / (LENS[i] - LENS[i - 1] || 1)
  const [a, b] = [SAMPLES[i - 1], SAMPLES[i]]
  return { p: [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k], turn: (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI + 90 }
}
// the plane keeps clear of both pin heads: it flies only this middle stretch of the arc
const [LO, HI] = [0.22, 0.78]

const APPEAR = 4
const DEPART = 26
const ARRIVE = 104
const LEAVE = 168
const CLEAR = 172

// the plane's pose sampled every other frame on one easy ease, nose along the arc
const EASED = bezier(...EASY)
const share = (f: number) => LO + (HI - LO) * EASED(Math.min(1, Math.max(0, (f - DEPART) / (ARRIVE - DEPART))))
const STEPS = Array.from({ length: (ARRIVE - DEPART) / 2 + 1 }, (_, i) => DEPART + i * 2)
const POSES = STEPS.map((f) => along(share(f)))
const PLANE_P: Track<Vec> = STEPS.map((f, i): Key<Vec> => [f, POSES[i].p])
const PLANE_R: Track<number> = STEPS.map((f, i): Key<number> => [f, POSES[i].turn])

// the dashed trail: each dash draws as the plane passes over it, and they clear last laid, first gone
const DASHES = 9
const GAP = 0.36 // share of each dash's slot left empty
const passes = (s: number) => {
  let f = DEPART
  while (f < ARRIVE && share(f) < s) f++
  return f
}
// dashes behind the plane's first stretch go down as it lifts off, those past its last as it arrives, two frames apart
const ON = Array.from({ length: DASHES }, (_, i) => passes((i + GAP / 2) / DASHES)).reduce<Array<number>>((acc, f, i) => (acc.push(i ? Math.max(f, acc[i - 1] + 2) : f), acc), [])
const dash = (i: number): Shape => {
  const [a, b] = [(i + GAP / 2) / DASHES, (i + 1 - GAP / 2) / DASHES]
  const pts = [0, 0.5, 1].map((t) => along(a + (b - a) * t).p)
  const full = Math.max(passes(b), ON[i] + 3)
  const off = CLEAR + (DASHES - 1 - i) * 2
  return { d: line(...pts), line: 6, round: true, trim: [[ON[i], 0], [full, 1], [off, 1, SNAP], [off + 8, 0]] }
}

// the plane seen from above, nose up, so turning it banks it along the arc
const PLANE: ReadonlyArray<Shape> = [
  { d: poly([[-6, -12], [6, -12], [42, 8], [42, 16], [6, 8], [-6, 8], [-42, 16], [-42, 8]], 3), fill: 'deep', depth: 0.5 },
  { d: poly([[-4, 22], [4, 22], [18, 33], [18, 39], [-18, 39], [-18, 33]], 2), fill: 'deep', depth: 0.5 },
  { d: pill(-9, -44, 18, 86), fill: 'white', depth: 0.8 },
  { d: rect(-5, -33, 10, 7, 3), fill: 'ink', line: false },
]

const SQUASH: Vec = [116, 82]
const PIN_S: Track<Vec> = [[ARRIVE - 2, [100, 100], IN], ...spring([100, 100], ARRIVE, 0.6, SQUASH)]

const pin = (tip: Vec, body: Shape['fill'], dot: Shape['fill']): ReadonlyArray<Shape> => [
  { d: mapPin(tip[0], tip[1], PIN_K), fill: body, depth: 0.7 },
  { d: ellipse(tip[0], tip[1] - HEAD, 16), fill: dot, line: 4, depth: 0.3 },
]

const flightBooking: Icon = {
  name: 'flight-booking',
  frames: 210,
  still: 140,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [250, 338], shapes: [] },
    // the map tile and what is printed on it, each with its own thickness
    { id: 'tile', parent: 'root', tilt: FACE, shapes: [{ d: rect(-150, -110, 300, 220, 24), fill: 'tint', depth: 1 }] },
    {
      parent: 'root',
      tilt: FACE,
      clip: 'tile',
      shapes: [
        { d: rect(-160, -8, 320, 22), fill: 'white', line: 4, depth: 0.2 },
        { d: rect(-6, -120, 20, 240), fill: 'white', line: 4, depth: 0.2 },
        { d: rect(-124, 42, 80, 46, 10), fill: 'grey', line: 4, depth: 0.35 },
        { d: rect(42, -92, 76, 50, 10), fill: 'white', line: 4, depth: 0.25 },
      ],
    },
    // the spots the two pins stand on
    { parent: 'root', tilt: FACE, shapes: [{ d: ellipse(...FROM, 13), fill: 'white', line: 4, depth: 0.2 }, { d: ellipse(...TO, 13), fill: 'white', line: 4, depth: 0.2 }] },
    { parent: 'root', tilt: FACE, a: TO, p: TO, m: glint(ARRIVE, 100), shapes: [{ d: ellipse(...TO, 32) }] },
    { parent: 'root', tilt: FACE, a: TO, p: TO, m: glint(ARRIVE + 6, 150), shapes: [{ d: ellipse(...TO, 32), line: 4 }] },
    // the origin pin takes the push as the plane lifts off; the destination pin squashes on its tip when it lands
    { parent: 'root', m: hit(DEPART, [0, 6]), shapes: pin(FROM_TIP, 'white', 'deep') },
    { parent: 'root', a: TO_TIP, p: TO_TIP, s: PIN_S, shapes: pin(TO_TIP, 'hot', 'white') },
    // the trail, then the plane flying over it
    { parent: 'root', shapes: Array.from({ length: DASHES }, (_, i) => dash(i)) },
    { parent: 'root', p: PLANE_P, r: PLANE_R, m: { s: popScale(APPEAR, LEAVE) }, shapes: PLANE },
    glow('root', [END[0] + 70, END[1] - 10], 22, popIn(ARRIVE + 4, LEAVE - 8)),
    glow('root', [END[0] - 96, END[1] + 40], 15, popIn(ARRIVE + 10, LEAVE - 4)),
  ],
}

export default flightBooking
