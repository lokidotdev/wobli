// Password Vault
import { ellipse, line, pill, rect } from '../engine.ts'
import { IN, spring, springTurn, SOFT } from '../motions.ts'
import { EXT, FACE, facePoint, glow, LINE, outAndBack, popIn } from '../parts.ts'
import type { Icon, Layer, Shape, Vec } from '../engine.ts'

// Three key cards wait half in the vault's top and slide down into it one after another. The wheel is spun shut and the bolts
// shoot out of the door edge, the vault takes the clunk on the frame they land, one sparkle on that beat. After a long hold the
// wheel unwinds, the bolts slide back and the cards rise out of the top the way they went in, last in first out.
const INSERT = 6 // the first card starts down
const CARD_GAP = 12 // each next card follows this much later
const CARD_LEN = 26
const SPIN = 56 // the wheel is spun
const BOLT = 64 // the bolts start out
const BOLT_LEN = 12
const LOCK = BOLT + BOLT_LEN // the bolts land, the vault takes the hit
const UNWIND = 124 // the wheel turns back
const RETRACT = 136 // the bolts slide home
const RISE = 150 // the last card in rises out first
const RISE_GAP = 6
const RISE_LEN = 18
const WHEEL: Vec = [0, 30]
const FIELD_Y = -70 // the password field on the door: one dot fills for each card that goes in
const CARDS = [
  { x: -54, y: -160, stripe: 'main' },
  { x: 0, y: -178, stripe: 'gold' },
  { x: 54, y: -160, stripe: 'deep' },
] as const

// a key card: white slab, coloured stripe, gold chip
const keyCard = (x: number, y: number, stripe: Shape['fill']): ReadonlyArray<Shape> => [
  { d: rect(x - 50, y - 34, 100, 68, 10), fill: 'white', depth: 0.3 },
  { d: rect(x - 50, y - 20, 100, 14), fill: stripe },
  { d: rect(x - 36, y + 4, 26, 20, 5), fill: 'gold', depth: 0.2 },
]

// one spoke of the wheel, a bar with a gold knob on its tip
const spoke = (deg: number): ReadonlyArray<Shape> => {
  const [c, s] = [Math.cos((deg * Math.PI) / 180), Math.sin((deg * Math.PI) / 180)]
  const tip: Vec = [WHEEL[0] + c * 48, WHEEL[1] + s * 48]
  return [{ d: line([WHEEL[0] + c * 16, WHEEL[1] + s * 16], tip), line: 10 }, { d: ellipse(tip[0], tip[1], 11), fill: 'gold', depth: 0.4 }]
}

const card = (i: number): Layer => {
  const { x, y, stripe } = CARDS[i]
  const out = INSERT + i * CARD_GAP
  const back = RISE + (CARDS.length - 1 - i) * RISE_GAP
  return { parent: 'root', tilt: FACE, m: { p: outAndBack<Vec>([0, 0], facePoint(0, 150), out, CARD_LEN, back, RISE_LEN) }, shapes: keyCard(x, y, stripe) }
}

const bolt = (y: number, lag: number): Layer => ({
  parent: 'root',
  tilt: FACE,
  m: { p: outAndBack<Vec>([0, 0], facePoint(30, 0), BOLT + lag, BOLT_LEN, RETRACT + (lag ? 0 : 4), BOLT_LEN) },
  shapes: [{ d: pill(78, y - 10, 36, 20), fill: 'grey', depth: 0.6 }],
})

const passwordVault: Icon = {
  name: 'password-vault',
  frames: 180,
  still: 116,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [254, 284], m: { p: [...spring([2, 6], LOCK, 0.7), [RETRACT, [2, 6], SOFT], [RETRACT + 30, [0, 0]]] }, shapes: [] },
    // behind the body: the cards go down behind its top edge
    ...[0, 1, 2].map(card),
    {
      parent: 'root',
      tilt: FACE,
      shapes: [
        ...[-1, 1].map((s): Shape => ({ d: rect(s * 96 - 18, 118, 36, 22, 6), fill: 'deep', depth: 0.6 })),
        { d: rect(-140, -124, 280, 250, 24), fill: 'deep', depth: 1.2 },
        ...[-64, 36].map((y): Shape => ({ d: rect(-150, y, 22, 40, 6), fill: 'grey', depth: 0.6 })),
      ],
    },
    // the bolts sit under the door's right edge until they shoot out
    bolt(-48, 0),
    bolt(60, 4),
    {
      id: 'door',
      parent: 'root',
      tilt: FACE,
      shapes: [
        { d: rect(-118, -102, 226, 206, 16), fill: 'main', depth: 0.5 },
        { d: rect(-66, FIELD_Y - 18, 132, 36, 18), fill: 'white', depth: 0.3 },
        { d: ellipse(WHEEL[0], WHEEL[1], 64), fill: 'white', depth: 0.4 },
        { d: ellipse(WHEEL[0], WHEEL[1], 50) },
      ],
    },
    // dot i fills on the frame card i is all the way in, and empties as the wheel unwinds, last in first out
    ...CARDS.map((_, i): Layer => {
      const c: Vec = [(i - 1) * 36, FIELD_Y]
      return { parent: 'door', a: c, p: c, m: popIn(INSERT + i * CARD_GAP + CARD_LEN, UNWIND + (CARDS.length - 1 - i) * 5), shapes: [{ d: ellipse(c[0], c[1], 8), fill: 'ink', line: false }] }
    }),
    {
      parent: 'door',
      a: WHEEL,
      p: WHEEL,
      m: { r: [...springTurn(120, SPIN, 0.6), [UNWIND, 120, IN], [UNWIND + 26, 0]] },
      shapes: [...[30, 150, 270].flatMap(spoke), { d: ellipse(WHEEL[0], WHEEL[1], 20), fill: 'gold', depth: 0.6 }],
    },
    glow('root', [-178, -150], 24, popIn(LOCK, 132)),
  ],
}

export default passwordVault
