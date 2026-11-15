// Grocery Bag
import { ellipse, line, poly, rect } from '../engine.ts'
import { DROP, fall, twinkle } from '../motions.ts'
import { EXT, FACE, LINE, glow, hit, popIn, shackle } from '../parts.ts'
import type { Icon, Layer, Motion, Shape, Vec } from '../engine.ts'

// An empty tote stands open. Four groceries pop in above it one after another and drop in, each straightening as it falls:
// a bottle, a milk carton, a baguette, then an apple last in front. The tote takes every landing and the groceries already
// inside settle a beat later; a sparkle answers the apple. After the hold they shrink away last in, first out, and the tote
// is empty again at the seam.
const APPEAR = 6 // the first item pops in
const GAP = 20 // each next item follows this much later
const WAIT = 8 // frames an item hangs before it drops
const DROP_LEN = 14 // frames it takes to fall into the tote
const landAt = (i: number) => APPEAR + i * GAP + WAIT + DROP_LEN // item i (0 to 3) is in the tote
const SETTLE = 4 // the items already inside take a landing this much after the tote
const DONE = landAt(3)
const CLEAR = 128 // the first item to leave
const CLEAR_GAP = 6 // each next one leaves this much later

const DROP_H = 130 // how far above its spot an item hangs, along the face
const TOTE = { x: -112, w: 224, top: -8, bottom: 196 }
const STRAP = 62 // the handles' straps stand this far either side of the middle
const BAR = 14 // strap width
const LIP = 36 // the back wall stands this much higher than the front, showing the tote's mouth

// the front handle, sewn under the hem and hanging down over the panel: the back handle's arch turned upside down
const DROOP = (() => {
  const [o, i, y, h] = [STRAP + BAR / 2, STRAP - BAR / 2, TOTE.top + 20, 22]
  return `M${-o} ${y}L${-o} ${y + h}A${o} ${o} 0 0 0 ${o} ${y + h}L${o} ${y}L${i} ${y}L${i} ${y + h}A${i} ${i} 0 0 1 ${-i} ${y + h}L${-i} ${y}Z`
})()

// the groceries, each drawn around its own centre in the tote's face
const BOTTLE: Vec = [-26, -66]
const CARTON: Vec = [62, -44]
const BREAD: Vec = [-74, -50]
const APPLE: Vec = [-4, -4]

const bottle = ([x, y]: Vec): ReadonlyArray<Shape> => [
  { d: rect(x - 14, y - 112, 28, 22, 4), fill: 'hot', depth: 0.5 }, // the cap
  { d: poly([[x - 12, y - 92], [x + 12, y - 92], [x + 12, y - 70], [x + 30, y - 46], [x + 30, y + 90], [x - 30, y + 90], [x - 30, y - 46], [x - 12, y - 70]], [3, 3, 12, 10, 10, 10, 10, 12]), fill: 'deep', depth: 0.8 },
  { d: rect(x - 30, y - 20, 60, 40, 3), fill: 'white', depth: 0.2 }, // the label band
]
const carton = ([x, y]: Vec): ReadonlyArray<Shape> => [
  { d: rect(x - 6, y - 98, 12, 18, 2), fill: 'white', depth: 0.4 }, // the sealed fin along the gable
  { d: poly([[x - 38, y - 52], [x - 30, y - 84], [x + 30, y - 84], [x + 38, y - 52]], 4), fill: 'deep', depth: 0.8 },
  { d: rect(x - 38, y - 52, 76, 140, 6), fill: 'white', depth: 0.8 },
  { d: ellipse(x, y - 26, 16), fill: 'deep', depth: 0.2 }, // the dairy badge
]
const bread = ([x, y]: Vec): ReadonlyArray<Shape> => [
  { d: rect(x - 24, y - 104, 48, 208, 24), fill: 'gold', depth: 0.7 },
  ...[-72, -42, -12].map((dy): Shape => ({ d: line([x - 9, y + dy + 10], [x + 9, y + dy - 6]), round: true })), // the scores
]
const apple = ([x, y]: Vec): ReadonlyArray<Shape> => [
  { d: line([x + 2, y - 34], [x + 8, y - 58]), line: 7 }, // the stalk
  { d: poly([[x + 8, y - 50], [x + 36, y - 66], [x + 26, y - 42]], [2, 10, 2]), fill: 'ok', depth: 0.3 }, // the leaf
  {
    d: `M${x} ${y - 30}C${x + 20} ${y - 46} ${x + 48} ${y - 36} ${x + 46} ${y - 2}C${x + 44} ${y + 28} ${x + 22} ${y + 44} ${x} ${y + 36}C${x - 22} ${y + 44} ${x - 44} ${y + 28} ${x - 46} ${y - 2}C${x - 48} ${y - 36} ${x - 20} ${y - 46} ${x} ${y - 30}Z`,
    fill: 'main',
    depth: 0.8,
  },
]

