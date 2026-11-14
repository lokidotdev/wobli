// Conversion Funnel
import { ellipse, poly, rect } from '../engine.ts'
import { DROP, IN, SOFT, spring, twinkle } from '../motions.ts'
import { EXT, FACE, LINE, coin, glow, hit, popIn } from '../parts.ts'
import type { Icon, Layer, Shape, Track, Vec } from '../engine.ts'

// Three visitors pop in above the mouth one after another and drop into the funnel, which takes each hit on the frame it lands.
// A beat later each one comes out of the spout as a gold coin that springs to its place in a fan below, with a sparkle on the
// last. After a long hold the coins go back up the spout, last out first in, and the visitors pop back in on the seam.
const TOP = -248 // where the visitors pop in, on the face
const SINK = -40 // where a visitor is gone, deep behind the funnel
const SPOUT: Vec = [0, 78]
const APPEAR = [2, 14, 26]
const FALL_DELAY = 14 // pop in, then fall
const FALL_LEN = 22
const LAND = APPEAR.map((t) => t + FALL_DELAY + FALL_LEN)
const CONVERT = 8 // frames from a visitor landing to its coin leaving the spout
const OUT = LAND.map((t) => t + CONVERT)
const GROW = 16
const BACK = [184, 178, 172] // last out, first in
const BACK_LEN = 20
const VISITOR_X = [-24, 32, 88]
const COIN_REST: ReadonlyArray<Vec> = [[-78, 150], [0, 170], [78, 150]]
const KNOCK: Vec = [2, 7]

// an avatar disc: slab body, raised white head and shoulders
const avatar = (r: number, fill: Shape['fill']): ReadonlyArray<Shape> => [
  { d: ellipse(0, 0, r), fill, depth: 0.8 },
  { d: ellipse(0, -r * 0.24, r * 0.3), fill: 'white', depth: 0.3 },
  { d: `M${-r * 0.56} ${r * 0.62}A${r * 0.56} ${r * 0.46} 0 0 1 ${r * 0.56} ${r * 0.62}Z`, fill: 'white', depth: 0.3 },
]

// a visitor: pops in over the mouth, drops in on an ease in and is gone the frame it lands
const visitor = (x: number, i: number): Layer => ({
  parent: 'face',
  p: [[APPEAR[i] + FALL_DELAY, [x, TOP], DROP], [LAND[i], [x * 0.3 - 10, SINK]]],
  op: LAND[i],
  m: twinkle(APPEAR[i]),
  shapes: avatar(28, 'deep'),
})

// a coin: grows out of the spout and springs to its rest, then goes back up the spout shrinking into it
const coinOut = (rest: Vec, i: number): Layer => {
  const p: Track<Vec> = [...spring(rest, OUT[i], 0.55, SPOUT), [BACK[i], rest, IN], [BACK[i] + BACK_LEN, SPOUT]]
  return {
    parent: 'face',
    ip: OUT[i] - 1,
    op: BACK[i] + BACK_LEN,
    p,
    s: [[OUT[i], [40, 40], SOFT], [OUT[i] + GROW, [100, 100], 0], [BACK[i], [100, 100], IN], [BACK[i] + BACK_LEN, [40, 40]]],
    shapes: coin(26),
  }
}

// a stage of the funnel: a trapezoid from width `top` at y to width `foot` at y + h
const stage = (y: number, h: number, top: number, foot: number, fill: Shape['fill']): Shape => ({
  d: poly([[-top / 2, y], [top / 2, y], [foot / 2, y + h], [-foot / 2, y + h]], [8, 8, 5, 5]),
  fill,
  depth: 1,
})

const conversionFunnel: Icon = {
  name: 'conversion-funnel',
  frames: 210,
  still: 132,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [258, 248], shapes: [] },
    { id: 'face', parent: 'root', tilt: FACE, shapes: [] },
    // coins and visitors pass behind the funnel, so they are drawn first
    ...COIN_REST.map(coinOut),
    ...VISITOR_X.map(visitor),
    { id: 'funnel', parent: 'root', m: LAND.map((t) => hit(t, KNOCK, 0.6)), shapes: [] },
    {
      parent: 'funnel',
      tilt: FACE,
      shapes: [
        { d: rect(-22, 50, 44, 40, 6), fill: 'deep', depth: 1 },
        stage(4, 50, 92, 52, 'main'),
        stage(-56, 52, 156, 104, 'tint'),
        stage(-118, 54, 216, 164, 'main'),
        { d: rect(-124, -146, 248, 30, 12), fill: 'deep', depth: 1 },
      ],
    },
    glow('root', [182, 52], 22, popIn(OUT[2] + 14, BACK[2] - 12)),
    glow('root', [-110, 150], 15, popIn(OUT[2] + 20, BACK[2] - 6)),
  ],
}

export default conversionFunnel
