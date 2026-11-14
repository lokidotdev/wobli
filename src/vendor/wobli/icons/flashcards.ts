// Flashcards
import { ellipse, line, rect } from '../engine.ts'
import { IN, SNAP, SOFT, sparkle } from '../motions.ts'
import { EXT, FACE, LINE, checkBadge, glow, hit } from '../parts.ts'
import type { Icon, Layer, Shape, Track, Vec } from '../engine.ts'

// The top card of a small deck shows its question. It lifts off the deck and flips over on its long axis, standing edge on at the
// top of the lift, and comes down answer side up; the deck takes the landing on the same frame, sparkles on the beat. After the
// hold the card lifts and flips back the way it came, lands question side up and the deck takes that landing too.
const W = 250 // one card
const H = 160
const LEFT = -W / 2
const TOP = -H / 2
const CARD = 0.4 // a card's thickness, as a share of the extrusion

const FLIP = 8 // the card leaves the deck, question up
const SWING = 30 // deck to deck
const LAND = FLIP + SWING // answer up
const BACK = 124 // the card leaves again
const HOME = BACK + SWING // question up
const MID = FLIP + SWING / 2 // edge on, at the top of the lift
const MID_BACK = BACK + SWING / 2

const LIFT: Vec = [0, -70] // how high the card rises over the deck
const UNDER = (n: number): Vec => [EXT[0] * CARD * n, EXT[1] * CARD * n] // the nth card down the deck

// up and over on the way out, down and onto the deck on the way in; the same path both times
const lift = (t: number): Track<Vec> => [
  [t, [0, 0], SOFT],
  [t + SWING / 2, LIFT, IN],
  [t + SWING, [0, 0], 0],
]
const LIFT_P: Track<Vec> = [...lift(FLIP), ...lift(BACK)]

// the card turns over its long axis: one side squeezes to edge on while the other opens out from it
const QUESTION_S: Track<Vec> = [[FLIP, [100, 100], SNAP], [LAND, [100, -100], 0], [BACK, [100, -100], SNAP], [HOME, [100, 100]]]
const ANSWER_S: Track<Vec> = [[FLIP, [100, -100], SNAP], [LAND, [100, 100], 0], [BACK, [100, 100], SNAP], [HOME, [100, -100]]]

// a plain index card: white slab, a coloured rule under the head, a few ruled lines
const blank = (rule: Shape['fill']): ReadonlyArray<Shape> => [
  { d: rect(LEFT, TOP, W, H, 16), fill: 'white', depth: CARD },
  { d: rect(LEFT + 16, TOP + 30, W - 32, 8, 4), fill: rule, line: 3 },
]

// the question side: a gold disc with a question mark, two lines of the prompt beside it
const QX = LEFT + 62
const QY = 14
const question = (): ReadonlyArray<Shape> => [
  ...blank('main'),
  { d: ellipse(QX, QY, 34), fill: 'gold', depth: 0.25 },
  { d: `M${QX - 12} ${QY - 10}A13 13 0 1 1 ${QX + 3} ${QY + 3}L${QX + 1} ${QY + 9}`, line: 6 },
  { d: ellipse(QX + 1, QY + 21, 4), fill: 'ink', line: false },
  { d: rect(QX + 50, QY - 22, 100, 14, 7), fill: 'grey', depth: 0.15 },
  { d: rect(QX + 50, QY + 6, 70, 14, 7), fill: 'grey', depth: 0.15 },
]

// the answer side: a check badge and the answer written out under a green rule
const answer = (): ReadonlyArray<Shape> => [
  ...blank('ok'),
  ...checkBadge([QX, QY], 32, 0.3),
  { d: rect(QX + 50, QY - 30, 104, 14, 7), fill: 'main', depth: 0.15 },
  { d: line([QX + 50, QY + 4], [QX + 160, QY + 4]), line: 4 },
  { d: line([QX + 50, QY + 26], [QX + 124, QY + 26]), line: 4 },
]

// the cards under the top one, each a little askew
const deckCard = (n: number, r: number): Layer => ({
  parent: 'deck',
  p: UNDER(n),
  tilt: FACE,
  r,
  shapes: blank('grey'),
})

const flashcards: Icon = {
  name: 'flashcards',
  frames: 180,
  still: 96,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [258, 268], s: [100, 100], shapes: [] },
    // untilted carrier for the deck: takes each landing on the frame the card touches down
    { id: 'deck', parent: 'root', m: [hit(LAND, [2, 7]), hit(HOME, [2, 7])], shapes: [] },
    deckCard(2, -7),
    deckCard(1, 4),
    // the top card rides up and down; its two sides swap at the frame it stands edge on
    { id: 'card', parent: 'deck', p: [0, 0], m: { p: LIFT_P }, shapes: [] },
    { parent: 'card', tilt: FACE, s: QUESTION_S, op: MID, shapes: question() },
    { parent: 'card', tilt: FACE, s: ANSWER_S, ip: MID, op: MID_BACK, shapes: answer() },
    { parent: 'card', tilt: FACE, s: QUESTION_S, ip: MID_BACK, shapes: question() },
    glow('root', [-176, -112], 22, sparkle(LAND + 4)),
    glow('root', [168, 92], 15, sparkle(LAND + 12)),
  ],
}

export default flashcards
