// Smartwatch Alert
import { ellipse, line, rect } from '../engine.ts'
import { EXT, FACE, LINE, buzz, glow, outAndBack, popIn, wave } from '../parts.ts'
import type { Icon, Shape, Vec } from '../engine.ts'

// The watch taps the wrist: it buzzes and two waves ripple off the case. On the same beat the notification card scrolls up from
// under the bottom of the screen and the time moves up to make room, a few frames behind. After a long hold the card scrolls
// back down the way it came and the time settles home after it.
const TAP = 26 // the wrist tap: buzz and card answer to it; the waves start early because they swell from nothing
const LEAVE = 128
const CARD_UP: Vec = [0, -142]
const TIME_UP: Vec = [0, -12]

const watchAlert: Icon = {
  name: 'watch-alert',
  frames: 180,
  still: 96,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [246, 254], m: buzz(TAP, 4), shapes: [] },
    wave('root', [0, 0], 150, TAP - 16),
    wave('root', [0, 0], 176, TAP - 8),
    {
      parent: 'root',
      tilt: FACE,
      shapes: [
        { d: rect(-56, -172, 112, 90, 22), fill: 'grey', depth: 0.8 },
        { d: rect(-56, 82, 112, 90, 22), fill: 'grey', depth: 0.8 },
        ...[-1, 1].map((s): Shape => ({ d: line([-32, s * 136], [32, s * 136]) })),
        { d: rect(90, -36, 24, 52, 7), fill: 'gold', depth: 0.8 },
        { d: rect(-98, -112, 196, 224, 50), fill: 'deep', depth: 1 },
      ],
    },
    { id: 'screen', parent: 'root', tilt: FACE, shapes: [{ d: rect(-80, -94, 160, 188, 36), fill: 'tint' }] },
    {
      parent: 'screen',
      clip: 'screen',
      m: { p: outAndBack<Vec>([0, 0], TIME_UP, TAP + 9, 30, LEAVE + 6, 30) },
      shapes: [{ d: rect(-34, -58, 68, 26, 9), fill: 'white' }, { d: line([-20, 50], [20, 50]) }],
    },
    {
      parent: 'screen',
      clip: 'screen',
      m: { p: outAndBack<Vec>([0, 0], CARD_UP, TAP + 4, 30, LEAVE, 30) },
      shapes: [
        { d: rect(-66, 110, 132, 84, 18), fill: 'white', depth: 0.3 },
        { d: ellipse(-38, 136, 13), fill: 'hot' },
        { d: line([-14, 136], [44, 136]) },
        { d: line([-48, 168], [30, 168]) },
      ],
    },
    glow('root', [140, -130], 22, popIn(TAP + 30, LEAVE)),
  ],
}

export default watchAlert
