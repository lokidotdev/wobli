// Integrations Hub
import { ellipse, line, poly, rect } from '../engine.ts'
import { EXT, FACE, LINE, glow, outAndBack, popIn } from '../parts.ts'
import type { Icon, Layer, Shape, Vec } from '../engine.ts'

// Four app tiles ride an orbit around the hub and swing a quarter turn into place. As the orbit settles, a link draws out
// from the hub to each tile in turn and the tile gives as it is reached; the hub lifts on the frame the last one connects.
// After a long hold the links pull back into the hub, last in first out, and the orbit turns home the way it came.
const ORBIT = 150 // tile centres from the hub, on the face
const HUB = 116 // hub tile size
const TILE = 70 // app tile size
const TURN = 6 // the orbit starts its quarter turn
const TURN_LEN = 44
const LINK = 34 // first link starts
const LINK_GAP = 6
const LINK_LEN = 16
const UNLINK = 124 // the last link starts home
const UNTURN = 140
const UNTURN_LEN = 36
const LAST = LINK + 3 * LINK_GAP + LINK_LEN // the last tile connects

const ORBIT_TURN = outAndBack(0, 90, TURN, TURN_LEN, UNTURN, UNTURN_LEN)
const COUNTER = outAndBack(0, -90, TURN, TURN_LEN, UNTURN, UNTURN_LEN)

// the glyph on each tile: generic shapes, no real app marks
const glyph = (i: number, ink: Shape['fill']): ReadonlyArray<Shape> =>
  [
    [{ d: ellipse(0, -2, 15), fill: ink, depth: 0.3 }],
    [{ d: poly([[0, -19], [18, 13], [-18, 13]], 3), fill: ink, depth: 0.3 }],
    [{ d: poly([[0, -19], [19, 0], [0, 19], [-19, 0]], 3), fill: ink, depth: 0.3 }],
    [{ d: rect(-16, -14, 32, 9, 3), fill: ink, depth: 0.3 }, { d: rect(-16, 4, 22, 9, 3), fill: ink, depth: 0.3 }],
  ][i] as ReadonlyArray<Shape>

const ANGLES = [-90, 0, 90, 180]
const FILLS: ReadonlyArray<[Shape['fill'], Shape['fill']]> = [['deep', 'white'], ['white', 'main'], ['deep', 'white'], ['white', 'deep']]
const at = (deg: number, r: number): Vec => [Math.cos((deg * Math.PI) / 180) * r, Math.sin((deg * Math.PI) / 180) * r]

const link = (deg: number, i: number): Layer => ({
  parent: 'orbit',
  shapes: [{ d: line(at(deg, HUB / 2 + 6), at(deg, ORBIT - TILE / 2 - 6)), line: 7, round: true, trim: outAndBack(0, 1, LINK + i * LINK_GAP, LINK_LEN, UNLINK - i * LINK_GAP, 14) }],
})

// the tile counter-turns so its glyph stays upright on the face, and gives a little outward as its link arrives
const tile = (deg: number, i: number): Layer => {
  const reach = LINK + i * LINK_GAP + LINK_LEN
  const [dx, dy] = at(deg, 7)
  return {
    parent: 'orbit',
    p: at(deg, ORBIT),
    r: COUNTER,
    m: { p: outAndBack<Vec>([0, 0], [dx, dy], reach - 2, 5, reach + 5, 12) },
    shapes: [{ d: rect(-TILE / 2, -TILE / 2, TILE, TILE, 18), fill: FILLS[i][0], depth: 0.8 }, ...glyph(i, FILLS[i][1])],
  }
}

const integrationsHub: Icon = {
  name: 'integrations-hub',
  frames: 180,
  still: 96,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [250, 258], shapes: [] },
    { id: 'face', parent: 'root', tilt: FACE, shapes: [{ d: ellipse(0, 0, ORBIT), line: 4 }] },
    { id: 'orbit', parent: 'face', r: ORBIT_TURN, shapes: [] },
    ...ANGLES.map(link),
    {
      parent: 'root',
      tilt: FACE,
      m: { p: outAndBack<Vec>([0, 0], [0, -9], LAST - 2, 6, LAST + 8, 16) },
      shapes: [
        { d: rect(-HUB / 2, -HUB / 2, HUB, HUB, 30), fill: 'main', depth: 1 },
        ...[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sy]): Shape => ({ d: rect(sx * 21 - 15, sy * 21 - 15, 30, 30, 9), fill: 'white', depth: 0.35 })),
      ],
    },
    ...ANGLES.map(tile),
    glow('root', [150, -150], 22, popIn(LAST + 2, UNLINK - 20)),
  ],
}

export default integrationsHub
