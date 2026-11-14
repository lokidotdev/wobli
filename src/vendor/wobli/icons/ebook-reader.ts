// E-Book Reader
import { ellipse, line, poly, rect } from '../engine.ts'
import { SNAP } from '../motions.ts'
import { EXT, FACE, LINE, glow, popIn } from '../parts.ts'
import type { Icon, Layer, Shape, Vec } from '../engine.ts'

// A tablet holds an open book. Three pages turn one by one over the spine, each folding up from the right and laying its back
// down on the left a beat after the one before it; a sparkle lands with the last page. The third spread is the first one
// again, so the long hold that follows loops straight back into the first turn.
const PAGE_W = 132
const PAGE_H = 170
const GUTTER = 5 // gap either side of the spine
const TOP = -PAGE_H / 2
const SPINE: Vec = [0, 0]

const TURN = 12 // the first page lifts
const TURN_LEN = 26 // spine to spine
const STAGGER = 22 // the next page follows
const LAND = TURN + 2 * STAGGER + TURN_LEN // the last page lies down
const SPARKLE_OUT = 132

// a page's left edge on either side of the spine
const edge = (side: 'left' | 'right') => (side === 'left' ? -GUTTER - PAGE_W : GUTTER)

const sheetShape = (side: 'left' | 'right'): Shape => ({ d: rect(edge(side), TOP, PAGE_W, PAGE_H, 6), fill: 'white', depth: 0.2 })

// lines of text, lengths as shares of the text width, from y down
const text = (x: number, y: number, lens: ReadonlyArray<number>, gap = 22): ReadonlyArray<Shape> =>
  lens.map((k, i) => ({ d: line([x, y + i * gap], [x + (PAGE_W - 40) * k, y + i * gap]) }))

type Kind = 'text' | 'pic' | 'chapter' | 'prose'
const content = (side: 'left' | 'right', kind: Kind): ReadonlyArray<Shape> => {
  const x = edge(side) + 20
  if (kind === 'pic') {
    const [w, h, y] = [PAGE_W - 40, 74, TOP + 20]
    return [
      { d: rect(x, y, w, h, 6), fill: 'tint', depth: 0.1 },
      { d: ellipse(x + w - 24, y + 22, 11), fill: 'gold', depth: 0.1 },
      { d: poly([[x, y + h], [x + 30, y + 34], [x + 52, y + 56], [x + 70, y + 42], [x + w, y + h]], [3, 4, 3, 4, 3]), fill: 'main', depth: 0.1 },
      ...text(x, y + h + 26, [1, 0.8, 0.55]),
    ]
  }
  if (kind === 'chapter') {
    return [{ d: rect(x, TOP + 22, 56, 18, 5), fill: 'main', depth: 0.1 }, ...text(x, TOP + 66, [1, 0.9, 1, 0.7, 0.45])]
  }
  if (kind === 'prose') return text(x, TOP + 26, [1, 0.85, 1, 0.92, 1, 0.6])
  return text(x, TOP + 26, [0.9, 1, 0.75, 1, 0.88, 0.5])
}

const page = (side: 'left' | 'right', kind: Kind): ReadonlyArray<Shape> => [sheetShape(side), ...content(side, kind)]

// one turning page: its front folds over the spine on SNAP and is cut at the halfway frame, when it stands edge on;
// its back takes over on the mirrored track, so it lands on the left reading the right way round
const turn = (i: number, front: Kind, back: Kind): ReadonlyArray<Layer> => {
  const t = TURN + i * STAGGER
  return [
    { parent: 'book', a: SPINE, p: SPINE, s: [[t, [100, 100], SNAP], [t + TURN_LEN, [-100, 100]]], op: t + TURN_LEN / 2, shapes: page('right', front) },
    { parent: 'book', a: SPINE, p: SPINE, s: [[t, [-100, 100], SNAP], [t + TURN_LEN, [100, 100]]], ip: t + TURN_LEN / 2, shapes: page('left', back) },
  ]
}

// spreads, first to last: text | pic, prose | chapter, pic | text, then text | pic again
const [P1, P2, P3] = [turn(0, 'pic', 'prose'), turn(1, 'chapter', 'pic'), turn(2, 'text', 'text')]

const ebookReader: Icon = {
  name: 'ebook-reader',
  frames: 180,
  still: 100,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [258, 244], s: [84, 84], shapes: [] },
    {
      id: 'tablet',
      parent: 'root',
      tilt: FACE,
      shapes: [
        { d: rect(84, -132, 50, 14, 5), fill: 'deep', depth: 0.8 }, // the top button, behind the body
        { d: rect(-176, -124, 352, 248, 30), fill: 'deep', depth: 1 },
        { d: rect(-156, -104, 312, 208, 12), fill: 'paper', depth: 0.2 },
        { d: ellipse(0, -114, 4), fill: 'ink', line: false },
      ],
    },
    { id: 'book', parent: 'tablet', shapes: [] },
    // the pages that never move: the first left page, the last right page under the stack
    { parent: 'book', shapes: [...page('left', 'text'), ...page('right', 'pic')] },
    { parent: 'book', shapes: [{ d: line([0, TOP + 4], [0, TOP + PAGE_H - 4]) }] }, // the spine
    // right hand stack, top page last so it draws over the ones under it
    P3[0],
    P2[0],
    P1[0],
    // left hand pile, each back lies down over the one before
    P1[1],
    P2[1],
    P3[1],
    glow('root', [-170, -150], 22, popIn(LAND, SPARKLE_OUT)),
    glow('root', [178, -112], 15, popIn(LAND + 6, SPARKLE_OUT + 4)),
  ],
}

export default ebookReader
