// iPhone Notification
import { ellipse, line, pill, rect } from '../engine.ts'
import { float, IN, SOFT } from '../motions.ts'
import { buzz, EXT, facePoint, FACE, glow, outAndBack, LINE, popIn, wave } from '../parts.ts'
import type { Icon, Shape, Vec } from '../engine.ts'

// The Dynamic Island widens, the banner unfolds out of it and lands with a buzz, the Messages icon gets its badge. After a long
// hold the banner folds back into the island the way it came, and the island closes.
const ISLAND = [pill(-28, -143, 56, 16), pill(-50, -146, 100, 22)] as const
const iphone = (r = 40): ReadonlyArray<Shape> => [
  ...[-96, -50].map((y): Shape => ({ d: rect(-100, y, 14, 36, 5), fill: 'deep', depth: 0.9 })),
  { d: rect(86, -74, 14, 54, 5), fill: 'deep', depth: 0.9 },
  { d: rect(-92, -164, 184, 328, r), fill: 'deep', depth: 0.9 },
]
const HOME = ['main', 'ok', 'gold', 'hot', 'white', 'main', 'gold', 'white', 'ok'] as const
const BANNER: Vec = [0, -134] // the island's centre: where the banner comes from and goes back to
const BADGE: Vec = [-24, 101]

const iphoneNotification: Icon = {
  name: 'iphone-notification',
  frames: 180,
  still: 72,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [252, 256], m: [{ ...float, k: 0.5 }, buzz(50, 3)], shapes: [] },
    wave('root', [0, -10], 196, 48, -64, -24),
    { parent: 'root', tilt: FACE, shapes: iphone() },
    {
      id: 'screen',
      parent: 'root',
      tilt: FACE,
      shapes: [
        { d: rect(-78, -150, 156, 300, 30), fill: 'tint' },
        ...HOME.map((c, i): Shape => ({ d: rect(-58 + (i % 3) * 40, -44 + Math.floor(i / 3) * 40, 36, 36, 10), fill: c, depth: 0.25 })),
        { d: rect(-66, 92, 132, 50, 20), fill: 'white' },
        ...(['ok', 'main', 'hot'] as const).map((c, i): Shape => ({ d: rect(-54 + i * 38, 101, 32, 32, 9), fill: c, depth: 0.25 })),
      ],
    },
    {
      parent: 'root',
      tilt: FACE,
      a: BADGE,
      p: facePoint(...BADGE),
      m: popIn(54, 150),
      shapes: [{ d: ellipse(BADGE[0], BADGE[1], 13), fill: 'hot', depth: 0.5 }, { d: line([-28, 96], [-23, 92], [-23, 108]), line: 4 }],
    },
    {
      parent: 'root',
      tilt: FACE,
      clip: 'screen',
      a: BANNER,
      p: facePoint(...BANNER),
      ip: 24,
      op: 145,
      s: outAndBack<Vec>([18, 8], [100, 100], 24, 28, 116, 28),
      shapes: [
        { d: rect(-70, -122, 140, 58, 18), fill: 'white', depth: 0.3 },
        { d: rect(-60, -111, 36, 36, 10), fill: 'ok', depth: 0.3 },
        { d: ellipse(-42, -95, 10, 8), fill: 'white', line: 4 },
        { d: line([-14, -102], [44, -102]) },
        { d: line([-14, -84], [22, -84]) },
      ],
    },
    { parent: 'root', tilt: FACE, shapes: [{ d: [[8, ISLAND[0], SOFT], [28, ISLAND[1], 0], [124, ISLAND[1], IN], [146, ISLAND[0]]], fill: 'ink', line: false }] },
    glow('root', [150, -156], 22, popIn(56, 120)),
  ],
}

export default iphoneNotification
