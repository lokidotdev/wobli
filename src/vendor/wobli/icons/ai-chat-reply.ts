// AI Chat Reply
import { ellipse, line, pill, spark } from '../engine.ts'
import { SOFT, springTurn } from '../motions.ts'
import { EXT, FACE, LINE, bubble, facePoint, glow, hit, popIn, popScale } from '../parts.ts'
import type { Icon, Layer, Track, Vec } from '../engine.ts'

// The prompt pops out of its tail on the right: sent. The assistant's badge takes it on the same frame, its sparkle spins a
// quarter turn on a spring, and the reply grows out of the tail beside the badge while its lines stream in one after another.
// After the hold the prompt and then the reply shrink back into their tails, the reply's lines going with it.

const PROMPT_TAIL: Vec = [154, -50] // the prompt's tail tip, bottom right
const REPLY_TAIL: Vec = [-114, 126] // the reply's tail tip, bottom left, just above the badge
const BADGE: Vec = [-154, 162]
const SENT = 6
const SPARK = 30 // the badge reacts once the prompt has landed
const REPLY_IN = 40
const STREAM = 54 // first reply line starts writing
const PROMPT_OUT = 134
const REPLY_OUT = 144

// reply box and its text lines: [x, y, width], left aligned so they stream in from the left
const REPLY = { x: -120, y: -20, w: 250, h: 116 }
const LINES: ReadonlyArray<readonly [number, number, number]> = [[-94, 4, 176], [-94, 34, 146], [-94, 64, 90]]
const LINE_H = 12

// a line writes in from its left end, then holds until the reply has shrunk away and resets unseen
const streamIn = (start: number): Track<Vec> => [
  [0, [0, 100], 0],
  [start, [0, 100], SOFT],
  [start + 16, [100, 100], 0],
  [REPLY_OUT + 31, [100, 100], 0],
  [REPLY_OUT + 32, [0, 100]],
]

const textLine = ([x, y, w]: readonly [number, number, number], i: number): Layer => ({
  parent: 'reply',
  a: [x, y + LINE_H / 2],
  p: [x, y + LINE_H / 2],
  s: streamIn(STREAM + i * 12),
  shapes: [{ d: pill(x, y, w, LINE_H), fill: 'white', depth: 0.3 }],
})

const aiChatReply: Icon = {
  name: 'ai-chat-reply',
  frames: 180,
  still: 110,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [232, 222], shapes: [] },
    // the prompt: the user's white bubble, grown out of its tail on the send
    {
      parent: 'root',
      tilt: FACE,
      a: PROMPT_TAIL,
      p: facePoint(...PROMPT_TAIL),
      s: popScale(SENT, PROMPT_OUT),
      shapes: [
        { d: bubble(-20, -150, 180, 70, 'right'), fill: 'white', depth: 0.8 },
        { d: line([4, -124], [130, -124]) },
        { d: line([4, -102], [70, -102]) },
      ],
    },
    // the assistant's badge: a dark disc that takes the send, its sparkle spinning a quarter turn
    {
      id: 'badge',
      parent: 'root',
      tilt: FACE,
      m: hit(SPARK, facePoint(0, 6), 0.6),
      shapes: [{ d: ellipse(BADGE[0], BADGE[1], 40), fill: 'deep', depth: 1 }],
    },
    {
      parent: 'badge',
      a: BADGE,
      p: BADGE,
      // four points, so the reset to 0 at the seam is the same pose
      r: [...springTurn(90, SPARK), [179, 90, 0], [180, 0]],
      shapes: [{ d: spark(BADGE[0], BADGE[1], 25), fill: 'white', depth: 0.25 }],
    },
    // the reply: grows out of the tail by the badge
    {
      id: 'reply',
      parent: 'root',
      tilt: FACE,
      a: REPLY_TAIL,
      p: facePoint(...REPLY_TAIL),
      s: popScale(REPLY_IN, REPLY_OUT),
      shapes: [{ d: bubble(REPLY.x, REPLY.y, REPLY.w, REPLY.h, 'left'), fill: 'main', depth: 0.8 }],
    },
    ...LINES.map(textLine),
    glow('root', [168, -6], 20, popIn(STREAM + 30, PROMPT_OUT - 8)),
  ],
}

export default aiChatReply
