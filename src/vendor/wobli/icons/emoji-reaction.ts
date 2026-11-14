// Emoji Reaction
import { arc, ellipse, line, pill } from '../engine.ts'
import { IN, hop } from '../motions.ts'
import { EXT, FACE, LINE, bubble, facePoint, glow, hit, numeral, popIn, popScale } from '../parts.ts'
import type { Icon, Vec } from '../engine.ts'

// A message sits on the face. A smiley pops in above it and falls faster and faster onto the bubble's lower right corner; the
// bubble takes the hit on the frame it lands, a reaction chip with its count grows out under it, and the smiley rebounds and
// settles. After a long hold the smiley and its chip pop away together and the message is left as it began.
const CORNER: Vec = [96, 52] // where the smiley lands, on the bubble's face
const CHIP = { x: CORNER[0] - 30, y: CORNER[1] - 25, w: 124, h: 50 }
const FROM: Vec = [86, -190] // the smiley's start, above and right of the corner
const ENTER = 8
const LAND = 34
const GONE = 146

const emojiReaction: Icon = {
  name: 'emoji-reaction',
  frames: 180,
  still: 120,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [232, 258], shapes: [] },
    { id: 'chat', parent: 'root', m: hit(LAND, [-1, 7], 0.7), shapes: [] },
    {
      id: 'bubble',
      parent: 'chat',
      tilt: FACE,
      shapes: [
        { d: bubble(-150, -110, 270, 150, 'left', 30), fill: 'white', depth: 1 },
        { d: line([-118, -70], [64, -70]) },
        { d: line([-118, -38], [20, -38]) },
        { d: line([-118, -6], [-30, -6]) },
      ],
    },
    // the reaction chip grows out under the smiley as it lands, its count beside it
    {
      parent: 'bubble',
      a: CORNER,
      p: CORNER,
      m: popIn(LAND, GONE + 4),
      shapes: [
        { d: pill(CHIP.x, CHIP.y, CHIP.w, CHIP.h), fill: 'main', depth: 0.5 },
        { d: numeral(1, CORNER[0] + 58, CORNER[1] - 11, 12, 22), line: 5, round: true },
      ],
    },
    // the smiley: untilted so it falls straight down, its face leaned with the bubble
    {
      id: 'emoji',
      parent: 'chat',
      a: facePoint(...CORNER),
      p: facePoint(...CORNER),
      s: popScale(ENTER, GONE),
      m: [{ p: [[0, FROM], [ENTER + 4, FROM, IN], [LAND, [0, 0]]] }, { ...hop, at: LAND, k: 0.8 }],
      shapes: [],
    },
    {
      parent: 'emoji',
      tilt: FACE,
      p: facePoint(...CORNER),
      shapes: [
        { d: ellipse(0, 0, 40), fill: 'gold', depth: 0.6 },
        { d: ellipse(-13, -8, 5, 7), fill: 'ink', line: false },
        { d: ellipse(13, -8, 5, 7), fill: 'ink', line: false },
        { d: arc(0, 2, 20, 30, 150), round: true },
      ],
    },
    glow('root', [178, -78], 22, popIn(LAND + 4, 124)),
  ],
}

export default emojiReaction
