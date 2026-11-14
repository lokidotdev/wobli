// Online Course
import { ellipse, line, pill, poly, rect } from '../engine.ts'
import { EASY, IN, hop } from '../motions.ts'
import { EXT, FACE, LAP, LINE, glow, laptop, outAndBack, outIn, popIn } from '../parts.ts'
import type { Icon, Track, Vec } from '../engine.ts'

// The play button on the laptop pops away and the lesson runs: the tutor on the right nods, the board on the left fills in
// line by line and the progress bar creeps along the bottom of the screen. The bar reaches the end, a graduation cap pops out
// over the lid's corner on a sparkle and hops. A still hold, then the cap pops away, the board and bar rewind and play returns.
const PLAY = 14 // the play button pops away, the lesson starts
const DONE = 104 // the bar reaches the end
const CAP_OUT = 132 // the cap pops away
const REWIND = 136 // board and bar rewind
const REWIND_LEN = 18
const RETURN = REWIND + REWIND_LEN // the play button pops back

const BUTTON: Vec = [0, -98]
const BAR = { x: -92, y: -42, w: 184, h: 12 }
const BAR_START: Vec = [BAR.x, BAR.y + BAR.h / 2]
const TUTOR: Vec = [58, -98] // the tutor's head on the face
const CAP: Vec = [112, -184] // the graduation cap, over the lid's top right corner, in root space

// the lesson plays at a constant rate; the rewind retraces it on IN
const progress: Track<Vec> = [[PLAY + 4, [6, 100]], [DONE, [100, 100], 0], [REWIND, [100, 100], IN], [REWIND + REWIND_LEN, [6, 100]]]
// a board line written in, held, then erased on the rewind
const write = (t: number): Track<number> => [[t, 0, EASY], [t + 14, 1, 0], [REWIND, 1, IN], [REWIND + REWIND_LEN, 0]]

const onlineCourse: Icon = {
  name: 'online-course',
  frames: 180,
  still: 124,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [262, 322], shapes: [] },
    { id: 'lap', parent: 'root', tilt: FACE, shapes: laptop('deep') },
    { id: 'screen', parent: 'lap', shapes: [{ d: rect(LAP.x, LAP.y, LAP.w, LAP.h, 8), fill: 'tint' }] },
    // the board: three lines of the lesson written in one after another
    {
      parent: 'lap',
      clip: 'screen',
      shapes: [
        { d: rect(-92, -144, 104, 88, 8), fill: 'white', depth: 0.2 },
        { d: line([-78, -124], [-6, -124]), line: 4, trim: write(PLAY + 10) },
        { d: line([-78, -104], [-22, -104]), line: 4, trim: write(PLAY + 28) },
        { d: line([-78, -84], [-14, -84]), line: 4, trim: write(PLAY + 46) },
      ],
    },
    // the tutor's tile: shoulders stay, the head nods as the lesson starts
    {
      parent: 'lap',
      clip: 'screen',
      shapes: [
        { d: rect(24, -144, 68, 88, 8), fill: 'main', depth: 0.2 },
        { d: `M32 -56L32 -66C32 -80 44 -84 58 -84C72 -84 84 -80 84 -66L84 -56Z`, fill: 'white', line: 4 },
      ],
    },
    {
      parent: 'lap',
      clip: 'screen',
      a: TUTOR,
      p: outAndBack<Vec>(TUTOR, [TUTOR[0], TUTOR[1] + 6], PLAY + 8, 7, PLAY + 17, 10),
      shapes: [{ d: ellipse(TUTOR[0], TUTOR[1], 15, 16), fill: 'white', line: 4 }],
    },
    // the progress bar: a white track and a fill growing from its left end
    { parent: 'lap', shapes: [{ d: pill(BAR.x, BAR.y, BAR.w, BAR.h), fill: 'white', depth: 0.2 }] },
    { parent: 'lap', a: BAR_START, p: BAR_START, s: progress, shapes: [{ d: pill(BAR.x, BAR.y, BAR.w, BAR.h), fill: 'main', depth: 0.2 }] },
    // the play button: over the paused lesson, pops away as it starts and back once it has rewound
    {
      parent: 'lap',
      a: BUTTON,
      p: BUTTON,
      m: outIn(PLAY, RETURN - 6),
      shapes: [
        { d: ellipse(BUTTON[0], BUTTON[1], 32), fill: 'white', depth: 0.6 },
        { d: poly([[BUTTON[0] - 9, BUTTON[1] - 15], [BUTTON[0] + 16, BUTTON[1]], [BUTTON[0] - 9, BUTTON[1] + 15]], 4), fill: 'main', depth: 0.3 },
      ],
    },
    // the graduation cap: pops out over the corner when the bar is full, hops, pops away before the rewind
    {
      id: 'cap',
      parent: 'root',
      a: [0, 30],
      p: [CAP[0], CAP[1] + 30],
      m: [...popIn(DONE, CAP_OUT), { ...hop, at: DONE + 6, k: 0.7 }],
      shapes: [],
    },
    {
      parent: 'cap',
      shapes: [
        { d: 'M-36 4L-36 30C-36 42 36 42 36 30L36 4Z', fill: 'deep', depth: 0.8 },
        { d: poly([[-70, 0], [0, -30], [70, 0], [0, 30]], 4), fill: 'deep', depth: 0.5 },
        { d: line([0, 0], [52, 8], [52, 38]), line: 4 },
        { d: rect(45, 34, 14, 20, 4), fill: 'gold', line: 4 },
        { d: ellipse(0, 0, 7, 4), fill: 'gold', line: 4 },
      ],
    },
    glow('root', [-150, -168], 22, popIn(DONE + 4, CAP_OUT - 6)),
  ],
}

export default onlineCourse
