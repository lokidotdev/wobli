// Live Activity Bar
import { ellipse, line, pill, poly, rect } from '../engine.ts'
import { SNAP, twinkle } from '../motions.ts'
import { buzz, mapPin, checkBadge, EXT, FACE, facePoint, glow, hit, LINE, numeral, PHONE_SCREEN, phoneBody, popScale, wave } from '../parts.ts'
import type { Icon, Shape, Track, Vec } from '../engine.ts'

// The Live Activity pops up on the lock screen under the clock. Its bar fills left to right with the little car riding the
// head of the fill; the car pulls up at the stop with a small spring, the phone buzzes on that frame and the stop turns into a
// check. After a long hold the activity pops away where it appeared, and the bar is empty for the next ride.
const CARD: Vec = [0, 55] // the activity's centre on the screen: where it pops in and out
const BAR_X = -50
const BAR_Y = 86
const BAR_W = 78
const BAR_H = 14
const STOP: Vec = [BAR_X + BAR_W + 20, BAR_Y + BAR_H / 2] // the drop off, at the end of the bar
const CAR_Y = BAR_Y - 2 // the car's wheels sit on the bar

const APPEAR = 4
const DEPART = 30
const ARRIVE = 96
const LEAVE = 148
const RESET = 179 // the card is gone by now, so the bar and the car go home unseen

const FILL: Track<string> = [
  [DEPART, rect(BAR_X, BAR_Y, 34, BAR_H, BAR_H / 2), SNAP],
  [ARRIVE, rect(BAR_X, BAR_Y, BAR_W, BAR_H, BAR_H / 2), 0],
  [RESET, rect(BAR_X, BAR_Y, BAR_W, BAR_H, BAR_H / 2), 0],
  [RESET + 1, rect(BAR_X, BAR_Y, 34, BAR_H, BAR_H / 2)],
]
const RIDE: Track<Vec> = [
  [DEPART, [BAR_X + 26, CAR_Y], SNAP],
  [ARRIVE, [BAR_X + BAR_W - 20, CAR_Y], 0],
  [RESET, [BAR_X + BAR_W - 20, CAR_Y], 0],
  [RESET + 1, [BAR_X + 26, CAR_Y]],
]

// a side-on car, wheels on y 0, nose to the right
const car = (): ReadonlyArray<Shape> => [
  { d: poly([[-18, -6], [-12, -18], [6, -18], [13, -8], [20, -6], [20, 2], [-18, 2]], 3), fill: 'white', depth: 0.4 },
  { d: rect(-9, -15, 9, 7, 2), fill: 'tint', line: 3 },
  ...[-10, 11].map((x): Shape => ({ d: ellipse(x, 3, 5), fill: 'ink', line: false })),
]

const liveActivity: Icon = {
  name: 'live-activity',
  frames: 180,
  still: 120,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [250, 254], s: [110, 110], m: buzz(ARRIVE, 3), shapes: [] },
    { parent: 'root', tilt: FACE, shapes: phoneBody(32, 'deep') },
    { id: 'screen', parent: 'root', tilt: FACE, shapes: [{ d: PHONE_SCREEN(22), fill: 'tint' }] },
    // the lock screen clock, 9:41
    {
      parent: 'screen',
      shapes: [
        { d: numeral(9, -48, -92, 22, 40), line: 6 },
        { d: numeral(4, 6, -92, 22, 40), line: 6 },
        { d: numeral(1, 32, -92, 22, 40), line: 6 },
        ...[-80, -64].map((y): Shape => ({ d: ellipse(-6, y, 3.5), fill: 'ink', line: false })),
      ],
    },
    // the Live Activity card and everything on it
    {
      id: 'card',
      parent: 'screen',
      a: CARD,
      p: CARD,
      s: popScale(APPEAR, LEAVE),
      shapes: [
        { d: rect(-62, 2, 124, 106, 20), fill: 'white', depth: 0.4 },
        { d: rect(-52, 10, 30, 30, 9), fill: 'main', depth: 0.3 },
        { d: line([-10, 20], [44, 20]) },
        { d: line([-10, 34], [22, 34]) },
        { d: pill(BAR_X, BAR_Y, BAR_W, BAR_H), fill: 'grey', line: 4 },
        { d: FILL, fill: 'ok', line: 4 },
      ],
    },
    // the ride app's badge: a pin
    {
      parent: 'card',
      shapes: [
        { d: mapPin(-37, 33, 0.09), fill: 'white', line: 3, depth: 0.3 },
      ],
    },
    // the stop, then its check
    { parent: 'card', shapes: [{ d: ellipse(STOP[0], STOP[1], 9), fill: 'white', line: 4 }] },
    { parent: 'card', a: STOP, p: STOP, op: RESET, m: twinkle(ARRIVE + 2), shapes: checkBadge(STOP, 13, 0.4) },
    // the car riding the head of the fill, pulling up with a spring
    { parent: 'card', p: RIDE, s: [118, 118], m: hit(ARRIVE, [5, 0]), shapes: car() },
    wave('root', facePoint(...STOP), 46, ARRIVE, -64, -24),
    glow('root', [118, -12], 22, twinkle(ARRIVE + 4), { op: RESET }),
  ],
}

export default liveActivity
