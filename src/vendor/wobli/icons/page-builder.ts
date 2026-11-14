// Page Builder
import { ellipse, line, pill, poly, rect } from '../engine.ts'
import { IN, SOFT } from '../motions.ts'
import { EXT, FACE, LINE, checkBadge, facePoint, glow, hit, popIn, popScale } from '../parts.ts'
import type { Icon, Layer, Shape, Track, Vec } from '../engine.ts'

// An empty browser page waits with three section slots. The hero block pops up above the window and drops into the top slot,
// the feature row follows once it lands, then the footer; the window takes each landing with the spring. On the footer a
// check pops on the toolbar: the page is built. After the hold the blocks lift back out the way they fell, last in first
// out, and shrink away, so the seam is the empty page.
const WIN = { x: -150, y: -128, w: 300, h: 258 }
const BAR = -86 // the toolbar's foot
const PAGE_X = -128
const PAGE_W = 256
// the three sections, top to bottom: hero, feature row, footer
const SECTIONS: ReadonlyArray<{ y: number; h: number }> = [{ y: -72, h: 78 }, { y: 14, h: 58 }, { y: 80, h: 34 }]

const ABOVE: Vec = [0, -150] // where a block hangs before it drops, straight up on screen
const GROW = (i: number) => 4 + i * 26 // each block pops in as the one before it lands
const HANG = 10
const FALL = 16
const LAND = (i: number) => GROW(i) + HANG + FALL
const LIFT = (i: number) => 124 + (2 - i) * 8 // last in, first out
const RISE = 16
const SHRINK = 8 // frames into the rise it starts to shrink
const DONE = LAND(2) + 4 // the check pops
const UNDONE = LIFT(2) - 14 // and goes before the first block leaves

const BADGE: Vec = [WIN.x + WIN.w - 10, WIN.y + 4]

// what each block carries
const hero = (y: number, h: number): ReadonlyArray<Shape> => [
  { d: rect(PAGE_X, y, PAGE_W, h, 12), fill: 'main', depth: 0.6 },
  { d: line([PAGE_X + 22, y + 24], [PAGE_X + 140, y + 24]), line: 7 },
  { d: line([PAGE_X + 22, y + 44], [PAGE_X + 104, y + 44]) },
  { d: pill(PAGE_X + 176, y + 22, 58, 26), fill: 'white', depth: 0.4 },
]
const features = (y: number, h: number): ReadonlyArray<Shape> => [
  { d: rect(PAGE_X, y, PAGE_W, h, 12), fill: 'white', depth: 0.6 },
  ...[0, 1, 2].map((k): Shape => ({ d: rect(PAGE_X + 14 + k * 80, y + 10, 68, h - 20, 8), fill: 'tint', depth: 0.3 })),
  ...[0, 1, 2].map((k): Shape => ({ d: ellipse(PAGE_X + 34 + k * 80, y + h / 2, 8), fill: 'main', line: 4 })),
]
const footer = (y: number, h: number): ReadonlyArray<Shape> => [
  { d: rect(PAGE_X, y, PAGE_W, h, 10), fill: 'deep', depth: 0.6 },
  { d: pill(PAGE_X + 18, y + h / 2 - 5, 60, 10), fill: 'white', line: 4 },
  { d: pill(PAGE_X + 172, y + h / 2 - 5, 66, 10), fill: 'white', line: 4 },
]
const BLOCKS = [hero, features, footer]

// falls into its slot on the ease in, rises back out on its mirror
const blockLayer = (i: number): Layer => {
  const { y, h } = SECTIONS[i]
  const c: Vec = [0, y + h / 2]
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
    shapes: BLOCKS[i](y, h),
  }
}

const pageBuilder: Icon = {
  name: 'page-builder',
  frames: 180,
  still: 104,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [246, 274], s: [92, 92], shapes: [] },
    { id: 'board', parent: 'root', m: SECTIONS.map((_, i) => hit(LAND(i), [2, 8])), shapes: [] },
    {
      id: 'window',
      parent: 'board',
      tilt: FACE,
      shapes: [
        { d: rect(WIN.x, WIN.y, WIN.w, WIN.h, 24), fill: 'white', depth: 1 },
        { d: poly([[WIN.x, WIN.y], [WIN.x + WIN.w, WIN.y], [WIN.x + WIN.w, BAR], [WIN.x, BAR]], [24, 24, 0, 0]), fill: 'deep', depth: 0.2 },
        ...[-126, -106, -86].map((x): Shape => ({ d: ellipse(x, (WIN.y + BAR) / 2, 6), fill: 'white' })),
        { d: pill(-64, WIN.y + 10, 160, 22), fill: 'white' },
        ...SECTIONS.map(({ y, h }): Shape => ({ d: rect(PAGE_X, y, PAGE_W, h, 12), fill: 'paper', depth: 0.3 })),
      ],
    },
    ...SECTIONS.map((_, i) => blockLayer(i)),
    { parent: 'window', a: BADGE, p: BADGE, s: popScale(DONE, UNDONE), shapes: checkBadge(BADGE, 28) },
    glow('root', [-186, -110], 22, popIn(DONE + 2, UNDONE - 10)),
    glow('root', [184, 40], 15, popIn(DONE + 8, UNDONE - 6)),
  ],
}

export default pageBuilder
