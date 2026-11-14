// Shopping Cart Add
import { ellipse, line, pill, poly, rect } from '../engine.ts'
import { IN, spring } from '../motions.ts'
import { EXT, FACE, facePoint, glow, hit, LINE, outAndBack, popIn, popScale } from '../parts.ts'
import type { Icon, Shape, Track, Vec } from '../engine.ts'

// A product box pops in above the cart and drops in, faster and faster, tipping level as it falls. The cart takes the hit with
// the spring on the frame the box lands, and a beat later the count badge is knocked up and springs home as 1 turns to 2.
// After the hold the box pops away inside the cart and the count goes back to 1, ready to drop again.
const APPEAR = 0 // the box pops in above the cart
const DROP = 14 // it lets go
const LAND = 38 // it hits the basket
const BUMP = LAND + 4 // the badge answers, a beat behind the cart
const CLEAR = 134 // the box pops away
const RESET = 168 // back above the cart, unseen

const BOX: Vec = [6, -126] // the box's centre on the cart face, half sunk behind the basket front
const BOX_IN = facePoint(...BOX)
const BOX_FROM: Vec = [BOX_IN[0] + 70, BOX_IN[1] - 170] // up and to the right of the cart, where it falls from
const BADGE: Vec = [130, -96]
const ROLL = 16 // frames the count takes to roll over
const ROLL_OUT: Vec = [0, -64] // the old digit leaves up through the top of the badge
const ROLL_IN: Vec = [0, 64] // the new one waits below it

const FALL: Track<Vec> = [
  [DROP, BOX_FROM, IN, [[-6, -30], [30, -70]]],
  [LAND, BOX_IN, 0],
  [RESET, BOX_FROM],
]

// small digits drawn about the badge centre
const ONE = line([BADGE[0] - 8, BADGE[1] - 9], [BADGE[0] + 3, BADGE[1] - 17], [BADGE[0] + 3, BADGE[1] + 17])
const TWO = `M${BADGE[0] - 11} ${BADGE[1] - 7}C${BADGE[0] - 11} ${BADGE[1] - 21} ${BADGE[0] + 11} ${BADGE[1] - 21} ${BADGE[0] + 11} ${BADGE[1] - 7}C${BADGE[0] + 11} ${BADGE[1] + 3} ${BADGE[0] - 11} ${BADGE[1] + 8} ${BADGE[0] - 11} ${BADGE[1] + 17}L${BADGE[0] + 12} ${BADGE[1] + 17}`

const cartAdd: Icon = {
  name: 'cart-add',
  frames: 180,
  still: 120,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [258, 298], s: [84, 84], m: hit(LAND, [2, 10], 0.9), shapes: [] },
    // the box: falls in canvas space, its face leaned like the cart's
    {
      id: 'box',
      parent: 'root',
      p: FALL,
      r: [[DROP, 18, IN], [LAND, 0, 0], [RESET, 18]],
      s: popScale(APPEAR, CLEAR),
      shapes: [],
    },
    {
      parent: 'box',
      tilt: FACE,
      shapes: [
        { d: rect(-60, -50, 120, 100, 8), fill: 'gold', depth: 0.8 },
        { d: rect(-16, -50, 32, 100), fill: 'white', depth: 0.8 },
        { d: line([-44, 30], [-28, 30]) },
      ],
    },
    {
      id: 'cart',
      parent: 'root',
      tilt: FACE,
      shapes: [
        { d: line([-150, -134], [-120, -84]), line: 8 },
        { d: pill(-178, -150, 52, 24), fill: 'deep', depth: 0.6 },
        ...[-84, 64].map((x): Shape => ({ d: line([x, 30], [x, 60]), line: 8 })),
        { d: rect(-116, 52, 216, 18, 9), fill: 'deep', depth: 0.6 },
        ...[-84, 70].flatMap((x): Array<Shape> => [{ d: ellipse(x, 98, 22), fill: 'deep', depth: 0.8 }, { d: ellipse(x, 98, 7), fill: 'white', line: 3 }]),
        { d: poly([[-126, -88], [136, -88], [112, 34], [-102, 34]], [8, 8, 12, 12]), fill: 'main', depth: 1 },
        { d: line([-110, -28], [122, -28]) },
        ...[-48, 12, 72].map((x): Shape => ({ d: line([x, -66], [x * 0.94, 14]) })),
      ],
    },
    { id: 'badge', parent: 'cart', m: hit(BUMP, [4, -14], 0.7), shapes: [{ d: ellipse(BADGE[0], BADGE[1], 32), fill: 'hot', depth: 0.6 }] },
    // the count rolls up inside the badge, and rolls back down the same way when the box clears
    { parent: 'badge', clip: 'badge', m: { p: outAndBack<Vec>([0, 0], ROLL_OUT, BUMP, ROLL, CLEAR + 6, ROLL) }, shapes: [{ d: ONE, line: 6 }] },
    { parent: 'badge', clip: 'badge', m: { p: outAndBack<Vec>(ROLL_IN, [0, 0], BUMP + 2, ROLL, CLEAR + 4, ROLL) }, shapes: [{ d: TWO, line: 6 }] },
    glow('root', [-140, -200], 24, popIn(LAND + 2, CLEAR - 14)),
    glow('root', [170, -170], 16, popIn(LAND + 8, CLEAR - 8)),
  ],
}

export default cartAdd
