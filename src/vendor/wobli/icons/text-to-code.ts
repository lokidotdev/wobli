// Text to Code
import { line, pill, rect } from '../engine.ts'
import { IN, SOFT } from '../motions.ts'
import { EXT, FACE, LINE, facePoint, glow, hit, outAndBack, popIn } from '../parts.ts'
import type { Icon, Layer, Shape, Track, Vec } from '../engine.ts'

// A white card holding a written sentence takes a spark on its "T" chip, lifts and tips over on its middle, top edge first;
// the back lands as a dark code block with a "</>" chip, takes the landing, and its indented rows of tokens type in one after
// another. After the hold it lifts and tips back the same way, the sentence writes in again and the card settles where it began.
const BOX = { x: -150, y: -110, w: 300, h: 200 }
const MID: Vec = facePoint(BOX.x + BOX.w / 2, BOX.y + BOX.h / 2) // the tip's hinge: the card's centre on screen
const SPARK = 4 // the prompt: a spark on the chip
const LIFT = 10 // rises off the face
const FLIP = 16 // the front starts to tip away
const EDGE = FLIP + 8 // edge on: the front is gone, the back starts to show
const LAND = EDGE + 14 // the back is flat and set down
const AGAIN = 118 // the return tip, the same beats again
const AGAIN_EDGE = AGAIN + 8
const AGAIN_LAND = AGAIN_EDGE + 14
const RISE: Vec = [0, -22]

// the glyph chip, top left on both sides
const CHIP = { x: -122, y: -82, w: 64, h: 64 }
const CM: Vec = [CHIP.x + CHIP.w / 2, CHIP.y + CHIP.h / 2]
const T_GLYPH = [line([CM[0] - 16, CM[1] - 16], [CM[0] + 16, CM[1] - 16]), line([CM[0], CM[1] - 16], [CM[0], CM[1] + 18])]
const CODE_GLYPH = [
  line([CM[0] - 10, CM[1] - 13], [CM[0] - 22, CM[1]], [CM[0] - 10, CM[1] + 13]),
  line([CM[0] + 5, CM[1] - 17], [CM[0] - 5, CM[1] + 17]),
  line([CM[0] + 10, CM[1] - 13], [CM[0] + 22, CM[1]], [CM[0] + 10, CM[1] + 13]),
]

const LINE_H = 14
type Row = readonly [x: number, y: number, tokens: ReadonlyArray<readonly [w: number, fill: Shape['fill']]>]
// the sentence: plain grey lines, left aligned
const TEXT_ROWS: ReadonlyArray<Row> = [
  [-40, -76, [[150, 'grey']]],
  [-40, -46, [[104, 'grey']]],
  [-122, 0, [[236, 'grey']]],
  [-122, 30, [[168, 'grey']]],
]
// the code: a keyword token then the rest, indented like a block
const CODE_ROWS: ReadonlyArray<Row> = [
  [-40, -76, [[44, 'main'], [92, 'white']]],
  [-40, -46, [[66, 'white'], [34, 'main']]],
  [-90, 0, [[36, 'main'], [138, 'white']]],
  [-122, 30, [[56, 'white']]],
]

// one row, growing from its left end once its side faces up
const row = (parent: string, [x, y, tokens]: Row, grow: Track<Vec>): Layer => {
  let at = x
  const shapes = tokens.map(([w, fill]): Shape => {
    const s = { d: pill(at, y, w, LINE_H), fill, depth: 0.3 }
    at += w + 10
    return s
  })
  return { parent, a: [x, y + LINE_H / 2], p: [x, y + LINE_H / 2], s: grow, shapes }
}
const writeIn = (start: number): Track<Vec> => [[start, [0, 100], SOFT], [start + 12, [100, 100]]]

const textToCode: Icon = {
  name: 'text-to-code',
  frames: 180,
  still: 96,
  line: LINE,
  extrude: EXT,
  layers: [
    {
      id: 'root',
      p: [256, 262],
      m: [
        { p: [...outAndBack<Vec>([0, 0], RISE, LIFT, 10, LAND - 10, 10), ...outAndBack<Vec>([0, 0], RISE, AGAIN - 6, 10, AGAIN_LAND - 10, 10)] },
        hit(LAND, [0, 7], 0.4),
        hit(AGAIN_LAND, [0, 7], 0.4),
      ],
      shapes: [],
    },
    // the front: tips away on IN, comes back on SOFT, its mirror
    {
      id: 'front',
      parent: 'root',
      a: MID,
      p: MID,
      s: [[FLIP, [100, 100], IN], [EDGE, [100, 0], 0], [AGAIN_EDGE, [100, 0], SOFT], [AGAIN_LAND, [100, 100]]],
      shapes: [],
    },
    {
      id: 'frontFace',
      parent: 'front',
      tilt: FACE,
      shapes: [
        { d: rect(BOX.x, BOX.y, BOX.w, BOX.h, 28), fill: 'white', depth: 1 },
        { d: rect(CHIP.x, CHIP.y, CHIP.w, CHIP.h, 16), fill: 'main', depth: 0.5 },
        ...T_GLYPH.map((d): Shape => ({ d })),
      ],
    },
    ...TEXT_ROWS.map((r, i) => row('frontFace', r, [[0, [100, 100], 0], [EDGE + 1, [0, 100], 0], ...writeIn(AGAIN_EDGE + 6 + i * 4)])),
    // the back: shows from the edge on, lands flat, tips away again on the return
    {
      id: 'back',
      parent: 'root',
      a: MID,
      p: MID,
      s: [[EDGE, [100, 0], SOFT], [LAND, [100, 100], 0], [AGAIN, [100, 100], IN], [AGAIN_EDGE, [100, 0]]],
      shapes: [],
    },
    {
      id: 'backFace',
      parent: 'back',
      tilt: FACE,
      shapes: [
        { d: rect(BOX.x, BOX.y, BOX.w, BOX.h, 28), fill: 'deep', depth: 1 },
        { d: rect(CHIP.x, CHIP.y, CHIP.w, CHIP.h, 16), fill: 'main', depth: 0.5 },
        ...CODE_GLYPH.map((d): Shape => ({ d })),
      ],
    },
    ...CODE_ROWS.map((r, i) => row('backFace', r, writeIn(LAND + 4 + i * 5))),
    // the prompt lands on the chip, the result gets one sparkle
    glow('root', facePoint(CHIP.x - 6, CHIP.y - 8), 18, popIn(SPARK, FLIP + 4)),
    glow('root', [158, -150], 24, popIn(LAND + 6, AGAIN - 10)),
  ],
}

export default textToCode
