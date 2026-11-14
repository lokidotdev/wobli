// Auto-Tag Photos
import { ellipse, line, poly, rect } from '../engine.ts'
import { EXT, FACE, LINE, glow, hit, popIn, popScale } from '../parts.ts'
import type { Icon, Layer, Shape, Vec } from '../engine.ts'

// A grid of four photos sits on a board. One after another, corner to corner, a label tag pops onto each photo, growing out of
// its pin, and the photo takes the little hit on the frame its tag lands; a sparkle marks the last one. After a long hold the
// tags shrink back into their pins in the order they came, and the grid is bare again for the loop.
const P = 104 // photo side
const GAP = 18
const SPAN = 2 * P + GAP
const PAD = 18
const KNOCK: Vec = [0, 7]

const FIRST = 14 // the first tag starts to pop
const STEP = 12 // between one tag and the next
const LAND = 10 // a tag's pop peaks this long after it starts: the photo takes the hit here
const CLEAR = 124 // the first tag starts back into its pin
const STEP_HOME = 8

// photos in the order they get tagged: top left, top right, bottom left, bottom right
const CELLS: ReadonlyArray<readonly [number, number]> = [[0, 0], [1, 0], [0, 1], [1, 1]]
const corner = (i: number, j: number): Vec => [-SPAN / 2 + i * (P + GAP), -SPAN / 2 + j * (P + GAP)]

// a landscape: sun up one side, a ridge of mountains along the bottom, mirrored on every other photo
const photo = ([x, y]: Vec, flip: boolean): ReadonlyArray<Shape> => {
  const fx = (u: number) => x + (flip ? 1 - u : u) * P
  return [
    { d: rect(x, y, P, P, 12), fill: 'main', depth: 0.45 },
    { d: ellipse(fx(0.76), y + P * 0.26, 11), fill: 'white' },
    { d: poly([[fx(0.06), y + P - 6], [fx(0.36), y + P * 0.44], [fx(0.58), y + P * 0.72], [fx(0.74), y + P * 0.56], [fx(0.94), y + P - 6]], 3), fill: 'deep' },
  ]
}

// a label tag pointing at its pin, the pin at 0 0
const TAG = poly([[0, 0], [15, -15], [58, -15], [58, 15], [15, 15]], [3, 4, 7, 7, 4])
const tag = (pin: Vec, up: number, down: number): Layer => ({
  a: [0, 0],
  p: pin,
  r: -12,
  s: popScale(up, down),
  shapes: [
    { d: TAG, fill: 'white', depth: 0.4 },
    { d: ellipse(14, 0, 4.5), fill: 'ink', line: false },
    { d: line([26, 0], [46, 0]), line: 5 },
  ],
})

const cell = ([i, j]: readonly [number, number], k: number): Layer[] => {
  const c = corner(i, j)
  const mid: Vec = [c[0] + P / 2, c[1] + P / 2]
  const up = FIRST + k * STEP
  const flip = (i + j) % 2 === 1
  return [
    { id: `photo${k}`, parent: 'board', a: mid, p: mid, m: hit(up + LAND, KNOCK, 0.6), shapes: photo(c, flip) },
    { ...tag([c[0] + (flip ? P - 66 : 10), c[1] + P * 0.66], up, CLEAR + k * STEP_HOME), parent: `photo${k}` },
  ]
}

const LAST = FIRST + (CELLS.length - 1) * STEP + LAND

const autoTagPhotos: Icon = {
  name: 'auto-tag-photos',
  frames: 180,
  still: 100,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [250, 258], shapes: [] },
    {
      id: 'board',
      parent: 'root',
      tilt: FACE,
      shapes: [{ d: rect(-SPAN / 2 - PAD, -SPAN / 2 - PAD, SPAN + 2 * PAD, SPAN + 2 * PAD, 26), fill: 'white', depth: 1 }],
    },
    ...CELLS.flatMap(cell),
    glow('root', [150, -96], 24, popIn(LAST, CLEAR - 6)),
    glow('root', [-156, 40], 16, popIn(LAST + 8, CLEAR)),
  ],
}

export default autoTagPhotos
