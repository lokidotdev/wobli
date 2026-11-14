// Live Stream
import { ellipse, line, pill, rect } from '../engine.ts'
import { EASY, SOFT } from '../motions.ts'
import { EXT, FACE, LINE, PHONE_SCREEN, facePoint, glow, outAndBack, phoneBody, popIn } from '../parts.ts'
import type { Icon, Layer, Shape, Track, Vec } from '../engine.ts'

// A phone streaming a face to the room. The LIVE badge beats twice, a double pulse that says the feed is on air. Then the heart
// button sinks three times and on each press a heart grows out of it and floats up past the phone, leaning as it rises and
// settling where it lands. The hearts hold above the stream, then pop away one after another and the badge beats again for the loop.
const HEART = 'M0 92C-24 74 -132 8 -132 -48C-132 -94 -98 -122 -62 -122C-34 -122 -12 -106 0 -84C12 -106 34 -122 62 -122C98 -122 132 -94 132 -48C132 8 24 74 0 92Z'
// grows a path of plain x y pairs about the origin and moves it to c
const place = (d: string, k: number, [cx, cy]: Vec) =>
  d.replace(/(-?\d+\.?\d*) (-?\d+\.?\d*)/g, (_, x: string, y: string) => `${+(cx + +x * k).toFixed(2)} ${+(cy + +y * k).toFixed(2)}`)

const BADGE: Vec = [-31, -111] // the LIVE badge's centre on the screen
const LIKE: Vec = [44, 109] // the heart button's centre on the screen
const LIKE_SEEN = facePoint(...LIKE) // where the hearts grow from, in the root's space
const PUSH: Vec = [-1, 4] // the button sinks along its own side
const BEAT = 4 // the badge's first pulse; the second follows 14 frames on
const TAPS = [34, 48, 62] as const // the button goes down, a heart leaves on each
const LEAVE = 140 // the hearts pop away, one after another

// a double pulse: out on SOFT, home on IN, twice
const pulse = (t: number, k: number): Track<Vec> => [...outAndBack<Vec>([100, 100], [k, k], t, 6, t + 6, 8), ...outAndBack<Vec>([100, 100], [k, k], t + 14, 6, t + 20, 10)]

// where each heart floats to (from the button), how far it leans, its colour and size
const FLOATS: ReadonlyArray<readonly [Vec, number, Shape['fill'], number]> = [
  [[30, -250], -14, 'hot', 0.24],
  [[96, -186], 12, 'main', 0.19],
  [[64, -118], -8, 'hot', 0.16],
]

const heart = ([to, turn, fill, k]: (typeof FLOATS)[number], i: number): Layer => {
  const t = TAPS[i]
  const out = LEAVE + i * 6
  return {
    parent: 'root',
    a: LIKE_SEEN,
    p: LIKE_SEEN,
    m: [
      { p: [[t, [0, 0], SOFT], [t + 48, to], [out + 30, to, 0], [out + 31, [0, 0]]], r: [[t, 0, EASY], [t + 24, turn, EASY], [t + 48, turn * 0.4]] },
      ...popIn(t, out),
    ],
    shapes: [{ d: place(HEART, k, LIKE_SEEN), fill, depth: 0.5, edges: [[LIKE_SEEN[0], LIKE_SEEN[1] + 92 * k]] }],
  }
}

const liveStream: Icon = {
  name: 'live-stream',
  frames: 180,
  still: 112,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [214, 300], s: [92, 92], shapes: [] },
    { id: 'phone', parent: 'root', tilt: FACE, shapes: phoneBody(32, 'deep') },
    {
      parent: 'phone',
      shapes: [
        { d: PHONE_SCREEN(22), fill: 'tint' },
        // the streamer: shoulders and a head
        { d: 'M-58 84A58 52 0 0 1 58 84Z', fill: 'main', depth: 0.3 },
        { d: ellipse(0, -10, 30), fill: 'main', depth: 0.3 },
        // viewer count
        { d: pill(18, -124, 46, 26), fill: 'white', depth: 0.3 },
        { d: line([32, -111], [52, -111]) },
        // comment field
        { d: pill(-60, 96, 78, 26), fill: 'white', depth: 0.3 },
        { d: line([-48, 109], [0, 109]) },
      ],
    },
    {
      parent: 'phone',
      a: LIKE,
      p: LIKE,
      m: TAPS.map((t) => ({ p: outAndBack<Vec>([0, 0], PUSH, t - 4, 4, t, 8) })),
      shapes: [
        { d: ellipse(LIKE[0], LIKE[1], 17), fill: 'white', depth: 0.4 },
        { d: place(HEART, 0.075, [LIKE[0], LIKE[1] + 1]), fill: 'hot', line: 3 },
      ],
    },
    {
      parent: 'phone',
      a: BADGE,
      p: BADGE,
      m: { s: pulse(BEAT, 118) },
      shapes: [
        { d: rect(-62, -124, 62, 26, 9), fill: 'hot', depth: 0.4 },
        { d: ellipse(-50, -111, 5), fill: 'white', line: 3 },
        // L I V E in ink strokes
        { d: line([-39, -117], [-39, -105], [-33, -105]), line: 3 },
        { d: line([-29, -117], [-29, -105]), line: 3 },
        { d: line([-25, -117], [-21, -105], [-17, -117]), line: 3 },
        { d: line([-6, -117], [-13, -117], [-13, -105], [-6, -105]), line: 3 },
        { d: line([-13, -111], [-7, -111]), line: 3 },
      ],
    },
    ...FLOATS.map(heart),
    glow('root', [150, -190], 22, popIn(TAPS[0] + 30, LEAVE - 8)),
  ],
}

export default liveStream
