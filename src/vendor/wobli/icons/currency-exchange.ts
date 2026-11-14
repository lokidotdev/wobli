// Currency Exchange
import { arc, ellipse, line, poly } from '../engine.ts'
import { SOFT } from '../motions.ts'
import { EXT, FACE, LINE, glow, popIn } from '../parts.ts'
import type { Icon, Layer, Shape, Track, Vec } from '../engine.ts'

// The circular arrows turn half a circle and, a few frames behind them, the dollar coin rides the top arc to the right while
// the euro coin rides the bottom arc to the left; each coin keeps its face upright, settling a beat after the swap. A sparkle
// marks the landing. After a hold they swap again the same way round, finishing the full turn back where they started.
const ORBIT = 86 // coin centres sit this far either side of the middle, on the face
const COIN_R = 58
const RING_R = 168 // the arrows ring the coins, clear of them at rest
const TURN = 8 // the arrows start the first swap
const LAG = 5 // the coins follow
const TRIP = 46
const SECOND = 104 // the arrows start the second swap
const LAND = TURN + LAG + TRIP
const LAND2 = SECOND + LAG + TRIP

// a half turn, a hold, the next half turn the same way round: one full revolution per loop. The hold key (ease 0) carries 180
// until the second swap, which picks up at the same pose written as -180, so the loop ends on exactly 0 and the seam is clean.
const swap = (at: number): Track<number> => [[at, 0, SOFT], [at + TRIP, 180, 0], [SECOND + at - TURN, -180, SOFT], [SECOND + at - TURN + TRIP, 0]]
// the coin's face stays upright: it turns back as the orbit turns forward, a few frames late so it sways in and settles
const upright = (at: number): Track<number> => swap(at).map(([t, v, e]) => [t, -v, e] as const)

// a curved arrow as one white slab: a band along the ring from `from` to `to` degrees, ending in a head that points on round
const BAND = 18
const arrowArc = (r: number, from: number, to: number): ReadonlyArray<Shape> => {
  const at = (deg: number, rr: number): string => `${(Math.cos((deg * Math.PI) / 180) * rr).toFixed(2)} ${(Math.sin((deg * Math.PI) / 180) * rr).toFixed(2)}`
  const [ro, ri] = [r + BAND / 2, r - BAND / 2]
  const b = (to * Math.PI) / 180
  const tip: Vec = [Math.cos(b) * r - Math.sin(b) * 40, Math.sin(b) * r + Math.cos(b) * 40]
  const d = `M${at(from, ro)}A${ro} ${ro} 0 0 1 ${at(to, ro)}L${at(to, r + 26)}L${tip[0].toFixed(2)} ${tip[1].toFixed(2)}L${at(to, r - 26)}L${at(to, ri)}A${ri} ${ri} 0 0 0 ${at(from, ri)}Z`
  return [{ d, fill: 'white', depth: 0.6 }]
}

// dollar: an S stroke with its bar
const DOLLAR = 'M15 -16C11 -24 -14 -24 -14 -10C-14 4 15 -2 15 12C15 26 -12 26 -16 16'
// euro: an open C with two bars
const EURO: ReadonlyArray<string> = [arc(4, 0, 20, 45, 315), line([-24, -5], [6, -5]), line([-24, 6], [4, 6])]

const coinFace = (fill: Shape['fill'], glyph: ReadonlyArray<Shape>): ReadonlyArray<Shape> => [
  { d: ellipse(0, 0, COIN_R), fill, depth: 1 },
  { d: ellipse(0, 0, COIN_R * 0.72), fill, depth: 0.3 },
  ...glyph,
]

// the dollar coin, drawn twice: one copy under the euro until the second swap, one over it after
const dollar = (span: { ip?: number; op?: number }): Layer => ({
  ...span,
  parent: 'orbit',
  p: [-ORBIT, 0],
  r: upright(TURN + LAG + 4),
  shapes: coinFace('gold', [{ d: DOLLAR, line: 6, round: true }, { d: line([0, -30], [0, 30]), line: 6 }]),
})

const currencyExchange: Icon = {
  name: 'currency-exchange',
  frames: 210, // two swaps, each with its own hold
  still: 80,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [250, 258], shapes: [] },
    { id: 'face', parent: 'root', tilt: FACE, shapes: [] },
    { parent: 'face', r: swap(TURN), shapes: [...arrowArc(RING_R, 200, 330), ...arrowArc(RING_R, 20, 150)] },
    { id: 'orbit', parent: 'face', r: swap(TURN + LAG), shapes: [] },
    // the dollar rides the back (top) arc first, so it draws under the euro until the hold, then over it for the second swap
    dollar({ op: SECOND }),
    {
      parent: 'orbit',
      p: [ORBIT, 0],
      r: upright(TURN + LAG + 4),
      shapes: coinFace('main', EURO.map((d): Shape => ({ d, line: 6, round: true }))),
    },
    dollar({ ip: SECOND }),
    glow('root', [-172, -150], 22, popIn(LAND, SECOND - 6)),
    glow('root', [186, 132], 18, popIn(LAND2, 174)),
  ],
}

export default currencyExchange
