// Food Order
import { at, line, poly, rect } from '../engine.ts'
import { IN, SOFT } from '../motions.ts'
import { EXT, FACE, LINE, checkBadge, glow, hit, outAndBack, popIn } from '../parts.ts'
import type { Icon, Shape, Track, Vec } from '../engine.ts'

// A burger box hangs tilted above an open paper bag, then drops into its mouth, straightening as it falls. The bag takes the
// hit on the frame the box lands, then its top folds over toward us and a check sticker seals the fold with a sparkle. After a
// still hold the sticker pops away, the top unfolds and the box lifts back out along the path it fell in on.
const DROP = 14 // the box lets go
const FALL = 22
const LAND = DROP + FALL // the box is in the bag
const FOLD = LAND + 8 // the top folds over
const FOLD_LEN = 18
const SEALED = FOLD + FOLD_LEN
const SEAL_IN = SEALED + 2 // the sticker presses onto the fold
const SEAL_OUT = 118
const UNFOLD = 124
const BACK = UNFOLD + FOLD_LEN + 4 // the box lifts back out once the top is open
const RISE = 30

const BAG = { x: -108, w: 216, bottom: 176 }
const HINGE = -56 // where the top folds
const FLAP = 78 // how far the top stands above the fold
const TEETH = 8 // the torn paper edge along the top
const LIP = 30 // the back wall stands this much higher than the front, showing the bag's mouth
const BOX = { w: 144, h: 86 }
const REST: Vec = [0, 4] // inside the bag, below the fold
const ABOVE: Vec = [34, -268]
const TURN = -12
const KNOCK: Vec = [0, 12]
const BADGE: Vec = [0, 16] // across the folded top's torn edge, holding it down

// the fold, 0 standing open to 1 folded flat over the front; the path is rebuilt every other frame so the top swings on its hinge
const FOLDING: Track<number> = outAndBack(0, 1, FOLD, FOLD_LEN, UNFOLD)
const bake = (shape: (v: number) => string): Track<string> => Array.from({ length: 91 }, (_, i) => [i * 2, shape(at(FOLDING, i * 2))] as const)
const lean = (v: number) => Math.cos(v * Math.PI)
// never a zero height, so the outline keeps its corners
const span = (h: number) => (Math.abs(h) < 3 ? (h < 0 ? -3 : 3) : h)

// the top, hinged on the fold, its far edge cut in a zigzag that always points away from the hinge
const FLAP_D = (v: number) => {
  const h = span(-FLAP * lean(v))
  const tooth = Math.sign(h) * TEETH * Math.min(1, Math.abs(h) / 20)
  const far = HINGE + h
  const n = 8
  const edge: Array<Vec> = Array.from({ length: n * 2 - 1 }, (_, i) => [BAG.x + BAG.w - (i * BAG.w) / (n * 2 - 2), far + (i % 2 ? tooth : 0)])
  return poly([[BAG.x, HINGE], [BAG.x + BAG.w, HINGE], ...edge], 0)
}
// the frames the top passes upright, where its inside starts and stops showing
const upright = (from: number, to: number) => Array.from({ length: to - from }, (_, i) => from + i).find((f) => at(FOLDING, f) >= 0.5 !== at(FOLDING, from) >= 0.5) ?? from
const backTop = (v: number) => HINGE + span(-(FLAP + LIP) * Math.max(lean(v), 0))
const BACK_D = (v: number) => rect(BAG.x + 6, backTop(v), BAG.w - 12, BAG.bottom - backTop(v) - 20, 8)
const MOUTH_D = (v: number) => {
  const top = Math.min(backTop(v) + 12, HINGE + 10)
  return rect(BAG.x + 18, top, BAG.w - 36, HINGE + 30 - top, 4)
}

// a clamshell burger box centred on 0 0: base, lid seam and a tab
const box = (): ReadonlyArray<Shape> => {
  const [x, y] = [-BOX.w / 2, -BOX.h / 2]
  return [
    { d: rect(x, y, BOX.w, BOX.h, 16), fill: 'white', depth: 0.8 },
    { d: line([x, y + 50], [x + BOX.w, y + 50]) },
    { d: rect(-18, y + 40, 36, 22, 5), fill: 'deep', depth: 0.3 },
  ]
}

const foodOrder: Icon = {
  name: 'food-order',
  frames: 180,
  still: 100,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [254, 252], shapes: [] },
    // the bag takes the hit as the box lands, and a smaller one as the top seals
    { id: 'bag', parent: 'root', tilt: FACE, s: [86, 86], m: [hit(LAND, KNOCK, 0.7), hit(SEALED, [0, 6], 0.7)], shapes: [] },
    // the back wall and the dark mouth, folding down with the top
    { parent: 'bag', shapes: [{ d: bake(BACK_D), fill: 'main', depth: 1 }, { d: bake(MOUTH_D), fill: 'deep' }] },
    // the box: falls in on the slamming ease, straightening, and lifts back out on its mirror
    {
      parent: 'bag',
      m: {
        p: [[0, ABOVE], [DROP, ABOVE, IN], [LAND, REST, 0], [BACK, REST, SOFT], [BACK + RISE, ABOVE]],
        r: [[0, TURN], [DROP, TURN, IN], [LAND, 0, 0], [BACK, 0, SOFT], [BACK + RISE, TURN]],
      },
      shapes: box(),
    },
    // the front panel below the fold and its label
    {
      parent: 'bag',
      shapes: [
        { d: rect(BAG.x, HINGE - 4, BAG.w, BAG.bottom - HINGE + 4, 10), fill: 'main', depth: 1 },
        { d: rect(-56, 64, 112, 64, 10), fill: 'white', depth: 0.3 },
        { d: line([-36, 86], [36, 86]), line: 4 },
        { d: line([-36, 106], [12, 106]), line: 4 },
      ],
    },
    // the top: stands open above the fold, then swings over toward us and lies flat on the front
    { parent: 'bag', shapes: [{ d: bake(FLAP_D), fill: 'main', depth: 0.5 }] },
    // once past upright the top shows its paler inside
    { parent: 'bag', ip: upright(FOLD, SEALED + 1), op: upright(UNFOLD, UNFOLD + FOLD_LEN + 1), shapes: [{ d: bake(FLAP_D), fill: 'tint', depth: 0.5 }] },
    { parent: 'bag', a: BADGE, p: BADGE, m: popIn(SEAL_IN, SEAL_OUT), shapes: checkBadge(BADGE, 28) },
    glow('root', [-150, -150], 22, popIn(SEAL_IN + 4, SEAL_OUT - 6)),
    glow('root', [158, -60], 16, popIn(SEAL_IN + 9, SEAL_OUT - 2)),
  ],
}

export default foodOrder
