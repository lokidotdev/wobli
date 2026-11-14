// Pie Split
import { arc } from '../engine.ts'
import { spring, SOFT } from '../motions.ts'
import { EXT, FACE, facePoint, glow, LINE, outAndBack, popIn } from '../parts.ts'
import type { Icon, Layer, Shape, Vec } from '../engine.ts'

// The slices slide apart from the centre one after another; the big front one leaves last, goes furthest and rises on its
// own column. After a hold it goes home first and the rest follow, last out first home; the pie takes the hit as the final
// slice clicks in, then sits still.
const PIE_R = 114
const SPLIT = 4 // first slice leaves
const GAP = 5 // stagger between slices
const OUT_LEN = 28
const HOME = 84 // the front slice starts home
const HOME_LEN = 24
const RISE = 16 // px the front slice climbs, its column growing under it

// a closed wedge: centre, out along the rim clockwise, back to centre
const wedge = (from: number, to: number) => `M0 0${arc(0, 0, PIE_R, from, to).replace('M', 'L')}Z`

type Slice = { from: number; to: number; fill: Shape['fill']; out: number }
// back to front on screen; the front one is the hero
const BACK: ReadonlyArray<Slice> = [
  { from: 250, to: 330, fill: 'tint', out: 26 },
  { from: -30, to: 50, fill: 'white', out: 26 },
  { from: 150, to: 250, fill: 'deep', out: 26 },
]
const HERO: Slice = { from: 50, to: 150, fill: 'main', out: 44 }
const HERO_OUT = SPLIT + BACK.length * GAP + 4
const LAND = HOME + GAP * BACK.length + HOME_LEN // the last slice clicks in

// the radial move of a slice, as a canvas offset on the leaned face
const away = ({ from, to, out }: Slice): Vec => {
  const mid = (((from + to) / 2) * Math.PI) / 180
  return facePoint(Math.cos(mid) * out, Math.sin(mid) * out)
}
// the extrusion's unit vector: the hero climbs against it so its foot stays on the plane
const UP: Vec = [-EXT[0] / Math.hypot(...EXT), -EXT[1] / Math.hypot(...EXT)]

const slice = (s: Slice, out: number, back: number, rise = 0): Layer => {
  const [dx, dy] = away(s)
  const to: Vec = [dx + UP[0] * rise, dy + UP[1] * rise]
  return {
    parent: 'root',
    tilt: FACE,
    m: { p: outAndBack<Vec>([0, 0], to, out, OUT_LEN, back, HOME_LEN), ...(rise ? { x: outAndBack(0, rise, out, OUT_LEN, back, HOME_LEN) } : {}) },
    shapes: [{ d: wedge(s.from, s.to), fill: s.fill, depth: 1, edges: [[0, 0]] }],
  }
}

const pieSplit: Icon = {
  name: 'pie-split',
  frames: 180,
  still: 66,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [252, 238], m: { p: [...spring([1, 6], LAND, 0.35), [LAND + 34, [1, 6], SOFT], [LAND + 52, [0, 0]]] }, shapes: [] },
    // leave in order, come home in reverse: last out, first home
    ...BACK.map((s, i) => slice(s, SPLIT + i * GAP, HOME + (BACK.length - i) * GAP)),
    slice(HERO, HERO_OUT, HOME, RISE),
    glow('root', [116, -114], 18, popIn(HERO_OUT + OUT_LEN - 4, HOME - 6)),
  ],
}

export default pieSplit
