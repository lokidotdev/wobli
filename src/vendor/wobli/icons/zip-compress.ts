// Zip Compress
import { rect } from '../engine.ts'
import { EXT, FACE, LINE, glow, outAndBack, outIn, popIn, popScale, sheet } from '../parts.ts'
import type { Icon, Layer, Shape, Vec } from '../engine.ts'

// Three files sit side by side. The outer two slide in over the middle one, the right a beat behind the left, and the stack
// squashes away as the zip file pops out of the same spot; its pull runs down the teeth to close it. After the hold the pull
// runs back up, the zip gives way to the stack and the files slide home on the mirror of the way they came, last in first out.
const SPREAD = 112
const GATHER = 6 // the left file leaves
const LAG = 4 // the right file follows
const TRAVEL = 30
const ZIP_IN = 34
const ZIP_OUT = 120
const PULL_TOP: Vec = [0, -78]
const PULL_RUN: Vec = [0, 144]

// a file that slides to the middle, squashes away, and later pops back and retraces its way home
const file = (x: number, tag: Shape['fill'], kind: 'doc' | 'img' | 'pdf', lag: number): Layer => ({
  parent: 'face',
  a: [x, 0],
  p: [x, 0],
  m: [{ p: outAndBack<Vec>([0, 0], [-x, 0], GATHER + lag, TRAVEL, ZIP_OUT + 8 - lag, TRAVEL) }, outIn(ZIP_IN - 6 + lag, ZIP_OUT + lag)],
  shapes: sheet(108, 142, tag, kind, x),
})

const TEETH: ReadonlyArray<Shape> = Array.from({ length: 7 }, (_, i): Shape => ({ d: rect(i % 2 ? -1 : -19, -88 + i * 26, 20, 13, 3), fill: 'gold', line: 3 }))

const zipCompress: Icon = {
  name: 'zip-compress',
  frames: 180,
  still: 98,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [254, 268], shapes: [] },
    { id: 'face', parent: 'root', tilt: FACE, shapes: [] },
    file(-SPREAD, 'main', 'doc', 0),
    file(SPREAD, 'hot', 'pdf', LAG),
    { parent: 'face', m: outIn(ZIP_IN - 2, ZIP_OUT + 2), shapes: sheet(108, 142, 'ok', 'img') },
    {
      id: 'zip',
      parent: 'face',
      m: { s: popScale(ZIP_IN, ZIP_OUT) },
      shapes: [{ d: rect(-82, -112, 164, 224, 18), fill: 'deep', depth: 0.8 }, { d: rect(-27, -112, 54, 224), fill: 'tint' }, ...TEETH],
    },
    {
      parent: 'zip',
      p: PULL_TOP,
      m: { p: outAndBack<Vec>([0, 0], PULL_RUN, ZIP_IN + 12, 24, ZIP_OUT - 20, 20) },
      shapes: [{ d: rect(-25, -20, 50, 40, 8), fill: 'gold', depth: 0.4 }, { d: rect(-10, -6, 20, 12, 3), fill: 'white', line: 3 }],
    },
    glow('root', [150, -140], 24, popIn(ZIP_IN + 28, ZIP_OUT - 10)),
    glow('root', [-152, -70], 16, popIn(ZIP_IN + 33, ZIP_OUT - 6)),
  ],
}

export default zipCompress
