// Folder Hover
import { line, pill, poly, rect } from '../engine.ts'
import { CURSOR, EXT, facePoint, FACE, glow, outAndBack, LINE, popIn, popScale, sheet } from '../parts.ts'
import type { Icon, Layer, Shape, Vec } from '../engine.ts'

// The pointer glides in, the folder lifts on arrival, its front leans open and three files rise out of it one after another,
// fanned. They sink back last out first home, the front closes, the pointer leaves along the path it came in on.
const FOLD_BACK = poly([[-130, -100], [-56, -100], [-34, -76], [130, -76], [130, 92], [-130, 92]], [18, 8, 8, 18, 18, 18])
const file = (x: number, dx: number, turn: number, out: number, back: number, kind: 'doc' | 'img' | 'pdf', tag: Shape['fill']): Layer => ({
  parent: 'back',
  a: [x, 30],
  p: [x, 30],
  m: { p: outAndBack<Vec>([0, 0], [dx, -88], out, 30, back, 26), r: outAndBack(0, turn, out, 30, back, 26) },
  shapes: sheet(96, 124, tag, kind, x, -40),
})

const folderHover: Icon = {
  name: 'folder-hover',
  frames: 180,
  still: 80,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [254, 326], m: { p: outAndBack<Vec>([0, 0], [0, -10], 16, 24, 126, 24) }, shapes: [] },
    { id: 'back', parent: 'root', tilt: FACE, shapes: [{ d: FOLD_BACK, fill: 'main', depth: 1 }] },
    file(-76, -8, -10, 26, 112, 'doc', 'gold'),
    file(0, 0, 0, 30, 108, 'img', 'ok'),
    file(76, 12, 11, 34, 104, 'pdf', 'hot'),
    {
      parent: 'root',
      tilt: FACE,
      m: { p: outAndBack<Vec>([0, 0], facePoint(0, 16), 22, 28, 112, 26) },
      shapes: [{ d: rect(-130, -46, 260, 138, 18), fill: 'main', depth: 1 }, { d: pill(-46, -12, 92, 28), fill: 'white', depth: 0.3 }],
    },
    {
      parent: 'root',
      m: { p: outAndBack<Vec>([150, 40], [44, -6], 0, 22, 128, 22), s: popScale(0, 148) },
      shapes: [{ d: CURSOR(0, 0), fill: 'white', depth: 0.5 }],
    },
    glow('root', [-164, -152], 22, popIn(58, 100)),
    glow('root', [158, -178], 28, popIn(64, 104)),
  ],
}

export default folderHover
