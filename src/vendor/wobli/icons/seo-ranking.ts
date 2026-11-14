// SEO Ranking
import { ellipse, line, pill, rect, star } from '../engine.ts'
import { IN, SOFT } from '../motions.ts'
import { EXT, FACE, LINE, glow, numeral, popIn, popScale } from '../parts.ts'
import type { Icon, Key, Layer, Shape, Track, Vec } from '../engine.ts'

// A results page with four ranked rows. Our row starts last, lifts off the page and climbs one slot at a time, each row it
// passes dropping a step a few frames later. It lands on top, settles back onto the page, and a gold star pops beside it.
// After the hold the row sinks back to last in one sweep while the others rise, top first, so the seam is the opening list.
const SLOTS = [-62, 2, 66, 130] // row centres, rank 1 to 4
const CLIMB = [18, 40, 62] // our row starts each step up
const STEP = 18 // frames per step
const LAG = 4 // a passed row drops this much after our row moves
const ARRIVE = CLIMB[2] + STEP
const BACK = 126 // our row starts to sink
const SINK = 30
const RISE = [BACK + 4, BACK + 8, BACK + 12] // passed rows rise home, top first
const LIFT = 105 // our row's scale while it travels over the others

// a row's y track: rests on slot `from`, steps to `to` at `t` on SOFT, home on IN at `back`
const move = (from: number, to: number, t: number, back: number, blen: number): Track<Vec> => [
  [t, [0, SLOTS[from]], SOFT],
  [t + STEP, [0, SLOTS[to]], 0],
  [back, [0, SLOTS[to]], IN],
  [back + blen, [0, SLOTS[from]]],
]
const OURS: Track<Vec> = [
  ...CLIMB.flatMap((t, i): ReadonlyArray<Key<Vec>> => [
    [t, [0, SLOTS[3 - i]], SOFT],
    [t + STEP, [0, SLOTS[2 - i]], 0],
  ]),
  [BACK, [0, SLOTS[0]], IN],
  [BACK + SINK, [0, SLOTS[3]]],
]
const LIFTED: Track<Vec> = [
  [CLIMB[0] - 8, [100, 100], SOFT],
  [CLIMB[0], [LIFT, LIFT], 0],
  [ARRIVE - 2, [LIFT, LIFT], IN],
  [ARRIVE + 6, [100, 100], 0],
  [BACK - 6, [100, 100], SOFT],
  [BACK + 2, [LIFT, LIFT], 0],
  [BACK + SINK - 4, [LIFT, LIFT], IN],
  [BACK + SINK + 4, [100, 100]],
]

const ROW = { x: -62, w: 172, h: 44 }
const TILE_X = -110
const STAR: Vec = [ROW.x + ROW.w + 20, SLOTS[0] + 4] // off the row's right end, over the page edge

// one result: a slab with a title line and a shorter url line, drawn on its own centre
const result = (fill: Shape['fill'], title: number, url: number): ReadonlyArray<Shape> => [
  { d: rect(ROW.x, -ROW.h / 2, ROW.w, ROW.h, 12), fill, depth: fill === 'main' ? 0.6 : 0.3 },
  { d: line([ROW.x + 18, -7], [ROW.x + 18 + title, -7]) },
  { d: line([ROW.x + 18, 8], [ROW.x + 18 + url, 8]) },
]

const seoRanking: Icon = {
  name: 'seo-ranking',
  frames: 180,
  still: 104,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [252, 254], s: [86, 86], shapes: [] },
    {
      id: 'page',
      parent: 'root',
      tilt: FACE,
      shapes: [
        { d: rect(-132, -170, 264, 340, 26), fill: 'white', depth: 1 },
        // the search bar: a field with a magnifier and the query
        { d: pill(-112, -150, 224, 42), fill: 'paper', depth: 0.3 },
        { d: ellipse(-86, -132, 9), fill: 'white' },
        { d: line([-79, -125], [-70, -116]) },
        { d: line([-54, -129], [26, -129]) },
        // the rank column: fixed, the rows move past it
        ...SLOTS.flatMap((y, i): ReadonlyArray<Shape> => [
          { d: rect(TILE_X - 2, y - 19, 38, 38, 10), fill: i === 0 ? 'gold' : 'grey', depth: 0.3 },
          { d: numeral(i + 1, TILE_X + 11, y - 10, 14, 20), line: 4 },
        ]),
      ],
    },
    { parent: 'page', p: move(0, 1, CLIMB[2] + LAG, RISE[0], STEP), shapes: result('tint', 84, 54) },
    { parent: 'page', p: move(1, 2, CLIMB[1] + LAG, RISE[1], STEP), shapes: result('tint', 104, 64) },
    { parent: 'page', p: move(2, 3, CLIMB[0] + LAG, RISE[2], STEP), shapes: result('tint', 74, 92) },
    // our row, last in the stack so it travels over the rows it passes; the arrow says which way it is going
    {
      parent: 'page',
      p: OURS,
      s: LIFTED,
      shapes: [
        ...result('main', 96, 60),
        { d: line([ROW.x + 136, 6], [ROW.x + 146, -6], [ROW.x + 156, 6]), line: 6 },
      ],
    },
    {
      parent: 'page',
      a: STAR,
      p: STAR,
      s: popScale(ARRIVE, BACK - 8),
      shapes: [{ d: star(STAR[0], STAR[1], 26, 0.48, 5, 3), fill: 'gold', depth: 0.6 }],
    },
    glow('root', [-170, -150], 22, popIn(ARRIVE + 2, BACK - 14)),
    glow('root', [175, -60], 15, popIn(ARRIVE + 8, BACK - 10)),
  ] satisfies ReadonlyArray<Layer>,
}

export default seoRanking
