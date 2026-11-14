// Medical Report
import { ellipse, line, poly, rect } from '../engine.ts'
import { EXT, FACE, LINE, glow, hit, outAndBack, popIn } from '../parts.ts'
import type { Icon, Layer, Shape, Vec } from '../engine.ts'

// A blank report sits on the clipboard. Its lines write themselves in one after another, top to bottom; as the last one
// finishes the red cross badge pops onto the corner and the board takes the knock on the same frame, a sparkle on the beat.
// After a long hold the badge shrinks away and the lines draw back last first, so the sheet is blank again at the seam.
const ROWS = [-34, -4, 26, 56]
const ENDS = [62, 40, 70, 28] // right end of each line
const LINE_X = -40 // lines start after their bullet
const WRITE = 8 // the first line starts writing
const STEP = 12 // each next line follows this much later
const LEN = 14 // frames a line takes to write
const writeAt = (i: number) => WRITE + i * STEP
const LAND = writeAt(ROWS.length - 1) + LEN + 2 // the badge lands and the board takes it
const BADGE_OUT = 128
const UNWRITE = 136 // the last line starts drawing back, the others follow 6 apart
const unwriteAt = (i: number) => UNWRITE + (ROWS.length - 1 - i) * 6

const BADGE: Vec = [80, 98]
const BADGE_R = 46
const ARM = 12 // half the cross's bar width
const REACH = 28 // half the cross's length

// the plus as one outline, so its slab reads as a single raised part
const cross = ([x, y]: Vec): string =>
  poly(
    [
      [x - ARM, y - REACH], [x + ARM, y - REACH], [x + ARM, y - ARM], [x + REACH, y - ARM],
      [x + REACH, y + ARM], [x + ARM, y + ARM], [x + ARM, y + REACH], [x - ARM, y + REACH],
      [x - ARM, y + ARM], [x - REACH, y + ARM], [x - REACH, y - ARM], [x - ARM, y - ARM],
    ],
    3,
  )

// one line of the report: its bullet stays, the ink line writes in and draws back
const row = (y: number, i: number): Layer => ({
  parent: 'board',
  shapes: [{ d: line([LINE_X, y], [ENDS[i], y]), line: 7, trim: outAndBack(0, 1, writeAt(i), LEN, unwriteAt(i), 10) }],
})

const medicalReport: Icon = {
  name: 'medical-report',
  frames: 180,
  still: 110,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [244, 262], s: [92, 92], shapes: [] },
    { id: 'knock', parent: 'root', m: hit(LAND, [4, 9]), shapes: [] },
    {
      id: 'board',
      parent: 'knock',
      tilt: FACE,
      shapes: [
        { d: rect(-104, -136, 208, 272, 24), fill: 'main', depth: 1 }, // the board
        { d: rect(-84, -110, 168, 228, 10), fill: 'white', depth: 0.3 }, // the sheet
        { d: rect(-46, -152, 92, 36, 10), fill: 'grey', depth: 0.7 }, // the clip
        { d: rect(-18, -142, 36, 12, 6), fill: 'white', depth: 0.2 },
        { d: rect(-64, -86, 92, 24, 8), fill: 'tint', depth: 0.25 }, // the patient header
        // a bullet before each line
        ...ROWS.map((y): Shape => ({ d: ellipse(-58, y, 7), fill: 'grey', depth: 0.2 })),
      ],
    },
    ...ROWS.map(row),
    {
      parent: 'board',
      a: BADGE,
      p: BADGE,
      m: popIn(LAND - 2, BADGE_OUT),
      shapes: [
        { d: ellipse(BADGE[0], BADGE[1], BADGE_R), fill: 'hot', depth: 0.7 },
        { d: cross(BADGE), fill: 'white', depth: 0.35 },
      ],
    },
    glow('root', [150, -170], 22, popIn(LAND + 4, BADGE_OUT - 6)),
    glow('root', [-168, -60], 15, popIn(LAND + 10, BADGE_OUT)),
  ],
}

export default medicalReport
