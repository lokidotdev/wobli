// Neural Network
import { ellipse, line, pill, rect } from '../engine.ts'
import { IN, SOFT } from '../motions.ts'
import { EXT, FACE, glow, hit, LINE, popIn } from '../parts.ts'
import type { Icon, Layer, Shape, Track, Vec } from '../engine.ts'

// A small network fires left to right. The input nodes light one after another, the signal draws along every link into the
// hidden layer, which lights in turn, then on into the two outputs; the board takes the hit as the outputs land and sparkles
// pop on the result. After the hold it clears from the output back, last lit first out, the links drawing back into their source.
const COLS: ReadonlyArray<{ x: number; ys: ReadonlyArray<number> }> = [
  { x: -124, ys: [-68, 0, 68] },
  { x: 0, ys: [-93, -31, 31, 93] },
  { x: 124, ys: [-40, 40] },
]
const NODE_R = 18
const OUT_R = 23
const STAGGER = 4 // frames between nodes in one layer
const LIGHT = [8, 40, 72] // each layer starts to light
const LINK = 16 // frames for the signal to draw along a link
const LINKS_ON = [LIGHT[0] + 12, LIGHT[1] + 16] // links leave a layer once it is lit
const LAND = LIGHT[2] // the outputs land, the board takes it
const OFF = [148, 132, 118] // each layer clears, output first
const LINKS_OFF = [OFF[1] + 4, OFF[2] + 4] // links draw back into their source as the layer ahead clears

const radius = (c: number) => (c === COLS.length - 1 ? OUT_R : NODE_R)
const node = (x: number, y: number, r: number, fill: Shape['fill']): Shape => ({ d: ellipse(x, y, r), fill, depth: 0.35 })
const links = (c: number): ReadonlyArray<[Vec, Vec]> =>
  COLS[c].ys.flatMap((a) => COLS[c + 1].ys.map((b): [Vec, Vec] => [[COLS[c].x, a], [COLS[c + 1].x, b]]))
const signal = (c: number): Track<number> => [
  [LINKS_ON[c], 0, SOFT],
  [LINKS_ON[c] + LINK, 1, 0],
  [LINKS_OFF[c], 1, IN],
  [LINKS_OFF[c] + LINK, 0],
]

const neuralNetwork: Icon = {
  name: 'neural-network',
  frames: 180,
  still: 104,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [254, 236], s: [86, 86], shapes: [] },
    {
      id: 'board',
      parent: 'root',
      tilt: FACE,
      m: hit(LAND, [3, 7], 0.5),
      shapes: [
        { d: rect(-182, -138, 364, 276, 30), fill: 'white', depth: 1 },
        ...COLS.map((col): Shape => ({ d: pill(col.x - 34, col.ys[0] - 34, 68, col.ys.at(-1)! - col.ys[0] + 68), fill: 'paper', depth: 0.3 })),
        // quiet links, then the signal drawing over them
        ...[0, 1].flatMap((c) => links(c).map(([a, b]): Shape => ({ d: line(a, b), line: 2 }))),
        ...[0, 1].flatMap((c) => links(c).map(([a, b]): Shape => ({ d: line(a, b), line: 5, trim: signal(c) }))),
        ...COLS.flatMap((col, c) => col.ys.map((y) => node(col.x, y, radius(c), 'grey'))),
      ],
    },
    // each node lights with a pop, staggered down its layer
    ...COLS.flatMap((col, c) =>
      col.ys.map((y, i): Layer => ({
        parent: 'board',
        a: [col.x, y],
        p: [col.x, y],
        m: popIn(LIGHT[c] + i * STAGGER, OFF[c] + i * 2),
        shapes: [node(col.x, y, radius(c), c === COLS.length - 1 ? 'ok' : 'main')],
      })),
    ),
    glow('root', [196, -132], 26, popIn(LAND + 8, OFF[2] - 6)),
    glow('root', [150, 168], 18, popIn(LAND + 14, OFF[2])),
  ],
}

export default neuralNetwork
