// Route Navigation
import { bezier, ellipse, line, onFace, poly, rect } from '../engine.ts'
import { EASY, IN, SNAP, spring } from '../motions.ts'
import { EXT, FACE, LINE, facePoint, glow, hit, popIn, popScale, wave } from '../parts.ts'
import type { Icon, Key, Shape, Track, Vec } from '../engine.ts'

// The navigation arrow pops onto the folded map and follows the winding route, turning with every bend and drawing its trail
// behind it. It reaches the flag, which takes the hit, and the flag springs up its pole. After a long hold the arrow pops away
// at the flag, the flag drops and the trail draws back along the road to the start, where the arrow comes from next time.
const WAYS: ReadonlyArray<Vec> = [[-118, 76], [-52, 62], [-54, 6], [16, -4], [24, -52], [64, -58]] // the route's turns, on the map's face
const FLAG: Vec = [118, -84] // the flag's foot, just past the route's end
const FOOT = facePoint(...FLAG)
const SPARK: Vec = [FOOT[0] + 84, FOOT[1] - 112]

const APPEAR = 4
const DEPART = 22
const ARRIVE = 96
const RAISE = ARRIVE + 4
const LEAVE = 166
const RETRACT = 172

// the route as Catmull-Rom cubics through the turns, so the dots, the trail and the arrow all ride the same road
const SEGS = WAYS.slice(0, -1).map((b, i): readonly [Vec, Vec, Vec, Vec] => {
  const a = WAYS[Math.max(0, i - 1)]
  const c = WAYS[i + 1]
  const d = WAYS[Math.min(WAYS.length - 1, i + 2)]
  return [b, [b[0] + (c[0] - a[0]) / 6, b[1] + (c[1] - a[1]) / 6], [c[0] - (d[0] - b[0]) / 6, c[1] - (d[1] - b[1]) / 6], c]
})
const ROUTE = `M${WAYS[0][0]} ${WAYS[0][1]}` + SEGS.map(([, c1, c2, e]) => `C${c1[0]} ${c1[1]} ${c2[0]} ${c2[1]} ${e[0]} ${e[1]}`).join('')

// sampled densely and measured as it lands on screen, the way the trail's trim measures it, so arrow and trail stay together
const cubic = ([p0, p1, p2, p3]: readonly [Vec, Vec, Vec, Vec], t: number): Vec => {
  const u = 1 - t
  const b = (i: 0 | 1) => u * u * u * p0[i] + 3 * u * u * t * p1[i] + 3 * u * t * t * p2[i] + t * t * t * p3[i]
  return [b(0), b(1)]
}
const SAMPLES: ReadonlyArray<Vec> = SEGS.flatMap((s, i) => Array.from({ length: i ? 40 : 41 }, (_, j) => cubic(s, (i ? j + 1 : j) / 40)))
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

// the arrow's pose sampled every other frame on one easy ease, its heading unwrapped so it never spins the long way round
const EASED = bezier(...EASY)
const STEPS = Array.from({ length: (ARRIVE - DEPART) / 2 + 1 }, (_, i) => DEPART + i * 2)
const POSES = STEPS.map((f) => along(EASED((f - DEPART) / (ARRIVE - DEPART))))
const HEADING = POSES.reduce<Array<number>>((acc, { turn }, i) => {
  if (!i) return [turn]
  let t = turn
  while (t - acc[i - 1] > 180) t -= 360
  while (t - acc[i - 1] < -180) t += 360
  return [...acc, t]
}, [])
const ARROW_P: Track<Vec> = STEPS.map((f, i): Key<Vec> => [f, POSES[i].p])
const ARROW_R: Track<number> = STEPS.map((f, i): Key<number> => [f, HEADING[i]])
const TRAIL: Track<number> = [[DEPART, 0, EASY], [ARRIVE, 1], [RETRACT, 1, SNAP], [RETRACT + 28, 0]]

const LOW: Vec = [0, 36] // how far down the pole the flag waits
const CLOTH: Track<Vec> = [[0, LOW], ...spring([0, 0], RAISE, 0.6, LOW), [RETRACT + 4, [0, 0], IN], [RETRACT + 28, LOW]]

const routeNavigation: Icon = {
  name: 'route-navigation',
  frames: 210,
  still: 150,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [236, 290], s: [88, 88], shapes: [] },
    // the folded map: three panels, the middle one a shade apart, with a lake and two blocks raised off it
    {
      id: 'map',
      parent: 'root',
      tilt: FACE,
      shapes: [
        { d: rect(-160, -116, 320, 232, 10), fill: 'white', depth: 1 },
        { d: rect(-54, -116, 108, 232), fill: 'paper', line: false },
        { d: line([-54, -116], [-54, 116]), line: 3 },
        { d: line([54, -116], [54, 116]), line: 3 },
        { d: rect(-140, -98, 62, 70, 26), fill: 'tint', line: 4, depth: 0.15 },
        { d: rect(66, 20, 70, 40, 6), fill: 'grey', line: 4, depth: 0.3 },
        { d: rect(-26, 70, 46, 30, 6), fill: 'grey', line: 4, depth: 0.3 },
      ],
    },
    // the planned route, then the trail the arrow leaves on it
    { parent: 'map', shapes: [0.08, 0.2, 0.32, 0.44, 0.56, 0.68, 0.8, 0.92].map((t): Shape => ({ d: ellipse(...along(t).p, 5), fill: 'ink', line: false })) },
    { parent: 'map', shapes: [{ d: ROUTE, line: 10, round: true, trim: TRAIL }] },
    { parent: 'map', shapes: [{ d: ellipse(WAYS[0][0], WAYS[0][1], 13), fill: 'white', depth: 0.3 }, { d: ellipse(FLAG[0], FLAG[1], 16, 16), fill: 'grey', depth: 0.4 }] },
    // the arrow, flat on the map, turning with the road
    {
      parent: 'map',
      p: ARROW_P,
      r: ARROW_R,
      s: popScale(APPEAR, LEAVE),
      shapes: [{ d: poly([[0, -30], [24, 24], [0, 12], [-24, 24]], [3, 3, 3, 3]), fill: 'main', depth: 0.6 }],
    },
    // the flag stands up off the map at its foot, takes the hit, and the cloth springs up the pole
    { id: 'flag', parent: 'root', p: FOOT, m: hit(ARRIVE, [3, 5]), shapes: [{ d: rect(-4, -150, 8, 150, 3), fill: 'white', depth: 0.4 }] },
    {
      parent: 'flag',
      p: CLOTH,
      shapes: [{ d: poly([[4, -136], [70, -136], [54, -117], [70, -98], [4, -98]], [2, 2, 0, 2, 2]), fill: 'hot', depth: 0.5 }],
    },
    { parent: 'flag', shapes: [{ d: ellipse(0, -154, 9), fill: 'gold', depth: 0.4 }] },
    wave('root', FOOT, 52, ARRIVE, -64, -24),
    glow('root', SPARK, 22, popIn(RAISE + 6, LEAVE - 8)),
  ],
}

export default routeNavigation
