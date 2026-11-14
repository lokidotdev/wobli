// Resume Submit
import { ellipse, line, pill, poly, rect } from '../engine.ts'
import { IN, SOFT } from '../motions.ts'
import { EXT, FACE, LINE, checkBadge, glow, hit, popIn } from '../parts.ts'
import type { Icon, Shape, Vec } from '../engine.ts'

// A resume card hangs tilted above an open briefcase, then drops into the case's mouth, straightening as it falls. The case
// takes the hit on the frame the card lands, its handle following a beat later, and a check pops onto the front corner with a
// sparkle. A still hold, then the check pops away and the card lifts back out along the path it fell in on.
const DROP = 14 // the card lets go
const FALL = 22
const LAND = DROP + FALL // the card is in the case
const CHECK_IN = LAND + 8
const CHECK_OUT = 112
const BACK = 140 // the card lifts back out
const RISE = 30

const CARD = { w: 124, h: 156 }
const REST: Vec = [0, -46] // inside the case: its top peeking over the front
const ABOVE: Vec = [40, -236] // where the card waits, above the handle
const TURN = 12
const KNOCK: Vec = [0, 12]
const BADGE: Vec = [130, -56] // the front panel's top right corner
const HANDLE_BASE: Vec = [0, -96]

const HANDLE = poly([[-54, -96], [-54, -142], [54, -142], [54, -96], [36, -96], [36, -124], [-36, -124], [-36, -96]], [0, 16, 16, 0, 0, 6, 6, 0])

// a resume centred on 0 0: photo, name line, three lines of experience and a coloured tag
const resume = (): ReadonlyArray<Shape> => {
  const [x, y] = [-CARD.w / 2, -CARD.h / 2]
  return [
    { d: rect(x, y, CARD.w, CARD.h, 10), fill: 'white', depth: 0.35 },
    { d: ellipse(x + 34, y + 36, 18), fill: 'main', depth: 0.2 },
    { d: line([x + 62, y + 28], [x + 102, y + 28]), line: 4 },
    { d: line([x + 62, y + 46], [x + 88, y + 46]), line: 4 },
    { d: line([x + 18, y + 80], [x + 106, y + 80]), line: 4 },
    { d: line([x + 18, y + 98], [x + 94, y + 98]), line: 4 },
    { d: line([x + 18, y + 116], [x + 100, y + 116]), line: 4 },
    { d: pill(x + 18, y + 130, 40, 14), fill: 'deep', depth: 0.2 },
  ]
}

const resumeSubmit: Icon = {
  name: 'resume-submit',
  frames: 180,
  still: 100,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [250, 282], shapes: [] },
    // the case takes the hit as the card lands
    { id: 'case', parent: 'root', tilt: FACE, s: [86, 86], m: hit(LAND, KNOCK, 0.7), shapes: [] },
    // the back wall and the dark mouth the card drops into
    {
      parent: 'case',
      shapes: [
        { d: rect(-150, -100, 300, 120, 18), fill: 'main', depth: 1 },
        { d: rect(-132, -84, 264, 40, 8), fill: 'deep' },
      ],
    },
    // the resume: falls in on the slamming ease, straightening, and lifts back out on its mirror
    {
      parent: 'case',
      m: {
        p: [[0, ABOVE], [DROP, ABOVE, IN], [LAND, REST, 0], [BACK, REST, SOFT], [BACK + RISE, ABOVE]],
        r: [[0, TURN], [DROP, TURN, IN], [LAND, 0, 0], [BACK, 0, SOFT], [BACK + RISE, TURN]],
      },
      shapes: resume(),
    },
    // the handle rides the case's top in front of the mouth, and follows the hit a beat late
    { parent: 'case', a: HANDLE_BASE, p: HANDLE_BASE, m: hit(LAND + 5, [0, 6], 0.7), shapes: [{ d: HANDLE, fill: 'deep', depth: 0.6 }] },
    // the front panel, its two clasps and a strap line
    {
      parent: 'case',
      shapes: [
        { d: rect(-160, -58, 320, 196, 22), fill: 'main', depth: 1 },
        { d: line([-160, 2], [160, 2]) },
        { d: rect(-88, -12, 34, 28, 6), fill: 'deep', depth: 0.4 },
        { d: rect(54, -12, 34, 28, 6), fill: 'deep', depth: 0.4 },
      ],
    },
    { parent: 'case', a: BADGE, p: BADGE, m: popIn(CHECK_IN, CHECK_OUT), shapes: checkBadge(BADGE, 30) },
    glow('root', [-170, -150], 22, popIn(CHECK_IN + 4, CHECK_OUT - 6)),
    glow('root', [178, 30], 16, popIn(CHECK_IN + 9, CHECK_OUT - 2)),
  ],
}

export default resumeSubmit
