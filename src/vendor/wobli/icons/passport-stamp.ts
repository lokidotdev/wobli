// Passport Stamp
import { ellipse, line, onFace, pill, rect } from '../engine.ts'
import { IN, SNAP, SOFT, sparkle } from '../motions.ts'
import { EXT, FACE, LINE, facePoint, glow, hit, outAndBack } from '../parts.ts'
import type { Icon, Shape, Track, Vec } from '../engine.ts'

// The closed passport slides over as its cover swings open across the spine, showing the photo page on the left and a blank
// visa page on the right. The rubber stamp comes down faster and faster and strikes the visa page, which takes the hit on the
// same frame and keeps the mark; the stamp lifts off on the mirror of the way it came. The cover swings shut over the mark,
// the passport settles back where it started and holds, closed.
const W = 150 // one page
const H = 200
const TOP = -H / 2
const LIP = 6 // how far the covers stand proud of the pages

const OPEN = 6 // the cover starts to swing open
const SWING = 28 // spine to spine
const STRIKE = 60 // the stamp touches the page
const CLOSE = 118 // the cover starts to swing shut
const SHUT = CLOSE + SWING // the cover lands
const MID_OPEN = OPEN + SWING / 2 // the cover stands edge on
const MID_CLOSE = CLOSE + SWING / 2

const MARK: Vec = [W / 2, 18] // centre of the mark on the visa page
const MARK_SEEN = onFace(FACE, MARK)
const STAMP_UP: Vec = [70, -150]

// the cover folds over the spine: its front shrinks to edge on and its back opens out on the left, and the reverse to close
const COVER_FRONT: Track<Vec> = [[OPEN, [100, 100], SNAP], [OPEN + SWING, [-100, 100], 0], [CLOSE, [-100, 100], SNAP], [SHUT, [100, 100]]]
const COVER_BACK: Track<Vec> = [[OPEN, [-100, 100], SNAP], [OPEN + SWING, [100, 100], 0], [CLOSE, [100, 100], SNAP], [SHUT, [-100, 100]]]

// the outside of the front cover: a deep slab with the crest and the title bar
const coverFront = (): ReadonlyArray<Shape> => [
  { d: rect(0, TOP - LIP, W + LIP, H + LIP * 2, 12), fill: 'deep', depth: 0.6 },
  { d: ellipse(W / 2 + 3, -18, 30), fill: 'gold', depth: 0.2 },
  { d: ellipse(W / 2 + 3, -18, 15), line: 4 },
  { d: line([W / 2 - 12, -18], [W / 2 + 18, -18]), line: 4 },
  { d: pill(W / 2 - 37, 40, 80, 14), fill: 'gold', depth: 0.2 },
  { d: pill(W / 2 - 22, 66, 50, 10), fill: 'gold', line: 3 },
]

// the inside of the front cover, lying on the left: the photo page with a portrait and a few lines
const photoPage = (): ReadonlyArray<Shape> => [
  { d: rect(-W - LIP, TOP - LIP, W + LIP, H + LIP * 2, 12), fill: 'deep', depth: 0.6 },
  { d: rect(-W, TOP, W - 4, H, 6), fill: 'white', depth: 0.2 },
  { d: rect(-W + 18, TOP + 22, 58, 72, 6), fill: 'tint', depth: 0.1 },
  { d: ellipse(-W + 47, TOP + 50, 13), fill: 'main' },
  { d: `M${-W + 25} ${TOP + 94}C${-W + 27} ${TOP + 72} ${-W + 67} ${TOP + 72} ${-W + 69} ${TOP + 94}Z`, fill: 'main' },
  { d: line([-W + 88, TOP + 34], [-22, TOP + 34]) },
  { d: line([-W + 88, TOP + 56], [-36, TOP + 56]) },
  { d: line([-W + 18, TOP + 124], [-22, TOP + 124]) },
  { d: line([-W + 18, TOP + 148], [-50, TOP + 148]) },
  { d: line([-W + 18, TOP + 172], [-34, TOP + 172]), line: 3 },
]

// the back cover and the blank visa page on the right, a faint frame where the stamp goes
const visaPage = (): ReadonlyArray<Shape> => [
  { d: rect(0, TOP - LIP, W + LIP, H + LIP * 2, 12), fill: 'deep', depth: 1 },
  { d: rect(4, TOP, W - 4, H, 6), fill: 'white', depth: 0.4 },
  { d: line([22, TOP + 24], [W - 22, TOP + 24]), line: 3 },
  { d: line([22, H / 2 - 22], [W - 54, H / 2 - 22]), line: 3 },
]

// the mark: a raised ring in the stamp's colour, a white field, a little check and two lines of ink
const stampMark = ([x, y]: Vec): ReadonlyArray<Shape> => [
  { d: ellipse(x, y, 44), fill: 'main', depth: 0.15 },
  { d: ellipse(x, y, 32), fill: 'white', line: 3 },
  { d: line([x - 12, y - 4], [x - 3, y + 6], [x + 14, y - 12]), line: 5 },
  { d: line([x - 16, y + 18], [x + 16, y + 18]), line: 3 },
]

const passportStamp: Icon = {
  name: 'passport-stamp',
  frames: 180,
  still: 96,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [256, 300], s: [102, 102], shapes: [] },
    // untilted carrier: centred while closed, slides over as it opens so the open spread is centred, takes the strike and the slam
    {
      id: 'book',
      parent: 'root',
      p: outAndBack<Vec>(facePoint(-W / 2, 0), [0, 0], OPEN, SWING, CLOSE, SWING),
      m: [hit(STRIKE, [3, 9]), hit(SHUT, [2, 5], 0.35)],
      shapes: [],
    },
    { id: 'pages', parent: 'book', tilt: FACE, shapes: visaPage() },
    { parent: 'pages', a: MARK, p: MARK, r: -14, ip: STRIKE, op: SHUT, shapes: stampMark(MARK) },
    // the cover: its inside opens out on the left, its outside folds over the spine, cut at the frame it stands edge on
    { parent: 'book', tilt: FACE, s: COVER_BACK, ip: MID_OPEN, op: MID_CLOSE, shapes: photoPage() },
    { parent: 'book', tilt: FACE, s: COVER_FRONT, op: MID_OPEN, shapes: coverFront() },
    { parent: 'book', tilt: FACE, s: COVER_FRONT, ip: MID_CLOSE, shapes: coverFront() },
    // the stamp: down on an ease in to the strike, a beat pressed, then up on its mirror
    {
      parent: 'book',
      p: [MARK_SEEN[0] + 4, MARK_SEEN[1] + 4],
      tilt: FACE,
      m: { p: [[STRIKE - 22, STAMP_UP, IN], [STRIKE, [0, 0], 0], [STRIKE + 10, [0, 0], SOFT], [STRIKE + 44, STAMP_UP]] },
      shapes: [
        { d: rect(-46, -6, 92, 16, 6), fill: 'main', depth: 0.4 },
        { d: rect(-58, -46, 116, 42, 12), fill: 'white', depth: 1 },
        { d: rect(-14, -94, 28, 50, 4), fill: 'white', depth: 0.8 },
        { d: ellipse(0, -114, 28), fill: 'main', depth: 1 },
      ],
    },
    glow('root', [-170, -130], 22, sparkle(STRIKE + 6)),
    glow('root', [176, 96], 15, sparkle(STRIKE + 14)),
  ],
}

export default passportStamp
