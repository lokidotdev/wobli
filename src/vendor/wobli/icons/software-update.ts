// Software Update
import { ellipse, pill, poly, rect, rosette, spark } from '../engine.ts'
import { EASY, IN, SOFT } from '../motions.ts'
import { EXT, FACE, LINE, PHONE_SCREEN, facePoint, glow, hit, outAndBack, outIn, phoneBody, popIn } from '../parts.ts'
import type { Icon, Track, Vec } from '../engine.ts'

// The download arrow falls faster and faster into the settings app, sinking into it as the phone takes the hit on the same
// frame. The progress bar under the app fills, and as it tops out the app gives one beat and a new badge pops on its corner.
// After a long hold the badge goes, the bar drains, and the arrow rises back out of the app the way it came.
const LAND = 30
const FULL = 92
const BADGE_OUT = 140
const LIFT = 146
const APP: Vec = [0, -40] // the app's centre on the screen: where the arrow lands
const ARROW_IN: Vec = facePoint(...APP)
const ARROW_TOP: Vec = [ARROW_IN[0], ARROW_IN[1] - 140]
const BADGE: Vec = [44, -84]
const BAR = { x: -54, y: 30, w: 108, h: 22 }
const FILL: Track<Vec> = [[LAND + 4, [0, 100], EASY], [FULL, [100, 100], 0], [BADGE_OUT + 4, [100, 100], EASY], [BADGE_OUT + 30, [0, 100]]]

const softwareUpdate: Icon = {
  name: 'software-update',
  frames: 180,
  still: 112,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [256, 296], s: [94, 94], shapes: [] },
    { id: 'phone', parent: 'root', m: hit(LAND, [2, 8], 0.7), shapes: [] },
    { parent: 'phone', tilt: FACE, shapes: phoneBody(32, 'deep') },
    {
      parent: 'phone',
      tilt: FACE,
      shapes: [
        { d: PHONE_SCREEN(22), fill: 'tint' },
        { d: pill(-24, -126, 48, 14), fill: 'ink', line: false },
        { d: pill(BAR.x, BAR.y, BAR.w, BAR.h), fill: 'white', depth: 0.3 },
        { d: pill(-36, 72, 72, 12), fill: 'white', depth: 0.2 },
      ],
    },
    // the progress fill, growing from the bar's left end
    {
      parent: 'phone',
      tilt: FACE,
      a: [BAR.x + 5, BAR.y + BAR.h / 2],
      p: [BAR.x + 5, BAR.y + BAR.h / 2],
      s: FILL,
      shapes: [{ d: pill(BAR.x + 5, BAR.y + 4, BAR.w - 10, BAR.h - 8), fill: 'main', line: false }],
    },
    // the settings app: a slab with its gear, beating once when the update lands
    {
      id: 'app',
      parent: 'phone',
      tilt: FACE,
      a: APP,
      p: APP,
      s: outAndBack<Vec>([100, 100], [112, 112], FULL, 6, FULL + 6, 12),
      shapes: [
        { d: rect(APP[0] - 44, APP[1] - 44, 88, 88, 24), fill: 'main', depth: 0.5 },
        { d: rosette(APP[0], APP[1], 26, 8, 0.7), fill: 'white', depth: 0.3 },
        { d: ellipse(APP[0], APP[1], 10), fill: 'main' },
      ],
    },
    // the new badge on the app's corner
    {
      parent: 'app',
      a: BADGE,
      p: BADGE,
      m: popIn(FULL, BADGE_OUT),
      shapes: [
        { d: rosette(BADGE[0], BADGE[1], 24, 10, 0.75), fill: 'hot', depth: 0.5 },
        { d: spark(BADGE[0], BADGE[1], 13), fill: 'white', line: 4 },
      ],
    },
    // the download arrow, tip at its origin so it sinks into the app point first
    {
      parent: 'root',
      tilt: FACE,
      p: [[0, ARROW_TOP], [6, ARROW_TOP, IN], [LAND, ARROW_IN, 0], [LIFT, ARROW_IN, SOFT], [176, ARROW_TOP]],
      m: outIn(LAND, LIFT),
      shapes: [{ d: poly([[0, 0], [-50, -50], [-20, -50], [-20, -104], [20, -104], [20, -50], [50, -50]], 6), fill: 'main', depth: 0.8 }],
    },
    glow('root', [140, -150], 24, popIn(FULL + 2, BADGE_OUT - 4)),
    glow('root', [-150, -60], 16, popIn(FULL + 8, BADGE_OUT)),
  ],
}

export default softwareUpdate
