// Ride Hailing
import { bezier, ellipse, line, onFace, rect } from '../engine.ts'
import { EASY, SNAP, spring } from '../motions.ts'
import { EXT, FACE, LINE, PHONE_SCREEN, buzz, facePoint, glow, hit, mapPin, phoneBody, popIn, popScale, wave } from '../parts.ts'
import type { Icon, Key, Shape, Track, Vec } from '../engine.ts'

// The car pops onto the phone's map down the street, then the pickup pin pops up round the corner and the route draws from
// the pin back to the car. The car drives up the street, turns the corner and pulls up under the pin, eating the route as it
// goes; on the frame it stops the phone buzzes, the pin bobs on its tip and a ripple rings out. After the hold the pin and the
// car pop away where they stood, and the car comes back down the street next time.
const ROAD_X = -30 // the street the car comes up
const ROAD_Y = -40 // the street the pickup is on
const ROAD_W = 30
const BEND = 20 // the corner's radius, on the road's centre line
const START: Vec = [ROAD_X, 108]
const STOP: Vec = [0, ROAD_Y] // where the car pulls up, just short of the pin
const PICKUP: Vec = [42, ROAD_Y] // the pin's tip, on the street at the route's end
const PIN_K = 0.26
const SCALE = 100
const SPARK: Vec = [facePoint(...PICKUP)[0] + 70, facePoint(...PICKUP)[1] - 100]

const CAR_IN = 4
const PIN_IN = 16
const ROUTE_IN = 30
const DEPART = 56
const ARRIVE = 118
const PIN_OUT = 156
const CAR_OUT = 160
const RESET = 192 // the car is gone by now, so it goes home unseen

// up the street, round the corner, along to the stop: sampled densely and measured as it lands on screen, the way the route's
// trim measures it, so the car and the end of the route stay together
const SAMPLES: ReadonlyArray<Vec> = [
  ...Array.from({ length: 40 }, (_, i): Vec => [ROAD_X, START[1] + ((ROAD_Y + BEND - START[1]) * i) / 40]),
  ...Array.from({ length: 21 }, (_, i): Vec => {
    const a = Math.PI + (Math.PI / 2) * (i / 20)
    return [ROAD_X + BEND + BEND * Math.cos(a), ROAD_Y + BEND + BEND * Math.sin(a)]
  }),
  ...Array.from({ length: 20 }, (_, i): Vec => [ROAD_X + BEND + ((STOP[0] - ROAD_X - BEND) * (i + 1)) / 20, ROAD_Y]),
]
const LENS = SAMPLES.reduce<Array<number>>((acc, p, i) => {
  if (!i) return [0]
  const [a, b] = [onFace(FACE, SAMPLES[i - 1]), onFace(FACE, p)]
  return [...acc, acc[i - 1] + Math.hypot(b[0] - a[0], b[1] - a[1])]
}, [])
const TOTAL = LENS[LENS.length - 1]
const along = (share: number): { p: Vec; turn: number } => {
  const goal = share * TOTAL
  let i = 1
  while (i < LENS.length - 1 && LENS[i] < goal) i++
  const k = (goal - LENS[i - 1]) / (LENS[i] - LENS[i - 1] || 1)
  const [a, b] = [SAMPLES[i - 1], SAMPLES[i]]
  return { p: [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k], turn: (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI + 90 }
}
// the route runs from the pin back to the car, so it draws out of the pin and is eaten from the car's end
const ROUTE = line(...[...SAMPLES].reverse())

// the car's pose sampled every other frame on one easy ease
const EASED = bezier(...EASY)
const STEPS = Array.from({ length: (ARRIVE - DEPART) / 2 + 1 }, (_, i) => DEPART + i * 2)
const POSES = STEPS.map((f) => along(EASED((f - DEPART) / (ARRIVE - DEPART))))
const CAR_P: Track<Vec> = [...STEPS.map((f, i): Key<Vec> => [f, POSES[i].p]), [RESET, STOP, 0], [RESET + 1, START]]
const CAR_R: Track<number> = [...STEPS.map((f, i): Key<number> => [f, POSES[i].turn]), [RESET, 90, 0], [RESET + 1, 0]]
const TRAIL: Track<number> = [[ROUTE_IN, 0, SNAP], [ROUTE_IN + 22, 1, 0], [DEPART, 1, EASY], [ARRIVE, 0]]

// the pin bobs on its tip when the car pulls up
const PIN_S: Track<Vec> = [[0, [SCALE, SCALE]], ...spring([SCALE, SCALE], ARRIVE, 0.6, [112, 88])]

// a top-down car, nose up, centred on 0 0
const car = (): ReadonlyArray<Shape> => [
  ...[-10, 10].flatMap((y) => [-12, 12].map((x): Shape => ({ d: rect(x - 3, y - 5, 6, 10, 2), fill: 'ink', line: false }))),
  { d: rect(-12, -19, 24, 38, 8), fill: 'gold', line: 4, depth: 0.5 },
  { d: rect(-8, -11, 16, 7, 2), fill: 'tint', line: 3 },
  { d: rect(-8, 2, 16, 8, 3), fill: 'tint', line: 3 },
]

const rideHailing: Icon = {
  name: 'ride-hailing',
  frames: 210,
  still: 140,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [250, 250], s: [122, 122], m: buzz(ARRIVE, 3), shapes: [] },
    { parent: 'root', tilt: FACE, shapes: phoneBody(32, 'deep') },
    { id: 'screen', parent: 'root', tilt: FACE, shapes: [{ d: PHONE_SCREEN(22), fill: 'tint' }] },
    // the map: two streets crossing and three blocks, each raised off the screen
    {
      parent: 'screen',
      clip: 'screen',
      shapes: [
        { d: rect(ROAD_X - ROAD_W / 2, -150, ROAD_W, 300), fill: 'white', line: 4, depth: 0.2 },
        { d: rect(-90, ROAD_Y - ROAD_W / 2, 180, ROAD_W), fill: 'white', line: 4, depth: 0.2 },
        { d: rect(-80, -120, 30, 56, 6), fill: 'grey', line: 4, depth: 0.35 },
        { d: rect(-2, -120, 58, 52, 8), fill: 'grey', line: 4, depth: 0.35 },
        { d: rect(-2, 0, 58, 58, 8), fill: 'white', line: 4, depth: 0.35 },
        { d: rect(-2, 74, 58, 48, 8), fill: 'grey', line: 4, depth: 0.35 },
      ],
    },
    // the route from the pin back to the car
    { parent: 'screen', shapes: [{ d: ROUTE, line: 6, round: true, trim: TRAIL }] },
    // the car, turning with the road and pulling up with a small spring
    { parent: 'screen', p: CAR_P, r: CAR_R, s: popScale(CAR_IN, CAR_OUT), m: hit(ARRIVE, [5, 0]), shapes: car() },
    // the pickup pin, standing on its tip
    {
      parent: 'screen',
      a: PICKUP,
      p: PICKUP,
      s: PIN_S,
      m: { s: popScale(PIN_IN, PIN_OUT) },
      shapes: [
        { d: mapPin(PICKUP[0], PICKUP[1], PIN_K), fill: 'hot', line: 4, depth: 0.5 },
        { d: ellipse(PICKUP[0], PICKUP[1] - 160 * PIN_K, 9), fill: 'white', line: 4 },
      ],
    },
    wave('root', facePoint(...PICKUP), 44, ARRIVE, -64, -24),
    glow('root', SPARK, 22, popIn(ARRIVE + 4, PIN_OUT - 8)),
  ],
}

export default rideHailing
