// Loading Spinner Cube
import { at, ellipse, poly, view } from '../engine.ts'
import { SNAP } from '../motions.ts'
import { EXT, glow, hit, LINE, outAndBack, popIn } from '../parts.ts'
import type { Icon, Layer, Shape, Track, Vec } from '../engine.ts'

// The cube lifts off its pedestal and turns a quarter on its axis, the next face coming round as the last one leaves; it
// drops home and the pedestal takes the landing with the spring. After a short hold it does it again, and two quarter turns
// bring the same colours back to the front, so the loop closes on the pose it opened with. A sparkle pops on each landing.
const TURN = 90 // one beat per quarter turn
const LIFT = 4 // the cube leaves the pedestal
const SPIN = 10 // and turns once it is clear
const SPIN_LEN = 40
const LAND = 54 // home again: the pedestal takes the hit on this frame
const RISE: Vec = [0, -34]

// the turn and the hop for one beat, laid twice
const beat = (b: number) => b * TURN
const YAW: Track<number> = [0, 1].flatMap((b): Track<number> => [[beat(b) + SPIN, b * 90, SNAP], [beat(b) + SPIN + SPIN_LEN, b * 90 + 90]])
const HOP: Track<Vec> = [0, 1].flatMap((b) => outAndBack<Vec>([0, 0], RISE, beat(b) + LIFT, 22, beat(b) + LAND - 22, 22))

// the cube is modelled in 3d, x forward, y right, z up, sitting on the pedestal's top at the origin
const S = 72 // half a side
const H = 2 * S
type P3 = readonly [number, number, number]
const BASE = 28 // the house yaw, so the rest pose faces top right like every other sticker
const cam = (yaw: number) => view(BASE + yaw, 30)
const turn = (yaw: number, [x, y, z]: P3): Vec => cam(yaw)([x, y, z])
const face = (yaw: number, pts: ReadonlyArray<P3>, r = 6) => poly(pts.map((p) => turn(yaw, p)), r)

// side k runs from corner k to corner k + 1, counter clockwise seen from above
const CORNER: ReadonlyArray<readonly [number, number]> = [[S, -S], [S, S], [-S, S], [-S, -S]]
const sidePts = (k: number, inset = 0): ReadonlyArray<P3> => {
  const [[ax, ay], [bx, by]] = [CORNER[k], CORNER[(k + 1) % 4]]
  // pull the corners in along the edge and up off the ground for a raised panel on the face
  const [ux, uy] = [(bx - ax) / (2 * S), (by - ay) / (2 * S)]
  const [nx, ny] = [(ax + bx) / (2 * S), (ay + by) / (2 * S)]
  const lift = inset ? 1.5 : 0
  return [
    [ax + ux * inset + nx * lift, ay + uy * inset + ny * lift, inset],
    [bx - ux * inset + nx * lift, by - uy * inset + ny * lift, inset],
    [bx - ux * inset + nx * lift, by - uy * inset + ny * lift, H - inset],
    [ax + ux * inset + nx * lift, ay + uy * inset + ny * lift, H - inset],
  ]
}
// which way a side faces once turned: its outward normal against the camera's line of sight, positive when seen
const facing = (k: number, yaw: number) => {
  const [[ax, ay], [bx, by]] = [CORNER[k], CORNER[(k + 1) % 4]]
  const a = ((BASE + yaw) * Math.PI) / 180
  const [nx, ny] = [(ax + bx) / 2, (ay + by) / 2]
  // view() puts depth along x sin + y cos; the viewer sits at negative depth
  return -(nx * Math.sin(a) + ny * Math.cos(a))
}

// a path rebuilt every other frame from the eased yaw, so the cube turns on its axis instead of morphing straight across
const FRAMES = 180
const bake = (shape: (yaw: number) => string): Track<string> =>
  Array.from({ length: FRAMES / 2 + 1 }, (_, i) => [i * 2, shape(at(YAW, i * 2))] as const)

// the first and last frame a side shows; sides only come round, so each is seen over one stretch of the loop
const shown = (k: number) => {
  const seen = Array.from({ length: FRAMES + 1 }, (_, f) => facing(k, at(YAW, f)) > 0.5)
  const first = seen.indexOf(true)
  if (first < 0) return null
  const last = seen.lastIndexOf(true)
  return { ip: first, op: last + 1 }
}

const SIDE_FILL: ReadonlyArray<Shape['fill']> = ['main', 'deep', 'main', 'deep']
const side = (k: number): Layer | null => {
  const span = shown(k)
  if (!span) return null
  return {
    parent: 'cube',
    ...(span.ip > 0 ? { ip: span.ip } : {}),
    ...(span.op <= FRAMES ? { op: span.op } : {}),
    shapes: [
      { d: bake((yaw) => face(yaw, sidePts(k))), fill: SIDE_FILL[k] },
      { d: bake((yaw) => face(yaw, sidePts(k, 24), 10)), fill: SIDE_FILL[(k + 1) % 4], line: 4 },
    ],
  }
}

const TOP: ReadonlyArray<P3> = CORNER.map(([x, y]): P3 => [x, y, H])
const TOP_INSET: ReadonlyArray<P3> = CORNER.map(([x, y]): P3 => [x * 0.42, y * 0.42, H + 1])

const SPARKS: ReadonlyArray<Vec> = [[-136, -214], [128, -170]]

const loadingCube: Icon = {
  name: 'loading-cube',
  frames: FRAMES,
  still: 70,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [250, 312], shapes: [] },
    {
      id: 'ped',
      parent: 'root',
      m: [0, 1].map((b) => hit(beat(b) + LAND, [0, 7], 0.6)),
      shapes: [
        { d: ellipse(0, 28, 146, 52), fill: 'grey', depth: 1 },
        { d: ellipse(0, 8, 120, 42), fill: 'white', depth: 0.8 },
      ],
    },
    { id: 'cube', parent: 'ped', p: [0, 8], m: { p: HOP }, shapes: [] },
    ...[0, 1, 2, 3].map(side).filter((l): l is Layer => l !== null),
    {
      parent: 'cube',
      shapes: [
        { d: bake((yaw) => face(yaw, TOP)), fill: 'white' },
        { d: bake((yaw) => face(yaw, TOP_INSET, 6)), fill: 'gold', line: 4 },
      ],
    },
    ...SPARKS.map((p, i) => glow('root', p, i ? 18 : 24, popIn(beat(i) + LAND, beat(i) + LAND + 30))),
  ],
}

export default loadingCube
