// Flash Sale Timer
import { ellipse, line, pill, poly, rect } from '../engine.ts'
import { IN, SOFT } from '../motions.ts'
import { EXT, FACE, LINE, buzz, glow, numeral, popIn } from '../parts.ts'
import type { Icon, Layer, Track, Vec } from '../engine.ts'

// The flip clock counts the sale down a second at a time: each card folds shut edge on and opens on the next digit, and the sale
// tag hanging off its corner gives a little shake on every tick, a harder one on the last, with a sparkle. After a long hold the
// cards flip back to where they began, the tens card a beat behind the ones, and the clock stands still for the seam.
const CARD: Record<'tens' | 'ones', Vec> = { tens: [-52, 6], ones: [52, 6] }
const CARD_W = 86
const CARD_H = 112
const DIGIT_W = 36
const DIGIT_H = 60
const PIN: Vec = [128, -66] // where the tag's string is tied: it swings about here

const TICKS = [16, 44, 72] // the count reaches 09, 08, 07
const LAST = TICKS[TICKS.length - 1]
const RESET = 140 // the cards flip back to 10
const LAG = 5 // the tens card follows the ones
const SHUT = 5 // frames to fold edge on
const OPEN = 8 // frames to open on the new digit

// the ones card shows 0 then counts 9, 8, 7; the tens card goes 1 then 0
const ONES = [0, 9, 8, 7]
const TENS = [1, 0]

// one flip per tick: shut on IN, the digit swaps edge on, open on SOFT
const flips = (ticks: ReadonlyArray<number>): Track<Vec> => [
  [0, [100, 100], 0],
  ...ticks.flatMap((t) => [[t - SHUT, [100, 100], IN], [t, [100, 0], SOFT], [t + OPEN, [100, 100], 0]] as const),
  [180, [100, 100]],
]
const digits = (c: Vec, values: ReadonlyArray<number>, ticks: ReadonlyArray<number>): Track<string> => {
  const d = (n: number) => numeral(n, c[0] - DIGIT_W / 2, c[1] - DIGIT_H / 2, DIGIT_W, DIGIT_H)
  return [[0, d(values[0]), 0], ...ticks.map((t, i) => [t, d(values[(i + 1) % values.length]), 0] as const), [180, d(values[0])]]
}

const card = (c: Vec, values: ReadonlyArray<number>, ticks: ReadonlyArray<number>): ReadonlyArray<Layer> => [
  // the slot the card sits in, seen when it folds edge on
  { parent: 'clock', shapes: [{ d: rect(c[0] - CARD_W / 2 - 6, c[1] - CARD_H / 2 - 6, CARD_W + 12, CARD_H + 12, 18), fill: 'grey', depth: 0.2 }] },
  {
    parent: 'clock',
    a: c,
    p: c,
    s: flips(ticks),
    shapes: [
      { d: rect(c[0] - CARD_W / 2, c[1] - CARD_H / 2, CARD_W, CARD_H, 14), fill: 'white', depth: 0.5 },
      { d: digits(c, values, ticks), line: 9, round: true },
      { d: line([c[0] - CARD_W / 2, c[1]], [c[0] - CARD_W / 2 + 12, c[1]]), line: 4 },
      { d: line([c[0] + CARD_W / 2 - 12, c[1]], [c[0] + CARD_W / 2, c[1]]), line: 4 },
    ],
  },
]

const [PX, PY] = PIN
const TAG = poly([[PX, PY + 24], [PX + 44, PY + 62], [PX + 44, PY + 170], [PX - 44, PY + 170], [PX - 44, PY + 62]], [8, 10, 14, 14, 10])

const flashSaleTimer: Icon = {
  name: 'flash-sale-timer',
  frames: 180,
  still: 110,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [214, 262], shapes: [] },
    {
      id: 'clock',
      parent: 'root',
      tilt: FACE,
      shapes: [
        { d: pill(-34, -110, 68, 34), fill: 'grey', depth: 0.8 },
        { d: rect(-136, -92, 272, 196, 32), fill: 'main', depth: 1 },
      ],
    },
    ...card(CARD.ones, ONES, [...TICKS, RESET]),
    ...card(CARD.tens, TENS, [TICKS[0] + LAG, RESET + LAG]),
    // the tag, shaking about the knot on every tick, hardest on the last
    {
      id: 'shake',
      parent: 'clock',
      a: PIN,
      p: PIN,
      m: { r: [...TICKS.slice(0, -1).flatMap((t) => buzz(t + 1, 6, 3).r as Track<number>), ...(buzz(LAST + 1, 10, 6).r as Track<number>)] },
      shapes: [],
    },
    {
      parent: 'shake',
      a: PIN,
      p: PIN,
      r: -28,
      shapes: [
        { d: line([PX, PY], [PX, PY + 52]), line: 5, round: true },
        { d: TAG, fill: 'hot', depth: 0.8 },
        { d: ellipse(PX, PY + 60, 9), fill: 'white', line: 4 },
        { d: line([PX + 14, PY + 98], [PX - 14, PY + 142]), line: 6, round: true },
        { d: ellipse(PX - 12, PY + 104, 7), fill: 'white', line: 4 },
        { d: ellipse(PX + 12, PY + 136, 7), fill: 'white', line: 4 },
      ],
    },
    { parent: 'clock', shapes: [{ d: ellipse(PX, PY, 9), fill: 'grey', depth: 0.6 }] },
    glow('root', [214, -104], 20, popIn(LAST + 4, RESET - 36)),
  ],
}

export default flashSaleTimer
