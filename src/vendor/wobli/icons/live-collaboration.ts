// Live Collaboration
import { line, rect } from '../engine.ts'
import { SNAP } from '../motions.ts'
import { CURSOR, EXT, FACE, facePoint, glow, LINE, popIn, popScale, sheet } from '../parts.ts'
import type { Icon, Key, Layer, Shape, Swatch, Track, Vec } from '../engine.ts'

// Two people share one document. The first pointer pops in and types the top line; the second pops in a beat later on the line
// below and they take turns down the page, each line drawing out behind its caret, each name tag trailing a few frames behind.
// When the last line lands a sparkle marks it, everything holds; then the pointers shrink away and the lines draw back, last first.
const W = 250
const H = 280
const LEFT = -92
const LINE_Y = (i: number) => -66 + i * 32
const ENDS = [72, 40, 84, 64, -20] // right end of each line
const SPEED = 7 // units typed per frame: steady, like keys
const JUMP = 10 // a caret moving down to its next line, on SNAP
const PAUSE = 4 // settles on the new line before typing
const TRAIL = 3 // the name tag's lag behind its pointer
const CARET_OUT = 136 // both pointers shrink away
const ERASE = 146 // last line starts drawing back, the others follow 3 apart

type Typist = { fill: Swatch; lines: ReadonlyArray<number>; start: number }
const TYPISTS: ReadonlyArray<Typist> = [
  { fill: 'main', lines: [0, 2, 4], start: 6 },
  { fill: 'deep', lines: [1, 3], start: 24 },
]

// when each line starts and finishes typing, and the caret's path through them
const plan = ({ lines, start }: Typist) => {
  const runs: Array<{ i: number; from: number; to: number }> = []
  const path: Array<Key<Vec>> = []
  let t = start
  lines.forEach((i, n) => {
    const len = Math.round((ENDS[i] - LEFT) / SPEED)
    if (n === 0) path.push([0, [LEFT, LINE_Y(i)], 0])
    path.push([t, [LEFT, LINE_Y(i)]], [t + len, [ENDS[i], LINE_Y(i)], 0])
    runs.push({ i, from: t, to: t + len })
    t += len
    if (n < lines.length - 1) {
      path.push([t + PAUSE, [ENDS[i], LINE_Y(i)], SNAP])
      t += PAUSE + JUMP
      path.push([t, [LEFT, LINE_Y(lines[n + 1])], 0])
      t += PAUSE
    }
  })
  return { runs, path, done: t }
}
const PLANS = TYPISTS.map(plan)
const LAST = Math.max(...PLANS.map((p) => p.done)) // the final line lands
const RUNS = PLANS.flatMap((p) => p.runs)

const shift = (track: ReadonlyArray<Key<Vec>>, d: number): Track<Vec> => track.map(([t, v, e]) => (t === 0 ? [0, v, 0] : [t + d, v, e]))

const typed = (i: number): Layer => {
  const { from, to } = RUNS.find((r) => r.i === i)!
  const back = ERASE + (ENDS.length - 1 - i) * 3
  return {
    parent: 'doc',
    shapes: [{ d: line([LEFT, LINE_Y(i)], [ENDS[i], LINE_Y(i)]), line: 7, round: true, trim: [[0, 0, 0], [from, 0], [to, 1, 0], [back, 1, SNAP], [back + 12, 0]] }],
  }
}

// the path on the leaned page, carried into the upright root so pointers and tags stay standing
const upright = (track: ReadonlyArray<Key<Vec>>): Track<Vec> => track.map(([t, v, e]) => [t, facePoint(...v), e])

const caret = ({ fill, start }: Typist, n: number): ReadonlyArray<Layer> => {
  const path = upright(PLANS[n].path)
  const pop = popScale(start - 6, CARET_OUT + n * 4)
  return [
    // the name tag rides beside the pointer, a few frames late
    { parent: 'root', p: shift(path, TRAIL), s: pop, shapes: [{ d: rect(26, 50, 54, 26, 9), fill, depth: 0.5 }] },
    { id: `pointer-${n}`, parent: 'root', p: path, s: pop, shapes: [] },
    { parent: `pointer-${n}`, s: [76, 76], shapes: [{ d: CURSOR(0, 0), fill, depth: 0.6 }] }, // the shared pointer, tip on the line's end
  ]
}

const liveCollaboration: Icon = {
  name: 'live-collaboration',
  frames: 180,
  still: 118,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [240, 236], s: [88, 88], shapes: [] },
    {
      id: 'doc',
      parent: 'root',
      tilt: FACE,
      shapes: [
        ...sheet(W, H, 'grey').slice(0, 2), // the sheet's body and folded corner; its own tag and lines are replaced below
        { d: rect(LEFT, -110, 90, 22, 6), fill: 'grey', depth: 0.3 },
      ] as ReadonlyArray<Shape>,
    },
    ...ENDS.map((_, i) => typed(i)),
    ...TYPISTS.flatMap(caret),
    glow('root', [-170, -60], 24, popIn(LAST + 2, CARET_OUT - 6)),
    glow('root', [178, -126], 16, popIn(LAST + 8, CARET_OUT)),
  ],
}

export default liveCollaboration
