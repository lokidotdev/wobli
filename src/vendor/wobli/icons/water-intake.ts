// Water Intake
import { at, line, poly, rect } from '../engine.ts'
import { IN, SOFT, fall, twinkle } from '../motions.ts'
import { EXT, FACE, LINE, checkBadge, facePoint, glow, numeral, popIn, popScale } from '../parts.ts'
import type { Icon, Key, Layer, Track, Vec } from '../engine.ts'

// Three drops pop out of the air over a glass and fall in, one after another. On the frame each drop slips past the rim
// the water rises a step out of where it stood and the counter card beside it ticks up one; the third drop fills the glass,
// a check pops on the card and a sparkle follows. After the hold the water sinks on the mirror of its rise, the count
// ticking back down as it passes each step, so the glass is where it started at the seam.
const APPEAR = 6 // the first drop pops in
const GAP = 26 // each next drop follows this much later
const WAIT = 10 // frames a drop hangs before it falls
const FALL_LEN = 18 // frames it takes to fall to the rim
const landAt = (i: number) => APPEAR + i * GAP + WAIT + FALL_LEN // drop i (0 to 2) slips into the glass
const RISE = 16 // frames the water takes to rise a step
const DONE = landAt(2) + RISE // the glass is full
const BACK = 134 // the water starts to sink
const SINK = 32

const START = 5 // glasses on the counter
const STEP = 0.2 // share of the glass each drop adds
const BASE = 0.34 // the water's share before the first drop

// the water's share of the glass, a step per drop out of where it stood on SOFT; home in one sweep on IN, its mirror
const LEVEL: Track<number> = [
  ...[0, 1, 2].flatMap((i): ReadonlyArray<Key<number>> => [
    [landAt(i), BASE + i * STEP, SOFT],
    [landAt(i) + RISE, BASE + (i + 1) * STEP, 0],
  ]),
  [BACK, BASE + 3 * STEP, IN],
  [BACK + SINK, BASE],
]

// the count: ticks on the frame each drop lands, and on the way home as the water passes back under each step
const countAt = (f: number) => {
  if (f >= BACK) return START + Math.ceil((at(LEVEL, f) - BASE) / STEP - 1e-6)
  return START + [0, 1, 2].filter((i) => f >= landAt(i)).length
}
const FRAMES = Array.from({ length: 181 }, (_, f) => f)
// holds a value until the frame it changes
const steps = <T>(value: (f: number) => T): Track<T> =>
  FRAMES.filter((f) => f === 0 || f === 180 || value(f) !== value(f - 1)).map((f) => [f, value(f), 0] as const)

// the glass, an upright tumbler on the house face, wider at the rim
const RIM_Y = -150
const FOOT_Y = 104
const RIM_W = 68
const FOOT_W = 50
// the inside the water fills, walls and a thick foot inset from the outline
const IN_TOP = -138
const IN_BOT = 74
const IN_RIM = 57
const IN_FOOT = 39
const halfAt = (y: number) => IN_FOOT + ((IN_BOT - y) / (IN_BOT - IN_TOP)) * (IN_RIM - IN_FOOT)
const water = (share: number) => {
  const y = IN_BOT - share * (IN_BOT - IN_TOP)
  return poly([[-halfAt(y), y], [halfAt(y), y], [IN_FOOT, IN_BOT], [-IN_FOOT, IN_BOT]], [0, 0, 10, 10])
}
// keyed every other frame while it moves, held still between, so the four points morph
const WATER: Track<string> = FRAMES.filter((f, i) => i % 2 === 0 || f === 180)
  .filter((f) => f === 0 || f === 180 || at(LEVEL, f) !== at(LEVEL, f - 2) || at(LEVEL, f + 2) !== at(LEVEL, f))
  .map((f) => [f, water(at(LEVEL, f))] as const)

// a drop: a round belly under a sharp tip
const dropPath = (x: number, y: number, k: number) => {
  const P = (px: number, py: number) => `${x + px * k} ${y + py * k}`
  return `M${P(0, -34)}C${P(10, -18)} ${P(24, -4)} ${P(24, 10)}C${P(24, 24)} ${P(13, 34)} ${P(0, 34)}C${P(-13, 34)} ${P(-24, 24)} ${P(-24, 10)}C${P(-24, -4)} ${P(-10, -18)} ${P(0, -34)}Z`
}

const GLASS_AT: Vec = [-74, 66]
const RIM_MID: Vec = [GLASS_AT[0] + facePoint(0, RIM_Y)[0], GLASS_AT[1] + facePoint(0, RIM_Y)[1]]
const DROP_RISE = 130 // how far above the rim a drop appears
// drop i: pops in above the rim, hangs, falls on DROP and is cut the frame it slips past the rim
const drop = (i: number): Layer => {
  const t = APPEAR + i * GAP
  const from: Vec = [RIM_MID[0], RIM_MID[1] - DROP_RISE]
  return {
    parent: 'root',
    a: from,
    p: from,
    ip: t,
    op: landAt(i),
    m: [twinkle(t), fall([0, DROP_RISE], t + WAIT, FALL_LEN)],
    shapes: [{ d: dropPath(from[0], from[1], 0.9), fill: 'main', depth: 0.5 }],
  }
}

// the counter card: a drop glyph over the count
const DIGIT_W = 40
const DIGIT_H = 62
const COUNT_Y = 0
const BADGE: Vec = [72, -102]

const waterIntake: Icon = {
  name: 'water-intake',
  frames: 180,
  still: 112,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [250, 262], shapes: [] },
    {
      id: 'card',
      parent: 'root',
      tilt: FACE,
      p: [96, -46],
      shapes: [
        { d: rect(-74, -100, 148, 196, 28), fill: 'white', depth: 1 },
        { d: dropPath(0, -46, 0.82), fill: 'main', depth: 0.4 },
        { d: steps((f) => numeral(countAt(f), -DIGIT_W / 2, COUNT_Y, DIGIT_W, DIGIT_H)), line: 9, round: true },
      ],
    },
    // the goal check, popping on the card's corner once the glass is full
    { parent: 'card', a: BADGE, p: BADGE, s: popScale(DONE, BACK - 4), shapes: checkBadge(BADGE, 26) },
    {
      id: 'glass',
      parent: 'root',
      tilt: FACE,
      p: GLASS_AT,
      shapes: [
        { d: poly([[-RIM_W, RIM_Y], [RIM_W, RIM_Y], [FOOT_W, FOOT_Y], [-FOOT_W, FOOT_Y]], [4, 4, 14, 14]), fill: 'tint', depth: 1 },
        { d: WATER, fill: 'main', depth: 0.3, crease: false },
        { d: rect(-FOOT_W + 10, IN_BOT + 6, (FOOT_W - 10) * 2, 16, 6), fill: 'white', depth: 0.2 }, // the thick foot
        { d: line([-44, -112], [-34, 40]), line: 8, round: true }, // a glint down the wall
      ],
    },
    ...[0, 1, 2].map(drop),
    glow('root', [-176, -150], 22, popIn(DONE + 2, BACK - 10)),
    glow('root', [196, 92], 15, popIn(DONE + 8, BACK - 4)),
  ],
}

export default waterIntake
