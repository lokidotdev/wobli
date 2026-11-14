// Drag & Drop Upload
import { line, poly, rect } from '../engine.ts'
import { EASY, IN, SOFT, spring } from '../motions.ts'
import { CURSOR, EXT, FACE, LINE, checkBadge, glow, outAndBack, popIn, popScale, sheet } from '../parts.ts'
import type { Icon, Shape, Vec } from '../engine.ts'

// The pointer carries a file in, held just above the plate, and the zone lights up the moment the file is over it. The pointer
// lets go: the file falls, the plate takes the hit with the spring, a check lands on the file. The pointer leaves along the path
// it came in on. After the hold everything clears last in, first out: check, file, then the zone's light.
const ZONE = { x: -100, y: -70, w: 200, h: 140 }
// the dashed border: seven dashes along each long edge, five along each short one
const DASHES: ReadonlyArray<string> = (() => {
  const [x0, y0, x1, y1] = [ZONE.x, ZONE.y, ZONE.x + ZONE.w, ZONE.y + ZONE.h]
  const out: Array<string> = []
  for (let i = 0; i < 7; i++) {
    const [a, b] = [x0 + (ZONE.w * i) / 7 + 6, x0 + (ZONE.w * (i + 0.6)) / 7 + 6]
    out.push(line([a, y0], [b, y0]), line([a, y1], [b, y1]))
  }
  for (let i = 0; i < 5; i++) {
    const [a, b] = [y0 + (ZONE.h * i) / 5 + 6, y0 + (ZONE.h * (i + 0.6)) / 5 + 6]
    out.push(line([x0, a], [x0, b]), line([x1, a], [x1, b]))
  }
  return out
})()
const UP_ARROW = poly([[0, -30], [30, 2], [12, 2], [12, 30], [-12, 30], [-12, 2], [-30, 2]], 4)

const REST: Vec = [0, -8] // where the file lies on the plate
const LIFT: Vec = [5, -24] // held above it, straight up the extrusion
const FROM: Vec = [150, -150] // where the drag starts, off the plate
const GRIP: Vec = [16, -22] // the pointer's tip on the file
const BADGE: Vec = [-46, 36]

const GLIDE = 8 // the drag sets off
const OVER = 42 // the file is over the zone
const LIT = 26 // its leading edge crosses the dashes
const DROP = 50 // the pointer lets go
const LAND = 58 // the file hits the plate
const LEAVE = 84
const CLEAR = 138

const dropzoneUpload: Icon = {
  name: 'dropzone-upload',
  frames: 180,
  still: LEAVE,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [236, 296], m: { p: [[LAND - 2, [0, 0], IN], [LAND, [2, 9], 0], ...spring([0, 0], LAND, 0.7, [2, 9])] }, shapes: [] },
    { id: 'zone', parent: 'root', tilt: FACE, shapes: [{ d: rect(-130, -100, 260, 200, 28), fill: 'white', depth: 1 }] },
    {
      parent: 'zone',
      ip: LIT,
      op: CLEAR + 34,
      s: outAndBack<Vec>([0, 0], [100, 100], LIT, 18, CLEAR + 16, 18),
      shapes: [{ d: rect(ZONE.x, ZONE.y, ZONE.w, ZONE.h, 14), fill: 'tint', line: false }],
    },
    { parent: 'zone', shapes: [...DASHES.map((d): Shape => ({ d })), { d: UP_ARROW, fill: 'grey', depth: 0.25 }] },
    {
      id: 'drag',
      parent: 'root',
      p: REST,
      m: [
        { p: [[GLIDE, [FROM[0] + LIFT[0], FROM[1] + LIFT[1]], SOFT], [OVER, LIFT, 0], [DROP, LIFT, IN], [LAND, [0, 0], 0], [179, [0, 0], 0], [180, [FROM[0] + LIFT[0], FROM[1] + LIFT[1]]]] },
        { s: popScale(4, CLEAR + 8) },
      ],
      shapes: [],
    },
    // the sheet trails the hand by a few degrees and straightens after it stops
    { parent: 'drag', tilt: FACE, m: { r: [[GLIDE + 4, 0, EASY], [GLIDE + 20, 7, EASY], [OVER + 6, 0]] }, shapes: sheet(92, 118, 'hot', 'pdf') },
    { parent: 'root', a: BADGE, p: BADGE, m: popIn(LAND + 6, CLEAR), shapes: checkBadge(BADGE, 30) },
    {
      parent: 'root',
      p: REST,
      m: {
        p: outAndBack<Vec>([FROM[0] + LIFT[0] + GRIP[0], FROM[1] + LIFT[1] + GRIP[1]], [LIFT[0] + GRIP[0], LIFT[1] + GRIP[1]], GLIDE, OVER - GLIDE, LEAVE, 26),
        s: popScale(0, LEAVE + 26),
      },
      shapes: [{ d: CURSOR(0, 0), fill: 'white', depth: 0.5 }],
    },
    glow('root', [-170, -128], 24, popIn(LAND + 10, 126)),
    glow('root', [164, 84], 16, popIn(LAND + 16, 132)),
  ],
}

export default dropzoneUpload
