// Live Class
import { ellipse, pill, rect } from '../engine.ts'
import { EXT, FACE, LINE, glow, laptop, outAndBack, popIn } from '../parts.ts'
import type { Icon, Layer, Shape, Track, Vec } from '../engine.ts'

// The teacher on the big tile nods as the lesson goes on and the live dot pulses with her. A question lands: the top student's
// hand shoots up, the second follows a beat later, and the teacher nods to take them, with a sparkle on the screen's corner.
// A long still hold on the raised hands, then they come down last up first down and the class carries on.
const TALK = 8 // the teacher nods while talking
const RAISE = [28, 34] as const // each student's hand goes up, the second lagging the first
const ACK = 52 // the teacher nods to take the questions
const LOWER = [134, 128] as const // hands come down, last up first down
const LIFT = 14 // frames for a hand to go up or come down

const TEACHER = { x: -96, y: -146, w: 106, h: 116 }
const HEAD: Vec = [-43, -94] // the teacher's head on the face
const LIVE: Vec = [-78, -130] // the live badge, top left of the teacher's tile
const STUDENT_W = 78
const STUDENT_H = 54
const STUDENT = (i: number): Vec => [18, -146 + i * (STUDENT_H + 8)] // top left of each student tile
const DOWN: Vec = [0, 60] // a lowered hand sits under its tile, clipped away

// a nod: dips on the soft ease, comes home on its mirror
const nod = (t: number): Track<Vec> => outAndBack<Vec>([0, 0], [0, 6], t, 7, t + 9, 10)

const student = (i: number): ReadonlyArray<Layer> => {
  const [x, y] = STUDENT(i)
  const id = `tile${i}`
  const cx = x + 28
  const bottom = y + STUDENT_H
  const arm = x + 58 // the raised arm, beside the head
  return [
    { id, parent: 'lap', shapes: [{ d: rect(x, y, STUDENT_W, STUDENT_H, 8), fill: 'white', depth: 0.2 }] },
    // the hand: drawn behind the shoulders so they cover the arm's root, clipped to the tile so it rises out of the bottom
    {
      parent: 'lap',
      clip: id,
      p: outAndBack<Vec>(DOWN, [0, 0], RAISE[i], LIFT, LOWER[i]),
      shapes: [
        { d: rect(arm - 6, bottom - 30, 12, 36, 4), fill: 'main', line: 4 },
        { d: rect(arm - 13, bottom - 34, 9, 13, 4.5), fill: 'gold', line: 4 },
        { d: rect(arm - 9, bottom - 50, 20, 24, 8), fill: 'gold', line: 4 },
      ],
    },
    {
      parent: 'lap',
      clip: id,
      shapes: [
        { d: `M${cx - 20} ${bottom}A20 15 0 0 1 ${cx + 20} ${bottom}Z`, fill: 'main', line: 4 },
        { d: ellipse(cx, y + 24, 11), fill: 'white', line: 4 },
      ],
    },
  ]
}

const liveClass: Icon = {
  name: 'live-class',
  frames: 180,
  still: 100,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [244, 300], shapes: [] },
    { id: 'lap', parent: 'root', tilt: FACE, shapes: laptop('deep') },
    // the teacher's tile: a board behind her, shoulders that stay
    {
      id: 'teacher',
      parent: 'lap',
      shapes: [
        { d: rect(TEACHER.x, TEACHER.y, TEACHER.w, TEACHER.h, 8), fill: 'main', depth: 0.2 },
        { d: rect(-28, -138, 30, 22, 4), fill: 'white', line: 4 },
      ],
    },
    {
      parent: 'lap',
      clip: 'teacher',
      shapes: [{ d: 'M-79 -30L-79 -44C-79 -62 -63 -68 -43 -68C-23 -68 -7 -62 -7 -44L-7 -30Z', fill: 'white', line: 4 }],
    },
    {
      parent: 'lap',
      clip: 'teacher',
      p: [...nod(TALK), ...nod(ACK)],
      shapes: [
        { d: ellipse(HEAD[0], HEAD[1], 17, 18), fill: 'white', line: 4 },
        { d: `M${HEAD[0] - 17} ${HEAD[1] - 2}C${HEAD[0] - 17} ${HEAD[1] - 26} ${HEAD[0] + 17} ${HEAD[1] - 26} ${HEAD[0] + 17} ${HEAD[1] - 2}C${HEAD[0] + 8} ${HEAD[1] - 12} ${HEAD[0] - 8} ${HEAD[1] - 12} ${HEAD[0] - 17} ${HEAD[1] - 2}Z`, fill: 'deep', line: 4 },
      ],
    },
    // the live badge: a pill with a dot that pulses as the teacher nods
    { parent: 'lap', shapes: [{ d: pill(LIVE[0] - 10, LIVE[1] - 8, 32, 16), fill: 'white', depth: 0.3 }] },
    {
      parent: 'lap',
      a: LIVE,
      p: LIVE,
      s: [...outAndBack<Vec>([100, 100], [130, 130], TALK, 5, TALK + 5, 8), ...outAndBack<Vec>([100, 100], [130, 130], ACK, 5, ACK + 5, 8)],
      shapes: [{ d: ellipse(LIVE[0], LIVE[1], 5), fill: 'hot', line: 3 } satisfies Shape],
    },
    ...[0, 1].flatMap(student),
    glow('root', [158, -164], 22, popIn(RAISE[1] + 10, LOWER[1] - 6)),
  ],
}

export default liveClass
