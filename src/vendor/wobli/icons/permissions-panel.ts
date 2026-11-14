// Permissions Panel
import { arc, ellipse, line, pill, rect } from '../engine.ts'
import { EXT, FACE, LINE, glow, mapPin, outAndBack, popIn } from '../parts.ts'
import type { Icon, Layer, Shape, Vec } from '../engine.ts'

// A permissions sheet lists camera, microphone and location. The camera switch flips on and its badge swells on the same frame,
// then the microphone a beat later, then location; a sparkle lands as the last one settles. After the long hold they switch off
// last on first off, location first, so the panel is back where it began at the seam.
const FLIP = 16 // the camera switch starts on
const LAG = 18 // each next switch follows this much later
const FLIP_LEN = 20
const OFF = 116 // location starts off; the others follow LAG apart, last on first off
const BUMP = 8 // the badge swells this long, and settles over BUMP + 4

const ROWS = [-66, 10, 86]
const TRACK = { x: 22, w: 82, h: 40 }
const KNOB_R = 15
const KNOB_TRAVEL = TRACK.w - TRACK.h
const BADGE = { x: -74, s: 50 }

// the three glyphs, drawn white on their badge, centred on the badge's middle
const camera = (x: number, y: number): ReadonlyArray<Shape> => [
  { d: rect(x - 8, y - 15, 16, 8, 3), fill: 'white', line: 4 },
  { d: rect(x - 16, y - 10, 32, 23, 6), fill: 'white', line: 4 },
  { d: ellipse(x, y + 1.5, 6.5), line: 4 },
]
const mic = (x: number, y: number): ReadonlyArray<Shape> => [
  { d: arc(x, y - 1, 13, 15, 165), line: 4 },
  { d: line([x, y + 12], [x, y + 18]), line: 4 },
  { d: pill(x - 7, y - 19, 14, 25), fill: 'white', line: 4 },
]
const pin = (x: number, y: number): ReadonlyArray<Shape> => [
  { d: mapPin(x, y + 18, 0.16), fill: 'white', line: 4 },
  { d: ellipse(x, y - 7.5, 4.5), fill: 'ink', line: false },
]
const GLYPHS = [camera, mic, pin]

// one row: a badge that swells when its switch flips, two label lines, and the switch whose on colour grows out from under the knob
const row = (i: number): ReadonlyArray<Layer> => {
  const y = ROWS[i]
  const on = FLIP + i * LAG
  const off = OFF + (2 - i) * LAG
  const ty = y - TRACK.h / 2
  const c: Vec = [BADGE.x, y]
  return [
    {
      parent: 'panel',
      shapes: [
        { d: line([-36, y - 8], [8, y - 8]) },
        { d: line([-36, y + 9], [i === 1 ? -6 : -16, y + 9]) },
        { d: pill(TRACK.x, ty, TRACK.w, TRACK.h), fill: 'grey', depth: 0.3 },
        { d: outAndBack(pill(TRACK.x, ty, TRACK.h, TRACK.h), pill(TRACK.x, ty, TRACK.w, TRACK.h), on, FLIP_LEN, off), fill: 'ok', depth: 0.3 },
      ],
    },
    {
      parent: 'panel',
      p: outAndBack<Vec>([0, 0], [KNOB_TRAVEL, 0], on, FLIP_LEN, off),
      shapes: [{ d: ellipse(TRACK.x + TRACK.h / 2, y, KNOB_R), fill: 'white', depth: 0.5 }],
    },
    {
      // feedback on the cause: the badge swells on the frame its switch starts to move
      parent: 'panel',
      a: c,
      p: c,
      m: { s: outAndBack<Vec>([100, 100], [114, 114], on, BUMP, on + BUMP, BUMP + 4) },
      shapes: [
        { d: rect(c[0] - BADGE.s / 2, y - BADGE.s / 2, BADGE.s, BADGE.s, 14), fill: 'main', depth: 0.5 },
        ...GLYPHS[i](c[0], y),
      ],
    },
  ]
}

const permissionsPanel: Icon = {
  name: 'permissions-panel',
  frames: 180,
  still: 96,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [250, 254], shapes: [] },
    {
      id: 'panel',
      parent: 'root',
      tilt: FACE,
      shapes: [
        { d: rect(-136, -176, 272, 336, 28), fill: 'deep', depth: 1 },
        { d: rect(-116, -156, 232, 296, 14), fill: 'white', depth: 0.2 },
        { d: line([-96, -126], [-24, -126]) },
        { d: ellipse(86, -126, 9), fill: 'grey', line: 4 },
      ],
    },
    ...[0, 1, 2].flatMap(row),
    glow('root', [158, -140], 24, popIn(FLIP + 2 * LAG + FLIP_LEN - 4, OFF - 8)),
    glow('root', [-160, 118], 16, popIn(FLIP + 2 * LAG + FLIP_LEN + 2, OFF - 2)),
  ],
}

export default permissionsPanel
