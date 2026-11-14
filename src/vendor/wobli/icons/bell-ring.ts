// Bell Ring
import { arc, ellipse, line, ring } from '../engine.ts'
import { SOFT, springTurn, twinkle } from '../motions.ts'
import { EXT, FACE, LINE, glow, outIn, popIn, wave } from '../parts.ts'
import type { Icon, Layer, Track, Vec } from '../engine.ts'

// The bell is drawn back, let go, and rings: it swings through rest on the spring, each swing half the last. On the first
// strike the count turns from 1 to 2, a ripple leaves the rim and a sparkle pops. The clapper and the count bubble trail the
// bell by a few frames. After a long still hold the bubble clears and comes back as 1, ready for the next ring.
const BELL = 'M-96 40C-94 -20 -80 -96 0 -98C80 -96 94 -20 96 40C108 46 120 54 122 66Q0 96 -122 66C-120 54 -108 46 -96 40Z'
const LIP = 'M-122 66Q0 96 122 66A9 9 0 0 1 124 84Q0 116 -124 84A9 9 0 0 1 -122 66Z'
const HANG: Vec = [0, -116] // where the bell hangs from: everything swings about it
const COUNT: Vec = [88, -84]
const [CX, CY] = COUNT

const WIND = 8
const RELEASE = 24
const PACE = 0.85
const STRIKE = RELEASE + Math.round(13 * PACE) // the first swing's far end, where the clapper hits
const CLEAR = 150
const BACK = 180
const SWING: Track<number> = [[WIND, 0, SOFT], ...springTurn(0, RELEASE, PACE, 16)]

const ONE = line([CX - 7, CY - 10], [CX + 3, CY - 17], [CX + 3, CY + 17])
const TWO = `M${CX - 11} ${CY - 7}C${CX - 11} ${CY - 20} ${CX + 11} ${CY - 20} ${CX + 11} ${CY - 7}C${CX + 11} ${CY + 2} ${CX - 11} ${CY + 8} ${CX - 11} ${CY + 17}L${CX + 12} ${CY + 17}`
const digit = (d: string, extra: Partial<Layer>): Layer => ({ parent: 'count', a: COUNT, p: COUNT, ...extra, shapes: [{ d, line: 6 }] })

const bellRing: Icon = {
  name: 'bell-ring',
  frames: 210,
  still: 112,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [250, 256], shapes: [] },
    wave('root', [0, 10], 178, STRIKE - 10, -24, 14), // glint swells slow: start early so the ripple is out on the strike
    { id: 'face', parent: 'root', tilt: FACE, shapes: [] },
    { id: 'bell', parent: 'face', a: HANG, p: HANG, m: { r: SWING }, shapes: [] },
    { parent: 'bell', a: [0, 30], p: [0, 30], m: { r: SWING, at: 5, k: 0.5 }, shapes: [{ d: ellipse(0, 112, 24), fill: 'hot', depth: 0.8 }] },
    {
      parent: 'bell',
      shapes: [
        { d: ring(0, -116, 22, 9), fill: 'gold', depth: 0.6 },
        { d: BELL, fill: 'gold', depth: 1 },
        { d: LIP, fill: 'gold', depth: 1 },
        { d: arc(0, 6, 78, 196, 236), round: true },
      ],
    },
    { id: 'arm', parent: 'face', a: HANG, p: HANG, m: { r: SWING, at: 5, k: 0.5 }, shapes: [] },
    { id: 'count', parent: 'arm', a: COUNT, p: COUNT, m: outIn(CLEAR, BACK), shapes: [{ d: ellipse(CX, CY, 34), fill: 'hot', depth: 0.6 }] },
    digit(ONE, { op: STRIKE }),
    digit(TWO, { ip: STRIKE, op: BACK, m: twinkle(STRIKE) }),
    digit(ONE, { ip: BACK }),
    glow('root', [-150, -138], 24, popIn(STRIKE, 112)),
  ],
}

export default bellRing
