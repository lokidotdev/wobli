// Newsletter Blast
import { ellipse, poly, rect } from '../engine.ts'
import { EXT, FACE, LINE, glow, hit, outAndBack, popIn, popScale } from '../parts.ts'
import type { Icon, Layer, Shape, Vec } from '../engine.ts'

// The newsletter sits in the middle, and copies of it split off one after another, each thrown out to a reader; the big letter
// kicks back as each one leaves and every reader takes the hit on the frame its copy lands on their badge. After a long hold
// the copies fly home into the letter they came from, last out first in.
const LETTER: Vec = [-20, 62] // the newsletter's centre on the face
const READERS: ReadonlyArray<Vec> = [[-124, -100], [36, -136], [150, -12]] // avatar centres, left to right
const BADGE: Vec = [40, 44] // where a copy lands on its reader, from the reader's centre
const LAUNCH = [12, 20, 28] // a copy splits off and is thrown
const TRAVEL = 28
const HOME = [128, 120, 112] // copies head home, the last one out first
const HOME_LEN = 24

// an envelope: slab body, a flap crease, a seal
const envelope = (w: number, h: number, depth: number, seal: number): ReadonlyArray<Shape> => [
  { d: rect(-w / 2, -h / 2, w, h, h * 0.12), fill: 'white', depth },
  { d: poly([[-w / 2, -h / 2], [w / 2, -h / 2], [0, h * 0.1]], [h * 0.12, h * 0.12, h * 0.05]), fill: 'paper', depth: depth * 0.35 },
  { d: ellipse(0, h * 0.06, seal), fill: 'main', depth: depth * 0.5 },
]

// an avatar disc: slab body, raised white head and shoulders
const avatar = (r: number): ReadonlyArray<Shape> => [
  { d: ellipse(0, 0, r), fill: 'deep', depth: 1 },
  { d: ellipse(0, -r * 0.24, r * 0.3), fill: 'white', depth: 0.3 },
  { d: `M${-r * 0.56} ${r * 0.62}A${r * 0.56} ${r * 0.46} 0 0 1 ${r * 0.56} ${r * 0.62}Z`, fill: 'white', depth: 0.3 },
]

const reader = (seat: Vec, i: number): Layer => ({
  parent: 'face',
  p: seat,
  m: hit(LAUNCH[i] + TRAVEL, [5, -7], 0.7),
  shapes: avatar(46),
})

// a copy: grows out of the letter, thrown to its reader's badge spot, home again on the same path
const copy = (seat: Vec, i: number): Layer => {
  const to: Vec = [seat[0] + BADGE[0] - LETTER[0], seat[1] + BADGE[1] - LETTER[1]]
  return {
    parent: 'face',
    p: LETTER,
    m: { p: outAndBack<Vec>([0, 0], to, LAUNCH[i], TRAVEL, HOME[i], HOME_LEN), s: popScale(LAUNCH[i] - 4, HOME[i] + HOME_LEN - 12) },
    shapes: envelope(60, 40, 0.5, 7),
  }
}

const newsletterBlast: Icon = {
  name: 'newsletter-blast',
  frames: 180,
  still: 96,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [252, 262], shapes: [] },
    { id: 'face', parent: 'root', tilt: FACE, shapes: [] },
    ...READERS.map(reader),
    // the newsletter kicks back as each copy splits off
    { parent: 'face', p: LETTER, m: LAUNCH.map((t) => hit(t + 2, [0, 6], 0.5)), shapes: envelope(176, 116, 1, 16) },
    ...READERS.map(copy),
    glow('root', [-140, -150], 22, popIn(LAUNCH[2] + TRAVEL + 2, HOME[2] - 6)),
    glow('root', [170, 90], 16, popIn(LAUNCH[2] + TRAVEL + 8, HOME[2] - 2)),
  ],
}

export default newsletterBlast
