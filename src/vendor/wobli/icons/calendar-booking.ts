// Calendar Booking
import { line, pill, poly, rect } from '../engine.ts'
import { IN, SOFT, spring } from '../motions.ts'
import { CURSOR, EXT, FACE, facePoint, glow, hit, LINE, outAndBack, popIn, popScale } from '../parts.ts'
import type { Icon, Shape, Track, Vec } from '../engine.ts'

// The pointer glides in and taps a date, which sinks under it and fills green. The event card grows out of that date and drops
// to its place at the corner of the calendar, which takes the hit with the spring. The pointer leaves the way it came; after the
// hold the card lifts back into its date, the date clears and the loop closes.
const DATE: Vec = [21, -5] // the tapped day's centre on the calendar face
const EVENT: Vec = [84, 98] // where the event card lands
const TIP = facePoint(DATE[0] + 6, DATE[1] + 4) // the pointer's tip on the date
const FROM: Vec = [130, 70] // where the pointer comes from, off the calendar's right side
const PUSH: Vec = [-1.3, 5.9] // 6px of the extrusion: the date sinks along its own side

const GLIDE = 10 // the pointer sets off
const TAP = 36 // the date goes down
const RELEASE = 42 // and comes up: the booking commits
const GROW = 44 // the card grows out of the date
const LAND = 64 // and lands on the calendar
const LEAVE = 70 // the pointer heads home
const LIFT = 136 // the card rises back into its date
const HOME = 156 // and is gone
const CLEAR = 158 // the date clears

// the card falls out of the date on an ease in, and rises back on its mirror
const BACK: Vec = [DATE[0] - EVENT[0], DATE[1] - EVENT[1]]
const CARD_P: Track<Vec> = [[GROW, BACK, IN], [LAND, [0, 0], 0], [LIFT, [0, 0], SOFT], [HOME, BACK]]
const CARD_S: Track<Vec> = [[GROW, [0, 0], SOFT], [GROW + 12, [100, 100], 0], [HOME - 12, [100, 100], IN], [HOME, [0, 0]]]

const SLOTS = [0, 1, 2, 3].flatMap((c) => [0, 1].map((r): Vec => [-96 + c * 50, -22 + r * 52]))
const card = ([x, y]: Vec): ReadonlyArray<Shape> => [
  { d: rect(x - 70, y - 32, 140, 64, 14), fill: 'white', depth: 0.6 },
  { d: poly([[x - 70, y - 32], [x - 46, y - 32], [x - 46, y + 32], [x - 70, y + 32]], [14, 0, 0, 14]), fill: 'ok', line: 4 },
  { d: line([x - 30, y - 10], [x + 50, y - 10]) },
  { d: line([x - 30, y + 12], [x + 16, y + 12]) },
]

const calendarBooking: Icon = {
  name: 'calendar-booking',
  frames: 180,
  still: 104,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [238, 258], s: [82, 82], shapes: [] },
    {
      id: 'calendar',
      parent: 'root',
      tilt: FACE,
      m: hit(LAND, [2, 8]),
      shapes: [
        { d: rect(-122, -104, 244, 214, 26), fill: 'white', depth: 1 },
        { d: poly([[-122, -104], [122, -104], [122, -44], [-122, -44]], [26, 26, 0, 0]), fill: 'hot' },
        ...[-1, 1].map((s): Shape => ({ d: pill(s * 60 - 13, -128, 26, 50), fill: 'grey', depth: 0.5 })),
        ...SLOTS.filter(([x, y]) => x !== DATE[0] - 17 || y !== DATE[1] - 17).map(([x, y]): Shape => ({ d: rect(x, y, 34, 34, 9), fill: 'paper', depth: 0.3 })),
      ],
    },
    {
      parent: 'calendar',
      m: { p: outAndBack<Vec>([0, 0], PUSH, TAP, 4, RELEASE, 6), x: outAndBack(0, -6, TAP, 4, RELEASE, 6) },
      shapes: [{ d: rect(DATE[0] - 17, DATE[1] - 17, 34, 34, 9), fill: 'paper', depth: 0.3 }],
    },
    { parent: 'calendar', a: DATE, p: DATE, m: popIn(TAP + 2, CLEAR), shapes: [{ d: rect(DATE[0] - 17, DATE[1] - 17, 34, 34, 9), fill: 'ok', depth: 0.3 }] },
    { parent: 'calendar', a: EVENT, p: EVENT, ip: GROW, op: HOME, m: { p: CARD_P, s: CARD_S }, shapes: card(EVENT) },
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
    glow('root', [-136, -128], 22, popIn(LAND, LIFT - 6)),
    glow('root', [170, -24], 16, popIn(LAND + 6, LIFT)),
  ],
}

export default calendarBooking
