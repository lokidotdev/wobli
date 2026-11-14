// Learning Streak
import { ellipse, line, rect, shift } from '../engine.ts'
import { IN, SOFT, flicker } from '../motions.ts'
import { EXT, FACE, LINE, check, glow, numeral, popIn, popScale } from '../parts.ts'
import type { Icon, Key, Layer, Track, Vec } from '../engine.ts'

// A streak card shows a small flame over a four day count, four of the week's dots already ticked. Three more days pop
// in one after another; on the frame each dot lands the count ticks up and the flame flares a step taller out of where it
// stood, its gold heart catching up a beat later. The seventh day closes the week and sparkles follow. After the hold the
// days pop away last first, the count ticking back down and the flame sinking in one sweep, so it is day four at the seam.
const TICK = 20 // the first new day pops in
const GAP = 24 // each next day follows this much later
const tickAt = (i: number) => TICK + i * GAP // new day i (0 to 2) lands
const GROW = 16 // frames the flame takes to flare a step
const LAG = 5 // the gold heart follows the outer flame this much later
const DONE = tickAt(2) + GROW // the week is closed
const BACK = 128 // the days start to leave
const LEAVE_GAP = 7 // each earlier day follows the one after it
const leaveAt = (i: number) => BACK + (2 - i) * LEAVE_GAP // new day i pops away, last first
const COUNT_DOWN = 14 // the count drops once the day is mostly gone
const SINK = 34 // frames the flame takes to sink back

// the card, upright on the house face
const CARD = { x: -170, y: -126, w: 340, h: 256 }
const START = 4 // days already on the streak at the seam
const DAYS = 7

// the week row: seven dots, the first START ticked from the start
const DOT_R = 16
const DOT_Y = 90
const dotAt = (i: number): Vec => [-129 + i * 43, DOT_Y]
const ticked = (c: Vec) => [
  { d: ellipse(c[0], c[1], DOT_R), fill: 'hot' as const, depth: 0.5 },
  { d: check(c, DOT_R), line: 4 },
]

// the flame: a teardrop on its base with a tip that leans, the same commands every time so the flicker morphs
const BASE: Vec = [-88, 32]
const flame = (w: number, h: number, lean: number, [x, y]: Vec = BASE) => {
  const P = (px: number, py: number) => `${x + px} ${y + py}`
  return (
    `M${P(0, 0)}C${P(-w * 0.62, 0)} ${P(-w, -h * 0.18)} ${P(-w, -h * 0.4)}` +
    `C${P(-w, -h * 0.64)} ${P(lean * 0.4 - w * 0.4, -h * 0.8)} ${P(lean, -h)}` +
    `C${P(lean * 0.4 + w * 0.6, -h * 0.8)} ${P(w, -h * 0.62)} ${P(w, -h * 0.4)}` +
    `C${P(w, -h * 0.18)} ${P(w * 0.62, 0)} ${P(0, 0)}Z`
  )
}
const HEART_BASE: Vec = [BASE[0], BASE[1] - 12]
const OUTER = [flame(64, 194, 8), flame(61, 202, -8), flame(66, 188, 16)]
const HEART = [flame(34, 98, -4, HEART_BASE), flame(36, 92, 10, HEART_BASE), flame(33, 102, 0, HEART_BASE)]
// the flicker preset's steps, six of them so the track lands back on its first shape at the seam
const flickering = (shapes: ReadonlyArray<string>) => flicker(Array.from({ length: 6 }, (_, i) => shapes[i % 3]), 30)

// the flame's size, a step per new day out of where it stood on SOFT; home in one sweep on IN, its mirror
const LEVELS = [58, 72, 86, 100]
const lvl = (i: number): Vec => [LEVELS[i], LEVELS[i]]
const FLARE: Track<Vec> = [
  [0, lvl(0), 0],
  ...[0, 1, 2].flatMap((i): ReadonlyArray<Key<Vec>> => [
    [tickAt(i), lvl(i), SOFT],
    [tickAt(i) + GROW, lvl(i + 1), 0],
  ]),
  [BACK, lvl(3), IN],
  [BACK + SINK, lvl(0), 0],
]

// the count: up on each new day, down as each pops away
const countAt = (f: number) => START + [0, 1, 2].filter((i) => f >= tickAt(i) && f < leaveAt(i) + COUNT_DOWN).length
const FRAMES = Array.from({ length: 181 }, (_, f) => f)
// holds a value until the frame it changes
const steps = <T>(value: (f: number) => T): Track<T> =>
  FRAMES.filter((f) => f === 0 || f === 180 || value(f) !== value(f - 1)).map((f) => [f, value(f), 0] as const)
const DIGIT = { x: 34, y: -96, w: 58, h: 92 }

// new day i (0 to 2): the dot after the ticked ones pops in on its beat and away last first after the hold
const newDay = (i: number): Layer => {
  const c = dotAt(START + i)
  return { parent: 'card', a: c, p: c, s: popScale(tickAt(i) - 10, leaveAt(i)), shapes: ticked(c) } // peaks on its tick
}

const learningStreak: Icon = {
  name: 'learning-streak',
  frames: 180,
  still: 110,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [254, 270], shapes: [] },
    {
      id: 'card',
      parent: 'root',
      tilt: FACE,
      shapes: [
        { d: rect(CARD.x, CARD.y, CARD.w, CARD.h, 36), fill: 'white', depth: 1 },
        { d: steps((f) => numeral(countAt(f), DIGIT.x, DIGIT.y, DIGIT.w, DIGIT.h)), line: 11, round: true },
        { d: line([DIGIT.x - 6, 26], [DIGIT.x + 76, 26]), line: 7, round: true }, // the "days" label
        ...Array.from({ length: DAYS }, (_, i) => ({ d: ellipse(dotAt(i)[0], dotAt(i)[1], DOT_R), fill: 'paper' as const, depth: 0.2 })),
        ...Array.from({ length: START }, (_, i) => ticked(dotAt(i))).flat(),
      ],
    },
    ...[0, 1, 2].map(newDay),
    // the flame grows up out of its base; the gold heart follows a beat behind
    { parent: 'card', a: BASE, p: BASE, s: FLARE, shapes: [{ d: flickering(OUTER), fill: 'hot', depth: 0.5, crease: false }] },
    {
      parent: 'card',
      a: BASE,
      p: BASE,
      s: shift(FLARE, LAG),
      shapes: [{ d: flickering([HEART[1], HEART[2], HEART[0]]), fill: 'gold', depth: 0.4, crease: false }],
    },
    glow('root', [-150, -200], 22, popIn(DONE + 2, BACK - 10)),
    glow('root', [196, -60], 15, popIn(DONE + 8, BACK - 4)),
  ],
}

export default learningStreak
