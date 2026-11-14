// Email Sent
import { ellipse, line, poly, rect, view } from '../engine.ts'
import { DROP, OUT, twinkle } from '../motions.ts'
import { EXT, FACE, LINE, glow, outAndBack, outIn, popIn } from '../parts.ts'
import type { Icon, Layer, Shape, Vec } from '../engine.ts'

// The letter folds in half down its crease, one side then the other, and the paper plane pops out of the fold. It is thrown up
// and right, all speed up front, leaving a trail of dots, and hangs there through a long hold. Then it flies on and is gone,
// and the letter grows back out of the crease and unfolds the way it folded.
const FOLD = 14 // the left half folds; the right follows
const PLANE_IN = 30 // the plane pops out of the fold
const LAUNCH = 46 // thrown
const ARRIVE = LAUNCH + 40
const LEAVE = 134 // flies on and away
const REFOLD = 136 // the letter grows back out of the crease
const UNFOLD = 152 // and opens out again

const LETTER: Vec = [-54, 46] // the letter's centre in root: where the plane comes from
const TRAVEL: Vec = [150, -126] // from the fold to where the plane hangs
const ONWARD: Vec = [40, -34] // the last stretch as it leaves

const fly = view(50, 30)
const PL = 0.8
const pl = ([x, y, z]: readonly [number, number, number]): Vec => {
  const [u, v] = fly([x, y, z])
  return [u * PL, v * PL]
}
const [NOSE, TAIL, KEEL, FAR, NEAR] = [pl([172, 0, 0]), pl([-128, 0, 0]), pl([-104, 0, -112]), pl([-144, 116, 20]), pl([-144, -116, -44])]

// one half of the letter, drawn either side of the crease at x 0
const half = (side: -1 | 1): ReadonlyArray<Shape> => {
  const x = side * 100
  const body: Shape = { d: poly([[0, -124], [x, -124], [x, 124], [0, 124]], [0, 14, 14, 0]), fill: 'white', depth: 0.4 }
  return side < 0
    ? [body, { d: line([-72, -78], [0, -78]) }, { d: line([-72, -38], [0, -38]) }, { d: line([-72, 2], [0, 2]) }, { d: line([-72, 42], [-24, 42]) }]
    : [body, { d: line([0, -78], [30, -78]) }, { d: line([0, -38], [72, -38]) }, { d: line([0, 2], [52, 2]) }, { d: rect(20, 52, 52, 48, 7), fill: 'main', depth: 0.25 }]
}

// trail dots along the throw, popping in as the plane passes and out in the same order
const DOTS: ReadonlyArray<Vec> = [
  [LETTER[0] - 8, LETTER[1] + 30],
  [LETTER[0] + 20, LETTER[1] - 4],
  [LETTER[0] + 42, LETTER[1] - 40],
]

const emailSent: Icon = {
  name: 'email-sent',
  frames: 180,
  still: 104,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [244, 276], shapes: [] },
    // the letter: a leaned face with no drawing of its own, so its halves fold in its plane
    { id: 'letter', parent: 'root', tilt: FACE, p: LETTER, m: outIn(PLANE_IN + 4, REFOLD), shapes: [] },
    { parent: 'letter', s: outAndBack<Vec>([100, 100], [0, 100], FOLD, 16, UNFOLD, 16), shapes: half(-1) },
    { parent: 'letter', s: outAndBack<Vec>([100, 100], [0, 100], FOLD + 5, 16, UNFOLD + 5, 16), shapes: half(1) },
    ...DOTS.map((c, i): Layer => ({ parent: 'root', a: c, p: c, m: popIn(LAUNCH + 8 + i * 6, LEAVE + i * 5), shapes: [{ d: ellipse(c[0], c[1], 8), fill: 'ink', line: false }] })),
    {
      parent: 'root',
      p: LETTER,
      ip: PLANE_IN,
      op: LEAVE + 30,
      m: [
        { s: [...(twinkle(PLANE_IN).s ?? []), ...(twinkle(LEAVE, true).s ?? [])] },
        { p: [[LAUNCH, [0, 0], OUT, [[70, 10], [-40, 50]]], [ARRIVE, TRAVEL, 0], [LEAVE, TRAVEL, DROP], [LEAVE + 30, [TRAVEL[0] + ONWARD[0], TRAVEL[1] + ONWARD[1]]]], r: [[LAUNCH, 0, OUT], [ARRIVE, -10]] },
      ],
      shapes: [
        { d: poly([NOSE, FAR, TAIL], 3), fill: 'paper', side: 'white', depth: 0.8 },
        { d: poly([NOSE, TAIL, KEEL], 3), fill: 'main', depth: 0.8 },
        { d: poly([NOSE, TAIL, NEAR], 3), fill: 'white', side: 'white', depth: 0.8 },
      ],
    },
    glow('root', [LETTER[0] - 84, LETTER[1] - 44], 22, popIn(LAUNCH, LEAVE - 14)),
    glow('root', [LETTER[0] + TRAVEL[0] - 40, LETTER[1] + TRAVEL[1] - 100], 18, popIn(ARRIVE - 4, LEAVE - 8)),
  ],
}

export default emailSent
