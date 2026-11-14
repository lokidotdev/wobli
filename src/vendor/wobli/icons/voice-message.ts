// Voice Message
import { arc, ellipse, line, pill, poly } from '../engine.ts'
import { bubble, checkBadge, EXT, FACE, facePoint, glow, LINE, outAndBack, popIn, wave } from '../parts.ts'
import type { Icon, Layer, Vec } from '../engine.ts'

// The mic button sinks into its base under the press and a ripple leaves it; a voice bubble grows out of the mic and its
// waveform rises bar by bar while the button is held. The button comes up, the bubble slides off up and right and a check pops
// on its corner. After a long hold the bubble slides back down the same path, the bars fall last first and it shrinks into the mic.

const MIC: Vec = [-104, 124] // the button's centre on the face
const TAIL: Vec = [-118, 20] // the bubble's tail tip: it grows out of here and shrinks back into it
const BUBBLE = { x: -124, y: -130, w: 276, h: 120 }
const MID = BUBBLE.y + BUBBLE.h / 2
const BARS = [30, 56, 80, 46, 70, 38, 60, 28]
const CORNER: Vec = [BUBBLE.x + BUBBLE.w - 6, BUBBLE.y + 4]

const PRESS = 8 // button goes down
const GROW = 12 // bubble grows out of the mic
const RELEASE = 78 // button comes up
const SEND = 80 // bubble slides off
const SENT = SEND + 22 // it lands: the check pops
const BACK = 136 // bubble slides home
const SHRINK = 160 // and shrinks into the mic
const END = 176

const PUSH: Vec = [-2.6, 11.7] // 0.65 of the extrusion: the button sinks along its own side
const SEND_TO = facePoint(56, -54)

const bar = (h: number, i: number): Layer => {
  const c: Vec = [-62 + i * 27, MID]
  const back = BACK + 6 + (BARS.length - 1 - i) * 2 // last up, first down
  return {
    parent: 'bubble',
    a: c,
    p: c,
    s: outAndBack<Vec>([100, 0], [100, 100], 26 + i * 5, 12, back, 8),
    shapes: [{ d: pill(c[0] - 7, c[1] - h / 2, 14, h), fill: 'white', line: 4, depth: 0.3 }],
  }
}

const voiceMessage: Icon = {
  name: 'voice-message',
  frames: 180,
  still: 112,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [258, 244], shapes: [] },
    wave('root', facePoint(...MIC), 110, PRESS - 8, 150, 200),
    { parent: 'root', tilt: FACE, shapes: [{ d: ellipse(MIC[0], MIC[1], 92), fill: 'white', depth: 1 }] },
    {
      parent: 'root',
      tilt: FACE,
      m: { p: outAndBack<Vec>([0, 0], PUSH, PRESS, 8, RELEASE), x: outAndBack(0, -12, PRESS, 8, RELEASE) },
      shapes: [
        { d: ellipse(MIC[0], MIC[1], 70), fill: 'hot', depth: 1.3 },
        { d: pill(MIC[0] - 17, MIC[1] - 50, 34, 60), fill: 'white', depth: 0.3 },
        { d: arc(MIC[0], MIC[1] - 12, 32, 10, 170) },
        { d: line([MIC[0], MIC[1] + 20], [MIC[0], MIC[1] + 34]) },
        { d: line([MIC[0] - 16, MIC[1] + 36], [MIC[0] + 16, MIC[1] + 36]) },
      ],
    },
    { id: 'send', parent: 'root', m: { p: outAndBack<Vec>([0, 0], SEND_TO, SEND, SENT - SEND, BACK, 22) }, shapes: [] },
    {
      id: 'bubble',
      parent: 'send',
      tilt: FACE,
      a: TAIL,
      p: facePoint(...TAIL),
      ip: GROW,
      op: END,
      s: outAndBack<Vec>([6, 6], [100, 100], GROW, 22, SHRINK, 16),
      shapes: [
        { d: bubble(BUBBLE.x, BUBBLE.y, BUBBLE.w, BUBBLE.h), fill: 'main', depth: 0.8 },
        { d: poly([[-100, MID - 20], [-100, MID + 20], [-76, MID]], 3), fill: 'white', depth: 0.3 },
      ],
    },
    ...BARS.map(bar),
    { parent: 'bubble', a: CORNER, p: CORNER, m: popIn(SENT, BACK - 10), shapes: checkBadge(CORNER, 24, 0.4) },
    glow('root', [182, -46], 22, popIn(SENT + 2, BACK - 6)),
  ],
}

export default voiceMessage
