// Login Success
import { ellipse, pill, rect } from '../engine.ts'
import { checkBadge, EXT, FACE, facePoint, glow, LINE, outAndBack, popIn, shackle } from '../parts.ts'
import type { Icon, Layer, Vec } from '../engine.ts'

// Four password dots pop into the field on the padlock one after another; on the frame the last one lands the shackle springs
// open on the leg that stays in, and a check pops out of the corner. After a long hold the way home retraces the way out: the
const OPEN = 40 // the last dot lands, the shackle springs
const CLOSE = 118 // the shackle starts home
const DOT = (i: number): Vec => [-54 + i * 36, 12]
const HINGE: Vec = [-58, -62] // the leg that stays in the body
const BADGE: Vec = [116, -72]

const loginSuccess: Icon = {
  name: 'login-success',
  frames: 180,
  still: 96,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [250, 302], shapes: [] },
    {
      parent: 'body',
      a: HINGE,
      p: HINGE,
      m: { p: outAndBack<Vec>([0, 0], [-6, -18], OPEN, 24, CLOSE, 24), r: outAndBack(0, -32, OPEN, 24, CLOSE, 24) },
      shapes: [{ d: shackle(148, 32, -40, 82), fill: 'grey', depth: 0.7 }],
    },
    {
      id: 'body',
      parent: 'root',
      tilt: FACE,
      shapes: [
        { d: rect(-112, -80, 224, 176, 24), fill: 'deep', depth: 1 },
        { d: pill(-88, -14, 176, 52), fill: 'white', depth: 0.3 },
      ],
    },
    ...[0, 1, 2, 3].map((i): Layer => {
      const c = DOT(i)
      return { parent: 'body', a: c, p: c, m: popIn(OPEN - 32 + i * 8, CLOSE + 18 + (3 - i) * 4), shapes: [{ d: ellipse(c[0], c[1], 10), fill: 'ink', line: false }] }
    }),
    { parent: 'root', tilt: FACE, a: BADGE, p: facePoint(...BADGE), m: popIn(OPEN + 16, CLOSE - 6), shapes: checkBadge(BADGE, 42, 0.5) },
    glow('root', [-172, 40], 22, popIn(OPEN + 22, CLOSE - 10)),
  ],
}

export default loginSuccess
