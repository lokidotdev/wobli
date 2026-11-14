// Follow Button
import { ellipse, line, pill, rect } from '../engine.ts'
import { EXT, FACE, LINE, check, glow, hit, numeral, outAndBack, outIn, popIn, popScale } from '../parts.ts'
import type { Icon, Layer, Shape, Track, Vec } from '../engine.ts'

// The Follow button sinks under the tap and stretches into a wider Following button: the filled pill shrinks away into the
// white one beneath it and a check draws in. The viewer's avatar grows out of the button and rises to the end of the follower
// row, knocking its neighbour, and the count ticks up on the frame it lands. After a long hold it goes back into the button
// the way it came, the count ticks down, and the pill narrows and fills again.
const BTN: Vec = [0, 122] // the button's centre
const BTN_H = 48
const NARROW = 140 // Follow
const WIDE = 204 // Following
const ROW_Y = 42 // the follower row
const SLOTS: ReadonlyArray<number> = [-86, -56] // followers already there
const JOIN_X = -26 // the viewer's seat at the end of the row
const SEAT: Vec = [JOIN_X, ROW_Y]

const PRESS = 18 // the button bottoms out under the tap
const MORPH = PRESS + 2 // the pill stretches, the fill shrinks away
const STRETCH = 14
const JOIN = MORPH + 6 // the avatar grows out of the button
const TRAVEL = 26
const ARRIVE = JOIN + TRAVEL // lands in the row, count ticks
const LEAVE = 116 // heads back into the button
const HOME = 22
const BACK = LEAVE + HOME // the pill narrows and fills again

const btn = (w: number) => pill(BTN[0] - w / 2, BTN[1] - BTN_H / 2, w, BTN_H)
const WIDTH: Track<string> = outAndBack(btn(NARROW), btn(WIDE), MORPH, STRETCH, BACK, STRETCH)

// an avatar disc: slab body, raised white head and shoulders
const avatar = (r: number, fill: Shape['fill'], depth = 1): ReadonlyArray<Shape> => [
  { d: ellipse(0, 0, r), fill, depth },
  { d: ellipse(0, -r * 0.24, r * 0.3), fill: 'white', depth: 0.3 },
  { d: `M${-r * 0.56} ${r * 0.62}A${r * 0.56} ${r * 0.46} 0 0 1 ${r * 0.56} ${r * 0.62}Z`, fill: 'white', depth: 0.3 },
]

const follower = (x: number, i: number): Layer => ({
  parent: 'card',
  p: [x, ROW_Y],
  m: i === SLOTS.length - 1 ? [hit(ARRIVE, [-4, 1], 0.7), hit(LEAVE + 2, [3, -1], 0.7)] : [],
  shapes: avatar(24, 'tint', 0.5),
})

const DIGIT_W = 14
const DIGIT_H = 24
const DIGIT_Y = ROW_Y - DIGIT_H / 2
const COUNT_X = 18
const tick: Track<string> = [
  [0, numeral(2, COUNT_X + DIGIT_W + 8, DIGIT_Y, DIGIT_W, DIGIT_H), 0],
  [ARRIVE, numeral(3, COUNT_X + DIGIT_W + 8, DIGIT_Y, DIGIT_W, DIGIT_H), 0],
  [LEAVE, numeral(2, COUNT_X + DIGIT_W + 8, DIGIT_Y, DIGIT_W, DIGIT_H), 0],
  [180, numeral(2, COUNT_X + DIGIT_W + 8, DIGIT_Y, DIGIT_W, DIGIT_H)],
]

const followButton: Icon = {
  name: 'follow-button',
  frames: 180,
  still: 92,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [252, 252], shapes: [] },
    {
      id: 'card',
      parent: 'root',
      tilt: FACE,
      shapes: [
        { d: rect(-142, -172, 284, 334, 30), fill: 'white', depth: 1 },
        { d: line([-60, -22], [60, -22]) },
        { d: line([-34, -4], [34, -4]) },
      ],
    },
    // the profile's own avatar, raised on a plate
    { parent: 'card', p: [0, -104], shapes: [{ d: ellipse(0, 0, 58), fill: 'deep', depth: 0.3 }, ...avatar(48, 'main', 0.7)] },
    ...SLOTS.map(follower),
    { parent: 'card', shapes: [{ d: numeral(1, COUNT_X, DIGIT_Y, DIGIT_W, DIGIT_H), line: 5, round: true }, { d: tick, line: 5, round: true }] },
    // the viewer's avatar grows out of the button and rises to its seat
    {
      parent: 'card',
      p: SEAT,
      m: { p: outAndBack<Vec>([BTN[0] - SEAT[0], BTN[1] - SEAT[1]], [0, 0], JOIN, TRAVEL, LEAVE, HOME), s: popScale(JOIN - 4, LEAVE + 4) },
      shapes: avatar(24, 'main', 0.5),
    },
    // the button sinks under the tap; everything on it rides along
    { id: 'btn', parent: 'card', a: BTN, p: BTN, m: { p: outAndBack<Vec>([0, 0], [1.5, 6], PRESS - 4, 4, PRESS, 10) }, shapes: [] },
    // Following: the white pill under the fill, its check drawn in once the fill is gone
    { parent: 'btn', shapes: [{ d: WIDTH, fill: 'white', depth: 0.6 }] },
    {
      parent: 'btn',
      a: [-66, BTN[1]],
      p: [-66, BTN[1]],
      m: popIn(MORPH + 6, BACK - 6),
      shapes: [{ d: check([-66, BTN[1]], 30), line: 6 }],
    },
    { parent: 'btn', a: BTN, p: BTN, m: popIn(MORPH + 10, BACK - 10), shapes: [{ d: line([-36, BTN[1]], [72, BTN[1]]), line: 6 }] },
    // Follow: the filled pill on top, plus and label, shrinking away into the white one
    {
      parent: 'btn',
      a: BTN,
      p: BTN,
      m: outIn(MORPH, BACK),
      shapes: [
        { d: WIDTH, fill: 'main', depth: 0.6 },
        { d: line([-50, BTN[1]], [-30, BTN[1]]), line: 6 },
        { d: line([-40, BTN[1] - 10], [-40, BTN[1] + 10]), line: 6 },
        { d: line([-14, BTN[1]], [46, BTN[1]]), line: 6 },
      ],
    },
    glow('root', [170, -140], 24, popIn(ARRIVE + 2, LEAVE - 8)),
    glow('root', [-186, -30], 18, popIn(ARRIVE + 6, LEAVE - 14)),
  ],
}

export default followButton
