// Story Ring
import { arc, ellipse, ring } from '../engine.ts'
import { IN, SOFT } from '../motions.ts'
import { EXT, FACE, LINE, facePoint, glow, outAndBack, popIn, popScale } from '../parts.ts'
import type { Icon, Layer, Shape, Track, Vec } from '../engine.ts'

// A new story: the ring round the avatar spins in, its segments popping one after another as it winds, and settles closed
// with no overshoot. On the frame it closes the avatar swells a touch and a sparkle lands. After the hold the ring winds on
// the same way, its segments shrinking last in, first out, until only the avatar is left.
const FILL = 10 // the first segment pops and the ring starts to wind
const GAP = 5 // between segments
const SEGMENTS = 8
const CLOSE = FILL + (SEGMENTS - 1) * GAP + 10 // the ring has closed and stopped
const EMPTY = 126 // the last segment leaves first
const OUT_GAP = 2
const UNWIND = 44 // the ring winds on as it empties
const WIND = 135 // degrees the ring turns coming in and going out; a multiple of the pattern's 90, so it lands on itself
const RESET = 176 // every segment is gone by now, so the ring jumps back unseen

// the ring: a white track and eight annular segments alternating the two accents, the gradient told in steps
const [TRACK_OUT, TRACK_IN] = [154, 98]
const [R_OUT, R_IN] = [146, 120]
const segment = (i: number) => {
  const a = -90 + i * (360 / SEGMENTS) + 3
  const b = a + 360 / SEGMENTS - 6
  return `${arc(0, 0, R_OUT, a, b)}${arc(0, 0, R_IN, b, a).replace('M', 'L')}Z`
}
const segMid = (i: number): Vec => {
  const m = ((-90 + (i + 0.5) * (360 / SEGMENTS)) * Math.PI) / 180
  const r = (R_OUT + R_IN) / 2
  return [Math.cos(m) * r, Math.sin(m) * r]
}
const ringSegment = (i: number): Layer => {
  const c = segMid(i)
  return {
    parent: 'ring',
    a: c,
    p: c,
    s: [[0, [0, 0], 0], ...popScale(FILL + i * GAP, EMPTY + (SEGMENTS - 1 - i) * OUT_GAP)],
    shapes: [{ d: segment(i), fill: i % 2 ? 'deep' : 'main', depth: 0.45 }],
  }
}

// the ring winds in on a soft ease, stops closed, and winds on the same way as it empties
const SPIN: Track<number> = [
  [FILL, -WIND, SOFT],
  [CLOSE, 0, 0],
  [EMPTY, 0, IN],
  [EMPTY + UNWIND, WIND, 0],
  [RESET, -WIND],
]

// the avatar: a slab disc with a raised white head and shoulders
const R_AVATAR = 84
const AVATAR: ReadonlyArray<Shape> = [
  { d: ellipse(0, 0, R_AVATAR), fill: 'main', depth: 1 },
  { d: ellipse(0, -R_AVATAR * 0.24, R_AVATAR * 0.3), fill: 'white', depth: 0.3 },
  {
    d: `M${-R_AVATAR * 0.56} ${R_AVATAR * 0.62}A${R_AVATAR * 0.56} ${R_AVATAR * 0.46} 0 0 1 ${R_AVATAR * 0.56} ${R_AVATAR * 0.62}Z`,
    fill: 'white',
    depth: 0.3,
  },
]

const storyRing: Icon = {
  name: 'story-ring',
  frames: 180,
  still: 100,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [250, 262], shapes: [] },
    { id: 'face', parent: 'root', tilt: FACE, shapes: [{ d: ring(0, 0, TRACK_OUT, TRACK_IN), fill: 'white', depth: 0.3 }] },
    { id: 'ring', parent: 'face', r: SPIN, shapes: [] },
    ...Array.from({ length: SEGMENTS }, (_, i) => ringSegment(i)),
    // the avatar swells a touch on the frame the ring closes, and comes home without overshoot
    { parent: 'face', m: { s: outAndBack<Vec>([100, 100], [107, 107], CLOSE - 4, 8, CLOSE + 6, 14) }, shapes: AVATAR },
    glow('root', facePoint(-150, -150), 24, popIn(CLOSE, EMPTY - 10)),
    glow('root', facePoint(170, 110), 16, popIn(CLOSE + 6, EMPTY - 4)),
  ],
}

export default storyRing
