// Heatmap Grid
import { rect } from '../engine.ts'
import { EXT, FACE, glow, LINE, popIn, popScale } from '../parts.ts'
import type { Icon, Layer, Shape, Vec } from '../engine.ts'

// A wave of colour runs across the grid corner to corner, each cell popping up out of its well; a second, hotter wave follows
// close behind and turns the busiest cells deep, and a sparkle lands on the hottest one as the wave ends. After a long hold the
// colour drains away in the same direction: the hot tops shrink first, then the cells sink back into their wells.
const N = 4
const CELL = 46
const GAP = 10
const SPAN = N * CELL + (N - 1) * GAP
const CELL_XY = (k: number) => -SPAN / 2 + k * (CELL + GAP)
const MID = (k: number) => CELL_XY(k) + CELL / 2

// 0 stays empty, 1 lights in the first wave, 2 lights and then runs hot in the second
const HEAT: ReadonlyArray<ReadonlyArray<0 | 1 | 2>> = [
  [1, 0, 1, 1],
  [1, 2, 2, 0],
  [2, 2, 1, 1],
  [0, 1, 2, 1],
]
const HOTTEST: readonly [number, number] = [1, 2] // column, row: where the sparkle lands

const WAVE = 4 // the first wave starts in the corner
const STEP = 4 // frames between one diagonal and the next
const LAG = 18 // the hot wave follows this far behind
const DRAIN = 124 // the hot tops start shrinking, in the same direction the waves ran
const SINK = 130 // and the cells sink after them
const STEP_HOME = 3
const diag = (i: number, j: number) => i + j
const HOT_LAND = WAVE + LAG + diag(...HOTTEST) * STEP + 10 // the hot cell reaches full size

const block = (i: number, j: number, fill: Shape['fill'], up: number, down: number): Layer => {
  const c: Vec = [MID(i), MID(j)]
  return {
    parent: 'board',
    a: c,
    p: c,
    s: popScale(up, down),
    shapes: [{ d: rect(CELL_XY(i) + 3, CELL_XY(j) + 3, CELL - 6, CELL - 6, 8), fill, depth: 0.55 }],
  }
}

const cells: Layer[] = HEAT.flatMap((row, j) =>
  row.flatMap((h, i) => {
    if (!h) return []
    const d = diag(i, j)
    const lit = block(i, j, 'main', WAVE + d * STEP, SINK + d * STEP_HOME)
    return h === 2 ? [lit, block(i, j, 'deep', WAVE + LAG + d * STEP, DRAIN + d * STEP_HOME)] : [lit]
  }),
)

const WELLS: ReadonlyArray<Shape> = Array.from({ length: N * N }, (_, k) => ({
  d: rect(CELL_XY(k % N), CELL_XY(Math.floor(k / N)), CELL, CELL, 10),
  fill: 'grey',
  line: 4,
}))

const heatmapGrid: Icon = {
  name: 'heatmap-grid',
  frames: 180,
  still: 96,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [250, 262], shapes: [] },
    {
      id: 'board',
      parent: 'root',
      tilt: FACE,
      shapes: [{ d: rect(-SPAN / 2 - 20, -SPAN / 2 - 20, SPAN + 40, SPAN + 40, 26), fill: 'white', depth: 1 }, ...WELLS],
    },
    ...cells,
    glow('root', [138, -128], 24, popIn(HOT_LAND, DRAIN - 6)),
  ],
}

export default heatmapGrid
