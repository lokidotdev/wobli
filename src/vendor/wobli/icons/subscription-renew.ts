// Subscription Renew
import { arc, ellipse, pill, poly, rect } from '../engine.ts'
import { SNAP } from '../motions.ts'
import { checkBadge, EXT, FACE, facePoint, glow, LINE, outAndBack, popIn } from '../parts.ts'
import type { Icon, Shape, Vec } from '../engine.ts'

// The renew arrows on the calendar's corner turn one full cycle; as they come round, the card slides out from behind the
// calendar and is charged, a sparkle on its corner, and the renewal day checks off. After a long hold the check pops
// away first, then the card slides back behind the calendar along the way it came.
const RENEW: Vec = [124, -116] // the renew disc's centre on the calendar face: the pivot the arrows turn on
const DAY: Vec = [84, 58] // the renewal day's cell on the calendar face
const CARD_OUT: Vec = [-128, 104] // how far the card slides out, along the face
const SPIN = 6
const OUT = 38 // the card starts out as the arrows come round
const LANDED = 66 // the card lands: the charge
const BACK = 132

// one curling arrow round the disc: an arc from `from` to `to` degrees with its head at `to`
const curl = ([cx, cy]: Vec, r: number, from: number, to: number): ReadonlyArray<Shape> => {
  const b = (to * Math.PI) / 180
  const tip: Vec = [cx + Math.cos(b) * r, cy + Math.sin(b) * r]
  const [tx, ty, nx, ny] = [-Math.sin(b), Math.cos(b), Math.cos(b), Math.sin(b)]
  return [
    { d: arc(cx, cy, r, from, to - 8), line: 9 },
    { d: poly([[tip[0] + tx * 18, tip[1] + ty * 18], [tip[0] - tx * 4 + nx * 16, tip[1] - ty * 4 + ny * 16], [tip[0] - tx * 4 - nx * 16, tip[1] - ty * 4 - ny * 16]], 2), fill: 'white', depth: 0.3 },
  ]
}

const subscriptionRenew: Icon = {
  name: 'subscription-renew',
  frames: 180,
  still: 104,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [266, 244], s: [86, 86], shapes: [] },
    {
      parent: 'root',
      tilt: FACE,
      m: { p: outAndBack<Vec>([0, 0], facePoint(...CARD_OUT), OUT, LANDED - OUT, BACK) },
      shapes: [
        { d: rect(-108, -30, 216, 134, 18), fill: 'main', depth: 0.45 },
        { d: rect(-108, 0, 216, 26), fill: 'deep' },
        { d: rect(-80, 46, 38, 28, 7), fill: 'gold', depth: 0.2 },
      ],
    },
    {
      id: 'cal',
      parent: 'root',
      tilt: FACE,
      shapes: [
        { d: rect(-146, -124, 292, 256, 30), fill: 'white', depth: 1 },
        { d: poly([[-146, -124], [146, -124], [146, -52], [-146, -52]], [30, 30, 0, 0]), fill: 'deep' },
        ...[-1, 1].map((s): Shape => ({ d: pill(s * 72 - 15, -152, 30, 58), fill: 'grey', depth: 0.5 })),
        ...[0, 1, 2, 3].flatMap((c) => [0, 1].map((r): Shape => ({ d: rect(-116 + c * 60, -24 + r * 62, 40, 40, 10) }))),
        { d: ellipse(RENEW[0], RENEW[1], 58), fill: 'gold', depth: 0.7 },
      ],
    },
    {
      parent: 'cal',
      a: RENEW,
      p: RENEW,
      m: { r: [[SPIN, 0, SNAP], [SPIN + 44, 360]] },
      shapes: [...curl(RENEW, 33, 200, 330), ...curl(RENEW, 33, 20, 150)],
    },
    { parent: 'cal', a: DAY, p: DAY, m: popIn(LANDED + 4, BACK - 12), shapes: checkBadge(DAY, 34) },
    glow('root', [-236, 40], 24, popIn(LANDED, BACK - 18)),
    glow('root', [196, 40], 16, popIn(LANDED + 6, BACK - 12)),
  ],
}

export default subscriptionRenew
