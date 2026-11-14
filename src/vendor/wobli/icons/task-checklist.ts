// Task Checklist
import { line, pill, rect } from '../engine.ts'
import { SOFT } from '../motions.ts'
import { check, EXT, FACE, glow, LINE, popIn } from '../parts.ts'
import type { Icon, Layer, Shape } from '../engine.ts'

// Down the clipboard one row at a time: each box fills green and its check draws in right after, 20 frames apart. Sparkles land
// on the last tick, then a long hold. The checks clear last first, retracing the way down, so the list is empty at the seam.
const ROWS = [-62, 0, 62]
const BOX_X = -54
const TICK = 14 // first box pops; each next row follows 20 frames later
const GAP = 20
const CLEAR = 120 // last row clears first, back up the list
const DONE = TICK + GAP * 2 + 16 // the last check finishes drawing

const taskChecklist: Icon = {
  name: 'task-checklist',
  frames: 180,
  still: 100,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [258, 256], s: [80, 80], shapes: [] },
    {
      id: 'board',
      parent: 'root',
      tilt: FACE,
      shapes: [
        { d: rect(-118, -146, 236, 292, 24), fill: 'main', depth: 1 },
        { d: rect(-96, -116, 192, 240, 10), fill: 'white', depth: 0.2 },
        { d: pill(-52, -164, 104, 42), fill: 'grey', depth: 0.6 },
        { d: pill(-20, -150, 40, 12), fill: 'ink', line: false },
        ...ROWS.flatMap((y, i): Array<Shape> => [
          { d: rect(BOX_X - 18, y - 18, 36, 36, 9), fill: 'paper', depth: 0.3 },
          { d: line([-16, y - 7], [66, y - 7]) },
          { d: line([-16, y + 11], [i === 1 ? 50 : 26, y + 11]) },
        ]),
      ],
    },
    ...ROWS.map((y, i): Layer => {
      const on = TICK + i * GAP
      const off = CLEAR + (ROWS.length - 1 - i) * 8
      return {
        parent: 'board',
        a: [BOX_X, y],
        p: [BOX_X, y],
        m: popIn(on, off),
        shapes: [
          { d: rect(BOX_X - 18, y - 18, 36, 36, 9), fill: 'ok', depth: 0.3 },
          { d: check([BOX_X, y], 26), line: 6, trim: [[on + 4, 0, SOFT], [on + 16, 1, 0], [off + 30, 1, 0], [off + 31, 0]] },
        ],
      }
    }),
    glow('root', [140, -150], 26, popIn(DONE, CLEAR - 4)),
    glow('root', [-150, 96], 18, popIn(DONE + 6, CLEAR)),
  ],
}

export default taskChecklist
