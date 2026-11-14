// Online Checkout
import { ellipse, line, pill, poly, rect } from '../engine.ts'
import { IN, spring, twinkle } from '../motions.ts'
import { checkBadge, CURSOR, EXT, FACE, facePoint, glow, hit, LINE, outAndBack, PHONE_SCREEN, phoneBody, popIn, popScale } from '../parts.ts'
import type { Icon, Layer, Shape, Vec } from '../engine.ts'

// Two items drop into the cart one after the other and the cart takes each hit with the spring. The card slides in from the
// right, the pointer glides to the Pay button and presses it: the button sinks under it and a check pops on the card. The pointer
// leaves the way it came; after the hold the check pops away, the card slides back out the way it came in and the items clear.
const CART: Vec = [0, -64] // the cart's centre on the screen
const CARD: Vec = [0, 10]
const PAY: Vec = [0, 96] // the Pay button's centre
const TIP = facePoint(PAY[0] + 8, PAY[1] + 2) // the pointer's tip on the button
const FROM: Vec = [96, 4] // where the pointer comes from, off the phone's right side
const PUSH: Vec = [-1.7, 7.8] // 8px of the extrusion: the button sinks along its own side
const CARD_OFF: Vec = [170, 0] // the card waits off the screen's right edge

const ITEMS = [
  { x: -22, fill: 'main', drop: 6, out: 144 },
  { x: 18, fill: 'gold', drop: 16, out: 149 },
] as const
const FALL = 18 // frames an item takes to fall into the cart
const CARD_IN = 40
const GLIDE = 52 // the pointer sets off
const PRESS = 80 // the button goes down
const RELEASE = 88 // and comes up: the payment commits
const PAID = 90
const LEAVE = 116
const CLEAR = 130
const CARD_OUT = 138

const item = ({ x, fill, drop, out }: (typeof ITEMS)[number]): Layer => {
  const c: Vec = [x, -102]
  return {
    parent: 'cart',
    clip: 'screen',
    a: c,
    p: c,
    m: [{ p: [[drop, [0, -110], IN], [drop + FALL, [0, 0]]] }, twinkle(out, true)],
    shapes: [{ d: rect(x - 17, -119, 34, 34, 8), fill, depth: 0.4 }],
  }
}

const cartCheckout: Icon = {
  name: 'cart-checkout',
  frames: 180,
  still: 120,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [246, 236], s: [116, 116], shapes: [] },
    { parent: 'root', tilt: FACE, shapes: phoneBody(32, 'deep') },
    { id: 'screen', parent: 'root', tilt: FACE, shapes: [{ d: PHONE_SCREEN(22), fill: 'tint' }] },
    { id: 'cart', parent: 'root', tilt: FACE, a: CART, p: facePoint(...CART), m: [hit(ITEMS[0].drop + FALL, [1, 6]), hit(ITEMS[1].drop + FALL, [1, 6])], shapes: [] },
    ...ITEMS.map(item),
    {
      parent: 'cart',
      shapes: [
        { d: line([-62, -104], [-50, -100], [-40, -52]), line: 6 },
        { d: poly([[-48, -92], [56, -92], [44, -50], [-38, -50]], 6), fill: 'white', depth: 0.4 },
        { d: line([-36, -38], [42, -38]) },
        ...[-24, 30].map((x): Shape => ({ d: ellipse(x, -26, 8), fill: 'ink', line: false })),
      ],
    },
    {
      parent: 'root',
      tilt: FACE,
      clip: 'screen',
      m: { p: outAndBack<Vec>(CARD_OFF, [0, 0], CARD_IN, 26, CARD_OUT, 24) },
      shapes: [
        { d: rect(-56, -24, 112, 70, 12), fill: 'main', depth: 0.3 },
        { d: rect(-56, -10, 112, 14), fill: 'deep', line: 3 },
        { d: rect(-42, 16, 22, 16, 4), fill: 'gold', line: 3 },
      ],
    },
    { parent: 'root', tilt: FACE, shapes: [{ d: pill(-62, PAY[1] - 22, 124, 46), fill: 'white', depth: 0.5 }] },
    {
      parent: 'root',
      tilt: FACE,
      m: { p: outAndBack<Vec>([0, 0], PUSH, PRESS, 5, RELEASE, 6), x: outAndBack(0, -8, PRESS, 5, RELEASE, 6) },
      shapes: [
        { d: pill(-54, PAY[1] - 22, 108, 36), fill: 'ok', depth: 1 },
        { d: line([-20, PAY[1] - 4], [20, PAY[1] - 4]) },
      ],
    },
    { parent: 'root', tilt: FACE, shapes: [{ d: pill(-22, -128, 44, 12), fill: 'ink', line: false }] },
    { parent: 'root', tilt: FACE, a: CARD, p: facePoint(...CARD), m: popIn(PAID, CLEAR), shapes: checkBadge(CARD, 30) },
    {
      parent: 'root',
      p: TIP,
      m: [
        { p: outAndBack<Vec>(FROM, [0, 0], GLIDE, PRESS - 4 - GLIDE, LEAVE, 22) },
        { p: outAndBack<Vec>([0, 0], PUSH, PRESS, 5, RELEASE, 6) },
        { s: popScale(GLIDE - 4, LEAVE + 6) },
      ],
      shapes: [{ d: CURSOR(0, 0), fill: 'white', depth: 0.5 }],
    },
    glow('root', [138, -150], 24, popIn(PAID + 2, CLEAR + 4)),
    glow('root', [-150, -20], 16, popIn(PAID + 8, CLEAR + 8)),
  ],
}

export default cartCheckout
