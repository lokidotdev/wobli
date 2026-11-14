// Search Magnifier
import { arc, line, poly, rect, ring } from '../engine.ts'
import { IN, SOFT } from '../motions.ts'
import { EXT, FACE, LINE, facePoint, glow, outAndBack, popIn } from '../parts.ts'
import type { Icon, Layer, Shape, Track, Vec } from '../engine.ts'

// The lens glides down the list, pauses over the second row, then settles on the third. On the frame it lands the row lights
// up gold, growing out from under the lens, and the row's text slides in a touch. After a long hold the highlight shrinks back
// into the lens and the lens retraces its path home to the first row.
const ROW = (i: number) => -72 + i * 48
const LENS_X = 34
const HIT = 2 // the row the search finds
const START = 12
const PASS = 36 // over the second row
const MOVE = 44 // on again
const ARRIVE = 66
const LEAVE = 128
const HOME = 160
const over = (i: number): Vec => {
  const [x, y] = facePoint(LENS_X, ROW(i))
  return [x, y - 18]
}
const LENS_PATH: Track<Vec> = [
  [START, over(0), SOFT],
  [PASS, over(1), 0],
  [MOVE, over(1), SOFT],
  [ARRIVE, over(HIT), 0],
  [LEAVE, over(HIT), IN],
  [HOME, over(0)],
]
const row = (i: number): ReadonlyArray<Shape> => [
  { d: rect(-80, ROW(i) - 12, 24, 24, 7), fill: i === HIT ? 'main' : 'grey', depth: 0.3 },
  { d: line([-42, ROW(i) - 5], [i % 2 ? 40 : 64, ROW(i) - 5]) },
  { d: line([-42, ROW(i) + 9], [8, ROW(i) + 9]), line: 4 },
]

const searchMagnifier: Icon = {
  name: 'search-magnifier',
  frames: 180,
  still: 100,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [244, 252], shapes: [] },
    { id: 'list', parent: 'root', tilt: FACE, shapes: [{ d: rect(-108, -112, 216, 224, 22), fill: 'white', depth: 1 }] },
    {
      parent: 'list',
      a: [LENS_X, ROW(HIT)],
      p: [LENS_X, ROW(HIT)],
      s: outAndBack<Vec>([0, 100], [100, 100], ARRIVE, 18, LEAVE),
      shapes: [{ d: rect(-94, ROW(HIT) - 20, 188, 40, 12), fill: 'gold', line: 4 }],
    },
    ...[0, 1, 3].map((i): Layer => ({ parent: 'list', shapes: row(i) })),
    { parent: 'list', p: outAndBack<Vec>([0, 0], [8, 0], ARRIVE + 5, 18, LEAVE - 5), shapes: row(HIT) },
    { id: 'lens', parent: 'root', p: LENS_PATH, shapes: [] },
    {
      parent: 'lens',
      tilt: FACE,
      shapes: [
        { d: poly([[30, 42], [42, 30], [96, 84], [84, 96]], [0, 0, 12, 12]), fill: 'deep', depth: 1 },
        { d: poly([[28, 44], [44, 28], [56, 40], [40, 56]], 4), fill: 'grey', depth: 1 },
        { d: ring(0, 0, 46, 34), fill: 'main', depth: 1 },
        { d: arc(0, 0, 24, 200, 250), round: true },
      ],
    },
    glow('root', [-104, -124], 20, popIn(ARRIVE + 8, LEAVE - 6)),
  ],
}

export default searchMagnifier
