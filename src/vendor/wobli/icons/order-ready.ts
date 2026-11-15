// Order Ready
import { arc, poly, rect } from '../engine.ts'
import { IN, hop, spring } from '../motions.ts'
import { EXT, FACE, LINE, buzz, facePoint, glow, outAndBack, popIn, wave } from '../parts.ts'
import type { Icon, Layer, Track, Vec } from '../engine.ts'

// The bell's plunger is pushed down and springs back up: the bell rings with a quick buzz and a ripple, a sparkle pops. A beat
// later the coffee cup beside it hops in answer, and once it lands three curls of steam rise out of its lid, one after another.
// After a long still hold the steam sinks back into the cup the way it rose, last out first home, ready for the next ring.
const DING = 24 // the plunger bottoms out and the bell rings
const PRESS = 10 // how long the push takes
const HOP = DING + 4 // the cup answers the ring a beat late
const STEAM = 74 // the cup has landed: steam starts to rise
const STEAM_LEN = 16
const STAGGER = 5
const SINK = 146 // steam sinks back into the cup
const SPARK_OUT = 128

const CUP_FOOT: Vec = [-62, 100] // the cup hops about its base
const BELL_FOOT: Vec = [100, 100] // the bell buzzes about its base
const KNOCK: Vec = [0, 12] // how far the plunger goes down
const RING: Vec = facePoint(100, 0) // the bell's crown, where the ripple leaves from

// the cup body tapers from the lid down to its base: half width at y
const CUP = { x: -62, top: -58, bottom: 100, wTop: 52, wBottom: 40 }
const halfAt = (y: number) => CUP.wTop + ((CUP.wBottom - CUP.wTop) * (y - CUP.top)) / (CUP.bottom - CUP.top)
const band = (y0: number, y1: number) =>
  poly([[CUP.x - halfAt(y0), y0], [CUP.x + halfAt(y0), y0], [CUP.x + halfAt(y1), y1], [CUP.x - halfAt(y1), y1]], 3)

// one curl of steam rising from the lid at x, height h
const curl = (x: number, h: number) => {
  const [y0, y1] = [-112, -112 - h]
  const m = (y0 + y1) / 2
  return `M${x} ${y0}C${x - 16} ${y0 - h * 0.18} ${x - 16} ${m + h * 0.12} ${x} ${m}C${x + 16} ${m - h * 0.12} ${x + 16} ${y1 + h * 0.18} ${x} ${y1}`
}
const steam = (x: number, h: number, i: number): Layer => ({
  parent: 'cup',
  shapes: [{ d: curl(x, h), round: true, trim: outAndBack(0, 1, STEAM + i * STAGGER, STEAM_LEN, SINK + (2 - i) * STAGGER) }],
})

// pushed down on the slamming ease, then the spring sends it back up past rest and settles
const PLUNGE: Track<Vec> = [[DING - PRESS, [0, 0], IN], [DING, KNOCK, 0], ...spring([0, 0], DING, 0.7, KNOCK)]

const orderReady: Icon = {
  name: 'order-ready',
  frames: 180,
  still: 120,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [236, 262], shapes: [] },
    wave('root', RING, 80, DING - 10, -58, -18),
    { id: 'face', parent: 'root', tilt: FACE, shapes: [] },
    // the takeaway cup: tapered body, sleeve, lid with its raised rim
    { id: 'cup', parent: 'face', a: CUP_FOOT, p: CUP_FOOT, m: { ...hop, at: HOP, k: 0.7 }, shapes: [] },
    steam(-90, 74, 0),
    steam(-62, 96, 1),
    steam(-34, 70, 2),
    {
      parent: 'cup',
      shapes: [
        { d: band(CUP.top, CUP.bottom), fill: 'white', depth: 1 },
        { d: band(-12, 52), fill: 'main', depth: 0.3 },
        { d: rect(CUP.x - 62, -84, 124, 28, 8), fill: 'deep', depth: 0.8 },
        { d: rect(CUP.x - 44, -102, 88, 20, 6), fill: 'deep', depth: 0.6 },
      ],
    },
    // the service bell: base, dome, and the plunger on its crown
    { id: 'bell', parent: 'face', a: BELL_FOOT, p: BELL_FOOT, m: buzz(DING, 3, 4), shapes: [] },
    {
      parent: 'bell',
      m: { p: PLUNGE },
      shapes: [
        { d: rect(93, -20, 14, 40, 2), fill: 'grey', depth: 0.4 },
        { d: rect(78, -34, 44, 16, 8), fill: 'deep', depth: 0.6 },
      ],
    },
    {
      parent: 'bell',
      shapes: [
        { d: 'M36 74A64 60 0 0 1 164 74Z', fill: 'gold', depth: 1 },
        { d: arc(100, 74, 42, 200, 236), round: true },
        { d: rect(22, 72, 156, 28, 10), fill: 'deep', depth: 1 },
      ],
    },
    glow('root', [196, -112], 22, popIn(DING, SPARK_OUT)),
    glow('root', [-178, -118], 16, popIn(STEAM + 12, SPARK_OUT + 6)),
  ],
}

export default orderReady
