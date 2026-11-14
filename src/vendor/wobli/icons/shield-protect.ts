// Shield Protect
import { arc, ellipse, line, star } from '../engine.ts'
import { IN, OUT, SOFT, spring, springTurn, twinkle } from '../motions.ts'
import { EXT, FACE, facePoint, glow, LINE, popIn, sheet, wave } from '../parts.ts'
import type { Icon, Layer, Motion, Shape, Vec } from '../engine.ts'

// A bug dives at the shield from the top right, speeding up, and on the frame it strikes the shield takes the hit with the
// spring and a ripple runs off the point of contact; the bug ricochets back out spinning and shrinks away. A second one comes
// in from the lower left half a second later and bounces off the same way. The document behind barely feels it, a beat late.
const SHIELD = 'M0 -118C34 -96 64 -88 98 -90C102 -10 76 62 0 110C-76 62 -102 -10 -98 -90C-64 -88 -34 -96 0 -118Z'
const SHIELD_IN = 'M0 -90C24 -74 46 -68 72 -68C72 -10 54 42 0 78C-54 42 -72 -10 -72 -68C-46 -68 -24 -74 0 -90Z'
const SH: Vec = [40, 36] // the shield's centre in the root
const PIVOT: Vec = [40, 140] // the shield rocks on its point
const HIT_1 = 8 // the first bug appears
const HIT_2 = 40 // the second one appears
const FLY = 22 // frames from appearing to the strike: they land on 30 and 62
const at = (x: number, y: number): Vec => {
  const [fx, fy] = facePoint(x, y)
  return [SH[0] + fx, SH[1] + fy]
}
const add = (a: Vec, b: Vec): Vec => [a[0] + b[0], a[1] + b[1]]
const sub = (a: Vec, b: Vec): Vec => [a[0] - b[0], a[1] - b[1]]

// the hit: shoved along v in a few frames, then the spring brings it home through a recoil
const knock = (v: Vec, turn: number, t: number): Motion => ({
  p: [[t, [0, 0], SOFT], ...spring([0, 0], t + 5, 0.5, v)],
  r: [[t, 0, SOFT], ...springTurn(0, t + 5, 0.5, turn)],
})

// a spiky blob with a cross face, drawn round the point it strikes
const bug = ([x, y]: Vec): ReadonlyArray<Shape> => [
  { d: star(x, y, 34, 0.74, 11, 4), fill: 'hot', depth: 0.6 },
  ...[-1, 1].flatMap((s): ReadonlyArray<Shape> => [
    { d: ellipse(x + s * 11, y - 2, 8), fill: 'white', line: 4 },
    { d: ellipse(x + s * 9, y, 4), fill: 'ink', line: false },
    { d: line([x + s * 20, y - 16], [x + s * 5, y - 10]), line: 4 },
  ]),
  { d: arc(x, y + 17, 7, 200, 340), line: 4 },
]
// dives in on an ease in from `from`, strikes `hit` at t + FLY, ricochets out to `away` spinning, shrinking as it goes
const threat = (hit: Vec, from: Vec, away: Vec, t: number, spin: number): Layer => ({
  parent: 'root',
  a: hit,
  p: hit,
  ip: t,
  op: t + 64,
  m: [
    twinkle(t),
    twinkle(t + FLY + 6, true),
    {
      p: [[t, sub(from, hit), IN], [t + FLY, [0, 0], OUT], [t + 64, sub(away, hit)]],
      r: [[t + FLY, 0, OUT], [t + 64, spin]],
    },
  ],
  shapes: bug(hit),
})

const EDGE_1 = at(92, -60) // the top right shoulder
const EDGE_2 = at(-80, 30) // the lower left flank
const HIT_P1 = add(EDGE_1, [26, -12])
const HIT_P2 = add(EDGE_2, [-26, 6])

const shieldProtect: Icon = {
  name: 'shield-protect',
  frames: 180,
  still: 120,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [234, 258], shapes: [] },
    {
      parent: 'root',
      p: [-58, -60],
      tilt: FACE,
      m: [{ ...knock([-5, 3], -1.5, HIT_1 + FLY), at: 5 }, { ...knock([4, -2], 1.5, HIT_2 + FLY), at: 5 }],
      shapes: sheet(180, 226, 'ok', 'doc'),
    },
    wave('root', EDGE_1, 40, HIT_1 + FLY, -60, 10),
    wave('root', EDGE_2, 40, HIT_2 + FLY, 120, 190),
    { id: 'shield', parent: 'root', a: PIVOT, p: PIVOT, m: [knock([-16, 9], -7, HIT_1 + FLY), knock([14, -6], 6, HIT_2 + FLY)], shapes: [] },
    {
      parent: 'shield',
      p: SH,
      tilt: FACE,
      shapes: [
        { d: SHIELD, fill: 'ok', depth: 1 },
        { d: SHIELD_IN, fill: 'white', depth: 0.35 },
        { d: line([-30, -12], [-8, 12], [32, -30]), line: 9 },
      ],
    },
    threat(HIT_P1, add(HIT_P1, [64, -90]), add(HIT_P1, [84, -56]), HIT_1, 160),
    threat(HIT_P2, add(HIT_P2, [-84, 80]), add(HIT_P2, [-112, -16]), HIT_2, -160),
    glow('root', [-170, -150], 22, popIn(HIT_2 + FLY + 6, 160)),
  ],
}

export default shieldProtect
