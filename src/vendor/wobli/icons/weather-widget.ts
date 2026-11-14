// Weather Widget
import { ellipse, line, rect, star } from '../engine.ts'
import { SNAP, fall } from '../motions.ts'
import { EXT, FACE, LINE, glow, numeral, outAndBack, outIn, popIn } from '../parts.ts'
import type { Icon, Layer, Track, Vec } from '../engine.ts'

// The widget shows the sun. A cloud slides in from the card's right edge with a smaller one a beat behind it, the sun
// shrinks away behind them and the temperature drops; then rain starts falling out of the cloud and it drops again. After
// the hold the rain stops, the clouds slide back out the way they came, the sun pops back with a sparkle and the
// temperature climbs home.
const SUN: Vec = [-34, -66]
const CLOUD: Vec = [6, -58] // the big cloud's centre once it has landed
const PUFF: Vec = [-40, -82] // the small cloud behind it
const OFF: Vec = [250, 0] // past the sky panel's right edge, hidden by the sky clip
const RAIN_TOP: Vec = [CLOUD[0], CLOUD[1] + 22]

const CLOUD_IN = 20
const SLIDE = 26
const LAG = 6
const COVER = CLOUD_IN + 18 // the sun is behind the cloud
const LANDED = CLOUD_IN + SLIDE
const RAIN = 66
const CLEAR = 140 // the rain stops
const CLOUD_OUT = CLEAR + 14
const SUN_BACK = CLOUD_OUT + 12
const FRAMES = 210
const DRIP = 35 // one drop falls in this many frames, over and over

// a cloud of three bumps on a flat base, k scales it so the outline keeps its weight
const cloud = ([x, y]: Vec, k: number) => {
  const n = (v: number) => Math.round(v * k * 10) / 10
  return (
    `M${x - n(84)} ${y + n(48)}A${n(40)} ${n(40)} 0 0 1 ${x - n(87)} ${y - n(28)}A${n(54)} ${n(54)} 0 0 1 ${x + n(15)} ${y - n(57)}` +
    `A${n(48)} ${n(48)} 0 0 1 ${x + n(93)} ${y - n(13)}A${n(33)} ${n(33)} 0 0 1 ${x + n(84)} ${y + n(48)}Z`
  )
}

// the temperature, two digits morphing 24 to 18 when the cloud lands, to 12 when the rain starts, and home when the sun is back
const TENS = { x: -94, y: 72, w: 20, h: 34 }
const UNITS = { ...TENS, x: -64 }
const digit = (at: typeof TENS) => (n: number) => numeral(n, at.x, at.y, at.w, at.h)
const [tens, units] = [digit(TENS), digit(UNITS)]
const TENS_D: Track<string> = [[LANDED, tens(2), SNAP], [LANDED + 12, tens(1), 0], [SUN_BACK, tens(1), SNAP], [SUN_BACK + 12, tens(2)]]
const UNITS_D: Track<string> = [
  [LANDED, units(4), SNAP],
  [LANDED + 12, units(8), 0],
  [RAIN, units(8), SNAP],
  [RAIN + 12, units(2), 0],
  [SUN_BACK, units(2), SNAP],
  [SUN_BACK + 12, units(4)],
]

const drop = (x: number, phase: number): Layer => ({
  parent: 'rain',
  clip: 'sky',
  m: { ...fall([-12, 112], 0, DRIP), loop: DRIP, at: phase },
  shapes: [{ d: ellipse(x, RAIN_TOP[1], 7, 11), fill: 'white', depth: 0.3 }],
})

const weatherWidget: Icon = {
  name: 'weather-widget',
  frames: FRAMES,
  still: 112,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [244, 262], shapes: [] },
    // the widget card: the temperature and the place under the sky panel
    {
      id: 'card',
      parent: 'root',
      tilt: FACE,
      shapes: [
        { d: rect(-118, -140, 236, 280, 40), fill: 'white', depth: 1 },
        { d: ellipse(-28, 76, 6), line: 4 },
        { d: line([2, 80], [92, 80]), line: 6 },
        { d: line([2, 100], [60, 100]), line: 6 },
      ],
    },
    { parent: 'card', shapes: [{ d: TENS_D, line: LINE }] },
    { parent: 'card', shapes: [{ d: UNITS_D, line: LINE }] },
    // the sky: the panel and the matte that hides whatever is past its edge
    { id: 'sky', parent: 'card', shapes: [{ d: rect(-98, -120, 196, 172, 28), fill: 'deep', depth: 0.2 }] },
    // the sun, shrinking away once the cloud covers it and popping back after the clouds have gone
    {
      parent: 'card',
      clip: 'sky',
      a: SUN,
      p: SUN,
      m: outIn(COVER, SUN_BACK),
      shapes: [
        { d: star(SUN[0], SUN[1], 54, 0.74, 12, 2), fill: 'gold', depth: 0.4 },
        { d: ellipse(SUN[0], SUN[1], 34), fill: 'gold', depth: 0.6 },
      ],
    },
    // the rain, falling out of the cloud's base and through the panel's bottom edge
    { id: 'rain', parent: 'card', a: RAIN_TOP, p: RAIN_TOP, m: popIn(RAIN, CLEAR), shapes: [] },
    drop(CLOUD[0] - 36, 0),
    drop(CLOUD[0] - 4, 18),
    drop(CLOUD[0] + 28, 9),
    drop(CLOUD[0] + 56, 26),
    // the clouds, sliding in from the right edge and back out the way they came, the small one a beat behind
    {
      parent: 'card',
      clip: 'sky',
      m: { p: outAndBack<Vec>(OFF, [0, 0], CLOUD_IN + LAG, SLIDE, CLOUD_OUT + LAG, SLIDE) },
      shapes: [{ d: cloud(PUFF, 0.42), fill: 'white', depth: 0.6 }],
    },
    {
      parent: 'card',
      clip: 'sky',
      m: { p: outAndBack<Vec>(OFF, [0, 0], CLOUD_IN, SLIDE, CLOUD_OUT, SLIDE) },
      shapes: [{ d: cloud(CLOUD, 0.6), fill: 'white', depth: 0.8 }],
    },
    glow('root', [-128, -158], 22, popIn(SUN_BACK + 8, FRAMES - 30)),
  ],
}

export default weatherWidget
