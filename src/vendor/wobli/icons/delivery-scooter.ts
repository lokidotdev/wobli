// Delivery Scooter
import { bezier, ellipse, line, onFace, poly, rect } from '../engine.ts'
import { EASY, SNAP } from '../motions.ts'
import { EXT, FACE, LINE, PHONE_SCREEN, checkBadge, facePoint, glow, hit, phoneBody, popIn, popScale } from '../parts.ts'
import type { Icon, Key, Shape, Track, Vec } from '../engine.ts'

// A scooter pops onto the shop at the foot of the map on the phone and rides the winding route up the screen, turning to face
// each way the road bends and drawing its trail behind it. It pulls up at the house, which takes the hit,
// and a check pops over the roof. After the hold the check and the scooter pop away, the trail draws back down to the shop.
const WAYS: ReadonlyArray<Vec> = [[-30, 108], [34, 88], [30, 38], [-34, 18], [-28, -32], [36, -50], [36, -88]] // the route's turns, on the screen's face
const HOME: Vec = [-22, -98] // the house's foot, beside the route's end where the scooter parks
const DOOR = facePoint(...HOME)
const BADGE: Vec = [DOOR[0], DOOR[1] - 118]
const SPARK: Vec = [DOOR[0] + 70, DOOR[1] - 120]

const APPEAR = 4
const DEPART = 22
const ARRIVE = 104
const SEALED = ARRIVE + 6 // the check pops over the roof
const UNSEAL = 156
const LEAVE = 164
const RETRACT = 172
const TURN = 8 // frames the scooter takes to turn round

// the route as Catmull-Rom cubics through the turns, so the dots, the trail and the scooter all ride the same road
const SEGS = WAYS.slice(0, -1).map((b, i): readonly [Vec, Vec, Vec, Vec] => {
  const a = WAYS[Math.max(0, i - 1)]
  const c = WAYS[i + 1]
  const d = WAYS[Math.min(WAYS.length - 1, i + 2)]
  return [b, [b[0] + (c[0] - a[0]) / 6, b[1] + (c[1] - a[1]) / 6], [c[0] - (d[0] - b[0]) / 6, c[1] - (d[1] - b[1]) / 6], c]
})
const ROUTE = `M${WAYS[0][0]} ${WAYS[0][1]}` + SEGS.map(([, c1, c2, e]) => `C${c1[0]} ${c1[1]} ${c2[0]} ${c2[1]} ${e[0]} ${e[1]}`).join('')

// sampled densely and measured as it lands on screen, the way the trail's trim measures it, so scooter and trail stay together
const cubic = ([p0, p1, p2, p3]: readonly [Vec, Vec, Vec, Vec], t: number): Vec => {
  const u = 1 - t
  const b = (i: 0 | 1) => u * u * u * p0[i] + 3 * u * u * t * p1[i] + 3 * u * t * t * p2[i] + t * t * t * p3[i]
  return [b(0), b(1)]
}
const SAMPLES: ReadonlyArray<Vec> = SEGS.flatMap((s, i) => Array.from({ length: i ? 40 : 41 }, (_, j) => cubic(s, (i ? j + 1 : j) / 40))).map((p) => onFace(FACE, p))
const LENS = SAMPLES.reduce<Array<number>>((acc, p, i) => (i ? [...acc, acc[i - 1] + Math.hypot(p[0] - SAMPLES[i - 1][0], p[1] - SAMPLES[i - 1][1])] : [0]), [])
const TOTAL = LENS[LENS.length - 1]
const along = (share: number): Vec => {
  const goal = share * TOTAL
  let i = 1
  while (i < LENS.length - 1 && LENS[i] < goal) i++
  const k = (goal - LENS[i - 1]) / (LENS[i] - LENS[i - 1] || 1)
  const [a, b] = [SAMPLES[i - 1], SAMPLES[i]]
  return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k]
}

// the scooter's spot, upright off the screen, sampled every other frame on one easy ease
const EASED = bezier(...EASY)
const STEPS = Array.from({ length: (ARRIVE - DEPART) / 2 + 1 }, (_, i) => DEPART + i * 2)
const SPOTS = STEPS.map((f) => along(EASED((f - DEPART) / (ARRIVE - DEPART))))
const RIDE: Track<Vec> = STEPS.map((f, i): Key<Vec> => [f, SPOTS[i]])

