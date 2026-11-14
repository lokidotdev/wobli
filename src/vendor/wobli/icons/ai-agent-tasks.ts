// AI Agent Tasks
import { ellipse, line, pill, rect } from '../engine.ts'
import { SNAP, SOFT } from '../motions.ts'
import { check, EXT, FACE, glow, hit, LINE, outAndBack, popIn } from '../parts.ts'
import type { Icon, Layer, Shape, Track, Vec } from '../engine.ts'

// A little robot works down the task list on its own. At each row its arm jabs out and the box pops green on the frame the hand
// touches it, the check drawing in; then the robot snaps down to the next row, its antenna taking the stop. Sparkles land on
// the last tick and everything holds. After the hold the checks clear last first while the robot glides back to the top row.
const ROWS = [-62, 0, 62]
const BOX_X = -20
const ROBOT_X = -132
const REACH = 44 // how far the arm jabs out to touch a box
const JAB = 8 // frames for the arm to reach the box
const STEP = 16 // frames for the robot to snap to the next row
const TICKS = [12, 50, 88] // the hand touches each box
const MOVES = [24, 62] // the robot leaves for the next row
const DONE = TICKS[2] + 16 // the last check finishes drawing
const CLEAR = 130 // the last row clears first, back up the list
const HOME = 132 // the robot glides back to the top row
const HOME_LEN = 36

const ROBOT_P: Track<Vec> = [
  [0, [ROBOT_X, ROWS[0]], 0],
  [MOVES[0], [ROBOT_X, ROWS[0]], SNAP],
  [MOVES[0] + STEP, [ROBOT_X, ROWS[1]], 0],
  [MOVES[1], [ROBOT_X, ROWS[1]], SNAP],
  [MOVES[1] + STEP, [ROBOT_X, ROWS[2]], 0],
  [HOME, [ROBOT_X, ROWS[2]], SNAP],
  [HOME + HOME_LEN, [ROBOT_X, ROWS[0]]],
]

// one jab per row: out on SOFT, back on IN along the same path
const ARM_P: Track<Vec> = TICKS.flatMap((t) => outAndBack<Vec>([0, 0], [REACH, 0], t - JAB, JAB, t + 4, 10))
// the pupils glance at the box as the hand goes out
const EYES_P: Track<Vec> = TICKS.flatMap((t) => outAndBack<Vec>([0, 0], [4, 1], t - JAB - 2, JAB, t + 6, 10))
// the antenna takes each stop and springs home
const ANTENNA_P: Track<Vec> = MOVES.flatMap((t) => hit(t + STEP, [0, 6], 0.4).p as Track<Vec>)

const box = (y: number, fill: Shape['fill']): Shape => ({ d: rect(BOX_X - 18, y - 18, 36, 36, 9), fill, depth: 0.3 })

const aiAgentTasks: Icon = {
  name: 'ai-agent-tasks',
  frames: 180,
  still: 100,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [250, 250], s: [86, 86], shapes: [] },
    {
      id: 'board',
      parent: 'root',
      tilt: FACE,
      shapes: [
        { d: rect(-60, -124, 222, 248, 24), fill: 'white', depth: 1 },
        { d: pill(14, -142, 100, 38), fill: 'grey', depth: 0.6 },
        { d: pill(44, -129, 40, 12), fill: 'ink', line: false },
        ...ROWS.flatMap((y, i): Array<Shape> => [
          box(y, 'paper'),
          { d: line([16, y - 7], [128, y - 7]) },
          { d: line([16, y + 11], [i === 1 ? 104 : 72, y + 11]) },
        ]),
      ],
    },
    ...ROWS.map((y, i): Layer => {
      const on = TICKS[i]
      const off = CLEAR + (ROWS.length - 1 - i) * 8
      return {
        parent: 'board',
        a: [BOX_X, y],
        p: [BOX_X, y],
        m: popIn(on, off),
        shapes: [box(y, 'ok'), { d: check([BOX_X, y], 26), line: 6, trim: [[on + 4, 0, SOFT], [on + 16, 1, 0], [off + 30, 1, 0], [off + 31, 0]] }],
      }
    }),
    { id: 'robot', parent: 'board', p: ROBOT_P, shapes: [] },
    // the arm sits behind the head and jabs out to the right
    {
      parent: 'robot',
      p: ARM_P,
      shapes: [
        { d: pill(-20, -7, 54, 14), fill: 'grey', depth: 0.4 },
        { d: ellipse(40, 0, 11), fill: 'white', depth: 0.5 },
      ],
    },
    // antenna behind the head, its ball riding the stops
    {
      parent: 'robot',
      p: ANTENNA_P,
      shapes: [
        { d: rect(-4, -66, 8, 30, 3), fill: 'grey', depth: 0.4 },
        { d: ellipse(0, -72, 11), fill: 'main', depth: 0.5 },
      ],
    },
    {
      parent: 'robot',
      shapes: [
        { d: rect(-56, -16, 14, 32, 5), fill: 'grey', depth: 0.5 },
        { d: rect(-46, -42, 92, 84, 24), fill: 'main', depth: 1 },
        { d: rect(-34, -28, 68, 46, 14), fill: 'white', depth: 0.3 },
        { d: line([-12, 30], [12, 30]) },
      ],
    },
    {
      parent: 'robot',
      p: EYES_P,
      shapes: [
        { d: ellipse(-13, -5, 6), fill: 'ink', line: false },
        { d: ellipse(13, -5, 6), fill: 'ink', line: false },
      ],
    },
    glow('root', [150, -150], 26, popIn(DONE - 10, CLEAR - 4)),
    glow('root', [-190, 110], 18, popIn(DONE - 4, CLEAR)),
  ],
}

export default aiAgentTasks
