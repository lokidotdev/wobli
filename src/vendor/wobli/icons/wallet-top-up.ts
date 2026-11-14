// Wallet Top-Up
import { ellipse, line, rect } from '../engine.ts'
import { IN, POP, spring, twinkle } from '../motions.ts'
import { coin, EXT, FACE, glow, LINE, popIn } from '../parts.ts'
import type { Icon, Layer, Motion, Shape, Track, Vec } from '../engine.ts'

// Three coins pop in above the open wallet one after another and drop in, faster and faster. Each lands with a spring, the
// wallet takes the hit on that frame and sinks a little heavier, and the balance on its front fills a step. After a long hold the
// coins sink into the pocket last in first out, the balance empties and the wallet eases back up the way it went down.
const COINS = [0, 1, 2] as const
const APPEAR = (i: number) => 4 + i * 16 // coin pops in above the wallet
const FALL = (i: number) => APPEAR(i) + 12 // and starts to drop
const LAND = (i: number) => FALL(i) + 20 // and hits the pocket: 36, 52, 68
const SINK = (i: number) => 124 + (2 - i) * 6 // into the pocket, last in first out
const EMPTY = (i: number) => 140 + (2 - i) * 5 // the balance step pops out
const LIFT = 134 // the wallet eases back up
const SLOT = (i: number): Vec => [-90 + i * 72, [-50, -60, -46][i]] // where each coin rests, peeking out of the pocket
const HIT = 14 // a coin hits this far above its rest and springs down into it
const TOP = -236 // where the coins wait before dropping
const DEEP = 66 // sunk out of sight behind the pocket
const SEG = (i: number): Vec => [-48 + i * 36, 30] // balance steps on the label
const HEFT: Vec = [1, 4] // how far each coin pushes the wallet down

// the wallet takes each coin's hit with the spring, a step heavier each time, and comes home together on the mirror ease
const heavier = (lag: number, k = 1): ReadonlyArray<Motion> => [
  ...COINS.map((i): Motion => ({ p: spring(HEFT, LAND(i) + lag, 0.6), k })),
  { p: [[0, [0, 0]], [LIFT + lag, [0, 0], POP], [LIFT + lag + 32, [-HEFT[0] * 3, -HEFT[1] * 3]]], k },
]

const drop = (i: number): Track<Vec> => {
  const [x, y] = SLOT(i)
  return [[FALL(i), [x, TOP], IN], ...spring([x, y], LAND(i), 0.6, [x, y - HIT]), [SINK(i), [x, y], IN], [SINK(i) + 18, [x, DEEP]]]
}

const walletTopUp: Icon = {
  name: 'wallet-top-up',
  frames: 180,
  still: 112,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [254, 296], shapes: [] },
    { id: 'back', parent: 'root', tilt: FACE, m: heavier(0), shapes: [{ d: rect(-140, -112, 280, 206, 26), fill: 'deep', depth: 1 }] },
    ...COINS.map(
      (i): Layer => ({
        parent: 'back',
        p: drop(i),
        ip: APPEAR(i),
        op: SINK(i) + 18,
        m: twinkle(APPEAR(i)),
        shapes: coin(33),
      }),
    ),
    {
      id: 'front',
      parent: 'root',
      tilt: FACE,
      m: heavier(3),
      shapes: [
        { d: rect(-140, -32, 280, 126, 26), fill: 'main', depth: 1 },
        { d: rect(-116, 8, 164, 46, 14), fill: 'white', depth: 0.4 },
        { d: line([-102, 31], [-80, 31]), line: 6 },
        { d: line([-91, 20], [-91, 42]), line: 6 },
        ...COINS.map((i): Shape => ({ d: rect(SEG(i)[0] - 13, 18, 26, 26, 6), fill: 'paper', line: 3 })),
      ],
    },
    ...COINS.map((i): Layer => ({ parent: 'front', a: SEG(i), p: SEG(i), m: popIn(LAND(i), EMPTY(i)), shapes: [{ d: rect(SEG(i)[0] - 13, 18, 26, 26, 6), fill: 'gold', line: 3 }] })),
    {
      parent: 'root',
      tilt: FACE,
      m: heavier(5),
      shapes: [{ d: rect(80, -8, 92, 62, 20), fill: 'deep', depth: 0.7 }, { d: ellipse(136, 23, 12), fill: 'gold', depth: 0.4 }],
    },
    glow('root', [-128, -150], 22, popIn(LAND(2), 120)),
  ],
}

export default walletTopUp
