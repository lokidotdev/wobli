// Translate Message
import { line, pill, rect } from '../engine.ts'
import { IN, SOFT } from '../motions.ts'
import { EXT, FACE, LINE, bubble, facePoint, glow, hit, outAndBack, popIn } from '../parts.ts'
import type { Icon, Layer, Shape, Track, Vec } from '../engine.ts'

// A white message with a Latin "A" on its chip lifts off the face and flips over on its middle; the back lands as a dark bubble
// with a "文" chip, takes the landing and its lines write in one after another. After the hold it lifts and flips back the same
// way, the original lines write in again and it settles where it began.
const BOX = { x: -140, y: -104, w: 280, h: 164 }
const MID: Vec = facePoint(BOX.x + BOX.w / 2, BOX.y + BOX.h / 2) // the flip's hinge: the bubble's centre on screen
const LIFT = 8 // rises off the face
const FLIP = 14 // the front starts to turn away
const EDGE = FLIP + 8 // edge on: the front is gone, the back starts to show
const LAND = EDGE + 14 // the back is flat and set down
const AGAIN = 130 // the return flip, the same beats again
const AGAIN_EDGE = AGAIN + 8
const AGAIN_LAND = AGAIN_EDGE + 14
const RISE: Vec = [0, -20]

// the glyph chip, top left on both sides
const CHIP = { x: -112, y: -78, w: 64, h: 64 }
const CHIP_MID: Vec = [CHIP.x + CHIP.w / 2, CHIP.y + CHIP.h / 2]
const A_GLYPH = [
  line([CHIP_MID[0] - 16, CHIP_MID[1] + 18], [CHIP_MID[0], CHIP_MID[1] - 18], [CHIP_MID[0] + 16, CHIP_MID[1] + 18]),
  line([CHIP_MID[0] - 9, CHIP_MID[1] + 5], [CHIP_MID[0] + 9, CHIP_MID[1] + 5]),
]
const WEN_GLYPH = [
  line([CHIP_MID[0], CHIP_MID[1] - 21], [CHIP_MID[0], CHIP_MID[1] - 13]),
  line([CHIP_MID[0] - 19, CHIP_MID[1] - 8], [CHIP_MID[0] + 19, CHIP_MID[1] - 8]),
  line([CHIP_MID[0] - 11, CHIP_MID[1] - 3], [CHIP_MID[0] + 17, CHIP_MID[1] + 20]),
  line([CHIP_MID[0] + 11, CHIP_MID[1] - 3], [CHIP_MID[0] - 17, CHIP_MID[1] + 20]),
]

// the text: [x, y, width] for each line, left aligned so it writes in from the left
const FRONT_LINES: ReadonlyArray<readonly [number, number, number]> = [[-30, -72, 132], [-30, -42, 92], [-112, 2, 214], [-112, 30, 140]]
const BACK_LINES: ReadonlyArray<readonly [number, number, number]> = [[-30, -72, 104], [-30, -42, 128], [-112, 2, 176], [-112, 30, 196]]
const LINE_H = 14

// one line of text, growing from its left end once its side faces up
const textLine = (parent: string, [x, y, w]: readonly [number, number, number], fill: Shape['fill'], grow: Track<Vec>): Layer => ({
  parent,
  a: [x, y + LINE_H / 2],
  p: [x, y + LINE_H / 2],
  s: grow,
  shapes: [{ d: pill(x, y, w, LINE_H), fill, depth: 0.3 }],
})
const writeIn = (start: number): Track<Vec> => [[start, [0, 100], SOFT], [start + 14, [100, 100]]]

const translateMessage: Icon = {
  name: 'translate-message',
  frames: 210,
  still: 96,
  line: LINE,
  extrude: EXT,
  layers: [
    {
      id: 'root',
      p: [262, 268],
      m: [
        { p: [...outAndBack<Vec>([0, 0], RISE, LIFT, 10, LAND - 10, 10), ...outAndBack<Vec>([0, 0], RISE, AGAIN - 6, 10, AGAIN_LAND - 10, 10)] },
        hit(LAND, [0, 7], 0.5),
        hit(AGAIN_LAND, [0, 7], 0.5),
      ],
      shapes: [],
    },
    // the front: turns away on IN, comes back on SOFT, its mirror
    {
      id: 'front',
      parent: 'root',
      a: MID,
      p: MID,
      s: [[FLIP, [100, 100], IN], [EDGE, [0, 100], 0], [AGAIN_EDGE, [0, 100], SOFT], [AGAIN_LAND, [100, 100]]],
      shapes: [],
    },
    {
      id: 'frontFace',
      parent: 'front',
      tilt: FACE,
      shapes: [
        { d: bubble(BOX.x, BOX.y, BOX.w, BOX.h, 'left', 30), fill: 'white', depth: 1 },
        { d: rect(CHIP.x, CHIP.y, CHIP.w, CHIP.h, 16), fill: 'main', depth: 0.5 },
        ...A_GLYPH.map((d): Shape => ({ d })),
      ],
    },
    ...FRONT_LINES.map((l, i) =>
      textLine('frontFace', l, 'grey', [[0, [100, 100], 0], [EDGE + 1, [0, 100], 0], ...writeIn(AGAIN_EDGE + 6 + i * 4)]),
    ),
    // the back: shows from the edge on, lands flat, turns away again on the return
    {
      id: 'back',
      parent: 'root',
      a: MID,
      p: MID,
      s: [[EDGE, [0, 100], SOFT], [LAND, [100, 100], 0], [AGAIN, [100, 100], IN], [AGAIN_EDGE, [0, 100]]],
      shapes: [],
    },
    {
      id: 'backFace',
      parent: 'back',
      tilt: FACE,
      shapes: [
        { d: bubble(BOX.x, BOX.y, BOX.w, BOX.h, 'left', 30), fill: 'deep', depth: 1 },
        { d: rect(CHIP.x, CHIP.y, CHIP.w, CHIP.h, 16), fill: 'main', depth: 0.5 },
        ...WEN_GLYPH.map((d): Shape => ({ d })),
      ],
    },
    ...BACK_LINES.map((l, i) => textLine('backFace', l, 'white', writeIn(EDGE + 6 + i * 4))),
    glow('root', [150, -150], 22, popIn(LAND + 2, AGAIN - 10)),
  ],
}

export default translateMessage
