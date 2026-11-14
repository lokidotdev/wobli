// Language Switch
import { bezier, ellipse, line, pill, rect } from '../engine.ts'
import { IN, SOFT } from '../motions.ts'
import { EXT, FACE, LINE, facePoint, glow, outAndBack, popIn, outIn } from '../parts.ts'
import type { Ease, Icon, Layer, Shape, Track, Vec } from '../engine.ts'

// A settings card with a language toggle: the knob slides across, and the globe above the card rolls two meridians round on
// the same ease. The card's "A" chip pops out for a "文", its lines shrink back and the translated lines grow in, one after
// another. After the hold the knob slides home, the globe rolls back the way it came and the original text returns.
const CARD = { x: -150, y: -104, w: 300, h: 218 }
const CHIP = { x: -122, y: -78, w: 64, h: 64 }
const CHIP_MID: Vec = [CHIP.x + CHIP.w / 2, CHIP.y + CHIP.h / 2]
const TRACK = { x: -122, y: 52, w: 150, h: 40 }
const KNOB = { x: TRACK.x + 5, y: TRACK.y + 5, w: 70, h: 30 }
const KNOB_TO: Vec = facePoint(TRACK.w - KNOB.w - 10, 0) // the knob's slide along the face

const TAP = 8 // the knob starts across
const TAP_LEN = 14
const SWAP = TAP + 10 // the text starts to change as the knob lands
const BACK = 118 // the knob starts home
const UNSWAP = BACK + 10

// the globe: untilted, floating over the card
const GLOBE_R = 58
const GLOBE: Vec = [96, -158]
const AXIS = -20 // the globe's axis leans like a desk globe
const ROLL = 90 // two meridian steps, so the end pose is the start pose
const SPIN_LEN = 40

// a meridian's front half at longitude lon, as one 13 point line so every one morphs into every other
const meridian = (lon: number): string => {
  const l = ((((((lon + 90) % 180) + 180) % 180) - 90) * Math.PI) / 180 // wrapped onto the front half
  return line(
    ...Array.from({ length: 13 }, (_, i): Vec => {
      const lat = ((i * 15 - 90) * Math.PI) / 180
      return [GLOBE_R * Math.cos(lat) * Math.sin(l), -GLOBE_R * Math.sin(lat)]
    }),
  )
}
const MERIDIANS = [-90, -45, 0, 45] // spaced 45 apart; one leaving the right rim comes back in on the left
// longitude offset per frame, walked on the given ease: per frame keys so the meridians stay on the sphere
const roll = (k: number, start: number, from: number, to: number, ease: Ease): Track<string> => {
  const y = bezier(...ease)
  return Array.from({ length: SPIN_LEN + 1 }, (_, i) => [start + i, meridian(MERIDIANS[k] + from + (to - from) * y(i / SPIN_LEN)), 0] as const)
}
const SPIN_OUT = TAP + 4
const SPIN_BACK = BACK + 4

// glyphs, ink strokes in the chip
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

// the text: [x, y, width] per line, left aligned so it grows from the left
type Row = readonly [number, number, number]
const FIRST: ReadonlyArray<Row> = [[-38, -74, 136], [-38, -44, 92], [-122, 6, 232], [-122, 30, 0]]
const SECOND: ReadonlyArray<Row> = [[-38, -74, 98], [-38, -44, 130], [-122, 6, 176], [-122, 30, 0]]
const ROWS_A = FIRST.filter((r) => r[2] > 0)
const ROWS_B = SECOND.filter((r) => r[2] > 0)
const LINE_H = 14

const textLine = (parent: string, [x, y, w]: Row, s: Track<Vec>): Layer => ({
  parent,
  a: [x, y + LINE_H / 2],
  p: [x, y + LINE_H / 2],
  s,
  shapes: [{ d: pill(x, y, w, LINE_H), fill: 'grey', depth: 0.3 }],
})
const SHOWN: Vec = [100, 100]
const GONE: Vec = [0, 100]

const languageSwitch: Icon = {
  name: 'language-switch',
  frames: 180,
  still: 84,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [244, 300], shapes: [] },
    {
      id: 'card',
      parent: 'root',
      tilt: FACE,
      shapes: [
        { d: rect(CARD.x, CARD.y, CARD.w, CARD.h, 26), fill: 'white', depth: 1 },
        { d: rect(CHIP.x, CHIP.y, CHIP.w, CHIP.h, 16), fill: 'main', depth: 0.5 },
        { d: rect(TRACK.x, TRACK.y, TRACK.w, TRACK.h, 20), fill: 'grey', depth: 0.3 },
      ],
    },
    // the knob slides across on SOFT and home on IN
    {
      parent: 'root',
      p: outAndBack<Vec>([0, 0], KNOB_TO, TAP, TAP_LEN, BACK),
      id: 'knobRide',
      shapes: [],
    },
    { parent: 'knobRide', tilt: FACE, shapes: [{ d: rect(KNOB.x, KNOB.y, KNOB.w, KNOB.h, 15), fill: 'deep', depth: 0.6 }] },
    // the chip's glyphs swap by scale around the chip's centre
    { id: 'aRide', parent: 'root', a: facePoint(...CHIP_MID), p: facePoint(...CHIP_MID), m: outIn(TAP, BACK + 26), shapes: [] },
    { parent: 'aRide', tilt: FACE, shapes: A_GLYPH.map((d): Shape => ({ d })) },
    { id: 'wenRide', parent: 'root', a: facePoint(...CHIP_MID), p: facePoint(...CHIP_MID), m: popIn(TAP + 26, BACK), shapes: [] },
    { parent: 'wenRide', tilt: FACE, shapes: WEN_GLYPH.map((d): Shape => ({ d })) },
    ...ROWS_A.map((r, i) =>
      textLine('card', r, [[SWAP + i * 3, SHOWN, IN], [SWAP + 8 + i * 3, GONE, 0], [UNSWAP + 10 + i * 4, GONE, SOFT], [UNSWAP + 24 + i * 4, SHOWN]]),
    ),
    ...ROWS_B.map((r, i) =>
      textLine('card', r, [[0, GONE, 0], [SWAP + 10 + i * 4, GONE, SOFT], [SWAP + 24 + i * 4, SHOWN, 0], [UNSWAP + i * 3, SHOWN, IN], [UNSWAP + 8 + i * 3, GONE]]),
    ),
    // the globe: a slab disc, its lines clipped to it, leaning on its axis
    { id: 'globeRide', parent: 'root', p: GLOBE, r: AXIS, shapes: [] },
    { id: 'globe', parent: 'globeRide', shapes: [{ d: ellipse(0, 0, GLOBE_R), fill: 'deep', depth: 1 }] },
    {
      parent: 'globeRide',
      clip: 'globe',
      shapes: [
        { d: line([-GLOBE_R, 0], [GLOBE_R, 0]) },
        { d: line([-GLOBE_R, -30], [GLOBE_R, -30]) },
        { d: line([-GLOBE_R, 30], [GLOBE_R, 30]) },
        ...MERIDIANS.map((_, k): Shape => ({ d: [...roll(k, SPIN_OUT, 0, ROLL, SOFT), ...roll(k, SPIN_BACK, ROLL, 0, IN)] })),
      ],
    },
    glow('root', [-170, -170], 20, popIn(SWAP + 26, BACK - 6)),
    glow('root', [190, -40], 16, popIn(SWAP + 32, BACK - 2)),
  ],
}

export default languageSwitch
