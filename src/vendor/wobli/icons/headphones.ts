// Headphones
import { arc, ellipse, poly, rect } from '../engine.ts'
import { glint, hop } from '../motions.ts'
import { EXT, FACE, LINE, facePoint, glow, hit, outAndBack, popIn, popScale } from '../parts.ts'
import type { Icon, Layer, Shape, Vec } from '../engine.ts'

// The headphones hop up on the beat and slam down through rest; the cups take the hit and spring out on their yokes,
// right one a beat behind. Sound waves ripple out on both sides as they land and two notes rise out of the cups.
// After a still hold the notes sink back into the cups they came from.
const BAND = 'M-136 18A136 136 0 0 1 136 18L108 18A108 108 0 0 0 -108 18Z'
const CUP_X = 122 // each cup's centre, out from the band's middle
const YOKE_Y = 14 // where a cup hangs from the band

const HOP = 4 // the headphones set off
const LAND = HOP + 46 // they slam down through rest
const NOTE_LEN = 22
const HOME = 132 // the notes sink home

const CUP_MID = YOKE_Y + 86 // the cups' centres, where the waves come from

// a cup on its yoke: the shell, the cap plate and its rim, hinged where it hangs
const cup = (side: -1 | 1): Layer => {
  const x = side * CUP_X
  const hinge: Vec = [x, YOKE_Y]
  return {
    parent: 'set',
    a: hinge,
    p: hinge,
    m: hit(LAND + (side > 0 ? 3 : 0), [side * 9, 4], 0.6),
    shapes: [
      { d: rect(x - 14, YOKE_Y - 8, 28, 34, 6), fill: 'grey', depth: 0.6 },
      { d: rect(x - 40, YOKE_Y + 22, 80, 128, 34), fill: 'main', depth: 1 },
      { d: rect(x - 24, YOKE_Y + 40, 48, 92, 20), fill: 'tint', depth: 0.3 },
    ],
  }
}

// an eighth note, head at 0 0
const NOTE: ReadonlyArray<Shape> = [
  { d: poly([[6, -56], [34, -46], [34, -30], [14, -36], [14, 0], [6, 0]], 3), fill: 'white', depth: 0.4 },
  { d: ellipse(-4, 2, 16, 13), fill: 'white', depth: 0.4 },
]
const note = (from: Vec, to: Vec, out: number, back: number): Layer => ({
  parent: 'root',
  p: outAndBack<Vec>(from, to, out, NOTE_LEN, back, NOTE_LEN),
  s: popScale(out, back),
  shapes: NOTE,
})

// a sound wave beside a cup, swelling out of it on the glint keys
const ripple = (side: -1 | 1, r: number, start: number): Layer => {
  const c = facePoint(side * CUP_X, CUP_MID)
  const from = side > 0 ? -32 : 148
  return { parent: 'root', a: c, p: c, m: glint(start, 100), shapes: [{ d: arc(c[0], c[1], r, from, from + 64), round: true }] }
}

const headphones: Icon = {
  name: 'headphones',
  frames: 180,
  still: 100,
  line: LINE,
  extrude: EXT,
  layers: [
    // untilted, pivoting on the cups' feet so the hop rocks from the ground
    { id: 'root', a: [0, 150], p: [252, 372], s: [92, 92], m: { ...hop, at: HOP }, shapes: [] },
    ripple(-1, 74, LAND),
    ripple(-1, 104, LAND + 6),
    ripple(1, 74, LAND + 3),
    ripple(1, 104, LAND + 9),
    { id: 'set', parent: 'root', tilt: FACE, shapes: [{ d: BAND, fill: 'deep', depth: 0.8 }] },
    cup(-1),
    cup(1),
    note(facePoint(-CUP_X, 40), [-176, -150], LAND + 2, HOME + 6),
    note(facePoint(CUP_X, 40), [150, -176], LAND + 8, HOME),
    glow('root', [196, -60], 20, popIn(LAND + 12, HOME - 8)),
  ],
}

export default headphones
