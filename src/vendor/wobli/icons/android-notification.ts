// Android Notification
import { ellipse, line, pill, rect, ring } from '../engine.ts'
import { float, glint, press } from '../motions.ts'
import { checkBadge, EXT, facePoint, FACE, glow, outAndBack, LINE, PHONE_SCREEN, phoneBody, popIn } from '../parts.ts'
import type { Icon, Shape, Vec } from '../engine.ts'

// A status icon pops, the shade pulls down, the Reply action sinks under a tap, ripples and turns into a check. The shade goes
// back up the way it came down, carrying the check with it.
const TAP: Vec = [-28, -164] // the Reply action, in the shade's own space
const SHADE_DROP = 176

const androidNotification: Icon = {
  name: 'android-notification',
  frames: 210,
  still: 112,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [248, 262], m: { ...float, loop: 210, k: 0.7 }, shapes: [] },
    { parent: 'root', tilt: FACE, shapes: phoneBody(24, 'deep') },
    {
      id: 'screen',
      parent: 'root',
      tilt: FACE,
      shapes: [
        { d: PHONE_SCREEN(14), fill: 'tint' },
        { d: pill(-52, -78, 104, 34), fill: 'white', depth: 0.25 },
        ...[0, 1, 2].flatMap((c) => [0, 1].map((r): Shape => ({ d: rect(-52 + c * 38, 4 + r * 38, 28, 28, 14), fill: (['main', 'ok', 'gold'] as const)[(c + r) % 3], depth: 0.25 }))),
        { d: pill(-56, 104, 112, 20), fill: 'white' },
      ],
    },
    { parent: 'root', tilt: FACE, a: [-54, -124], p: facePoint(-54, -124), m: popIn(8, 176), shapes: [{ d: rect(-60, -130, 12, 12, 3), fill: 'ok', line: 3 }] },
    {
      id: 'shade',
      parent: 'root',
      tilt: FACE,
      clip: 'screen',
      m: { p: outAndBack<Vec>([0, 0], facePoint(0, SHADE_DROP), 22, 32, 150, 30) },
      shapes: [
        { d: rect(-74, -320, 148, 180, 12), fill: 'white' },
        { d: pill(-60, -308, 56, 22), fill: 'main' },
        { d: pill(4, -308, 56, 22), fill: 'tint' },
        { d: pill(-60, -280, 56, 22), fill: 'tint' },
        { d: pill(4, -280, 56, 22), fill: 'main' },
        { d: rect(-62, -248, 124, 98, 14), fill: 'paper', depth: 0.2 },
        { d: ellipse(-44, -228, 10), fill: 'ok' },
        { d: line([-26, -232], [30, -232]) },
        { d: line([-48, -206], [46, -206]) },
        { d: line([-48, -190], [10, -190]) },
        { d: pill(-54, -174, 52, 20), fill: 'main' },
        { d: pill(2, -174, 52, 20), fill: 'grey' },
        { d: pill(-16, -152, 32, 5), fill: 'ink', line: false },
      ],
    },
    { parent: 'shade', clip: 'screen', a: TAP, p: TAP, m: glint(92, 120), shapes: [{ d: ring(TAP[0], TAP[1], 30, 23), fill: 'main' }] },
    { parent: 'shade', clip: 'screen', a: TAP, p: TAP, m: [...popIn(78, 100), { ...press, k: 0.3, at: 78 }], shapes: [{ d: ellipse(TAP[0], TAP[1] + 4, 18), fill: 'white', depth: 0.5 }] },
    { parent: 'shade', clip: 'screen', a: TAP, p: TAP, m: popIn(100, 146), shapes: checkBadge(TAP, 20, 0.4) },
    { parent: 'root', tilt: FACE, shapes: [{ d: ellipse(0, -122, 7), fill: 'ink', line: false }] },
    glow('root', [132, -152], 24, popIn(104, 146)),
  ],
}

export default androidNotification
