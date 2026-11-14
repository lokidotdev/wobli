// Database Sync
import { ellipse, line, rect } from '../engine.ts'
import { EXT, FACE, LINE, checkBadge, glow, hit, outAndBack, popIn, popScale } from '../parts.ts'
import type { Icon, Layer, Shape, Vec } from '../engine.ts'

// A row slides out of the bottom tier and climbs the right side to the top, while a row from the top tier, a few frames
// behind, drops down the left side to the bottom. Each tier takes the row on the frame it arrives and a check pops over the
// stack. After a long hold both rows travel home on the paths they came by and tuck back into the tiers that made them.
const TIERS: ReadonlyArray<number> = [-84, -24, 36] // centre of each tier's cap, top to bottom
const RX = 92
const RY = 34
const TALL = 2.2 // each tier's thickness, in extrusions
const UP_FROM: Vec = [112, 70]
const UP_TO: Vec = [112, -50]
const DOWN_FROM: Vec = [-112, -50]
const DOWN_TO: Vec = [-112, 70]
const LEAVE = 10 // the up row leaves
const LAG = 6 // the down row follows
const TRIP = 46
const ARRIVE = LEAVE + TRIP
const RETURN = 118
const HOME = RETURN + TRIP
const BADGE: Vec = [0, -150]

// one tier: a thick disc, a rim on its cap, a light on its band
const tier = (y: number, top: boolean): ReadonlyArray<Shape> => [
  { d: ellipse(0, y, RX, RY), fill: 'main', depth: TALL },
  ...(top ? [{ d: ellipse(0, y, RX * 0.62, RY * 0.62) } as Shape] : []),
  { d: rect(-34, y + 50, 40, 11, 5.5), fill: 'white', depth: 0.3 },
]

// a row record: a slab card, a coloured key, a field line and an arrow saying which way it goes
const row = (dir: 1 | -1): ReadonlyArray<Shape> => [
  { d: rect(-46, -20, 92, 40, 10), fill: 'white', depth: 0.6 },
  { d: rect(-34, -9, 18, 18, 4), fill: 'main' },
  { d: line([-6, 0], [14, 0]) },
  { d: line([24, 6 * dir], [32, -6 * dir], [40, 6 * dir]), round: true },
]

const rowLayer = (from: Vec, to: Vec, at: number, dir: 1 | -1): Layer => ({
  parent: 'root',
  tilt: FACE,
  p: outAndBack(from, to, at, TRIP, RETURN + at - LEAVE),
  s: popScale(at - 4, HOME + at - LEAVE - 22),
  shapes: row(dir),
})

const databaseSync: Icon = {
  name: 'database-sync',
  frames: 180,
  still: 100,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [250, 262], shapes: [] },
    { parent: 'root', m: hit(ARRIVE + LAG, [-2, 7], 0.7), shapes: tier(TIERS[2], false) },
    { parent: 'root', m: hit(ARRIVE + 3, [0, -3], 0.7), shapes: tier(TIERS[1], false) },
    { parent: 'root', m: hit(ARRIVE, [2, -7], 0.7), shapes: tier(TIERS[0], true) },
    rowLayer(UP_FROM, UP_TO, LEAVE, 1),
    rowLayer(DOWN_FROM, DOWN_TO, LEAVE + LAG, -1),
    { parent: 'root', a: BADGE, p: BADGE, m: popIn(ARRIVE + LAG + 2, RETURN - 16), shapes: checkBadge(BADGE, 24) },
    glow('root', [-150, -128], 20, popIn(ARRIVE + 4, RETURN - 10)),
  ],
}

export default databaseSync
