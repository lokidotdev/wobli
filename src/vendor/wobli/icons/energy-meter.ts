// Energy Meter
import { ellipse, line, pill, poly, rect } from '../engine.ts'
import { IN, SOFT, twinkle } from '../motions.ts'
import { EXT, FACE, LINE, glow, outAndBack, popIn, popScale } from '../parts.ts'
import type { Icon, Key, Track, Vec } from '../engine.ts'

// The smart plug switches on: its light pops on and a bolt pops out above it. The bolt pulses three times, and a few
// frames after each pulse the usage bar on the meter card beside it fills a step, the last step to full with a sparkle.
// After a long hold the bolt pops away, the bar drains on the mirror of the way it filled and the light goes out.
const ON = 8 // the plug's light comes on
const BOLT_IN = 14 // the bolt pops out
const BEATS = [32, 56, 80] as const // the bolt pulses
const LAG = 4 // the bar answers each pulse this much later
const STEP = 16 // frames the bar takes to fill a step
const FULL = BEATS[2] + LAG + STEP
const AWAY = 134 // the bolt pops away
const DRAIN = 138 // the bar drains
const DRAIN_LEN = 26
const OFF = DRAIN + 6 // the light goes out, gone before the seam

// the plug, on the house face: a wall plate, the plug body, a round socket face with two holes and a light
const BOLT: Vec = [0, -186] // the bolt's centre, above the plug
const LIGHT: Vec = [44, -72]

// the meter card: a bolt glyph, a few reading lines and the usage bar
const CARD = { x: -74, y: -86, w: 148, h: 150 }
const BAR = { x: -52, y: 26, w: 104, h: 20 }
const fill = (share: number) => pill(BAR.x, BAR.y, BAR.h + share * (BAR.w - BAR.h), BAR.h)
const FILL: Track<string> = [
  [0, fill(0), 0],
  ...BEATS.flatMap((b, i): ReadonlyArray<Key<string>> => [
    [b + LAG, fill(i / 3), SOFT],
    [b + LAG + STEP, fill((i + 1) / 3), 0],
  ]),
  [DRAIN, fill(1), IN],
  [DRAIN + DRAIN_LEN, fill(0)],
]

// the bolt pops in, swells on each beat and home on its mirror, then pops away
const pulse = (t: number, k: number): Track<Vec> => outAndBack<Vec>([100, 100], [k, k], t, 6, t + 6, 10)
const BOLT_SCALE: Track<Vec> = [
  ...(twinkle(BOLT_IN).s ?? []),
  ...BEATS.flatMap((b, i) => pulse(b, 112 + i * 6)),
  ...(twinkle(AWAY, true).s ?? []),
]

const boltPath = (cx: number, cy: number, k: number) =>
  poly(
    ([[8, -40], [-22, 6], [-2, 6], [-8, 40], [22, -8], [2, -8]] as ReadonlyArray<Vec>).map(([x, y]): Vec => [cx + x * k, cy + y * k]),
    3,
  )

const energyMeter: Icon = {
  name: 'energy-meter',
  frames: 180,
  still: 112,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [244, 274], shapes: [] },
    {
      id: 'plug',
      parent: 'root',
      tilt: FACE,
      p: [-84, 30],
      shapes: [
        { d: rect(-92, -110, 184, 220, 26), fill: 'white', depth: 0.5 }, // the wall plate
        { d: rect(-70, -94, 140, 168, 40), fill: 'main', depth: 1 }, // the plug body
        { d: ellipse(0, -2, 48), fill: 'white', depth: 0.3 }, // the socket face
        { d: pill(-24, -20, 12, 32), fill: 'ink', line: false },
        { d: pill(12, -20, 12, 32), fill: 'ink', line: false },
        { d: ellipse(0, 28, 6), fill: 'ink', line: false },
        { d: rect(-24, 82, 48, 16, 6), fill: 'grey', depth: 0.4 }, // the switch under the body
        { d: ellipse(LIGHT[0], LIGHT[1], 8), fill: 'grey', line: 4 }, // the light, dark
      ],
    },
    { parent: 'plug', a: LIGHT, p: LIGHT, s: popScale(ON, OFF), shapes: [{ d: ellipse(LIGHT[0], LIGHT[1], 8), fill: 'ok', line: 4 }] },
    { parent: 'plug', a: BOLT, p: BOLT, s: BOLT_SCALE, shapes: [{ d: boltPath(BOLT[0], BOLT[1], 1.6), fill: 'gold', depth: 0.6 }] },
    {
      id: 'card',
      parent: 'root',
      tilt: FACE,
      p: [124, -30],
      shapes: [
        { d: rect(CARD.x, CARD.y, CARD.w, CARD.h, 26), fill: 'white', depth: 1 },
        { d: boltPath(-38, -48, 0.55), fill: 'gold', line: 4 },
        { d: line([-6, -60], [48, -60]), line: 6, round: true },
        { d: line([-6, -36], [30, -36]), line: 6, round: true },
        { d: line([-52, -6], [52, -6]), line: 4 },
        { d: pill(BAR.x, BAR.y, BAR.w, BAR.h), fill: 'paper', depth: 0.3 },
        { d: FILL, fill: 'main', depth: 0.3, crease: false },
      ],
    },
    glow('root', [196, -170], 22, popIn(FULL, AWAY - 8)),
    glow('root', [-170, -200], 15, popIn(FULL + 6, AWAY - 2)),
  ],
}

export default energyMeter
