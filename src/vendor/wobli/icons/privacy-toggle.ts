// Privacy Toggle
import { ellipse, line, pill, rect } from '../engine.ts'
import { EXT, FACE, glow, LINE, numeral, outAndBack, outIn, popIn } from '../parts.ts'
import type { Icon, Layer, Shape, Track, Vec } from '../engine.ts'

// The eye button on the card's corner sinks under a tap and the eye shuts as a slash strikes through it. The card number answers
// group by group, left to right: digits shrink away and masking dots pop into their pills, the last four stay readable. After a
// long hold a second tap opens the eye, the slash draws back and the digits return in the same order.
const PRESS = 10 // the first tap
const CLOSE = 14 // the eye shuts
const MASK = 20 // the first group starts to hide
const GAP = 6 // each next group follows this much later
const SWAP = 12 // dots pop in this long after the digits start out
const PRESS_BACK = 108 // the second tap
const OPEN = 112 // the eye opens
const UNMASK = 116 // the first group shows again
const EYE: Vec = [148, -96] // the button's centre on the card's top right corner
const ROW_Y = 6 // the number row
const PILL = { w: 62, h: 34 }
const pillX = (i: number) => -134 + i * 68 + PILL.w / 2

// the eye outline: open it is an almond, shut the top lid lies down on the bottom one; one builder so the keys morph
const eye = (open: boolean): string => {
  const [x, y] = EYE
  const top = open ? -22 : 8
  const bottom = open ? 22 : 22
  return `M${x - 28} ${y + 4}C${x - 14} ${y + top} ${x + 14} ${y + top} ${x + 28} ${y + 4}C${x + 14} ${y + bottom} ${x - 14} ${y + bottom} ${x - 28} ${y + 4}Z`
}
const EYE_OPEN = eye(true)
const EYE_SHUT = eye(false)
const SLASH_START: Vec = [EYE[0] - 36 * Math.cos(Math.PI * 50 / 180), EYE[1] - 36 * Math.sin(Math.PI * 50 / 180)]
const PUPIL: Vec = [EYE[0], EYE[1] + 4]

// a press into the button's own side and back, without overshoot, for both taps
const PUSH: Vec = [-1.5, 7]
const TAPS: Track<Vec> = [...outAndBack<Vec>([0, 0], PUSH, PRESS, 5, PRESS + 6, 8), ...outAndBack<Vec>([0, 0], PUSH, PRESS_BACK, 5, PRESS_BACK + 6, 8)]

// one group of the card number: two digits that hide, and three dots that stand in for them
const digits = (i: number, a: number, b: number): Layer => {
  const c: Vec = [pillX(i), ROW_Y]
  return {
    parent: 'card',
    a: c,
    p: c,
    m: outIn(MASK + i * GAP, UNMASK + i * GAP + SWAP),
    shapes: [
      { d: numeral(a, c[0] - 17, c[1] - 9, 12, 18), line: 4 },
      { d: numeral(b, c[0] + 5, c[1] - 9, 12, 18), line: 4 },
    ],
  }
}
const dots = (i: number): Layer => {
  const c: Vec = [pillX(i), ROW_Y]
  return {
    parent: 'card',
    a: c,
    p: c,
    m: popIn(MASK + i * GAP + SWAP, UNMASK + i * GAP),
    shapes: [-15, 0, 15].map((dx): Shape => ({ d: ellipse(c[0] + dx, c[1], 5.5), fill: 'ink', line: false })),
  }
}

const privacyToggle: Icon = {
  name: 'privacy-toggle',
  frames: 180,
  still: 90,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [240, 262], shapes: [] },
    {
      id: 'card',
      parent: 'root',
      tilt: FACE,
      shapes: [
        { d: rect(-156, -100, 312, 200, 22), fill: 'main', depth: 0.6 },
        { d: rect(-134, -70, 46, 34, 8), fill: 'white', depth: 0.25 },
        ...[0, 1, 2, 3].map((i): Shape => ({ d: pill(pillX(i) - PILL.w / 2, ROW_Y - PILL.h / 2, PILL.w, PILL.h), fill: 'white', depth: 0.3 })),
        { d: line([-130, 62], [-46, 62]) },
        { d: line([60, 62], [96, 62]) },
      ],
    },
    // the first three groups hide; the last four digits stay
    digits(0, 4, 5),
    digits(1, 8, 2),
    digits(2, 6, 0),
    ...[0, 1, 2].map(dots),
    {
      parent: 'card',
      shapes: [
        { d: numeral(4, pillX(3) - 17, ROW_Y - 9, 12, 18), line: 4 },
        { d: numeral(2, pillX(3) + 5, ROW_Y - 9, 12, 18), line: 4 },
      ],
    },
    // the button: a white collar on the card, the deep cap that sinks under the tap
    { parent: 'card', shapes: [{ d: ellipse(EYE[0], EYE[1], 56), fill: 'white', depth: 0.3 }] },
    {
      id: 'button',
      parent: 'card',
      m: { p: TAPS },
      shapes: [{ d: ellipse(EYE[0], EYE[1], 46), fill: 'deep', depth: 0.6 }],
    },
    { id: 'eye', parent: 'button', shapes: [{ d: outAndBack(EYE_OPEN, EYE_SHUT, CLOSE, 10, OPEN, 10), fill: 'white' }] },
    {
      parent: 'button',
      clip: 'eye',
      a: PUPIL,
      p: PUPIL,
      m: { s: outAndBack<Vec>([100, 100], [100, 0], CLOSE, 8, OPEN + 2, 8) },
      shapes: [{ d: ellipse(PUPIL[0], PUPIL[1], 10), fill: 'ink', line: false }],
    },
    {
      parent: 'button',
      // a white slash, outlined so it reads on the deep cap and over the white eye alike, drawn out from its top end
      a: SLASH_START,
      p: SLASH_START,
      r: 50,
      m: { s: outAndBack<Vec>([0, 0], [100, 100], CLOSE + 2, 14, OPEN, 12) },
      shapes: [{ d: pill(SLASH_START[0], SLASH_START[1] - 5, 72, 10), fill: 'white' }],
    },
    glow('root', [-150, -96], 22, popIn(MASK + 2 * GAP + SWAP + 10, 100)),
  ],
}

export default privacyToggle
