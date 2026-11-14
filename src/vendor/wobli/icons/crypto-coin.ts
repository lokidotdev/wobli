// Crypto Coin
import { ellipse, line, poly, rect } from '../engine.ts'
import { EASY, SNAP, SOFT, spring } from '../motions.ts'
import { EXT, FACE, glow, LINE, outAndBack, popIn } from '../parts.ts'
import type { Icon, Track, Vec } from '../engine.ts'

// The coin lifts off its pedestal and spins one full turn while the chart line climbs behind it; the arrow pops at the top.
// The coin comes down the way it went up and the pedestal takes the landing with the spring. After a long hold the line
// draws back down and the arrow pops away.
const LIFT = 10 // coin leaves the pedestal
const LAND = 84 // coin touches down: the pedestal takes the hit on this frame
const PEAK = 66 // the chart line reaches the top: the arrow pops
const HEX = poly(Array.from({ length: 6 }, (_, i): Vec => [Math.cos(((i * 60 - 90) * Math.PI) / 180) * 19, Math.sin(((i * 60 - 90) * Math.PI) / 180) * 19]), 4)
const TREND: ReadonlyArray<Vec> = [[-58, 36], [-28, 8], [0, 22], [34, -14], [66, -34]]
const ARROW = TREND[TREND.length - 1]
const DRAW: Track<number> = [[LIFT + 6, 0, EASY], [PEAK, 1], [146, 1, EASY], [170, 0]]
const COIN: Vec = [0, 32]

const cryptoCoin: Icon = {
  name: 'crypto-coin',
  frames: 180,
  still: 110,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [244, 248], shapes: [] },
    {
      id: 'board',
      parent: 'root',
      p: [52, -60],
      tilt: FACE,
      shapes: [
        { d: rect(-96, -66, 192, 130, 20), fill: 'white', depth: 0.6 },
        { d: line([-72, -40], [-34, -40]) },
      ],
    },
    { parent: 'board', shapes: [{ d: line(...TREND), line: 9, trim: DRAW }] },
    {
      parent: 'board',
      a: ARROW,
      p: ARROW,
      r: -26,
      m: popIn(PEAK, 146),
      shapes: [{ d: poly([[ARROW[0] + 20, ARROW[1]], [ARROW[0] - 10, ARROW[1] - 18], [ARROW[0] - 10, ARROW[1] + 18]], 3), fill: 'ok', depth: 0.4 }],
    },
    {
      id: 'ped',
      parent: 'root',
      m: { p: [...spring([0, 6], LAND, 0.8), [128, [0, 6], SOFT], [160, [0, 0]]] },
      shapes: [{ d: ellipse(0, 100, 80, 28), fill: 'grey', depth: 1 }, { d: ellipse(0, 82, 60, 21), fill: 'white', depth: 0.8 }],
    },
    {
      id: 'coin',
      parent: 'ped',
      a: [0, 78],
      p: [0, 78],
      m: { p: outAndBack<Vec>([0, 0], [0, -38], LIFT, 28, LAND - 26, 26), s: [[LIFT + 4, [100, 100], SNAP], [LIFT + 34, [-100, 100], SNAP], [LIFT + 64, [100, 100]]] },
      shapes: [],
    },
    {
      parent: 'coin',
      p: COIN,
      tilt: FACE,
      shapes: [
        { d: ellipse(0, 0, 54), fill: 'gold', depth: 1 },
        { d: ellipse(0, 0, 39) },
        { d: HEX, fill: 'gold', depth: 0.35 },
        { d: line([0, -9], [0, 9]), line: 5 },
      ],
    },
    glow('root', [-96, -20], 20, popIn(LAND, 150)),
    glow('root', [146, -104], 16, popIn(PEAK + 4, 146)),
  ],
}

export default cryptoCoin
