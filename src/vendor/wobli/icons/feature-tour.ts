// Feature Tour
import { ellipse, line, pill, poly, rect } from '../engine.ts'
import { SNAP } from '../motions.ts'
import { EXT, FACE, LINE, glow, outAndBack, popIn, popScale } from '../parts.ts'
import type { Icon, Layer, Shape, Track, Vec } from '../engine.ts'

// A spotlight sits on the app card's avatar and a tooltip pops up out of it. The spotlight glides to the chart, the tooltip
// following a beat behind with its step dot moving on, then on to the start button; each part swells on the frame the light
// lands on it, and a sparkle marks the last step. After the hold the tooltip pops away and the light glides home to the avatar.
const SHOW = 12 // the tooltip pops up on the avatar
const MOVE = [50, 92] // the spotlight leaves for the next step
const LEN = 24 // one glide
const LAG = 5 // the tooltip follows the light this much later
const HIDE = 140 // the tooltip pops away
const HOME = 148 // the light glides back to the avatar

// the three steps: the spotlight's plate, where the tooltip's tail points, and where the part swells from
const SPOTS = [rect(-110, -150, 84, 84, 22), rect(-110, -64, 220, 116, 22), rect(-114, 58, 228, 80, 26)]
const TIPS: ReadonlyArray<Vec> = [[-68, -60], [-36, 58], [-24, 144]]
const LANDS = [SHOW, MOVE[0] + LEN, MOVE[1] + LEN]
const DOT_GAP = 18

// steps from one slot to the next on SNAP, holding between, and home after `back`
function steps<T>(slots: ReadonlyArray<T>, delay: number, back: number, blen: number): Track<T> {
  return [
    [MOVE[0] + delay, slots[0], SNAP],
    [MOVE[0] + delay + LEN, slots[1], 0],
    [MOVE[1] + delay, slots[1], SNAP],
    [MOVE[1] + delay + LEN, slots[2], 0],
    [back, slots[2], blen ? SNAP : 0],
    [back + Math.max(blen, 1), slots[0]],
  ]
}

// the tooltip, tail tip at 0 0 pointing up at its step: two lines, three step dots and a next pill
const TOOLTIP: ReadonlyArray<Shape> = [
  { d: poly([[-34, 16], [-12, 16], [0, 0], [12, 16], [126, 16], [126, 90], [-34, 90]], [16, 3, 4, 3, 16, 16, 16]), fill: 'white', depth: 0.6 },
  { d: line([-16, 38], [70, 38]) },
  { d: line([-16, 56], [36, 56]) },
  ...[0, 1, 2].map((i): Shape => ({ d: ellipse(-12 + i * DOT_GAP, 74, 5), fill: 'grey', line: 3 })),
  { d: pill(60, 62, 50, 22), fill: 'main', depth: 0.3 },
]

// a part of the app that swells when the spotlight lands on it
const part = (c: Vec, land: number, shapes: ReadonlyArray<Shape>): Layer => ({
  parent: 'card',
  a: c,
  p: c,
  m: { s: outAndBack<Vec>([100, 100], [108, 108], land, 8, land + 8, 12) },
  shapes,
})

const featureTour: Icon = {
  name: 'feature-tour',
  frames: 180,
  still: 126,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [262, 232], s: [94, 94], shapes: [] },
    {
      id: 'card',
      parent: 'root',
      tilt: FACE,
      shapes: [
        { d: rect(-134, -176, 268, 330, 30), fill: 'deep', depth: 1 },
        { d: rect(-120, -162, 240, 302, 18), fill: 'white', depth: 0.2 },
        // the spotlight: a gold plate under the part it is showing, gliding from step to step
        { d: [[0, SPOTS[0]], ...steps(SPOTS, 0, HOME, 28)], fill: 'gold', depth: 0.25 },
        { d: line([-6, -126], [80, -126]) },
        { d: line([-6, -98], [48, -98]) },
      ],
    },
    part([-68, -108], LANDS[0], [{ d: rect(-92, -132, 48, 48, 14), fill: 'main', depth: 0.5 }, { d: ellipse(-68, -114, 8), fill: 'white', line: 4 }]),
    part([0, -6], LANDS[1], [
      { d: rect(-92, -50, 184, 88, 14), fill: 'tint', depth: 0.4 },
      ...([[-70, 30], [-36, 46], [-2, 18], [32, 56]] as const).map(([x, h]): Shape => ({ d: rect(x, 26 - h, 22, h, 4), fill: 'main', depth: 0.3 })),
    ]),
    part([0, 98], LANDS[2], [{ d: rect(-92, 76, 184, 44, 22), fill: 'main', depth: 0.5 }, { d: line([-34, 98], [34, 98]), line: 6 }]),
    {
      id: 'tip',
      parent: 'card',
      a: [0, 0],
      p: [[0, TIPS[0]], ...steps(TIPS, LAG, 172, 0)],
      s: [[0, [0, 0], 0], ...popScale(SHOW, HIDE)],
      shapes: TOOLTIP,
    },
    // the step dot moves on with the tooltip, a little behind it
    {
      parent: 'tip',
      p: [[0, [0, 0]], ...steps<Vec>([[0, 0], [DOT_GAP, 0], [2 * DOT_GAP, 0]], LAG + 4, 172, 0)],
      shapes: [{ d: ellipse(-12, 74, 6), fill: 'main', line: 3, depth: 0.2 }],
    },
    glow('root', [186, -40], 24, popIn(LANDS[2] + 2, HIDE - 6)),
    glow('root', [-178, 104], 16, popIn(LANDS[2] + 8, HIDE)),
  ],
}

export default featureTour
