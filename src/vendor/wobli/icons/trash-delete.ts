// Trash Delete
import { line, pill, poly, rect } from '../engine.ts'
import { IN, twinkle } from '../motions.ts'
import { buzz, EXT, FACE, facePoint, glow, LINE, outAndBack, popIn, sheet } from '../parts.ts'
import type { Icon, Layer, Shape, Vec } from '../engine.ts'

// The lid swings open on its hinge, the waiting file is thrown in on an arc, faster and faster, and drops behind the rim. The lid
// follows it shut on the mirror of the way it opened, and the bin rocks on the frame the lid slams, with one sparkle on that
// beat. After a long hold a fresh file pops in where the first one waited, which closes the loop.
const OPEN = 4 // the lid starts to lift
const THROW = 12 // the file leaves
const LAND = 42 // the file is inside
const SHUT = 62 // the lid slams
const REFILL = 134 // the next file pops in
const BASE = facePoint(0, 116) // where the bin stands: it rocks about this point
const HINGE: Vec = [-112, -104]
const FILE_REST: Vec = [150, -196]
const FILE_IN: Vec = [BASE[0] - FILE_REST[0], -70 - FILE_REST[1]] // behind the bin's front, as a move from the rest spot

const file = (extra: Partial<Layer>): Layer => ({ parent: 'root', tilt: FACE, p: FILE_REST, r: 10, shapes: sheet(78, 100, 'hot', 'doc'), ...extra })

const trashDelete: Icon = {
  name: 'trash-delete',
  frames: 180,
  still: 38, // lid open, file dropping in: the delete reads in one frame
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', a: BASE, p: [236 + BASE[0], 304 + BASE[1]], m: buzz(SHUT, 3, 4), shapes: [] },
    file({ op: LAND + 2, m: { p: [[THROW, [0, 0], IN, [[-50, -70], [0, -130]]], [LAND, FILE_IN]], r: [[THROW, 0, IN], [LAND, -16]] } }),
    file({ ip: REFILL, m: twinkle(REFILL) }),
    {
      id: 'body',
      parent: 'root',
      tilt: FACE,
      shapes: [
        { d: poly([[-100, -86], [100, -86], [82, 116], [-82, 116]], [6, 6, 18, 18]), fill: 'main', depth: 1 },
        ...[-44, 0, 44].map((x): Shape => ({ d: line([x, -50], [x * 0.86, 86]) })),
        { d: rect(-112, -104, 224, 26, 10), fill: 'deep', depth: 0.8 },
      ],
    },
    {
      parent: 'body',
      a: HINGE,
      p: HINGE,
      r: outAndBack(0, -64, OPEN, 24, LAND + 4, SHUT - LAND - 4),
      shapes: [{ d: pill(-34, -150, 68, 26), fill: 'deep', depth: 0.6 }, { d: rect(-118, -132, 236, 28, 12), fill: 'deep', depth: 0.8 }],
    },
    glow('root', [-150, -200], 22, popIn(SHUT, 120)),
  ],
}

export default trashDelete
