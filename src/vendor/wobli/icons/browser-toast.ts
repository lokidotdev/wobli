// Browser Toast
import { ellipse, line, pill, poly, rect } from '../engine.ts'
import { EASY } from '../motions.ts'
import { EXT, FACE, LINE, checkBadge, glow, outAndBack, popIn } from '../parts.ts'
import type { Icon, Shape, Track, Vec } from '../engine.ts'

// A toast slides in from the page's right edge and settles in the bottom corner; its check pops on the frame it lands and
// its timer bar starts to drain. When the bar runs out the toast slides back out the way it came, and the page is left as it was.
const SLIDE_IN = 14
const LAND = 40 // the toast settles: the check and the sparkle answer to this frame
const SLIDE_OUT = 130 // the timer has run out
const GONE = SLIDE_OUT + 24
const OFF: Vec = [160, 0] // past the page's right edge, hidden by the page clip
const TOAST = { x: -6, y: 22, w: 120, h: 58 }
const BADGE: Vec = [TOAST.x + 27, TOAST.y + 29]
const BAR: Vec = [TOAST.x + 52, TOAST.y + 39] // the timer bar's left end: it drains toward here
// full while it slides in, drains through the hold, empty on the way out, refilled off the page before the loop
const DRAIN: Track<Vec> = [[LAND, [100, 100], EASY], [SLIDE_OUT, [0, 100], 0], [GONE + 6, [100, 100]]]

const browserToast: Icon = {
  name: 'browser-toast',
  frames: 180,
  still: 96,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [244, 254], shapes: [] },
    {
      id: 'window',
      parent: 'root',
      tilt: FACE,
      shapes: [
        { d: rect(-140, -100, 280, 200, 22), fill: 'white', depth: 1 },
        { d: poly([[-140, -100], [140, -100], [140, -58], [-140, -58]], [22, 22, 0, 0]), fill: 'deep', depth: 0.2 },
        ...[-116, -96, -76].map((x): Shape => ({ d: ellipse(x, -79, 6), fill: 'white' })),
        { d: pill(-56, -90, 176, 22), fill: 'white' },
      ],
    },
    // the page: what the toast slides over, and the matte that hides it off the edge
    { id: 'page', parent: 'window', shapes: [{ d: rect(-124, -44, 248, 132, 10), fill: 'tint' }] },
    {
      parent: 'window',
      shapes: [
        { d: rect(-108, -30, 84, 64, 8), fill: 'main', depth: 0.3 },
        { d: pill(-10, -28, 104, 14), fill: 'grey', depth: 0.2 },
        { d: pill(-10, -4, 76, 14), fill: 'grey', depth: 0.2 },
        { d: pill(-108, 48, 96, 14), fill: 'grey', depth: 0.2 },
      ],
    },
    {
      id: 'toast',
      parent: 'window',
      clip: 'page',
      p: outAndBack<Vec>(OFF, [0, 0], SLIDE_IN, LAND - SLIDE_IN, SLIDE_OUT, GONE - SLIDE_OUT),
      shapes: [
        { d: rect(TOAST.x, TOAST.y, TOAST.w, TOAST.h, 14), fill: 'white', depth: 0.4 },
        { d: line([TOAST.x + 52, TOAST.y + 20], [TOAST.x + 104, TOAST.y + 20]) },
      ],
    },
    { parent: 'toast', clip: 'page', a: BAR, p: BAR, s: DRAIN, shapes: [{ d: rect(BAR[0], BAR[1] - 4, 52, 9, 4), fill: 'main', line: 4 }] },
    { parent: 'toast', clip: 'page', a: BADGE, p: BADGE, m: popIn(LAND - 6, SLIDE_OUT - 2), shapes: checkBadge(BADGE, 17, 0.3) },
    glow('root', [150, -40], 20, popIn(LAND, SLIDE_OUT - 16)),
  ],
}

export default browserToast
