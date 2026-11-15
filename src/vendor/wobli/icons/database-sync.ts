// Database Sync
import { ellipse, rect } from '../engine.ts'
import { SNAP } from '../motions.ts'
import { EXT, LINE, checkBadge, facePoint, glow, popIn } from '../parts.ts'
import type { Icon, Layer, Shape, Track, Vec } from '../engine.ts'

// Two databases stand side by side, each holding rows the other lacks: the left has its top and bottom rows lit, the right
// its middle one. A copy of each missing row slides across the gap into the matching empty slot, the middle one crossing the
// other way, until both stacks are lit the same; a check pops over each. After a long hold the copies slide back to the side
// they came from, last across first home, and the stores are different again.
const LEFT: Vec = facePoint(-104, 0)
const RIGHT: Vec = facePoint(104, 0)
const TIERS: ReadonlyArray<number> = [-62, -6, 50] // centre of each tier's cap, top to bottom
const RX = 62
const RY = 24
const TALL = 2.5 // each tier's thickness, in extrusions
const LEAVE = 12 // the first copy leaves
const STAGGER = 7
const TRIP = 36
const LANDED = LEAVE + 2 * STAGGER + TRIP // the last copy is in its slot
const RETURN = 116
const OUT = RETURN - 14 // the checks go before the copies leave

// which side holds each tier's row before the sync
const HAS: ReadonlyArray<'left' | 'right'> = ['left', 'right', 'left']

// the row light on a tier's band, in the cylinder's own space
const light = (y: number) => rect(-30, y + RY + 14, 44, 14, 7)

// one tier: a thick disc, a rim on the top cap, an empty slot on its band (lit if it holds the row)
const tier = (y: number, top: boolean, lit: boolean): ReadonlyArray<Shape> => [
  { d: ellipse(0, y, RX, RY), fill: 'main', depth: TALL },
  ...(top ? [{ d: ellipse(0, y, RX * 0.6, RY * 0.6) } as Shape] : []),
  { d: light(y), fill: lit ? 'deep' : 'white', depth: 0.3 },
]

const cylinder = (at: Vec, side: 'left' | 'right'): ReadonlyArray<Layer> =>
  [2, 1, 0].map((i) => ({ parent: 'root', p: at, shapes: tier(TIERS[i], i === 0, HAS[i] === side) }))

// a copy of a row: sits on its own light, slides across the gap into the other stack's slot, holds, slides home
const copy = (i: number, order: number): Layer => {
  const from = HAS[i] === 'left' ? LEFT : RIGHT
  const to = HAS[i] === 'left' ? RIGHT : LEFT
  const out = LEAVE + order * STAGGER
  const back = RETURN + (2 - order) * STAGGER
  const p: Track<Vec> = [[out, from, SNAP], [out + TRIP, to, 0], [back, to, SNAP], [back + TRIP, from]]
  return { parent: 'root', p, shapes: [{ d: light(TIERS[i]), fill: 'deep', depth: 0.3 }] }
}

const badge = (at: Vec, lag: number): Layer => {
  const c: Vec = [at[0], at[1] + TIERS[0] - 62]
  return { parent: 'root', a: c, p: c, m: popIn(LANDED + 2 + lag, OUT + lag), shapes: checkBadge(c, 22) }
}

const databaseSync: Icon = {
  name: 'database-sync',
  frames: 180,
  still: 100,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [254, 256], shapes: [] },
    ...cylinder(RIGHT, 'right'),
    ...cylinder(LEFT, 'left'),
    copy(0, 0),
    copy(1, 1),
    copy(2, 2),
    badge(RIGHT, 0),
    badge(LEFT, 5),
    glow('root', [-10, -150], 20, popIn(LANDED + 6, OUT + 8)),
  ],
}

export default databaseSync
