// Chat Typing
import { ellipse, line } from '../engine.ts'
import { bubble, EXT, FACE, facePoint, glow, LINE, outAndBack, popIn, popScale } from '../parts.ts'
import type { Icon, Layer, Track, Vec } from '../engine.ts'

// A message sits on the left. The typing bubble pops out of its tail on the right and its three dots hop in a wave, one after
// another. The typing bubble pops away and the reply grows out of the same tail, then holds; it shrinks back into that tail

const TAIL: Vec = [134, 140] // the reply side's tail tip: the typing bubble and the reply both grow out of it
const TYPING_IN = 8
const TYPING_OUT = 72
const REPLY_IN = 80
const REPLY_OUT = 146
const DOTS_FROM = 20
const HOP = 18 // one dot's hop period
const DOT_Y = 78

// three hops up and down, out on SOFT and home on IN so the fall mirrors the rise
const hops = (start: number): Track<Vec> =>
  [0, 1, 2].flatMap((c) => outAndBack<Vec>([0, 0], [0, -12], start + c * HOP, 6, start + c * HOP + 8, 6))

const chatTyping: Icon = {
  name: 'chat-typing',
  frames: 180,
  still: 112,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [250, 250], shapes: [] },
    {
      parent: 'root',
      tilt: FACE,
      shapes: [
        { d: bubble(-150, -150, 210, 90, 'left'), fill: 'white', depth: 0.8 },
        { d: line([-124, -118], [24, -118]) },
        { d: line([-124, -90], [-30, -90]) },
      ],
    },
    {
      id: 'typing',
      parent: 'root',
      tilt: FACE,
      a: TAIL,
      p: facePoint(...TAIL),
      s: popScale(TYPING_IN, TYPING_OUT),
      shapes: [{ d: bubble(TAIL[0] + 6 - 140, TAIL[1] - 94, 140, 64, 'right'), fill: 'grey', depth: 0.6 }],
    },
    ...[0, 1, 2].map(
      (i): Layer => ({
        parent: 'typing',
        p: hops(DOTS_FROM + i * 5),
        shapes: [{ d: ellipse(TAIL[0] - 64 + (i - 1) * 28, DOT_Y, 8), fill: 'deep', depth: 0.3 }],
      }),
    ),
    {
      parent: 'root',
      tilt: FACE,
      a: TAIL,
      p: facePoint(...TAIL),
      s: popScale(REPLY_IN, REPLY_OUT),
      shapes: [
        { d: bubble(-60, 20, 200, 90, 'right'), fill: 'main', depth: 0.8 },
        { d: line([-34, 52], [110, 52]) },
        { d: line([-34, 80], [50, 80]) },
      ],
    },
    glow('root', [170, -40], 22, popIn(REPLY_IN + 6, 130)),
  ],
}

export default chatTyping