// item i: pops in above its spot, hangs tilted, falls in straightening, takes the later landings, shrinks away last in first out
const item = (i: number, c: Vec, rest: number, lean: number, shapes: ReadonlyArray<Shape>): Layer => {
  const t = APPEAR + i * GAP
  const later = [1, 2, 3].filter((j) => j > i).map((j) => hit(landAt(j) + SETTLE, [0, 5], 0.6))
  const m: ReadonlyArray<Motion> = [
    twinkle(t),
    fall([0, DROP_H], t + WAIT, DROP_LEN),
    { r: [[t + WAIT, lean, DROP], [landAt(i), 0]] },
    ...later,
    twinkle(CLEAR + (3 - i) * CLEAR_GAP, true),
  ]
  return { parent: 'tote', a: c, p: [c[0], c[1] - DROP_H], r: rest, m, shapes }
}

const groceryBag: Icon = {
  name: 'grocery-bag',
  frames: 180,
  still: 112,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [254, 274], shapes: [] },
    // the tote takes each landing, the apple's lightest
    { id: 'tote', parent: 'root', tilt: FACE, s: [80, 80], m: [0, 1, 2, 3].map((i) => hit(landAt(i), [0, 10 - i * 2], 0.6)), shapes: [] },
    // the handles stand behind, the back wall and its dark mouth
    {
      parent: 'tote',
      shapes: [
        { d: shackle(STRAP * 2 + BAR, BAR, TOTE.top - LIP + 10, 96), fill: 'ok', depth: 0.4 },
        { d: rect(TOTE.x + 6, TOTE.top - LIP, TOTE.w - 12, TOTE.bottom - TOTE.top + LIP - 20, 8), fill: 'ok', depth: 1 },
        { d: rect(TOTE.x + 18, TOTE.top - LIP + 12, TOTE.w - 36, LIP + 20, 4), fill: 'deep' },
      ],
    },
    item(0, BOTTLE, 4, -12, bottle(BOTTLE)),
    item(1, CARTON, 8, 14, carton(CARTON)),
    item(2, BREAD, -16, -10, bread(BREAD)),
    item(3, APPLE, 0, 16, apple(APPLE)),
    // the front panel, its hem and the front handle flopped down over it
    {
      parent: 'tote',
      shapes: [
        { d: rect(TOTE.x, TOTE.top, TOTE.w, TOTE.bottom - TOTE.top, 12), fill: 'ok', depth: 1 },
        { d: poly([[TOTE.x, TOTE.top], [TOTE.x + TOTE.w, TOTE.top], [TOTE.x + TOTE.w, TOTE.top + 26], [TOTE.x, TOTE.top + 26]], [12, 12, 0, 0]), fill: 'white', depth: 0.3 },
        { d: DROOP, fill: 'ok', depth: 0.4 },
      ],
    },
    glow('root', [-160, -150], 22, popIn(DONE + 2, CLEAR - 4)),
    glow('root', [164, -40], 16, popIn(DONE + 7, CLEAR)),
  ],
}

export default groceryBag
