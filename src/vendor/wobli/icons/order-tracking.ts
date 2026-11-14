// Order Tracking
import { ellipse, line, pill, poly, rect } from '../engine.ts'
import { SNAP } from '../motions.ts'
import { buzz, checkBadge, EXT, FACE, facePoint, glow, LINE, mapPin, PHONE_SCREEN, phoneBody, popIn, popScale, wave } from '../parts.ts'
import type { Icon, Shape, Track, Vec } from '../engine.ts'

// The van pops onto the map at the depot and drives the dotted route to the pin, drawing its trail behind it. It arrives, the
// phone buzzes and the pin's head turns into a check. After a long hold the check and the van pop away at the pin and the trail
// draws back along the road to the depot, where the van comes from next time.
const DEPOT: Vec = [-34, 106] // where the van starts, on the screen's face
const DOOR: Vec = [-2, -22] // where it stops, just short of the pin
const BEND: readonly [Vec, Vec] = [[96, -6], [-84, 34]] // the route's tangents out of the depot and into the door
const PIN: Vec = [44, -28] // the pin's tip
const PIN_K = 0.36
const HEAD: Vec = [PIN[0], PIN[1] - 160 * PIN_K]

const APPEAR = 4
const DEPART = 30
const ARRIVE = 96
const LEAVE = 138
const RETRACT = 146

// the route as a cubic, so the dots, the trail and the van all ride the same road
const C1: Vec = [DEPOT[0] + BEND[0][0], DEPOT[1] + BEND[0][1]]
const C2: Vec = [DOOR[0] + BEND[1][0], DOOR[1] + BEND[1][1]]
const ROUTE = `M${DEPOT[0]} ${DEPOT[1]}C${C1[0]} ${C1[1]} ${C2[0]} ${C2[1]} ${DOOR[0]} ${DOOR[1]}`
const along = (t: number): Vec => {
  const u = 1 - t
  const b = (i: 0 | 1) => u * u * u * DEPOT[i] + 3 * u * u * t * C1[i] + 3 * u * t * t * C2[i] + t * t * t * DOOR[i]
  return [b(0), b(1)]
}
const TRAIL: Track<number> = [[DEPART, 0, SNAP], [ARRIVE, 1], [RETRACT, 1, SNAP], [RETRACT + 28, 0]]

const orderTracking: Icon = {
  name: 'order-tracking',
  frames: 180,
  still: 112,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [250, 258], s: [106, 106], m: buzz(ARRIVE, 3), shapes: [] },
    { parent: 'root', tilt: FACE, shapes: phoneBody(32, 'deep') },
    { id: 'screen', parent: 'root', tilt: FACE, shapes: [{ d: PHONE_SCREEN(22), fill: 'tint' }] },
    {
      parent: 'root',
      tilt: FACE,
      clip: 'screen',
      shapes: [
        { d: rect(-90, 40, 180, 22), fill: 'white', line: 4 },
        { d: rect(-90, -16, 180, 18), fill: 'white', line: 4 },
        { d: rect(4, -150, 20, 300), fill: 'white', line: 4 },
        { d: rect(-58, -112, 44, 52, 8), fill: 'ok', line: 4, depth: 0.25 },
        { d: rect(32, 76, 30, 44, 8), fill: 'grey', line: 4, depth: 0.25 },
      ],
    },
    // the planned route, then the trail the van leaves on it
    { parent: 'screen', shapes: [0.14, 0.26, 0.38, 0.5, 0.62, 0.74, 0.86].map((t): Shape => ({ d: ellipse(...along(t), 5.5), fill: 'ink', line: false })) },
    { parent: 'screen', shapes: [{ d: ROUTE, line: 10, round: true, trim: TRAIL }] },
    {
      parent: 'screen',
      shapes: [
        { d: mapPin(PIN[0], PIN[1], PIN_K), fill: 'hot', depth: 0.6 },
        { d: ellipse(HEAD[0], HEAD[1], 12), fill: 'white', line: 4 },
      ],
    },
    { parent: 'screen', a: HEAD, p: HEAD, m: popIn(ARRIVE, LEAVE), shapes: checkBadge(HEAD, 22, 0.4) },
    // the van, a flat map marker riding the route
    {
      parent: 'screen',
      p: [[DEPART, DEPOT, SNAP, BEND], [ARRIVE, DOOR]],
      s: popScale(APPEAR, LEAVE + 4),
      shapes: [
        { d: poly([[-36, -31], [10, -31], [10, -14], [24, -14], [36, 0], [36, 12], [-36, 12]], [7, 2, 2, 5, 2, 7, 7]), fill: 'white', depth: 0.5 },
        { d: rect(16, -10, 13, 11, 2), fill: 'deep', line: 3 },
        { d: line([-27, -10], [0, -10]), line: 4 },
        ...[-19, 22].map((x): Shape => ({ d: ellipse(x, 13, 8), fill: 'ink', line: false })),
      ],
    },
    { parent: 'root', tilt: FACE, shapes: [{ d: pill(-22, -128, 44, 12), fill: 'ink', line: false }] },
    wave('root', facePoint(...HEAD), 58, ARRIVE, -64, -24),
    glow('root', [112, -136], 22, popIn(ARRIVE + 4, LEAVE - 6)),
  ],
}

export default orderTracking
