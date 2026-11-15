// Recipe Card
import { ellipse, rect } from '../engine.ts'
import { IN, SNAP, SOFT, sparkle, twinkle } from '../motions.ts'
import { EXT, FACE, LINE, check, glow, hit } from '../parts.ts'
import type { Icon, Layer, Shape, Track, Vec } from '../engine.ts'

// A recipe card lies on a cutting board, the dish side up. It lifts and turns over on its upright axis, standing edge on at the
// top of the lift, and comes down with its ingredient list up; the board takes the landing on the same frame. The ingredients
// tick off one after another, each box popping green with a check drawn in, sparkles on the last. After the hold the card
// lifts and turns back the way it came and the board takes that landing too; the list is clean again under the dish side.
const W = 250 // the card
const H = 170
const LEFT = -W / 2
const TOP = -H / 2
const CARD = 0.4 // the card's thickness, as a share of the extrusion
const BOARD = { w: 318, h: 222 }

const FLIP = 8 // the card leaves the board, dish side up
const SWING = 30
const LAND = FLIP + SWING // list side up
const TICK = LAND + 10 // the first ingredient is ticked off
const STAGGER = 12
const BACK = 122 // the card leaves again
const HOME = BACK + SWING // dish side up
const MID = FLIP + SWING / 2 // edge on, at the top of the lift
const MID_BACK = BACK + SWING / 2

const LIFT: Vec = [0, -70] // how high the card rises over the board
const ON_BOARD: Vec = [-EXT[0] * CARD, -EXT[1] * CARD] // the card's underside on the board's top

// up and over on the way out, down and onto the board on the way in; the same path both times
const lift = (t: number): Track<Vec> => [
  [t, [0, 0], SOFT],
  [t + SWING / 2, LIFT, IN],
  [t + SWING, [0, 0], 0],
]
const LIFT_P: Track<Vec> = [...lift(FLIP), ...lift(BACK)]

// the card turns over its upright axis: one side squeezes to edge on while the other opens out from it
const DISH_S: Track<Vec> = [[FLIP, [100, 100], SNAP], [LAND, [-100, 100], 0], [BACK, [-100, 100], SNAP], [HOME, [100, 100]]]
const LIST_S: Track<Vec> = [[FLIP, [-100, 100], SNAP], [LAND, [100, 100], 0], [BACK, [100, 100], SNAP], [HOME, [-100, 100]]]

// a plain card: white slab, the recipe's name over a coloured rule
const blank = (): ReadonlyArray<Shape> => [
  { d: rect(LEFT, TOP, W, H, 16), fill: 'white', depth: CARD },
  { d: rect(LEFT + 18, TOP + 18, 120, 14, 7), fill: 'grey', depth: 0.15 },
  { d: rect(LEFT + 18, TOP + 42, W - 36, 8, 4), fill: 'main', line: 3 },
]

// the dish side: a steaming bowl on its foot, three lines of method beside it
const BOWL: Vec = [LEFT + 68, 26]
const steam = (x: number) => `M${x} ${BOWL[1] - 18}C${x - 10} ${BOWL[1] - 30} ${x + 10} ${BOWL[1] - 38} ${x} ${BOWL[1] - 50}`
const dish = (): ReadonlyArray<Shape> => [
  ...blank(),
  { d: `M${BOWL[0] - 42} ${BOWL[1] - 8}A42 34 0 0 0 ${BOWL[0] + 42} ${BOWL[1] - 8}Z`, fill: 'main', depth: 0.3 },
  { d: rect(BOWL[0] - 16, BOWL[1] + 24, 32, 10, 4), fill: 'main', depth: 0.3 },
  { d: steam(BOWL[0] - 12), round: true, line: 4 },
  { d: steam(BOWL[0] + 12), round: true, line: 4 },
  { d: rect(LEFT + 130, -10, 96, 14, 7), fill: 'grey', depth: 0.15 },
  { d: rect(LEFT + 130, 16, 72, 14, 7), fill: 'grey', depth: 0.15 },
  { d: rect(LEFT + 130, 42, 84, 14, 7), fill: 'grey', depth: 0.15 },
]

// the list side: three ingredients, each a box and a line of text
const ROWS = [-14, 22, 58]
const TEXT = [120, 88, 140]
const BOX_X = LEFT + 32
const TEXT_X = LEFT + 60
const BOX = 26
const box = (y: number, fill: Shape['fill']): Shape => ({ d: rect(BOX_X - BOX / 2, y - BOX / 2, BOX, BOX, 6), fill, depth: 0.2 })
const list = (): ReadonlyArray<Shape> => [
  ...blank(),
  ...ROWS.flatMap((y, i): ReadonlyArray<Shape> => [box(y, 'white'), { d: rect(TEXT_X, y - 6, TEXT[i], 12, 6), fill: 'grey', depth: 0.15 }]),
]

// one ingredient ticked off: its box pops green and the check draws in a beat behind
const tick = (y: number, i: number): Layer => {
  const t = TICK + i * STAGGER
  const c: Vec = [BOX_X, y]
  return {
    parent: 'list',
    a: c,
    p: c,
    m: twinkle(t),
    ip: MID,
    op: MID_BACK,
    shapes: [box(y, 'ok'), { d: check(c, 20), line: 5, trim: [[t + 4, 0, SOFT], [t + 14, 1]] }],
  }
}
const LAST = TICK + (ROWS.length - 1) * STAGGER

const recipeCard: Icon = {
  name: 'recipe-card',
  frames: 180,
  still: 100,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [256, 250], s: [96, 96], shapes: [] },
    // untilted carrier for board and card: takes each landing on the frame the card touches down
    { id: 'board', parent: 'root', m: [hit(LAND, [2, 7]), hit(HOME, [2, 7])], shapes: [] },
    {
      parent: 'board',
      tilt: FACE,
      shapes: [
        { d: rect(-BOARD.w / 2, -BOARD.h / 2, BOARD.w, BOARD.h, 28), fill: 'deep', depth: 1 },
        { d: ellipse(BOARD.w / 2 - 30, -BOARD.h / 2 + 30, 11), fill: 'ink', line: false }, // the hanging hole
      ],
    },
    // the card rides up and down; its two sides swap at the frame it stands edge on
    { id: 'card', parent: 'board', p: ON_BOARD, m: { p: LIFT_P }, shapes: [] },
    { parent: 'card', tilt: FACE, s: DISH_S, op: MID, shapes: dish() },
    { id: 'list', parent: 'card', tilt: FACE, s: LIST_S, ip: MID, op: MID_BACK, shapes: list() },
    ...ROWS.map(tick),
    { parent: 'card', tilt: FACE, s: DISH_S, ip: MID_BACK, shapes: dish() },
    glow('root', [-186, -118], 22, sparkle(LAST + 8)),
    glow('root', [176, 104], 15, sparkle(LAST + 16)),
  ],
}

export default recipeCard
