// Loading Cube
import { poly, view } from '../engine.ts'
import { EXT, glow, hit, LINE, outAndBack, popIn } from '../parts.ts'
import type { Icon, Layer, Shape, Vec } from '../engine.ts'

// A big cube built from eight small ones sits on a tray. The four on top lift out one at a time and drop back into their
// sockets, the lift running round the square like a spinner: back, right, front, left. The lower tier takes each landing
// with the spring, a sparkle pops on the last one, and the cube holds whole until the round starts again.
const C = 80 // a small cube's side
const GAP = 6 // the seam between small cubes
const HALF = C / 2 + GAP / 2 // from the big cube's axis to a small cube's centre
const TOP_Z = C + GAP // the upper tier sits here

type P3 = readonly [number, number, number]
const cam = view(28, 30) // the house view: x forward, y right, z up, facing top right like every other sticker
const face = (pts: ReadonlyArray<P3>) => poly(pts.map(cam), 4)

// the three faces of a small cube a viewer sees, the top and the two sides facing front left and front right
const cube = ([cx, cy]: Vec, z: number, top: Shape['fill'], left: Shape['fill'], right: Shape['fill']): ReadonlyArray<Shape> => {
  const [x0, x1, y0, y1, z1] = [cx - C / 2, cx + C / 2, cy - C / 2, cy + C / 2, z + C]
  return [
    { d: face([[x0, y0, z], [x0, y1, z], [x0, y1, z1], [x0, y0, z1]]), fill: left },
    { d: face([[x0, y0, z], [x1, y0, z], [x1, y0, z1], [x0, y0, z1]]), fill: right },
    { d: face([[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]]), fill: top },
  ]
}

// the four columns in the order the lift runs round them: back, right, front, left (clockwise on screen)
const RING: ReadonlyArray<Vec> = [[HALF, HALF], [HALF, -HALF], [-HALF, -HALF], [-HALF, HALF]]
// further from the viewer draws first
const depthOf = ([x, y]: Vec) => x * Math.sin((28 * Math.PI) / 180) + y * Math.cos((28 * Math.PI) / 180)
const backToFront = RING.map((c, k) => ({ c, k })).sort((a, b) => depthOf(b.c) - depthOf(a.c))

const FIRST = 8 // the first cube leaves
const STEP = 26 // the next one leaves this many frames later
const UP = 16 // out of the socket
const DOWN = 14 // and back in on the mirror
const LIFT: Vec = [0, -46]
const leave = (k: number) => FIRST + k * STEP
const land = (k: number) => leave(k) + UP + DOWN
const LAST = land(RING.length - 1)

// the tray, a slab square under the lower tier
const TRAY = C + GAP + 18
const tray: Shape = { d: face([[-TRAY, -TRAY, 0], [TRAY, -TRAY, 0], [TRAY, TRAY, 0], [-TRAY, TRAY, 0]]), fill: 'grey', depth: 1 }

const upper = ({ c, k }: { c: Vec; k: number }): Layer => ({
  parent: 'base',
  m: { p: outAndBack<Vec>([0, 0], LIFT, leave(k), UP, leave(k) + UP, DOWN) },
  shapes: cube(c, TOP_Z, 'tint', 'main', 'main'),
})

const loadingCube: Icon = {
  name: 'loading-cube',
  frames: 180,
  still: 150,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [250, 318], shapes: [] },
    {
      id: 'base',
      parent: 'root',
      m: RING.map((_, k) => hit(land(k), [0, 5], 0.55)),
      shapes: [tray, ...backToFront.flatMap(({ c }) => cube(c, 0, 'white', 'deep', 'deep'))],
    },
    ...backToFront.map(upper),
    glow('root', [126, -206], 24, popIn(LAST, LAST + 34)),
  ],
}

export default loadingCube
