// Poll Vote
import { ellipse, line, pill, rect } from '../engine.ts'
import { CURSOR, EXT, FACE, LINE, facePoint, glow, outAndBack, popIn, popScale } from '../parts.ts'
import type { Icon, Layer, Vec } from '../engine.ts'

// A poll card waits with three empty options. The pointer glides in and taps the middle one: the row sinks under the press and
// its radio fills on the same frame. The result bars grow out of each row's left edge, the picked one first and longest, the
// others a beat behind; two sparkles answer the tallest. The pointer leaves the way it came, and after the hold the bars draw
// back in, last out first home, and the radio empties so the loop closes on the empty card.
const ROWS = [-62, -2, 58] // top of each option row on the card face
const ROW_H = 44
const TRACK_X = -84 // where the tracks and bars start
const TRACK_W = 204
const RADIO_X = -110
const RADIO_R = 12
const PICK = 1 // the middle option
const INSET = 6 // the bar sits inside its track
const BAR_H = ROW_H - INSET * 2
const SHARE = [0.36, 0.84, 0.24] // each bar's length as a share of the track: the picked one wins
const PUSH: Vec = [-1.3, 6] // a third of the extrusion: the row sinks along its own side

const GLIDE = 6 // the pointer sets off
const TAP = 36 // it lands on the radio: the row sinks and the radio fills
const FILL = TAP + 2 // the picked bar starts to grow
const FILL_LEN = 34
const LAG = 6 // frames between bars
const ORDER = [PICK, 0, 2] // the order the bars grow in
const LEAVE = 74 // the pointer heads home
const CLEAR = 134 // the bars start drawing back in
const CLEAR_LEN = 22
const EMPTY = CLEAR + 14 // the radio empties

const radio = (i: number): Vec => [RADIO_X, ROWS[i] + ROW_H / 2]
const TARGET = facePoint(...radio(PICK)) // the pointer's tip on the picked radio, in root space
const FROM: Vec = [150, 46] // where the pointer comes in from, off the card's lower right

// a result bar: grows out of a round nub at the row's left edge to its share of the track, and draws back the same way
const bar = (i: number): Layer => {
  const y = ROWS[i]
  const n = ORDER.indexOf(i)
  const [start, back] = [FILL + n * LAG, CLEAR + (2 - n) * 4]
  const left: Vec = [TRACK_X + INSET, y + ROW_H / 2]
  return {
    parent: 'card',
    a: left,
    p: left,
    ip: start,
    op: back + CLEAR_LEN + 1,
    s: outAndBack<Vec>([0, 100], [100, 100], start, 6, back + CLEAR_LEN - 6, 6),
    shapes: [
      {
        d: outAndBack(pill(left[0], y + INSET, BAR_H, BAR_H), pill(left[0], y + INSET, Math.round((TRACK_W - INSET * 2) * SHARE[i]), BAR_H), start, FILL_LEN, back, CLEAR_LEN),
        fill: i === PICK ? 'main' : 'tint',
        depth: 0.3,
      },
    ],
  }
}

const pollVote: Icon = {
  name: 'poll-vote',
  frames: 180,
  still: 124,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [252, 252], m: { p: outAndBack<Vec>([0, 0], [2, 5], TAP - 4, 4, TAP, 16) }, shapes: [] },
    {
      id: 'card',
      parent: 'root',
      tilt: FACE,
      shapes: [
        { d: rect(-140, -150, 280, 284, 26), fill: 'white', depth: 1 },
        { d: ellipse(-108, -112, 18), fill: 'deep', depth: 0.4 },
        { d: line([-76, -120], [52, -120]) },
        { d: line([-76, -100], [10, -100]) },
        ...[0, 2].flatMap((i) => [
          { d: ellipse(...radio(i), RADIO_R), fill: 'white' as const, depth: 0.3 },
          { d: pill(TRACK_X, ROWS[i], TRACK_W, ROW_H), fill: 'paper' as const, depth: 0.2 },
        ]),
      ],
    },
    // the picked row sinks under the tap and comes back up
    {
      id: 'picked',
      parent: 'card',
      m: { p: outAndBack<Vec>([0, 0], PUSH, TAP - 4, 4, TAP, 12) },
      shapes: [
        { d: ellipse(...radio(PICK), RADIO_R), fill: 'white', depth: 0.3 },
        { d: pill(TRACK_X, ROWS[PICK], TRACK_W, ROW_H), fill: 'paper', depth: 0.2 },
      ],
    },
    // the radio fills on the frame the pointer lands
    { parent: 'picked', a: radio(PICK), p: radio(PICK), m: popIn(TAP, EMPTY), shapes: [{ d: ellipse(...radio(PICK), RADIO_R - 4), fill: 'main', line: false }] },
    ...[0, 2].map(bar),
    { ...bar(PICK), parent: 'picked' },
    // the pointer glides in to the radio, taps, and leaves along the path it came in on
    {
      parent: 'root',
      p: TARGET,
      m: [
        { p: outAndBack<Vec>(FROM, [0, 0], GLIDE, TAP - 4 - GLIDE, LEAVE, 26) },
        { p: outAndBack<Vec>([0, 0], [2, 5], TAP - 4, 4, TAP, 12) },
        { s: popScale(0, LEAVE + 12) },
      ],
      shapes: [{ d: CURSOR(0, 0), fill: 'white', depth: 0.5 }],
    },
    glow('root', [176, -96], 24, popIn(FILL + FILL_LEN - 6, CLEAR - 6)),
    glow('root', [-178, 112], 16, popIn(FILL + FILL_LEN, CLEAR)),
  ],
}

export default pollVote
