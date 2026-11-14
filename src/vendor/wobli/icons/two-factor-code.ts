// Two-Factor Code
import { ellipse, line, pill, rect } from '../engine.ts'
import { buzz, checkBadge, EXT, FACE, facePoint, glow, LAP, laptop, LINE, numeral, outAndBack, PHONE_SCREEN, phoneBody, popIn } from '../parts.ts'
import type { Icon, Layer, Shape, Vec } from '../engine.ts'

// A message unfolds out of the top of the phone's screen and lands with a buzz; the four digits of the code pop into it one
// after another, then the same digits fill the laptop's boxes left to right and a check pops on the laptop. After a long hold
// the way home retraces the way out: the check goes, the boxes clear last in first out, and the message folds back up.
const LAPTOP: Vec = [60, 14]
const PHONE: Vec = [-124, 82]
const PHONE_SIZE: Vec = [72, 72]
const CODE = [4, 7, 1, 2] as const
const MSG_TOP: Vec = [0, -128] // the top of the screen: where the message comes from and goes back to
const PHONE_DIGIT = (i: number): Vec => [-39 + i * 26, -66]
const BOX = (i: number): Vec => [-72 + i * 48, -96]
const BADGE: Vec = [LAP.x + LAP.w + 4, LAP.y - 2]

const ARRIVE = 6 // the message starts unfolding
const LAND = 30 // it lands, the phone buzzes
const TYPE = 48 // the first box fills
const DONE = 78 // the check
const CLEAR = 124 // the way home starts
const FOLD = 150 // the message folds back

const twoFactorCode: Icon = {
  name: 'two-factor-code',
  frames: 180,
  still: 100,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [250, 262], shapes: [] },
    {
      id: 'laptop',
      parent: 'root',
      p: LAPTOP,
      tilt: FACE,
      shapes: [
        ...laptop('deep'),
        { d: line([-80, -136], [-20, -136]), line: 4 },
        ...[0, 1, 2, 3].map((i): Shape => ({ d: rect(BOX(i)[0] - 19, BOX(i)[1] - 22, 38, 44, 8), fill: 'white', depth: 0.25 })),
        { d: pill(-46, -58, 92, 22), fill: 'main', depth: 0.25 },
      ],
    },
    ...CODE.map((n, i): Layer => {
      const c = BOX(i)
      return { parent: 'laptop', a: c, p: c, m: popIn(TYPE + i * 7, CLEAR + 6 + (3 - i) * 4), shapes: [{ d: numeral(n, c[0] - 24 * 0.3, c[1] - 24 / 2, 24 * 0.6, 24), line: 6, round: true }] }
    }),
    { parent: 'root', tilt: FACE, a: BADGE, p: [LAPTOP[0] + facePoint(...BADGE)[0], LAPTOP[1] + facePoint(...BADGE)[1]], m: popIn(DONE, CLEAR), shapes: checkBadge(BADGE, 30, 0.5) },
    { id: 'phone', parent: 'root', p: PHONE, s: PHONE_SIZE, tilt: FACE, m: buzz(LAND, 2.5), shapes: [...phoneBody(32, 'main'), { d: PHONE_SCREEN(), fill: 'tint' }] },
    {
      id: 'message',
      parent: 'phone',
      a: MSG_TOP,
      p: MSG_TOP,
      ip: ARRIVE,
      op: FOLD + 26,
      s: outAndBack<Vec>([18, 8], [100, 100], ARRIVE, LAND - ARRIVE, FOLD, 24),
      shapes: [
        { d: rect(-60, -122, 120, 90, 18), fill: 'white', depth: 0.3 },
        { d: ellipse(-40, -102, 9), fill: 'ok', line: 4 },
        { d: line([-22, -102], [36, -102]), line: 4 },
      ],
    },
    ...CODE.map((n, i): Layer => {
      const c = PHONE_DIGIT(i)
      return { parent: 'message', a: c, p: c, m: popIn(LAND + 2 + i * 5, FOLD - 14 + (3 - i) * 3), shapes: [{ d: numeral(n, c[0] - 28 * 0.3, c[1] - 28 / 2, 28 * 0.6, 28), line: 5, round: true }] }
    }),
    glow('root', [176, -168], 22, popIn(DONE + 4, CLEAR - 8)),
    glow('root', [-196, -56], 18, popIn(LAND + 4, FOLD - 30)),
  ],
}

export default twoFactorCode
