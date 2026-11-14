// Desktop App Badge
import { ellipse, line, rect } from '../engine.ts'
import { IN, SOFT } from '../motions.ts'
import { EXT, FACE, LINE, glow, laptop, popIn } from '../parts.ts'
import type { Icon, Shape, Track, Vec } from '../engine.ts'

// One app in the laptop's dock bounces for attention the way a dock icon does: up on a soft rise, down faster and faster onto
// the dock floor, then once more at half the height. It never sinks through its slot. The red count badge pops on its corner
// and peaks on the frame of the first landing, trailing the icon by a few frames on the second bounce. Then a long still hold;
// the badge clears before the loop.
const JUMP = 8 // the app leaves the dock
const LAND = 46 // first landing: the badge and the sparkle answer to this frame
const CLEAR = 144 // the badge is read and goes
const UP: Vec = [0, -42]
const UP2: Vec = [0, -20]
const BOUNCE: Track<Vec> = [[JUMP, [0, 0], SOFT], [JUMP + 18, UP, 0], [LAND - 18, UP, IN], [LAND, [0, 0], SOFT], [LAND + 13, UP2, IN], [LAND + 26, [0, 0]]]
const SLOT = (i: number): Vec => [-66 + i * 44, -50] // dock slot centres
const APP = SLOT(2)
const BADGE: Vec = [APP[0] + 18, APP[1] - 19]
const tile = ([x, y]: Vec, fill: Shape['fill'], depth = 0.12): Shape => ({ d: rect(x - 17, y - 17, 34, 34, 9), fill, depth })

const dockBadge: Icon = {
  name: 'dock-badge',
  frames: 180,
  still: 100,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [250, 330], shapes: [] },
    { id: 'lap', parent: 'root', tilt: FACE, shapes: laptop('deep') },
    {
      parent: 'lap',
      shapes: [
        { d: rect(-92, -144, 96, 56, 8), fill: 'white' },
        { d: line([-78, -124], [-32, -124]) },
        { d: line([-78, -106], [-12, -106]) },
        { d: rect(-94, -74, 188, 48, 14), fill: 'paper' },
        tile(SLOT(0), 'ok'),
        tile(SLOT(1), 'gold'),
        tile(SLOT(3), 'white'),
      ],
    },
    {
      id: 'app',
      parent: 'lap',
      a: APP,
      p: APP,
      m: { p: BOUNCE },
      shapes: [tile(APP, 'main', 0.18), { d: ellipse(APP[0] - 2, APP[1] + 2, 8, 6), fill: 'white', line: 4 }],
    },
    {
      parent: 'app',
      a: BADGE,
      p: BADGE,
      m: [...popIn(LAND - 10, CLEAR), { p: BOUNCE, at: 4, k: 0.2 }],
      shapes: [{ d: ellipse(BADGE[0], BADGE[1], 12), fill: 'hot', depth: 0.15 }, { d: line([BADGE[0] - 4, BADGE[1] - 3], [BADGE[0] + 1, BADGE[1] - 7], [BADGE[0] + 1, BADGE[1] + 7]), line: 3 }],
    },
    glow('root', [158, -196], 24, popIn(LAND, 128)),
  ],
}

export default dockBadge
