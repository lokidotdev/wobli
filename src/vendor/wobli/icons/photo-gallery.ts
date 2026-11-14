// Photo Gallery
import { ellipse, poly, rect } from '../engine.ts'
import { EXT, FACE, LINE, glow, outAndBack, popIn } from '../parts.ts'
import type { Icon, Layer, Shape, Vec } from '../engine.ts'

// A stack of photos shuffles: the top print slides off to the right and the one under it slides left, each tucking back in.
// Then the stack fans out around the bottom corner it is held by, back print first, and a sparkle lands as the fan opens.
// The fan closes in the reverse order, front print home first, on the same arc it opened along.
const W = 150
const H = 184
const HOLD: Vec = [0, 150] // where the prints are pinched, below the stack, so they fan around it

const SHUFFLE = 6 // the top print slides off
const SHUFFLE_LEN = 14
const TUCK = 24 // the prints slide back onto the stack
const FAN = 42 // the back print starts to fan
const FAN_LEN = 20
const STAGGER = 5
const CLOSE = 124 // the front print folds home first
const SPREAD = [-36, -16, 6] // each print's angle in the open fan, back to front

// a print: white border, the photo inside, a hill and a sun
const print = (sky: Shape['fill'], hill: Shape['fill'], sunAt: Vec): ReadonlyArray<Shape> => [
  { d: rect(-W / 2, -H / 2, W, H, 10), fill: 'white', depth: 0.3 },
  { d: rect(-W / 2 + 14, -H / 2 + 14, W - 28, H - 58, 6), fill: sky, depth: 0.15 },
  { d: ellipse(sunAt[0], sunAt[1], 16), fill: 'gold', depth: 0.15 },
  { d: poly([[-W / 2 + 14, 34], [-22, -14], [6, 14], [30, -6], [W / 2 - 14, 34]], [6, 3, 3, 3, 6]), fill: hill, depth: 0.15 },
]

// each print rests a little behind the one above it, so the closed stack reads as a stack
const REST: ReadonlyArray<Vec> = [[-20, -16], [-10, -8], [0, 0]]

const card = (i: number, shapes: ReadonlyArray<Shape>, slide?: Vec, slideAt = SHUFFLE): Layer => {
  const rest: Vec = [HOLD[0] + REST[i][0], HOLD[1] + REST[i][1]]
  return {
    parent: 'stack',
    a: HOLD,
    p: slide ? outAndBack<Vec>(rest, [rest[0] + slide[0], rest[1] + slide[1]], slideAt, SHUFFLE_LEN, TUCK + (slideAt - SHUFFLE), SHUFFLE_LEN) : rest,
    r: outAndBack(0, SPREAD[i], FAN + i * STAGGER, FAN_LEN, CLOSE + (SPREAD.length - 1 - i) * STAGGER, FAN_LEN),
    shapes,
  }
}

const photoGallery: Icon = {
  name: 'photo-gallery',
  frames: 180,
  still: 92,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [276, 246], s: [118, 118], shapes: [] },
    { id: 'stack', parent: 'root', tilt: FACE, shapes: [] },
    card(0, print('main', 'deep', [34, -50])),
    card(1, print('tint', 'main', [-30, -52]), [-58, 8], SHUFFLE + 5),
    card(2, print('tint', 'deep', [36, -52]), [78, -6]),
    glow('root', [-128, -118], 22, popIn(FAN + FAN_LEN + 6, CLOSE - 6)),
    glow('root', [122, -122], 16, popIn(FAN + FAN_LEN + 12, CLOSE - 2)),
  ],
}

export default photoGallery
