// Gift Card
import { line, pill, rect } from '../engine.ts'
import { EASY, IN, OUT, SOFT, spring, springTurn } from '../motions.ts'
import { EXT, FACE, facePoint, glow, LINE, outAndBack, popIn } from '../parts.ts'
import type { Icon, Track, Vec } from '../engine.ts'

// The lid bursts off the gift box on a spring and the box dips under the kick; a beat later the gift card rises out of the
// box on a soft ease and two sparkles pop. After the hold the card sinks back in first, then the lid comes home along the
// path it left by and the box takes the landing.
const BOW = 'M0 -78C-18 -124 -86 -134 -76 -96C-70 -78 -30 -78 0 -78ZM0 -78C18 -124 86 -134 76 -96C70 -78 30 -78 0 -78Z'
const HINGE: Vec = [-114, -36] // the lid's left corner: it tips open about it
const LID_OFF: Vec = [-62, -34]
const OPEN = 8 // the lid bursts off and the box dips
const LAND = 148 // the lid is home and the box takes it
const CARD_UP = facePoint(0, -120)
const DIP = (at: number): Track<Vec> => [[at - 2, [0, 0], OUT], [at + 4, [0, 5], EASY], [at + 20, [0, 0]]]

const giftCard: Icon = {
  name: 'gift-card',
  frames: 180,
  still: 84,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [262, 292], s: [76, 76], m: { p: [...DIP(OPEN), ...DIP(LAND)] }, shapes: [] },
    {
      parent: 'root',
      tilt: FACE,
      shapes: [
        { d: rect(-100, -40, 200, 140, 14), fill: 'main', depth: 1 },
        { d: rect(-20, -40, 40, 140), fill: 'gold', depth: 1 },
      ],
    },
    {
      parent: 'root',
      tilt: FACE,
      a: HINGE,
      p: facePoint(...HINGE),
      m: {
        p: [...spring(LID_OFF, OPEN, 0.6), [124, LID_OFF, IN], [LAND, [0, 0]]],
        r: [...springTurn(-30, OPEN, 0.6), [124, -30, IN], [LAND, 0]],
      },
      shapes: [
        { d: BOW, fill: 'gold', depth: 0.5 },
        { d: rect(-114, -78, 228, 42, 12), fill: 'main', depth: 0.8 },
        { d: rect(-22, -78, 44, 42), fill: 'gold', depth: 0.8 },
        { d: pill(-18, -94, 36, 24), fill: 'gold', depth: 0.5 },
      ],
    },
    // the open top of the box: the card only shows above it, so it rises out of the box and in front of the lid
    { id: 'mouth', parent: 'root', tilt: FACE, o: 0, shapes: [{ d: rect(-200, -400, 400, 353) }] },
    {
      parent: 'root',
      tilt: FACE,
      clip: 'mouth',
      m: { p: outAndBack<Vec>([0, 0], CARD_UP, 16, 34, 112, 26) },
      shapes: [
        { d: rect(-76, -36, 152, 124, 12), fill: 'white', depth: 0.4 },
        { d: rect(30, -36, 22, 124), fill: 'gold' },
        { d: pill(-58, -18, 56, 18), fill: 'main' },
        { d: line([-58, 14], [8, 14]) },
      ],
    },
    glow('root', [118, -196], 22, popIn(46, 116)),
    glow('root', [150, -110], 15, popIn(52, 122)),
  ],
}

export default giftCard
