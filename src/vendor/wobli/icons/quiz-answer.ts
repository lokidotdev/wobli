// Quiz Answer
import { ellipse, rect } from '../engine.ts'
import { CURSOR, EXT, FACE, LINE, checkBadge, facePoint, glow, outAndBack, popIn, popScale } from '../parts.ts'
import type { Icon, Layer, Shape, Track, Vec } from '../engine.ts'

// A quiz card asks its question over four answers. The pointer glides in and taps the third, which sinks under it; green sweeps
// across the answer from its letter and a check badge pops onto its end a beat later, sparkles on the beat. The pointer leaves
// the way it came; after the hold the badge shrinks away, the green draws back into the letter and the card is unanswered again.
const ROWS = [-40, 10, 60, 110] // each answer's centre line on the card
const TEXT = [96, 70, 84, 58] // each answer's text length
const PICK = 2 // the correct answer
const ROW_X = -96
const ROW_W = 192
const ROW_H = 40
const LETTER_X = -72
const BADGE: Vec = [74, ROWS[PICK]]
const TIP = facePoint(16, ROWS[PICK] + 4) // the pointer's tip on the answer
const FROM: Vec = [140, 80] // where the pointer comes from, off the card's right side
const PUSH: Vec = [-1.3, 5.9] // 6px of the extrusion: the answer sinks along its own side

const GLIDE = 10 // the pointer sets off
const TAP = 36 // the answer goes down
const RELEASE = 42 // and comes up: the answer is picked
const FILL = TAP + 2 // green sweeps across it
const SWEEP = 14
const BADGE_IN = FILL + 8 // the check lands, a beat behind the green
const LEAVE = 58 // the pointer heads home
const BADGE_OUT = 120
const CLEAR = 144 // the green draws back into the letter
const SWEEP_BACK = 12

const QUESTION: Vec = [-62, -106]
// the question mark as one ink stroke over its dot
const QMARK = ([x, y]: Vec) => `M${x - 8} ${y - 6}A9 9 0 1 1 ${x + 2} ${y + 2}L${x + 1} ${y + 5}`

// an answer row: its plate, then its letter disc and text drawn above whatever fills the plate
const plate = (y: number): Shape => ({ d: rect(ROW_X, y - ROW_H / 2, ROW_W, ROW_H, 12), fill: 'white', depth: 0.3 })
const label = (y: number, i: number): ReadonlyArray<Shape> => [
  { d: ellipse(LETTER_X, y, 11), fill: 'grey', depth: 0.2 },
  { d: rect(-50, y - 6, TEXT[i], 12, 6), fill: 'grey', depth: 0.15 },
]

// the picked answer fills from its left end outwards, and draws back the same way
const SWEEP_S: Track<Vec> = outAndBack<Vec>([0, 100], [100, 100], FILL, SWEEP, CLEAR, SWEEP_BACK)
const pickY = ROWS[PICK]
const LEFT: Vec = [ROW_X, pickY]

const answer: ReadonlyArray<Layer> = [
  { id: 'pick', parent: 'quiz', m: { p: outAndBack<Vec>([0, 0], PUSH, TAP, 4, RELEASE, 6), x: outAndBack(0, -6, TAP, 4, RELEASE, 6) }, shapes: [plate(pickY)] },
  { parent: 'pick', a: LEFT, p: LEFT, s: SWEEP_S, shapes: [{ d: rect(ROW_X, pickY - ROW_H / 2, ROW_W, ROW_H, 12), fill: 'ok', line: false }] },
  { parent: 'pick', shapes: label(pickY, PICK) },
  { parent: 'pick', a: BADGE, p: BADGE, m: popIn(BADGE_IN, BADGE_OUT), shapes: checkBadge(BADGE, 22, 0.5) },
]

const quizAnswer: Icon = {
  name: 'quiz-answer',
  frames: 180,
  still: 104,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [244, 250], s: [96, 96], shapes: [] },
    {
      id: 'quiz',
      parent: 'root',
      tilt: FACE,
      shapes: [
        { d: rect(-116, -156, 232, 300, 26), fill: 'main', depth: 1 }, // the card
        { d: rect(-96, -136, 192, 60, 14), fill: 'tint', depth: 0.3 }, // the question
        { d: ellipse(QUESTION[0], QUESTION[1], 18), fill: 'gold', depth: 0.25 },
        { d: QMARK(QUESTION), line: 4 },
        { d: ellipse(QUESTION[0] + 1, QUESTION[1] + 11, 2.5), fill: 'ink', line: false },
        { d: rect(-32, -118, 104, 12, 6), fill: 'white', depth: 0.15 },
        { d: rect(-32, -98, 66, 12, 6), fill: 'white', depth: 0.15 },
        // the other answers
        ...ROWS.flatMap((y, i): ReadonlyArray<Shape> => (i === PICK ? [] : [plate(y), ...label(y, i)])),
      ],
    },
    ...answer,
    {
      parent: 'root',
      p: TIP,
      m: [
        { p: outAndBack<Vec>(FROM, [0, 0], GLIDE, TAP - 4 - GLIDE, LEAVE, 22) },
        { p: outAndBack<Vec>([0, 0], PUSH, TAP, 4, RELEASE, 6) },
        { s: popScale(GLIDE - 4, LEAVE - 8) },
      ],
      shapes: [{ d: CURSOR(0, 0), fill: 'white', depth: 0.5 }],
    },
    glow('root', [168, -60], 22, popIn(BADGE_IN + 4, BADGE_OUT - 6)),
    glow('root', [-170, -150], 15, popIn(BADGE_IN + 10, BADGE_OUT)),
  ],
}

export default quizAnswer
