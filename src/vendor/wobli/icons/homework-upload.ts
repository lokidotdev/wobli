// Homework Upload
import { ellipse, line, pill, rect } from '../engine.ts'
import { EASY, IN } from '../motions.ts'
import { EXT, FACE, LAP, LINE, checkBadge, glow, laptop, outAndBack, popIn } from '../parts.ts'
import type { Icon, Shape, Track, Vec } from '../engine.ts'

// A notebook page waits above the laptop, then slides down into the screen, shrinking as it goes in. The upload bar under it
// fills, and when it is full a check pops onto the page's corner as two sparkles follow it in. A still hold, then the check pops
// away, the bar empties and the page slides back out along the path it came in on.
const SLIDE = 8 // the page sets off for the screen
const SLIDE_LEN = 28
const LAND = SLIDE + SLIDE_LEN // the page sits on the screen
const FULL = LAND + 36 // the bar is full
const CHECK_OUT = 132 // the check pops away
const RETURN = 158 // the bar empties and the page slides back out
const RETURN_LEN = 20

const PAGE = { w: 112, h: 144 }
const OUTSIDE: Vec = [40, -284] // where the page waits, above the lid
const ON_SCREEN: Vec = [0, -102] // where it lands on the screen
const SHRINK: Vec = [62, 62]
const BAR = { x: -70, y: -42, w: 140, h: 12 }
const BAR_START: Vec = [BAR.x, BAR.y + BAR.h / 2]
const BADGE: Vec = [38, -136] // the page's top right corner on the screen

// the bar fills at a steady rate once the page lands, and empties on the way back out
const PROGRESS: Track<Vec> = [[LAND + 2, [6, 100], EASY], [FULL, [100, 100], 0], [RETURN, [100, 100], IN], [RETURN + 14, [6, 100]]]

// a ruled notebook page centred on 0 0: punched holes down the left, a margin, three handwritten lines
const notebookPage = (): ReadonlyArray<Shape> => {
  const [x, y] = [-PAGE.w / 2, -PAGE.h / 2]
  return [
    { d: rect(x, y, PAGE.w, PAGE.h, 8), fill: 'white', depth: 0.35 },
    { d: line([x + 30, y], [x + 30, y + PAGE.h]), line: 4 },
    ...[0.22, 0.5, 0.78].map((t): Shape => ({ d: ellipse(x + 15, y + PAGE.h * t, 6), fill: 'grey', line: 4 })),
    { d: line([x + 44, y + 34], [x + 94, y + 34]), line: 4 },
    { d: line([x + 44, y + 62], [x + 86, y + 62]), line: 4 },
    { d: line([x + 44, y + 90], [x + 98, y + 90]), line: 4 },
    { d: rect(x + 44, y + 110, 34, 14, 4), fill: 'main', depth: 0.2 },
  ]
}

const homeworkUpload: Icon = {
  name: 'homework-upload',
  frames: 180,
  still: 112,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [250, 350], shapes: [] },
    { id: 'lap', parent: 'root', tilt: FACE, shapes: laptop('deep') },
    { parent: 'lap', shapes: [{ d: rect(LAP.x, LAP.y, LAP.w, LAP.h, 8), fill: 'tint' }] },
    // the upload bar: a white track and a fill growing from its left end
    { parent: 'lap', shapes: [{ d: pill(BAR.x, BAR.y, BAR.w, BAR.h), fill: 'white', depth: 0.2 }] },
    { parent: 'lap', a: BAR_START, p: BAR_START, s: PROGRESS, shapes: [{ d: pill(BAR.x, BAR.y, BAR.w, BAR.h), fill: 'main', depth: 0.2 }] },
    // the page: slides in on the soft ease, shrinking onto the screen, and back out on its mirror
    {
      parent: 'lap',
      p: outAndBack<Vec>(OUTSIDE, ON_SCREEN, SLIDE, SLIDE_LEN, RETURN, RETURN_LEN),
      s: outAndBack<Vec>([100, 100], SHRINK, SLIDE, SLIDE_LEN, RETURN, RETURN_LEN),
      shapes: notebookPage(),
    },
    // the check pops onto the page's corner when the bar is full, and pops away before the page leaves
    { id: 'badge', parent: 'lap', a: BADGE, p: BADGE, m: popIn(FULL, CHECK_OUT), shapes: checkBadge(BADGE, 26) },
    glow('root', [-150, -176], 22, popIn(FULL + 4, CHECK_OUT - 6)),
    glow('root', [176, -40], 16, popIn(FULL + 9, CHECK_OUT - 2)),
  ],
}

export default homeworkUpload