// which way it faces: right while the road runs right across the screen, left while it runs left, turning on the easy ease
// round the middle of each bend. Measured a few steps ahead so a wobble in the road never turns it.
const ways = SPOTS.map((p, i) => Math.sign(SPOTS[Math.min(SPOTS.length - 1, i + 3)][0] - SPOTS[Math.max(0, i - 3)][0]) || 1)
const FACING: Track<Vec> = ways.reduce<Array<Key<Vec>>>(
  (keys, w, i) => (i && w !== ways[i - 1] ? [...keys, [STEPS[i] - TURN / 2, [-w * 100, 100], EASY], [STEPS[i] + TURN / 2, [w * 100, 100]]] : keys),
  [[0, [ways[0] * 100, 100]]],
)
const TRAIL: Track<number> = [[DEPART, 0, EASY], [ARRIVE, 1], [RETRACT, 1, SNAP], [RETRACT + 28, 0]]

// a scooter seen side on, facing right, standing on 0 0: wheels, body, stem and bars, seat, and the delivery box on its rack
const scooter = (): ReadonlyArray<Shape> => [
  { d: poly([[18, -26], [28, -84], [42, -84], [48, -26]], [3, 4, 4, 3]), fill: 'main', depth: 0.6 },
  { d: rect(16, -96, 36, 11, 5), fill: 'deep', depth: 0.4 },
  { d: poly([[-52, -60], [-6, -60], [4, -38], [24, -38], [24, -24], [-52, -24]], [16, 4, 4, 4, 4, 10]), fill: 'main', depth: 0.8 },
  { d: rect(-46, -70, 38, 12, 6), fill: 'deep', depth: 0.4 },
  { d: rect(-60, -114, 44, 42, 7), fill: 'gold', depth: 0.8 },
  { d: line([-60, -100], [-16, -100]), line: 4 },
  ...[-32, 36].map((x): Shape => ({ d: ellipse(x, -15, 15), fill: 'deep', depth: 0.6 })),
  ...[-32, 36].map((x): Shape => ({ d: ellipse(x, -15, 5), fill: 'white', line: 3 })),
]

// a little house standing on 0 0: walls, roof and door
const house = (): ReadonlyArray<Shape> => [
  { d: rect(-30, -50, 60, 50, 4), fill: 'white', depth: 0.6 },
  { d: poly([[-40, -46], [0, -84], [40, -46]], [4, 6, 4]), fill: 'main', depth: 0.6 },
  { d: rect(-10, -30, 20, 30, 4), fill: 'deep', depth: 0.3 },
]

const deliveryScooter: Icon = {
  name: 'delivery-scooter',
  frames: 210,
  still: 140,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [254, 268], s: [110, 110], shapes: [] },
    { parent: 'root', tilt: FACE, shapes: phoneBody(32, 'deep') },
    // the map on the screen: two blocks raised off it, the planned route dotted, the trail the scooter leaves, the shop at its start
    {
      id: 'map',
      parent: 'root',
      tilt: FACE,
      shapes: [
        { d: PHONE_SCREEN(22), fill: 'tint' },
        { d: rect(-56, -12, 40, 40, 6), fill: 'white', line: 4, depth: 0.3 },
        { d: rect(16, 56, 40, 64, 6), fill: 'white', line: 4, depth: 0.3 },
      ],
    },
    { parent: 'map', shapes: SEGS.map(([, , , e]): Shape => ({ d: ellipse(e[0], e[1], 4), fill: 'ink', line: false })).slice(0, -1) },
    { parent: 'map', shapes: [{ d: ROUTE, line: 9, round: true, trim: TRAIL }] },
    { parent: 'map', shapes: [{ d: ellipse(WAYS[0][0], WAYS[0][1], 12), fill: 'gold', depth: 0.3 }] },
    // the house stands up off the screen at the route's end, and takes the hit as the scooter pulls up
    { id: 'house', parent: 'root', p: DOOR, s: [86, 86], m: hit(ARRIVE, [3, 6]), shapes: house() },
    // the scooter rides the route upright, turning to face the way the road runs, and rocks back as it stops
    { id: 'ride', parent: 'root', p: RIDE, s: popScale(APPEAR, LEAVE), shapes: [] },
    { id: 'scooter', parent: 'ride', s: FACING, m: hit(ARRIVE + 3, [-4, 2], 0.6), shapes: [] },
    { parent: 'scooter', s: [50, 50], shapes: scooter() },
    { parent: 'root', a: BADGE, p: BADGE, m: popIn(SEALED, UNSEAL), shapes: checkBadge(BADGE, 24) },
    glow('root', SPARK, 18, popIn(SEALED + 6, UNSEAL - 6)),
  ],
}

export default deliveryScooter
