// Version History
import { ellipse, line, rect } from '../engine.ts'
import { EXT, FACE, LINE, facePoint, glow, outAndBack, popIn, sheet } from '../parts.ts'
import type { Icon, Layer, Shape, Vec } from '../engine.ts'

// Three versions of a document sit stacked. The clock's hand winds back and the newest sheet slides aside, then the one under
// it, until the first version lies open and a sparkle lands on it. After a hold the sheets come home last out, first home, and the
// hand winds forward with them, so the way forward retraces the way back.
const BACK = 14 // newest version starts back
const GAP = 14 // the second sheet follows
const LEN = 24
const SHOWN = BACK + GAP + LEN // the first version is open
const FORWARD = 104 // the second sheet heads home first
const HOME = FORWARD + GAP + LEN // everything is back
const STEP: Vec = [26, -26] // each older version sits up and right of the one in front
const ASIDE: Vec = [-196, 44] // where a flipped sheet rests, beside the stack
const W = 132
const H = 164
const CLOCK: Vec = [96, 98] // the history badge, on the stack's bottom right corner
const TURN = -300 // degrees the hand winds back

const at = (k: number, v: Vec = [0, 0]): Vec => [STEP[0] * k + v[0], STEP[1] * k + v[1]]

// one version: a sheet that slides aside on SOFT and comes home on IN along the same line
const version = (k: number, tag: Shape['fill'], out?: { start: number; back: number; to: Vec }): Layer => ({
  parent: 'root',
  tilt: FACE,
  ...(out
    ? {
        p: outAndBack<Vec>(facePoint(...at(k)), facePoint(...at(k, out.to)), out.start, LEN, out.back),
        r: outAndBack<number>(0, -6, out.start, LEN, out.back),
      }
    : { p: facePoint(...at(k)) }),
  shapes: sheet(W, H, tag, 'doc'),
})

const versionHistory: Icon = {
  name: 'version-history',
  frames: 180,
  still: 80,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [276, 258], s: [100, 100], shapes: [] },
    version(2, 'ok'),
    version(1, 'gold', { start: BACK + GAP, back: FORWARD, to: [-104, 20] }),
    version(0, 'main', { start: BACK, back: FORWARD + GAP, to: ASIDE }),
    {
      id: 'clock',
      parent: 'root',
      tilt: FACE,
      p: facePoint(...CLOCK),
      shapes: [
        { d: ellipse(0, 0, 44), fill: 'deep', depth: 0.8 },
        { d: ellipse(0, 0, 32), fill: 'white', depth: 0.3 },
        { d: line([0, 0], [16, 0]), line: 6 },
      ],
    },
    {
      parent: 'clock',
      r: outAndBack<number>(0, TURN, BACK, SHOWN - BACK, FORWARD, HOME - FORWARD),
      shapes: [{ d: rect(-3, -26, 6, 28, 3), fill: 'ink', line: false }],
    },
    glow('root', [-190, -120], 24, popIn(SHOWN, FORWARD - 4)),
    glow('root', [150, -170], 16, popIn(SHOWN + 6, FORWARD)),
  ],
}

export default versionHistory
