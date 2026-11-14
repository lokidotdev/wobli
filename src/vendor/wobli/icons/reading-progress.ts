// Reading Progress
import { at, line, pill, rect } from '../engine.ts'
import { IN, SOFT, fall } from '../motions.ts'
import { EXT, FACE, LINE, checkBadge, glow, hit, numeral, popIn, popScale } from '../parts.ts'
import type { Icon, Key, Layer, Motion, Shape, Track, Vec } from '../engine.ts'

// One book lies on the desk. Three more pop into the air above it and drop onto the pile one after another; each lands
// with a thud the books under it take, and on that frame the progress card beside it ticks up and its bar fills a step.
// The third book completes the bar, a check pops on the card and a sparkle follows. After the hold the books pop away top
// first, the bar draining and the count ticking down with them, so the pile is one book again at the seam.
const APPEAR = 8 // the first book pops in
const GAP = 26 // each next book follows this much later
const WAIT = 10 // frames a book hangs before it drops
const FALL_LEN = 16
const landAt = (i: number) => APPEAR + (i - 1) * GAP + WAIT + FALL_LEN // book i (1 to 3) lands on the pile
const RISE = 16 // frames the bar takes to fill a step
const DONE = landAt(3) + RISE // the bar is full
const BACK = 128 // the books start to leave
const LEAVE_GAP = 7 // each lower book follows the one above it
const leaveAt = (i: number) => BACK + (3 - i) * LEAVE_GAP // book i pops away, top first
const GONE = 30 // a twinkle out has shrunk to nothing
const TICK = 22 // the count drops once the book is mostly gone

// the pile, on the house face: books bottom to top, each a spine with its own width, shift and colours
const BOOK_H = 40
const SIDE = 20 // the slab's side, measured up the face: a book rests on the top edge of the one under it
const FLOOR = 116 // the bottom book's lower edge
type Book = { w: number; x: number; body: Shape['fill']; band: Shape['fill'] }
const BOOKS: ReadonlyArray<Book> = [
  { w: 196, x: 0, body: 'deep', band: 'white' },
  { w: 172, x: 12, body: 'main', band: 'white' },
  { w: 184, x: 2, body: 'white', band: 'main' },
  { w: 160, x: 16, body: 'deep', band: 'main' },
]
const bookTop = (i: number) => FLOOR - BOOK_H - i * (BOOK_H + SIDE)
const bookMid = (i: number): Vec => [BOOKS[i].x, bookTop(i) + BOOK_H / 2]
const DROP_H = 110 // how far above its place a book appears

// a book seen from its spine: the cover slab, a band near each end and a title line between them
const book = ({ w, x, body, band }: Book, top: number): ReadonlyArray<Shape> => {
  const [l, r] = [x - w / 2, x + w / 2]
  return [
    { d: rect(l, top, w, BOOK_H, 10), fill: body, depth: 1 },
    { d: rect(l + 18, top + 8, 12, BOOK_H - 16, 3), fill: band, depth: 0.2 },
    { d: rect(r - 30, top + 8, 12, BOOK_H - 16, 3), fill: band, depth: 0.2 },
    { d: line([l + 46, top + BOOK_H / 2], [r - 62, top + BOOK_H / 2]), line: 6, round: true },
  ]
}

// the books under a landing take the thud, the nearest hardest
const thuds = (i: number): ReadonlyArray<Motion> =>
  [1, 2, 3].filter((j) => j >= i && j > 0).map((j) => hit(landAt(j), [0, j === i ? 7 : Math.max(2, 6 - (j - i) * 2)], 0.5))

// book i (1 to 3): pops in above its place, hangs, drops on DROP, lands with a thud, and pops away top first after the hold
const dropped = (i: number): Layer => {
  const t = APPEAR + (i - 1) * GAP
  const mid = bookMid(i)
  return {
    parent: 'pile',
    a: mid,
    p: [mid[0], mid[1] - DROP_H],
    s: popScale(t, leaveAt(i)),
    m: [fall([0, DROP_H], t + WAIT, FALL_LEN), ...thuds(i)],
    shapes: book(BOOKS[i], bookTop(i)),
  }
}

// the bar's share: a step per landing out of where it stood on SOFT; home in one sweep on IN, its mirror
const LEVEL: Track<number> = [
  ...[1, 2, 3].flatMap((i): ReadonlyArray<Key<number>> => [
    [landAt(i), (i - 1) / 3, SOFT],
    [landAt(i) + RISE, i / 3, 0],
  ]),
  [BACK, 1, IN],
  [leaveAt(1) + GONE, 0],
]

const FRAMES = Array.from({ length: 181 }, (_, f) => f)
// holds a value until the frame it changes
const steps = <T>(value: (f: number) => T): Track<T> =>
  FRAMES.filter((f) => f === 0 || f === 180 || value(f) !== value(f - 1)).map((f) => [f, value(f), 0] as const)

// the count of books on the pile: up on each landing, down as each pops away
const countAt = (f: number) => 1 + [1, 2, 3].filter((i) => f >= landAt(i) && f < leaveAt(i) + TICK).length

// the progress card: a book glyph and the count over a bar
const CARD = { x: -76, y: -66, w: 152, h: 132 }
const BAR = { x: -54, y: 24, w: 108, h: 20 }
const MIN_FILL = BAR.h // the fill never narrower than its own round ends
const fill = (share: number) => pill(BAR.x, BAR.y, MIN_FILL + share * (BAR.w - MIN_FILL), BAR.h)
// keyed every other frame while it moves, held still between, so the pill morphs
const FILL: Track<string> = FRAMES.filter((f, i) => i % 2 === 0 || f === 180)
  .filter((f) => f === 0 || f === 180 || at(LEVEL, f) !== at(LEVEL, f - 2) || at(LEVEL, f + 2) !== at(LEVEL, f))
  .map((f) => [f, fill(at(LEVEL, f))] as const)
const DIGIT_W = 30
const DIGIT_H = 46
const BADGE: Vec = [CARD.x + CARD.w + 2, CARD.y - 2]

const readingProgress: Icon = {
  name: 'reading-progress',
  frames: 180,
  still: 118,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [250, 270], shapes: [] },
    { id: 'pile', parent: 'root', tilt: FACE, p: [-74, 10], shapes: [] },
    { parent: 'pile', m: thuds(0), shapes: book(BOOKS[0], bookTop(0)) },
    ...[1, 2, 3].map(dropped),
    {
      id: 'card',
      parent: 'root',
      tilt: FACE,
      p: [124, -40],
      shapes: [
        { d: rect(CARD.x, CARD.y, CARD.w, CARD.h, 26), fill: 'white', depth: 1 },
        // a small closed book: cover with a page edge
        { d: rect(-56, -40, 36, 48, 6), fill: 'main', depth: 0.4 },
        { d: line([-28, -32], [-28, 0]), line: 5 },
        { d: steps((f) => numeral(countAt(f), -4, -38, DIGIT_W, DIGIT_H)), line: 9, round: true },
        { d: pill(BAR.x, BAR.y, BAR.w, BAR.h), fill: 'paper', depth: 0.3 },
        { d: FILL, fill: 'main', depth: 0.3, crease: false },
      ],
    },
    // the goal check, on the card's corner once the bar is full
    { parent: 'card', a: BADGE, p: BADGE, s: popScale(DONE, BACK - 6), shapes: checkBadge(BADGE, 24) },
    glow('root', [-170, -170], 22, popIn(DONE + 2, BACK - 14)),
    glow('root', [190, 110], 15, popIn(DONE + 8, BACK - 8)),
  ],
}

export default readingProgress
