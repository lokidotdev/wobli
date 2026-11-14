// Ad Click
import { line, pill, rect, star } from '../engine.ts'
import { CURSOR, EXT, FACE, LINE, facePoint, glow, numeral, outAndBack, popIn, popScale, wave } from '../parts.ts'
import type { Icon, Track, Vec } from '../engine.ts'

// An ad card waits with its banner under the click counter. The pointer glides in and clicks the banner's button: the
// button sinks under the press, the banner gives a beat after, and a ripple leaves the tip on the same frame. The counter
// answers: its rising chip pops up and the count ticks from 41 to 42, with two sparkles on the beat. The pointer leaves the
// way it came, and after the hold the chip pops away and the count ticks back, so the loop closes on the quiet card.
const CTA = { x: -6, y: 12, w: 104, h: 42 } // the banner's button on the face
const CTA_MID: Vec = [CTA.x + CTA.w / 2, CTA.y + CTA.h / 2]
const PUSH: Vec = [-1.3, 6] // a third of the extrusion: the button sinks along its own side
const GIVE: Vec = [-0.4, 2.5] // the banner gives a little after it
const TAP_KNOCK: Vec = [2, 5] // the pointer presses in

const GLIDE = 6 // the pointer sets off
const TAP = 36 // it lands on the button: the button sinks, the ripple leaves
const TICK = TAP + 8 // the counter answers
const LEAVE = 72 // the pointer heads home
const BACK = 132 // the chip pops away
const UNTICK = BACK + 6 // the count ticks back

const TARGET = facePoint(CTA_MID[0] + 8, CTA_MID[1] + 2) // the pointer's tip on the button, in root space
const FROM: Vec = [104, 112] // where the pointer comes in from, off the card's lower right

// the counter: a fixed tens digit and a units digit that ticks
const DIGIT_W = 22
const DIGIT_H = 38
const DIGIT_Y = -145
const TENS_X = 44
const UNITS_X = TENS_X + DIGIT_W + 12
const units = (n: number) => numeral(n, UNITS_X, DIGIT_Y, DIGIT_W, DIGIT_H)
const COUNT: Track<string> = [[0, units(1), 0], [TICK, units(2), 0], [UNTICK, units(1), 0], [180, units(1)]]

const CHIP: Vec = [6, -126]

const adClick: Icon = {
  name: 'ad-click',
  frames: 180,
  still: 120,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [248, 252], shapes: [] },
    {
      id: 'card',
      parent: 'root',
      tilt: FACE,
      shapes: [
        { d: rect(-150, -172, 300, 302, 28), fill: 'white', depth: 1 },
        { d: pill(-124, -137, 46, 22), fill: 'gold', depth: 0.3 }, // the AD tag
        { d: rect(-34, -154, 146, 56, 16), fill: 'paper', depth: 0.3 }, // the counter plate
        { d: numeral(4, TENS_X, DIGIT_Y, DIGIT_W, DIGIT_H), line: 7, round: true },
        { d: COUNT, line: 7, round: true },
      ],
    },
    // the banner: gives a beat after the button sinks
    {
      id: 'banner',
      parent: 'card',
      m: { p: outAndBack<Vec>([0, 0], GIVE, TAP - 2, 4, TAP + 2, 14) },
      shapes: [
        { d: rect(-124, -82, 248, 188, 20), fill: 'main', depth: 0.5 },
        { d: star(-66, -4, 40, 0.48, 5, 3), fill: 'gold', depth: 0.4 },
        { d: line([-8, -48], [92, -48]) },
        { d: line([-8, -26], [56, -26]) },
      ],
    },
    // the button sinks under the click on the frame the pointer lands
    {
      parent: 'banner',
      m: { p: outAndBack<Vec>([0, 0], PUSH, TAP - 4, 4, TAP, 12) },
      shapes: [
        { d: pill(CTA.x, CTA.y, CTA.w, CTA.h), fill: 'white', depth: 0.5 },
        { d: line([CTA.x + 24, CTA_MID[1]], [CTA.x + CTA.w - 24, CTA_MID[1]]) },
      ],
    },
    // the rising chip pops up as the count ticks
    {
      parent: 'card',
      a: CHIP,
      p: CHIP,
      s: popScale(TICK - 2, BACK),
      shapes: [
        { d: pill(CHIP[0] - 28, CHIP[1] - 19, 56, 38), fill: 'ok', depth: 0.4 },
        { d: line([CHIP[0] - 13, CHIP[1] + 7], [CHIP[0], CHIP[1] - 7], [CHIP[0] + 13, CHIP[1] + 7]), line: 6, round: true },
      ],
    },
    wave('root', TARGET, 46, TAP - 8),
    // the pointer glides in to the button, clicks, and leaves along the path it came in on
    {
      parent: 'root',
      p: TARGET,
      m: [
        { p: outAndBack<Vec>(FROM, [0, 0], GLIDE, TAP - 4 - GLIDE, LEAVE, 26) },
        { p: outAndBack<Vec>([0, 0], TAP_KNOCK, TAP - 4, 4, TAP, 12) },
        { s: popScale(0, LEAVE + 12) },
      ],
      shapes: [{ d: CURSOR(0, 0), fill: 'white', depth: 0.5 }],
    },
    glow('root', [172, -128], 24, popIn(TAP + 2, BACK - 8)),
    glow('root', [-180, 64], 16, popIn(TICK + 4, BACK - 2)),
  ],
}

export default adClick
