// Message Read Receipts
import { ellipse, line, pill, rect } from '../engine.ts'
import { SOFT, twinkle } from '../motions.ts'
import { bubble, EXT, FACE, facePoint, glow, LINE, outAndBack, outIn, popIn } from '../parts.ts'
import type { Icon, Layer, Track, Vec } from '../engine.ts'

// The send button sinks under the finger and the typed line leaves the field; the bubble grows up out of the button. A first
// tick draws in (sent), a beat later the second tick draws beside it and the chip under them turns green with a sparkle (read).
// After a long hold the bubble folds back into the button the way it came, and the draft line returns to the field.
const SEND_BTN: Vec = [124, 76]
const CHIP: Vec = [62, -52]
const TICK = (x: number, y: number) => line([x - 16, y + 1], [x - 5, y + 12], [x + 16, y - 11])

const PRESS = 6
const SEND = 12 // the bubble leaves the button
const SENT = 44 // first tick
const READ = 82 // second tick
const SEEN = READ + 12 // second tick lands: the chip turns green
const FOLD = 144 // the bubble starts home
const GONE = 170 // folded into the button

const draw = (from: number): Track<number> => [[from, 0, SOFT], [from + 12, 1]]
const tick = (x: number, from: number): Layer => ({ parent: 'bubble', ip: from, op: GONE, shapes: [{ d: TICK(x, CHIP[1]), line: 6, trim: draw(from) }] })

const readReceipt: Icon = {
  name: 'read-receipt',
  frames: 180,
  still: 116,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [254, 266], shapes: [] },
    // the compose field and the draft line in it
    { id: 'field', parent: 'root', tilt: FACE, shapes: [{ d: rect(-162, 44, 324, 64, 32), fill: 'white', depth: 0.8 }] },
    { parent: 'field', a: [-84, 76], p: [-84, 76], m: outIn(SEND + 4, GONE - 14), shapes: [{ d: line([-130, 76], [-40, 76]), line: 6 }] },
    {
      parent: 'root',
      tilt: FACE,
      a: SEND_BTN,
      p: facePoint(...SEND_BTN),
      s: outAndBack<Vec>([100, 100], [84, 84], PRESS, 6, PRESS + 10, 10),
      shapes: [
        { d: ellipse(SEND_BTN[0], SEND_BTN[1], 23), fill: 'deep', depth: 0.6 },
        { d: line([124, 88], [124, 64]), line: 5 },
        { d: line([113, 75], [124, 64], [135, 75]), line: 5 },
      ],
    },
    // the sent bubble: grows out of the send button, folds back into it
    {
      id: 'bubble',
      parent: 'root',
      tilt: FACE,
      a: SEND_BTN,
      p: facePoint(...SEND_BTN),
      ip: SEND,
      op: GONE,
      s: outAndBack<Vec>([8, 8], [100, 100], SEND, 26, FOLD, 26),
      shapes: [
        { d: bubble(-162, -150, 280, 128, 'right', 26), fill: 'main', depth: 1 },
        { d: pill(-136, -124, 186, 24), fill: 'white', depth: 0.3 },
        { d: pill(-136, -84, 106, 24), fill: 'white', depth: 0.3 },
        { d: pill(CHIP[0] - 44, CHIP[1] - 19, 88, 38), fill: 'white', depth: 0.4 },
      ],
    },
    // read: the chip turns green under the ticks as the second one lands
    { parent: 'bubble', a: CHIP, p: CHIP, ip: SEEN, op: GONE, m: twinkle(SEEN), shapes: [{ d: pill(CHIP[0] - 44, CHIP[1] - 19, 88, 38), fill: 'ok', depth: 0.4 }] },
    tick(CHIP[0] - 10, SENT),
    tick(CHIP[0] + 12, READ),
    glow('root', [162, -170], 24, popIn(SEEN, 132)),
  ],
}

export default readReceipt
