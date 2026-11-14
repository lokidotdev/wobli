// Language Learning
import { ellipse, line, rect } from '../engine.ts'
import { SNAP, sparkle } from '../motions.ts'
import { EXT, FACE, LINE, bubble, facePoint, glow, hit } from '../parts.ts'
import type { Icon, Layer, Shape, Track, Vec } from '../engine.ts'

// Two speech bubbles talk across: the white one says "Hi", the dark reply says "Hola". The two words lift out and swap bubbles
// on crossing arcs, "Hi" over the top and "Hola" underneath; each bubble takes its new word on the frame it lands, with a sparkle
// on the beat. After the hold the words cross back along the same arcs and the bubbles take them home.
const ASK = { x: -185, y: -150, w: 240, h: 100 } // the white bubble, tail left
const REPLY = { x: -55, y: 30, w: 240, h: 100 } // the dark reply, tail right
const ASK_MID: Vec = [ASK.x + ASK.w / 2, ASK.y + ASK.h / 2]
const REPLY_MID: Vec = [REPLY.x + REPLY.w / 2, REPLY.y + REPLY.h / 2]
const PLATE_H = 62
const WORD = 6 // letter stroke

const SWAP = 8 // the words lift out
const FLIGHT = 30
const LAND = SWAP + FLIGHT // each word is in the other bubble
const BACK = 104 // the words cross back
const HOME = BACK + FLIGHT

// a word's crossing in the root's space, bowed to one side of the straight line between the bubbles; the way back retraces it
const [A, B] = [facePoint(...ASK_MID), facePoint(...REPLY_MID)]
const D: Vec = [B[0] - A[0], B[1] - A[1]]
const BOW: Vec = [D[1] * 0.45, -D[0] * 0.45] // square to the crossing, up and to the right
const cross = (from: Vec, to: Vec, side: number): Track<Vec> => {
  const d: Vec = [to[0] - from[0], to[1] - from[1]]
  const bow: Vec = [BOW[0] * side, BOW[1] * side]
  const there: readonly [Vec, Vec] = [[d[0] * 0.25 + bow[0], d[1] * 0.25 + bow[1]], [-d[0] * 0.25 + bow[0], -d[1] * 0.25 + bow[1]]]
  const home: readonly [Vec, Vec] = [[-d[0] * 0.25 + bow[0], -d[1] * 0.25 + bow[1]], [d[0] * 0.25 + bow[0], d[1] * 0.25 + bow[1]]]
  return [[SWAP, from, SNAP, there], [LAND, to, 0], [BACK, to, SNAP, home], [HOME, from]]
}

// "Hi" on a pink plate, drawn about its centre
const hi = ([x, y]: Vec): ReadonlyArray<Shape> => [
  { d: rect(x - 48, y - PLATE_H / 2, 96, PLATE_H, 18), fill: 'main', depth: 0.5 },
  { d: line([x - 26, y - 17], [x - 26, y + 17]), line: WORD },
  { d: line([x - 2, y - 17], [x - 2, y + 17]), line: WORD },
  { d: line([x - 26, y], [x - 2, y]), line: WORD },
  { d: line([x + 22, y - 3], [x + 22, y + 17]), line: WORD },
  { d: ellipse(x + 22, y - 14, 4.5), fill: 'ink', line: false },
]

// "Hola" on a gold plate, drawn about its centre
const hola = ([x, y]: Vec): ReadonlyArray<Shape> => {
  const x0 = x - 52
  return [
    { d: rect(x - 76, y - PLATE_H / 2, 152, PLATE_H, 18), fill: 'gold', depth: 0.5 },
    { d: line([x0, y - 17], [x0, y + 17]), line: WORD },
    { d: line([x0 + 22, y - 17], [x0 + 22, y + 17]), line: WORD },
    { d: line([x0, y], [x0 + 22, y]), line: WORD },
    { d: ellipse(x0 + 44, y + 7, 10), line: WORD },
    { d: line([x0 + 66, y - 17], [x0 + 66, y + 17]), line: WORD },
    { d: ellipse(x0 + 87, y + 7, 10), line: WORD },
    { d: line([x0 + 98, y - 3], [x0 + 98, y + 17]), line: WORD },
  ]
}

// a word plate: rests in its own bubble, crosses to the other and lands with it
const plate = (mid: Vec, shapes: ReadonlyArray<Shape>, path: Track<Vec>): Layer => ({
  parent: 'root',
  tilt: FACE,
  a: mid,
  p: path,
  m: [hit(LAND, [2, 6], 0.6), hit(HOME, [2, 6], 0.6)],
  shapes,
})

const languageLearning: Icon = {
  name: 'language-learning',
  frames: 210,
  still: 84,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [250, 262], shapes: [] },
    // each bubble takes the word that lands in it, a beat behind the word
    {
      parent: 'root',
      tilt: FACE,
      m: [hit(LAND + 2, [2, 5], 0.6), hit(HOME + 2, [2, 5], 0.6)],
      shapes: [{ d: bubble(ASK.x, ASK.y, ASK.w, ASK.h, 'left', 28), fill: 'white', depth: 0.8 }],
    },
    {
      parent: 'root',
      tilt: FACE,
      m: [hit(LAND + 2, [2, 5], 0.6), hit(HOME + 2, [2, 5], 0.6)],
      shapes: [{ d: bubble(REPLY.x, REPLY.y, REPLY.w, REPLY.h, 'right', 28), fill: 'deep', depth: 0.8 }],
    },
    plate(REPLY_MID, hola(REPLY_MID), cross(B, A, -1)),
    plate(ASK_MID, hi(ASK_MID), cross(A, B, 1)),
    glow('root', [178, -118], 22, sparkle(LAND)),
    glow('root', [-186, 118], 15, sparkle(LAND + 8)),
  ],
}

export default languageLearning
