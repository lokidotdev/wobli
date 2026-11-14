// Savings Jar
import { ellipse, line, pill, poly, rect } from '../engine.ts'
import { EASY, IN, SOFT, springTurn, twinkle } from '../motions.ts'
import { EXT, FACE, LINE, coin, glow, hit, outAndBack, popIn } from '../parts.ts'
import type { Icon, Layer, Motion, Track, Vec } from '../engine.ts'

// Three coins pop in above the jar one after another and drop in behind the lid. The jar takes each hit on the frame the coin
// lands, the lid a beat later, and the gold inside climbs a step. On the third coin the level reaches the goal: the flag runs up
// its pole, flutters as it arrives and a sparkle pops. After a long hold the flag comes down the way it went up and the level
// drains back to where it started.
const COINS = [0, 1, 2] as const
const APPEAR = (i: number) => 4 + i * 18 // coin pops in above the jar
const FALL = (i: number) => APPEAR(i) + 10 // and starts to drop
const LAND = (i: number) => FALL(i) + 16 // and is in the jar: 30, 48, 66
const GOAL = LAND(2) + 8 // the level reaches the goal mark: the flag goes up
const DOWN = 146 // the flag comes down, the level drains
const STEP_LEN = 12
const COIN_X = [-24, 14, -6] as const
const TOP = -300 // where the coins wait before dropping
const IN_JAR = -56 // a coin is out of sight behind the lid and neck here
const KNOCK: Vec = [1, 6] // how far each coin knocks the jar

// the gold inside: one rect growing from the jar's floor, so every key shares its commands
const FLOOR = 122
const level = (h: number) => rect(-70, FLOOR - h, 140, h, 20)
const LEVELS = [30, 60, 90, 122] as const
const GOAL_Y = FLOOR - LEVELS[3]
const FILL: Track<string> = [
  ...COINS.flatMap((i) => [[LAND(i), level(LEVELS[i]), SOFT] as const, [LAND(i) + STEP_LEN, level(LEVELS[i + 1]), 0] as const]),
  [DOWN, level(LEVELS[3]), IN],
  [DOWN + 28, level(LEVELS[0])],
]

// the flag on its pole, lowered at rest, run up on SOFT at the goal and brought down on IN, its mirror
const POLE_X = 50
const FLAG_ROOT: Vec = [POLE_X + 6, -266] // where the flag hinges on the pole when raised
const FLAG_LOW: Vec = [FLAG_ROOT[0], FLAG_ROOT[1] + 66] // lowered, just above the lid
const FLAG_RISE = 20
const FLUTTER = -14
const flutter: Motion = {
  r: [[GOAL + FLAG_RISE - 2, 0, IN], [GOAL + FLAG_RISE, FLUTTER, 0], ...springTurn(0, GOAL + FLAG_RISE, 0.6, FLUTTER)],
}

const savingsJar: Icon = {
  name: 'savings-jar',
  frames: 180,
  still: 118,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [258, 300], shapes: [] },
    { id: 'jar', parent: 'root', m: COINS.map((i) => hit(LAND(i), KNOCK, 0.6)), shapes: [] },
    { id: 'face', parent: 'jar', tilt: FACE, shapes: [] },
    // coins drop behind the lid, so they are drawn first
    ...COINS.map(
      (i): Layer => ({
        parent: 'face',
        p: [[FALL(i), [COIN_X[i], TOP], IN], [LAND(i), [COIN_X[i], IN_JAR]]],
        ip: APPEAR(i),
        op: LAND(i),
        m: twinkle(APPEAR(i)),
        shapes: coin(30),
      }),
    ),
    // the flag pole, planted in the lid
    {
      parent: 'face',
      shapes: [
        { d: rect(POLE_X, -276, 10, 160, 5), fill: 'white', depth: 0.3 },
        { d: ellipse(POLE_X + 5, -280, 11), fill: 'gold', depth: 0.4 },
      ],
    },
    {
      parent: 'face',
      a: FLAG_ROOT,
      p: outAndBack<Vec>(FLAG_LOW, FLAG_ROOT, GOAL, FLAG_RISE, DOWN, 24),
      m: flutter,
      shapes: [{ d: poly([[FLAG_ROOT[0], FLAG_ROOT[1]], [FLAG_ROOT[0] + 66, FLAG_ROOT[1] + 20], [FLAG_ROOT[0], FLAG_ROOT[1] + 40]], 4), fill: 'main', depth: 0.4 }],
    },
    // the jar: glass body with the gold inside, neck, lid
    {
      parent: 'face',
      shapes: [
        { d: rect(-92, -64, 184, 202, 46), fill: 'white', depth: 1 },
        { d: [[0, level(LEVELS[0]), EASY], ...FILL], fill: 'gold', line: 4 },
        { d: line([58, GOAL_Y + 2], [76, GOAL_Y + 2]), line: 4 },
        { d: line([62, FLOOR - LEVELS[2]], [76, FLOOR - LEVELS[2]]), line: 4 },
        { d: line([62, FLOOR - LEVELS[1]], [76, FLOOR - LEVELS[1]]), line: 4 },
        { d: pill(-70, -30, 14, 70), fill: 'white', line: 4 },
        { d: rect(-68, -92, 136, 34, 10), fill: 'white', depth: 0.7 },
      ],
    },
    {
      parent: 'face',
      m: COINS.map((i) => hit(LAND(i) + 4, [0, 4], 0.6)),
      shapes: [
        { d: rect(-84, -128, 168, 42, 14), fill: 'main', depth: 1 },
        { d: pill(-40, -112, 80, 10), fill: 'ink', line: false },
      ],
    },
    glow('root', [150, -190], 24, popIn(GOAL + FLAG_RISE, DOWN - 8)),
    glow('root', [-150, -110], 16, popIn(GOAL + FLAG_RISE + 6, DOWN - 4)),
  ],
}

export default savingsJar
