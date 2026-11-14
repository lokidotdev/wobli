// Note Taking
import { ellipse, line, poly, rect } from '../engine.ts'
import { EASY, IN, POP, SNAP, SOFT, spring } from '../motions.ts'
import { EXT, FACE, facePoint, glow, LINE, popIn } from '../parts.ts'
import type { Icon, Shape, Track, Vec } from '../engine.ts'

// A sticky note hovers just off the board while the pencil writes three lines on it, one after another, then steps back. The
// note slaps onto the board, which takes the hit with the spring, and a pin pops in on the same frame. After a long hold the pin
// comes out, the note lifts off the way it came and its lines clear, ready to be written again.
const NOTE: Vec = [26, 8] // the note's centre on the board face
const HALF = 58
const LIFT: Vec = [10, -40] // off the board, against the extrusion
const WRITTEN: ReadonlyArray<readonly [Vec, Vec, number]> = [
  [[-34, -6], [40, -6], 14],
  [[-34, 17], [40, 17], 38],
  [[-34, 40], [12, 40], 62],
]
const PIN: Vec = [NOTE[0], NOTE[1] - HALF + 14] // top centre, above the first line
const LEN = 18 // frames per written line
const PARKED = 96 // pencil back home
const PRESS = 100 // note starts towards the board
const LAND = 112 // note hits the board: spring, pin and sparkle
const UNSTICK = 150 // pin out, note lifts off
const ERASE = 160 // lines clear, last first

const add = (a: Vec, b: Vec): Vec => [a[0] + b[0], a[1] + b[1]]
// where a point written on the lifted note sits in the root
const nib = (p: Vec): Vec => add(facePoint(...add(NOTE, p)), LIFT)
const HOME: Vec = add(nib([HALF, -HALF]), [14, 0])
const PENCIL: Track<Vec> = [
  [0, HOME, SNAP],
  ...WRITTEN.flatMap(([a, b, t]) => [[t, nib(a)] as const, [t + LEN, nib(b), EASY] as const]),
  [PARKED, HOME],
]
const STAND_HIT: Vec = [2, 7]

// the sticky note: a square slab with its bottom right corner curling up
const note = (): ReadonlyArray<Shape> => {
  const [x, y, h, c] = [NOTE[0], NOTE[1], HALF, 24]
  return [
    { d: poly([[x - h, y - h], [x + h, y - h], [x + h, y + h - c], [x + h - c, y + h], [x - h, y + h]], [6, 6, 3, 3, 6]), fill: 'gold', depth: 0.35 },
    { d: poly([[x + h, y + h - c], [x + h - c, y + h - c], [x + h - c, y + h]], 3), fill: 'white', depth: 0.2 },
  ]
}

const noteTaking: Icon = {
  name: 'note-taking',
  frames: 180,
  still: 138,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [246, 290], s: [76, 76], shapes: [] },
    { id: 'stand', parent: 'root', m: { p: [...spring(STAND_HIT, LAND, 0.5), [UNSTICK + 6, STAND_HIT, POP], [UNSTICK + 26, [0, 0]]] }, shapes: [] },
    {
      parent: 'stand',
      tilt: FACE,
      shapes: [
        { d: rect(-120, -100, 240, 200, 22), fill: 'deep', depth: 1 },
        { d: rect(-104, -84, 208, 168, 10), fill: 'tint' },
        { d: rect(-92, -72, 54, 48, 6), fill: 'white', depth: 0.25 },
        { d: line([-82, -54], [-50, -54]) },
        { d: line([-82, -40], [-60, -40]) },
      ],
    },
    {
      id: 'note',
      parent: 'stand',
      tilt: FACE,
      a: NOTE,
      p: [[PRESS, add(facePoint(...NOTE), LIFT), IN], [LAND, facePoint(...NOTE), 0], [UNSTICK, facePoint(...NOTE), SOFT], [UNSTICK + 24, add(facePoint(...NOTE), LIFT)]],
      shapes: [
        ...note(),
        ...WRITTEN.map(([a, b, t], i): Shape => {
          const off = ERASE + (WRITTEN.length - 1 - i) * 4
          return { d: line(add(NOTE, a), add(NOTE, b)), line: 6, round: true, trim: [[t, 0], [t + LEN, 1, 0], [off, 1, SNAP], [off + 12, 0]] }
        }),
      ],
    },
    {
      parent: 'note',
      a: PIN,
      p: PIN,
      m: popIn(LAND, UNSTICK - 8),
      shapes: [
        { d: ellipse(PIN[0], PIN[1], 12), fill: 'main', depth: 0.8 },
        { d: ellipse(PIN[0] - 3, PIN[1] - 3, 3.5), fill: 'white', line: false },
      ],
    },
    {
      parent: 'root',
      p: PENCIL,
      s: [80, 80],
      r: [[0, 34, SNAP], [14, 26], [80, 26, EASY], [PARKED, 34]],
      shapes: [
        { d: rect(-19, -196, 38, 30, 14), fill: 'main', depth: 1 },
        { d: rect(-19, -172, 38, 18), fill: 'grey', depth: 1 },
        { d: rect(-19, -156, 38, 106), fill: 'deep', depth: 1 },
        { d: poly([[-19, -52], [19, -52], [3, -6], [-3, -6]], [3, 3, 2, 2]), fill: 'paper', depth: 0.6 },
        { d: poly([[-7, -22], [7, -22], [1, -4], [-1, -4]], 1), fill: 'ink', line: false },
      ],
    },
    glow('root', [-150, -110], 24, popIn(LAND + 2, UNSTICK - 6)),
    glow('root', [150, 110], 16, popIn(LAND + 8, UNSTICK)),
  ],
}

export default noteTaking
