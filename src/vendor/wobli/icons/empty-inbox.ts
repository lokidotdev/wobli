// Empty Inbox
import { ellipse, line, poly, rect, view } from '../engine.ts'
import { EASY } from '../motions.ts'
import { EXT, FACE, LINE, checkBadge, glow, popIn } from '../parts.ts'
import type { Icon, Layer, Shape, Track, Vec } from '../engine.ts'

// The tray lies empty and a small paper plane hangs over its near edge. The plane sets off right, banks up round the far side
// of the tray, turning about at the top where it is smallest, and comes back down the left on the mirror of the way it went,
// two dots trailing it. It settles where it started and a check lands on the tray: nothing in it. Then a long still hold.
const SET_OFF = 10 // the plane leaves its rest point
const APEX = 55 // the far side of the circle, slowest and smallest
const HOME = 100 // back where it started
const CLEAR = 144 // the check pops away before the seam

const ORBIT: Vec = [0, -80] // the circle's centre in root, high over the middle of the tray
const BANK = -12 // the circle leans with the tray's long side
const LOOP: Vec = [170, 50] // its half width and half height, foreshortened like the tray
const NEAR: Vec = [0, LOOP[1]] // rest point on the circle, its near side
const FAR: Vec = [0, -LOOP[1]] // the far side
const BADGE: Vec = [92, 96]

// the plane, modelled in 3d and seen from the house view
const fly = view(50, 30)
const PL = 0.48
const pl = ([x, y, z]: readonly [number, number, number]): Vec => {
  const [u, v] = fly([x, y, z])
  return [u * PL, v * PL]
}
const [NOSE, TAIL, KEEL, WING_FAR, WING_NEAR] = [pl([172, 0, 0]), pl([-128, 0, 0]), pl([-104, 0, -112]), pl([-144, 116, 20]), pl([-144, -116, -44])]
const PLANE: ReadonlyArray<Shape> = [
  { d: poly([NOSE, WING_FAR, TAIL], 3), fill: 'paper', side: 'white', depth: 0.5 },
  { d: poly([NOSE, TAIL, KEEL], 3), fill: 'main', depth: 0.5 },
  { d: poly([NOSE, TAIL, WING_NEAR], 3), fill: 'white', side: 'white', depth: 0.5 },
]

// one lap: up the right, over the far side, down the left; each half one segment bent into half an ellipse
const K = (LOOP[0] * 4) / 3
const LAP: Track<Vec> = [
  [SET_OFF, [0, 0], EASY, [[K, 0], [K, 0]]],
  [APEX, [FAR[0] - NEAR[0], FAR[1] - NEAR[1]], EASY, [[-K, 0], [-K, 0]]],
  [HOME, [0, 0]],
]

// the tray: a slab with a tinted floor, a raised inner rim and a label holder on its front edge
const TRAY: ReadonlyArray<Shape> = [
  { d: rect(-136, -98, 272, 196, 28), fill: 'main', depth: 1 },
  { d: rect(-108, -72, 216, 144, 16), fill: 'tint', depth: 0 },
  { d: line([-108, -40], [-54, -40], [-42, -16], [42, -16], [54, -40], [108, -40]) },
  { d: rect(-44, 50, 88, 34, 8), fill: 'white', depth: 0.35 },
  { d: line([-26, 67], [26, 67]) },
]

// two dots ride the same lap a few frames behind the plane
const trail = (lag: number, r: number): Layer => ({
  parent: 'orbit',
  p: NEAR,
  m: [{ p: LAP, at: lag }, ...popIn(SET_OFF + lag, HOME - 34 + lag)],
  shapes: [{ d: ellipse(0, 0, r), fill: 'ink', line: false }],
})

const emptyInbox: Icon = {
  name: 'empty-inbox',
  frames: 180,
  still: 120,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [250, 214], shapes: [] },
    { id: 'tray', parent: 'root', tilt: FACE, p: [0, 84], shapes: TRAY },
    { id: 'orbit', parent: 'root', p: ORBIT, r: BANK, shapes: [] },
    trail(12, 6),
    trail(20, 4.5),
    {
      id: 'plane',
      parent: 'orbit',
      p: NEAR,
      r: -BANK, // level at rest, whatever the circle's lean
      m: {
        p: LAP,
        // turns about on the far side: flips round as it climbs, back again as it comes down, smaller while far away
        s: [[SET_OFF + 12, [100, 100], EASY], [APEX - 10, [-80, 80], EASY], [APEX + 12, [-80, 80], EASY], [HOME - 8, [100, 100]]],
        r: [[SET_OFF, 0, EASY], [SET_OFF + 22, -14, EASY], [APEX, 0, EASY], [HOME - 22, 14, EASY], [HOME, 0]],
      },
      shapes: PLANE,
    },
    { parent: 'root', a: BADGE, p: BADGE, m: popIn(HOME + 2, CLEAR), shapes: checkBadge(BADGE, 28) },
    glow('root', [-150, -10], 20, popIn(HOME + 6, CLEAR - 6)),
  ],
}

export default emptyInbox
