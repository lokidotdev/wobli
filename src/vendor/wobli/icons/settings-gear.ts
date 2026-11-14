// Settings Gear
import { ellipse, line, pill, poly, rect } from '../engine.ts'
import { SOFT } from '../motions.ts'
import { EXT, FACE, LINE, glow, outAndBack, popIn } from '../parts.ts'
import type { Icon, Layer, Shape, Track, Vec } from '../engine.ts'

// The big gear turns two teeth and drives the small one the other way; as the gears come to rest the first switch flips on and
// the second follows a beat later, their tracks filling from under the knobs. A sparkle on the last flip, then the long hold.
// The gears turn two more teeth to switch everything off, last on first off, so every part is back where it began at the seam.
const BIG = { c: [-40, -82] as Vec, n: 10, r: 56 }
const SMALL = { n: 6, r: 34 }
const MESH = -18 // the angle the small gear sits at from the big one, where a big tooth meets a small gap
const SMALL_C: Vec = [BIG.c[0] + 92 * Math.cos((MESH * Math.PI) / 180), BIG.c[1] + 92 * Math.sin((MESH * Math.PI) / 180)]

const TURN = 72 // two teeth of the big gear: it looks the same after, so the loop closes on any multiple
const SPIN = 10 // the gears start turning
const OFF = 118 // the gears turn again to switch everything off
const SPIN_LEN = 46
const FLIP = 34 // the first switch flips on as the gears settle
const LAG = 12 // the second switch follows
const FLIP_LEN = 22
const BACK = OFF + 20 // the second switch goes off first, the first follows LAG later

const ROWS = [40, 112]
const TRACK = { x: 6, w: 84, h: 40 }
const KNOB_R = 15
const KNOB_TRAVEL = TRACK.w - TRACK.h

// a gear outline: n trapezoid teeth around a root circle, the first tooth at angle `phase`
const gear = (n: number, r: number, phase: number): string => {
  const pitch = 360 / n
  const pts: Array<Vec> = []
  const at = (deg: number, rad: number): Vec => [Math.cos((deg * Math.PI) / 180) * rad, Math.sin((deg * Math.PI) / 180) * rad]
  for (let i = 0; i < n; i++) {
    const a = phase + i * pitch
    pts.push(at(a - pitch * 0.3, r - 6), at(a - pitch * 0.16, r + 12), at(a + pitch * 0.16, r + 12), at(a + pitch * 0.3, r - 6))
  }
  return poly(pts, 3)
}

const gearLayer = (c: Vec, n: number, r: number, phase: number, fill: Shape['fill'], turn: Track<number>): Layer => ({
  parent: 'panel',
  a: [0, 0],
  p: c,
  r: turn,
  shapes: [
    { d: gear(n, r, phase), fill, depth: 0.8 },
    { d: ellipse(0, 0, r * 0.42), fill: 'white', depth: 0.3 },
    { d: ellipse(0, 0, r * 0.16), fill: 'ink', line: false },
  ],
})

// both turns: out to the first rest, then on to the second, on the same soft settle
const turn = (by: number): Track<number> => [
  [SPIN, 0, SOFT],
  [SPIN + SPIN_LEN, by, 0],
  [OFF, by, SOFT],
  [OFF + SPIN_LEN, by * 2],
]

const toggle = (y: number, on: number, off: number): ReadonlyArray<Layer> => {
  const ty = y - TRACK.h / 2
  return [
    {
      parent: 'panel',
      shapes: [
        { d: pill(TRACK.x, ty, TRACK.w, TRACK.h), fill: 'grey', depth: 0.3 },
        // the on colour grows out from under the knob as it travels, and shrinks back into it
        { d: outAndBack(pill(TRACK.x, ty, TRACK.h, TRACK.h), pill(TRACK.x, ty, TRACK.w, TRACK.h), on, FLIP_LEN, off), fill: 'main', depth: 0.3 },
      ],
    },
    {
      parent: 'panel',
      p: outAndBack<Vec>([0, 0], [KNOB_TRAVEL, 0], on, FLIP_LEN, off),
      shapes: [{ d: ellipse(TRACK.x + TRACK.h / 2, y, KNOB_R), fill: 'white', depth: 0.5 }],
    },
  ]
}

const settingsGear: Icon = {
  name: 'settings-gear',
  frames: 180,
  still: 100,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [252, 254], shapes: [] },
    {
      id: 'panel',
      parent: 'root',
      tilt: FACE,
      shapes: [
        { d: rect(-126, -186, 252, 362, 28), fill: 'deep', depth: 1 },
        { d: rect(-106, -166, 212, 322, 14), fill: 'white', depth: 0.2 },
        ...ROWS.flatMap((y, i): Array<Shape> => [
          { d: line([-84, y - 7], [-20, y - 7]) },
          { d: line([-84, y + 9], [i ? -42 : -56, y + 9]) },
        ]),
      ],
    },
    gearLayer(SMALL_C, SMALL.n, SMALL.r, MESH + 180 - 180 / SMALL.n, 'tint', turn((-TURN * BIG.n) / SMALL.n)),
    gearLayer(BIG.c, BIG.n, BIG.r, MESH, 'main', turn(TURN)),
    ...toggle(ROWS[0], FLIP, BACK + LAG),
    ...toggle(ROWS[1], FLIP + LAG, BACK),
    glow('root', [150, -150], 24, popIn(FLIP + LAG + FLIP_LEN - 4, OFF - 6)),
    glow('root', [-156, 120], 16, popIn(FLIP + LAG + FLIP_LEN + 2, OFF)),
  ],
}

export default settingsGear
