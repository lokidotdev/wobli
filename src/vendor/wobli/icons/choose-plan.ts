// Choose Plan
import { line, pill, rect, star } from '../engine.ts'
import { twinkle } from '../motions.ts'
import { EXT, FACE, LINE, check, glow, outAndBack, popIn } from '../parts.ts'
import type { Icon, Layer, Shape, Swatch, Vec } from '../engine.ts'

// Three pricing cards stand side by side. The middle plan lifts up out of the row and grows a touch, its neighbours settle back
// a beat later, and a gold star pops onto its corner as it arrives with a sparkle on the beat. After the hold the star goes
// first, then the card sinks home along the way it rose, so the row is level again at the seam.
const LIFT = 14 // the middle card starts to rise
const LIFT_LEN = 26
const LAG = 5 // the side cards follow this much later
const DROP = 122 // the middle card starts home
const STAR_IN = LIFT + LIFT_LEN - 6
const STAR_OUT = DROP - 14

const SIDE = { w: 88, h: 188 }
const MID = { w: 104, h: 220 }
const GAP = 130 // centre to centre along the face
const BADGE: Vec = [MID.w / 2 - 6, -MID.h / 2 + 8] // the star sits on the middle card's top right corner

type Plan = { x: number; w: number; h: number; body: Swatch; button: Swatch; feats: number }

// one card: body slab, a raised tag, the price as one bold bar, ticked feature lines, and a button slab
const card = ({ x, w, h, body, button, feats }: Plan): ReadonlyArray<Shape> => {
  const [l, r, t] = [x - w / 2, x + w / 2, -h / 2]
  return [
    { d: rect(l, t, w, h, 16), fill: body, depth: 1 },
    { d: pill(l + 16, t + 18, w * 0.5, 18), fill: 'white', depth: 0.3 },
    { d: line([l + 18, t + 62], [r - 30, t + 62]), line: 12 },
    ...Array.from({ length: feats }, (_, i): ReadonlyArray<Shape> => {
      const y = t + 96 + i * 24
      return [
        { d: check([l + 24, y], 16), line: 4 },
        { d: line([l + 40, y], [r - (i % 2 ? 26 : 16), y]), line: 4 },
      ]
    }).flat(),
    { d: pill(l + 14, h / 2 - 42, w - 28, 26), fill: button, depth: 0.4 },
  ]
}

const PLANS = {
  left: { x: -GAP, ...SIDE, body: 'white', button: 'grey', feats: 2 },
  mid: { x: 0, ...MID, body: 'main', button: 'white', feats: 3 },
  right: { x: GAP, ...SIDE, body: 'white', button: 'grey', feats: 2 },
} as const satisfies Record<string, Plan>

// a side card leans back a little as the middle one rises, and comes home after it
const side = (p: Plan, k: number): Layer => ({
  parent: 'root',
  tilt: FACE,
  a: [p.x, 0],
  p: [p.x, 0],
  m: { p: outAndBack<Vec>([0, 0], [0, 6], LIFT + LAG, LIFT_LEN, DROP + LAG), s: outAndBack<Vec>([100, 100], [100 - k, 100 - k], LIFT + LAG, LIFT_LEN, DROP + LAG) },
  shapes: card(p),
})

const choosePlan: Icon = {
  name: 'choose-plan',
  frames: 180,
  still: 92,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [252, 272], shapes: [] },
    side(PLANS.left, 4),
    side(PLANS.right, 4),
    {
      id: 'mid',
      parent: 'root',
      tilt: FACE,
      a: [0, 0],
      p: [0, 0],
      m: { p: outAndBack<Vec>([0, 0], [0, -36], LIFT, LIFT_LEN, DROP), s: outAndBack<Vec>([100, 100], [108, 108], LIFT, LIFT_LEN, DROP) },
      shapes: card(PLANS.mid),
    },
    {
      // the badge grows out of the card's top edge on the frame it arrives
      parent: 'mid',
      a: BADGE,
      p: BADGE,
      m: [twinkle(STAR_IN), twinkle(STAR_OUT, true)],
      shapes: [{ d: star(BADGE[0], BADGE[1], 26, 0.5, 5, 3), fill: 'gold', depth: 0.5 }],
    },
    glow('root', [118, -150], 22, popIn(STAR_IN + 4, STAR_OUT - 6)),
    glow('root', [-104, -128], 15, popIn(STAR_IN + 10, STAR_OUT)),
  ],
}

export default choosePlan
