// CI Pipeline
import { line, pill, rect } from '../engine.ts'
import { erase, SOFT } from '../motions.ts'
import { check, EXT, FACE, glow, LINE, popIn } from '../parts.ts'
import type { Icon, Layer, Shape } from '../engine.ts'

// The run walks down the pipeline left to right: a stage block pops green and its check draws in, then the pipe to the next
// stage draws itself across and that stage lights 24 frames later. As the last check lands the status pill turns green and
// sparkles land on the beat. After the hold the stages
// go dark last first and the pipes erase behind them, retracing the run, so the board is idle at the seam.
const STAGES = [-100, 0, 100]
const Y = 16
const HALF = 36 // half a stage block
const START = 14 // the first stage lights
const GAP = 24 // each next stage follows this many frames later
const DONE = START + GAP * (STAGES.length - 1) + 14 // the last check finishes drawing
const CLEAR = 122 // the last stage goes dark first, back up the pipeline
const CLEAR_GAP = 14

// the run's status pill in the board's corner, white while idle, green once every stage has passed
const HEADER = (fill: Shape['fill']): Shape => ({ d: pill(-136, -60, 92, 20), fill, depth: 0.3 })
const block = (x: number, fill: Shape['fill']): Shape => ({ d: rect(x - HALF, Y - HALF, HALF * 2, HALF * 2, 14), fill, depth: 0.6 })

const ciPipeline: Icon = {
  name: 'ci-pipeline',
  frames: 180,
  still: 100,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [252, 262], s: [88, 88], shapes: [] },
    {
      id: 'board',
      parent: 'root',
      tilt: FACE,
      shapes: [
        { d: rect(-160, -80, 320, 160, 26), fill: 'deep', depth: 1 },
        HEADER('white'),
        { d: rect(-100, Y - 9, 200, 18, 5), fill: 'grey', depth: 0.3 },
        ...STAGES.flatMap((x): Array<Shape> => [block(x, 'white'), { d: line([x - 14, Y], [x + 14, Y]) }]),
      ],
    },
    // the pipe between two stages draws across once the stage before it is green, and erases on the way back
    ...STAGES.slice(1).map((x, i): Layer => {
      const on = START + i * GAP + 8
      const off = CLEAR + (STAGES.length - 1 - i) * CLEAR_GAP - CLEAR_GAP + 4
      return {
        parent: 'board',
        shapes: [{ d: line([STAGES[i] + HALF, Y], [x - HALF, Y]), line: 6, trim: [[on, 0, SOFT], [on + 14, 1, 0], ...erase(off, off + 60).slice(0, 2)] }],
      }
    }),
    ...STAGES.map((x, i): Layer => {
      const on = START + i * GAP
      const off = CLEAR + (STAGES.length - 1 - i) * CLEAR_GAP
      return {
        parent: 'board',
        a: [x, Y],
        p: [x, Y],
        m: popIn(on, off),
        shapes: [block(x, 'ok'), { d: check([x, Y], 38), line: 6, trim: [[on + 4, 0, SOFT], [on + 16, 1, 0], [off + 30, 1, 0], [off + 31, 0]] }],
      }
    }),
    // the status pill turns green as the last check lands, and goes back to white first
    { parent: 'board', a: [-90, -50], p: [-90, -50], m: popIn(DONE - 4, CLEAR - 10), shapes: [HEADER('ok')] },
    glow('root', [150, -112], 24, popIn(DONE, CLEAR - 6)),
    glow('root', [-156, 92], 16, popIn(DONE + 6, CLEAR)),
  ],
}

export default ciPipeline
