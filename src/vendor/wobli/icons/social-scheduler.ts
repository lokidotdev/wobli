// Social Scheduler
import { ellipse, line, pill, poly, rect } from '../engine.ts'
import { IN, SOFT } from '../motions.ts'
import { EXT, FACE, LINE, checkBadge, facePoint, glow, hit, popIn, popScale } from '../parts.ts'
import type { Icon, Layer, Shape, Track, Vec } from '../engine.ts'

// Three post cards pop up above the week calendar one after another and drop into their day slots; the calendar takes each
// landing with the spring. On the third, a check pops on the header: the week is scheduled. After the hold the cards rise
// back out of their slots the way they fell, last in first out, and shrink away, so the seam is an empty calendar.
const CAL = { x: -130, y: -112, w: 260, h: 230 }
const HEADER = -52 // the header band's foot
const SLOT_W = 70
const SLOT_H = 66
const COLS = [-113, -35, 43]
const ROWS = [-40, 34]
const SLOTS = COLS.flatMap((x) => ROWS.map((y): Vec => [x, y]))
const POSTS: ReadonlyArray<Vec> = [[COLS[0], ROWS[0]], [COLS[1], ROWS[1]], [COLS[2], ROWS[0]]] // the slots the posts drop into

const ABOVE: Vec = [0, -150] // where a post hangs before it drops, straight up on screen
const GROW = (i: number) => 4 + i * 16 // the post pops in above its slot
const HANG = 10 // frames it hangs before it falls
const FALL = 16
const LAND = (i: number) => GROW(i) + HANG + FALL // and hits the calendar
const LIFT = (i: number) => 122 + (2 - i) * 8 // last in, first out
const RISE = 16
const SHRINK = 8 // frames into the rise it starts to shrink
const DONE = LAND(2) + 4 // the check pops
const UNDONE = LIFT(2) - 14 // and goes before the first post leaves

const BADGE: Vec = [CAL.x + CAL.w - 8, CAL.y + 6]

// a post card on its slot: the image, a caption line and a like dot
const post = ([x, y]: Vec): ReadonlyArray<Shape> => [
  { d: rect(x - 2, y - 2, SLOT_W + 4, SLOT_H + 4, 12), fill: 'white', depth: 0.6 },
  { d: rect(x + 8, y + 8, SLOT_W - 16, 30, 6), fill: 'tint' },
  { d: line([x + 10, y + 52], [x + 38, y + 52]) },
  { d: ellipse(x + 56, y + 52, 6), fill: 'main', line: 4 },
]

// falls into its slot on the ease in, rises back out on its mirror
const postLayer = (slot: Vec, i: number): Layer => {
  const c: Vec = [slot[0] + SLOT_W / 2, slot[1] + SLOT_H / 2]
  const rest = facePoint(c[0], c[1])
  const up: Vec = [rest[0] + ABOVE[0], rest[1] + ABOVE[1]]
  const drop = GROW(i) + HANG
  const P: Track<Vec> = [[drop, up, IN], [LAND(i), rest, 0], [LIFT(i), rest, SOFT], [LIFT(i) + RISE, up]]
  return {
    parent: 'board',
    tilt: FACE,
    a: c,
    p: P,
    ip: GROW(i),
    op: LIFT(i) + SHRINK + 30,
    s: popScale(GROW(i), LIFT(i) + SHRINK),
    shapes: post(slot),
  }
}

const socialScheduler: Icon = {
  name: 'social-scheduler',
  frames: 180,
  still: 96,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [246, 282], s: [94, 94], shapes: [] },
    { id: 'board', parent: 'root', m: POSTS.map((_, i) => hit(LAND(i), [2, 8])), shapes: [] },
    {
      id: 'calendar',
      parent: 'board',
      tilt: FACE,
      shapes: [
        { d: rect(CAL.x, CAL.y, CAL.w, CAL.h, 26), fill: 'white', depth: 1 },
        { d: poly([[CAL.x, CAL.y], [CAL.x + CAL.w, CAL.y], [CAL.x + CAL.w, HEADER], [CAL.x, HEADER]], [26, 26, 0, 0]), fill: 'main' },
        ...[-1, 1].map((s): Shape => ({ d: pill(s * 64 - 13, CAL.y - 24, 26, 50), fill: 'grey', depth: 0.5 })),
        ...SLOTS.map(([x, y]): Shape => ({ d: rect(x, y, SLOT_W, SLOT_H, 10), fill: 'paper', depth: 0.3 })),
      ],
    },
    ...POSTS.map(postLayer),
    { parent: 'calendar', a: BADGE, p: BADGE, s: popScale(DONE, UNDONE), shapes: checkBadge(BADGE, 28) },
    glow('root', [-178, -96], 22, popIn(DONE + 2, UNDONE - 10)),
    glow('root', [176, 40], 15, popIn(DONE + 8, UNDONE - 6)),
  ],
}

export default socialScheduler
