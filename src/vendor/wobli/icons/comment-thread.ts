// Comment Thread
import { ellipse, line, poly, rect } from '../engine.ts'
import { EXT, FACE, LINE, glow, numeral, popIn, popScale } from '../parts.ts'
import type { Icon, Layer, Shape, Track, Vec } from '../engine.ts'

// A post sits on top. One after another three comments stack up under it: each commenter's avatar pops in on the thread line,
// their bubble grows out of it a beat later, and the post's comment count ticks up on the same frame. The middle one is a reply,
// indented. A sparkle lands on the last; after a long hold the comments shrink back into their avatars, last in first out,
// and the count ticks back down with them.
const POST = { x: -128, y: -206, w: 256, h: 132 }
const STEP = 20 // between one comment and the next
const JOIN = [22, 22 + STEP, 22 + STEP * 2] // an avatar pops in
const SAY = 5 // its bubble follows this many frames later
const LEAVE = [150, 140, 130] // last in, first out
const ROW_H = 46
const GONE = 20 // a leaving comment is all but shrunk away this many frames after it starts: the count ticks down then

// each comment: avatar centre, its fill, bubble width and fill
const COMMENTS: ReadonlyArray<{ at: Vec; r: number; fill: Shape['fill']; w: number; bg: Shape['fill'] }> = [
  { at: [-104, 6], r: 20, fill: 'deep', w: 196, bg: 'tint' },
  { at: [-56, 76], r: 17, fill: 'main', w: 156, bg: 'white' },
  { at: [-104, 146], r: 20, fill: 'deep', w: 196, bg: 'tint' },
]

// the count beside the post's comment glyph: ticks up as each comment lands, back down as each leaves
const COUNT_X = POST.x + POST.w - 40
const COUNT_Y = POST.y + POST.h - 40
// a small speech bubble glyph, tail under its bottom left
const [GX, GY] = [COUNT_X - 46, COUNT_Y - 2]
const GLYPH = poly([[GX, GY], [GX + 34, GY], [GX + 34, GY + 20], [GX + 14, GY + 20], [GX + 4, GY + 30], [GX + 6, GY + 20], [GX, GY + 20]], [7, 7, 7, 2, 2, 2, 7])
const DIGIT_W = 13
const DIGIT_H = 22
const digit = (n: number) => numeral(n, COUNT_X, COUNT_Y, DIGIT_W, DIGIT_H)
const COUNT: Track<string> = [
  [0, digit(0), 0],
  [JOIN[0] + SAY, digit(1), 0],
  [JOIN[1] + SAY, digit(2), 0],
  [JOIN[2] + SAY, digit(3), 0],
  [LEAVE[2] + GONE, digit(2), 0],
  [LEAVE[1] + GONE, digit(1), 0],
  [LEAVE[0] + GONE, digit(0), 0],
  [180, digit(0)],
]

// its stretch of the thread line, back up to the comment above it (or the post), grows with the avatar
const THREAD_X = -104
const below = (i: number) => COMMENTS[i].at[1] + COMMENTS[i].r // the bottom of an earlier avatar, so the line never crosses it
const thread = ([x, y]: Vec, i: number): ReadonlyArray<Shape> =>
  x === THREAD_X
    ? [{ d: line([x, i === 0 ? POST.y + POST.h : below(i - 2)], [x, y]) }]
    : [{ d: line([THREAD_X, below(i - 1)], [THREAD_X, y], [x, y]) }]

const avatar = ({ at, r, fill }: (typeof COMMENTS)[number], i: number): Layer => ({
  parent: 'face',
  a: at,
  p: at,
  s: popScale(JOIN[i], LEAVE[i]),
  shapes: [
    ...thread(at, i),
    { d: ellipse(at[0], at[1], r), fill, depth: 0.8 },
    { d: ellipse(at[0], at[1] - r * 0.22, r * 0.32), fill: 'white', depth: 0.2 },
  ],
})

// the bubble grows out of the avatar's side
const comment = ({ at, r, w, bg }: (typeof COMMENTS)[number], i: number): Layer => {
  const x = at[0] + r + 16
  const y = at[1] - ROW_H / 2
  const edge: Vec = [at[0] + r + 4, at[1]]
  return {
    parent: 'face',
    a: edge,
    p: edge,
    s: popScale(JOIN[i] + SAY, LEAVE[i] - SAY),
    shapes: [
      { d: rect(x, y, w, ROW_H, 18), fill: bg, depth: 0.5 },
      { d: line([x + 18, at[1] - 7], [x + w - 34, at[1] - 7]) },
      { d: line([x + 18, at[1] + 9], [x + w * 0.5, at[1] + 9]) },
    ],
  }
}

const commentThread: Icon = {
  name: 'comment-thread',
  frames: 180,
  still: 100,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [258, 262], s: [92, 92], shapes: [] },
    {
      id: 'face',
      parent: 'root',
      tilt: FACE,
      shapes: [
        // the post
        { d: rect(POST.x, POST.y, POST.w, POST.h, 24), fill: 'white', depth: 1 },
        { d: ellipse(POST.x + 34, POST.y + 34, 18), fill: 'main', depth: 0.5 },
        { d: line([POST.x + 66, POST.y + 28], [POST.x + 170, POST.y + 28]) },
        { d: line([POST.x + 66, POST.y + 46], [POST.x + 128, POST.y + 46]) },
        { d: line([POST.x + 24, POST.y + 82], [POST.x + 150, POST.y + 82]) },
        // the comment glyph and its count
        { d: GLYPH, fill: 'main', depth: 0.3 },
        { d: COUNT, line: 5, round: true },
      ],
    },
    ...COMMENTS.flatMap((c, i) => [avatar(c, i), comment(c, i)]),
    glow('root', [182, 66], 22, popIn(JOIN[2] + SAY + 4, 124)),
  ],
}

export default commentThread
