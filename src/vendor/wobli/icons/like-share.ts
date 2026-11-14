// Like & Share
import { ellipse, line, poly, rect } from '../engine.ts'
import { EXT, FACE, LINE, glow, numeral, outAndBack, popIn } from '../parts.ts'
import type { Icon, Track, Vec } from '../engine.ts'

// The like button sinks and its heart fills hot; on the same frame a big heart pops over the photo and the like count ticks up.
// A beat later the share arrow pushes out along its own direction and the share count ticks with it. After a long hold the way
// home retraces the way out: the heart empties, the counts tick back down in the order they went up.
const HEART = 'M0 92C-24 74 -132 8 -132 -48C-132 -94 -98 -122 -62 -122C-34 -122 -12 -106 0 -84C12 -106 34 -122 62 -122C98 -122 132 -94 132 -48C132 8 24 74 0 92Z'
// grows a path of plain x y pairs about the origin and moves it to c
const place = (d: string, k: number, [cx, cy]: Vec) =>
  d.replace(/(-?\d+\.?\d*) (-?\d+\.?\d*)/g, (_, x: string, y: string) => `${+(cx + +x * k).toFixed(2)} ${+(cy + +y * k).toFixed(2)}`)
// a bent forward arrow about c: tail low left, head pointing right
const arrow = ([cx, cy]: Vec) =>
  poly(
    ([[4, -26], [26, -6], [4, 14], [4, 3], [-6, 3], [-14, 11], [-14, 22], [-28, 22], [-28, 4], [-14, -10], [4, -10]] as const).map(([x, y]): Vec => [cx + x * 0.82, cy + y * 0.82]),
    3,
  )

const PHOTO: Vec = [0, -26] // the big heart's centre on the photo
const LIKE: Vec = [-80, 94] // the like button's heart
const SHARE: Vec = [26, 94] // the share arrow
const PUSH: Vec = [-1.3, 6] // the button sinks along its own side
const SHOOT: Vec = [9, -4] // the share arrow pushes out the way it points

const TAP = 24 // the like lands: heart fills, big heart pops, count ticks
const SEND = 56 // the share arrow pushes out, its count ticks
const BIG_OUT = 104 // the big heart pops away
const EMPTY = 132 // the heart empties, the like count ticks back
const UNSEND = EMPTY + 10 // the share count ticks back

const DIGIT_W = 13
const DIGIT_H = 22
const DIGIT_Y = LIKE[1] - DIGIT_H / 2
const LIKE_X = LIKE[0] + 28
const SHARE_X = SHARE[0] + 30
// one digit that ticks from `a` to `b` on frame `on` and back on frame `off`
const tick = (a: number, b: number, x: number, on: number, off: number): Track<string> => [
  [0, numeral(a, x, DIGIT_Y, DIGIT_W, DIGIT_H), 0],
  [on, numeral(b, x, DIGIT_Y, DIGIT_W, DIGIT_H), 0],
  [off, numeral(a, x, DIGIT_Y, DIGIT_W, DIGIT_H), 0],
  [180, numeral(a, x, DIGIT_Y, DIGIT_W, DIGIT_H)],
]

const likeShare: Icon = {
  name: 'like-share',
  frames: 180,
  still: 84,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [258, 262], s: [90, 90], m: { p: outAndBack<Vec>([0, 0], [2, 5], TAP - 4, 4, TAP, 16) }, shapes: [] },
    {
      id: 'card',
      parent: 'root',
      tilt: FACE,
      shapes: [
        { d: rect(-120, -158, 240, 296, 24), fill: 'white', depth: 1 },
        { d: ellipse(-90, -126, 16), fill: 'main', depth: 0.4 },
        { d: line([-62, -132], [6, -132]) },
        { d: line([-62, -116], [-24, -116]) },
        { d: rect(-100, -92, 200, 140, 14), fill: 'tint' },
        { d: poly([[-100, 32], [-40, -26], [0, 10], [34, -12], [100, 42], [100, 48], [-100, 48]], [2, 6, 6, 6, 2, 2, 2]), fill: 'main', depth: 0.3 },
      ],
    },
    // like button: outline heart that sinks under the tap
    {
      id: 'like',
      parent: 'card',
      a: LIKE,
      p: LIKE,
      m: { p: outAndBack<Vec>([0, 0], PUSH, TAP - 4, 4, TAP, 10) },
      shapes: [{ d: place(HEART, 0.15, LIKE), fill: 'white', depth: 0.4 }],
    },
    { parent: 'like', a: LIKE, p: LIKE, m: popIn(TAP, EMPTY), shapes: [{ d: place(HEART, 0.15, LIKE), fill: 'hot', depth: 0.4 }] },
    { parent: 'card', shapes: [{ d: numeral(1, LIKE_X, DIGIT_Y, DIGIT_W, DIGIT_H), line: 5, round: true }, { d: tick(2, 3, LIKE_X + DIGIT_W + 8, TAP, EMPTY), line: 5, round: true }] },
    // share arrow: pushes out the way it points and comes home on the mirror
    {
      parent: 'card',
      a: SHARE,
      p: SHARE,
      m: { p: outAndBack<Vec>([0, 0], SHOOT, SEND - 4, 4, SEND + 2, 14) },
      shapes: [{ d: arrow(SHARE), fill: 'deep', depth: 0.25 }],
    },
    { parent: 'card', shapes: [{ d: tick(4, 5, SHARE_X, SEND, UNSEND), line: 5, round: true }] },
    // the big heart pops over the photo on the tap, a beat behind the button
    { parent: 'card', a: PHOTO, p: PHOTO, m: popIn(TAP + 2, BIG_OUT), shapes: [{ d: place(HEART, 0.4, PHOTO), fill: 'hot', depth: 0.6 }] },
    glow('root', [150, -150], 24, popIn(TAP + 6, BIG_OUT + 14)),
    glow('root', [160, 40], 16, popIn(SEND + 2, BIG_OUT + 8)),
  ],
}

export default likeShare
