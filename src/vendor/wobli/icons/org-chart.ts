// Org Chart
import { ellipse, rect } from '../engine.ts'
import { EXT, FACE, LINE, glow, hit, outAndBack, popIn } from '../parts.ts'
import type { Icon, Layer, Shape, Vec } from '../engine.ts'

// The lead's node sits alone at the top of the board and takes a nudge as the tree starts. Lines branch out of it to two
// managers, each popping in as its line arrives, then out of each manager to two reports, staggered left to right, and a
// sparkle lands as the last one pops in. After the hold the tree folds home last out, first in: each report shrinks and its
// line draws back into its manager, then the managers do the same into the lead.
const TOP: Vec = [0, -108]
const MID: ReadonlyArray<Vec> = [[-84, -4], [84, -4]]
const LOW: ReadonlyArray<Vec> = [[-126, 100], [-42, 100], [42, 100], [126, 100]]
const HALF = 26 // half a node tile
const LEAD_HALF = 34 // the lead's tile is a size up

const START = 8 // the lead is nudged, its lines start
const LEN = 18 // a line's draw
const POP = LEN - 6 // a node pops in just before its line touches it
const LOW_START = START + LEN + 4 // the reports' lines start
const GAP = 4 // reports stagger left to right
const DONE = LOW_START + GAP * 3 + POP // the last report lands
const FOLD = 112 // the reports start shrinking, last first
const LINE_BACK = 10 // a line draws back this long after its node starts shrinking
const MID_FOLD = FOLD + GAP * 3 + 12 // then the managers

// down out of the parent, across, down into the child
const elbow = (from: Vec, to: Vec, half: number): string => {
  const bend = from[1] + half + 18
  return `M${from[0]} ${from[1] + half}L${from[0]} ${bend}L${to[0]} ${bend}L${to[0]} ${to[1] - HALF}`
}

// an avatar node: a raised tile with a head and shoulders on it
const node = ([x, y]: Vec, fill: Shape['fill'], h = HALF): ReadonlyArray<Shape> => {
  const k = h / HALF
  return [
    { d: rect(x - h, y - h, h * 2, h * 2, 16 * k), fill, depth: 0.6 },
    { d: ellipse(x, y - 8 * k, 11 * k), fill: 'white', depth: 0.3 },
    { d: `M${x - 18 * k} ${y + h - 6 * k}A${18 * k} ${15 * k} 0 0 1 ${x + 18 * k} ${y + h - 6 * k}Z`, fill: 'white', depth: 0.3 },
  ]
}

const link = (from: Vec, to: Vec, half: number, out: number, back: number): Layer => ({
  parent: 'board',
  shapes: [{ d: elbow(from, to, half), line: 7, round: true, trim: outAndBack(0, 1, out, LEN, back, LEN) }],
})

const member = (c: Vec, fill: Shape['fill'], a: number, b: number): Layer => ({ parent: 'board', a: c, p: c, m: popIn(a, b), shapes: node(c, fill) })

const lowOut = (i: number) => LOW_START + GAP * i
const lowFold = (i: number) => FOLD + GAP * (3 - i)

const orgChart: Icon = {
  name: 'org-chart',
  frames: 180,
  still: 96,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [254, 262], shapes: [] },
    { id: 'board', parent: 'root', tilt: FACE, shapes: [{ d: rect(-168, -162, 336, 316, 28), fill: 'white', depth: 1 }] },
    ...MID.map((c) => link(TOP, c, LEAD_HALF, START, MID_FOLD + LINE_BACK)),
    ...LOW.map((c, i) => link(MID[i >> 1], c, HALF, lowOut(i), lowFold(i) + LINE_BACK)),
    ...MID.map((c) => member(c, 'main', START + POP, MID_FOLD)),
    ...LOW.map((c, i) => member(c, 'tint', lowOut(i) + POP, lowFold(i))),
    { parent: 'board', m: hit(START, [0, 6], 0.7), shapes: node(TOP, 'deep', LEAD_HALF) },
    glow('root', [176, -150], 22, popIn(DONE, FOLD - 8)),
    glow('root', [-190, 30], 16, popIn(DONE + 6, FOLD - 4)),
  ],
}

export default orgChart
