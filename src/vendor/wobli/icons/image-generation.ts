// Image Generation
import { ellipse, poly, rect, spark } from '../engine.ts'
import { EXT, FACE, LINE, glow, outAndBack, popIn } from '../parts.ts'
import type { Icon, Layer, Vec } from '../engine.ts'

// The spark badge on the frame turns over and sparkles flicker across the blank canvas. Then the picture paints in: the sky
// washes down from the top, the far hill rises out of the bottom edge with the near hill a beat behind, and the sun pops in last.
// After a long hold it all goes home the way it came: sun, near hill, far hill, then the sky draws back up, leaving it blank.
const CANVAS = { x: -96, y: -116, w: 192, h: 232 }
const CANVAS_PATH = rect(CANVAS.x, CANVAS.y, CANVAS.w, CANVAS.h, 8)
const BOTTOM = CANVAS.y + CANVAS.h
const BADGE: Vec = [112, -132]

const THINK = 6 // the badge turns, sparkles flicker on the canvas
const SKY_IN = 34
const FAR_IN = 46
const NEAR_IN = 52 // the near hill lags the far one
const SUN_IN = 64 // the picture is complete
const SUN_OUT = 124
const NEAR_OUT = 132
const FAR_OUT = 136
const SKY_OUT = 146
const BADGE_HOME = 150

const BELOW: Vec = [0, 150] // under the canvas's bottom edge, hidden by the clip
const FAR_HILL = poly([[-120, BOTTOM + 10], [-40, -24], [6, 22], [52, -8], [130, BOTTOM + 10]], [0, 10, 6, 10, 0])
const NEAR_HILL = poly([[-120, BOTTOM + 10], [-80, 62], [-20, 42], [60, 78], [120, 50], [130, BOTTOM + 10]], [0, 10, 10, 10, 10, 0])
const SUN: Vec = [42, -56]

const hill = (d: string, fill: 'deep' | 'main', inAt: number, outAt: number): Layer => ({
  parent: 'canvas',
  clip: 'canvas',
  ip: inAt,
  op: outAt + 22,
  m: { p: outAndBack<Vec>(BELOW, [0, 0], inAt, 22, outAt, 22) },
  shapes: [{ d, fill }],
})

const imageGeneration: Icon = {
  name: 'image-generation',
  frames: 180,
  still: 100,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [244, 262], s: [92, 92], shapes: [] },
    {
      id: 'frame',
      parent: 'root',
      tilt: FACE,
      shapes: [
        { d: rect(-120, -140, 240, 280, 20), fill: 'deep', depth: 1 },
        { d: CANVAS_PATH, fill: 'white', depth: 0.3 },
      ],
    },
    { id: 'canvas', parent: 'frame', shapes: [{ d: CANVAS_PATH, line: false }] },
    {
      parent: 'canvas',
      clip: 'canvas',
      a: [0, CANVAS.y],
      p: [0, CANVAS.y],
      ip: SKY_IN,
      op: SKY_OUT + 24,
      s: outAndBack<Vec>([100, 0], [100, 100], SKY_IN, 24, SKY_OUT, 24),
      shapes: [{ d: rect(CANVAS.x, CANVAS.y, CANVAS.w, CANVAS.h), fill: 'tint', line: false }],
    },
    { parent: 'canvas', clip: 'canvas', a: SUN, p: SUN, ip: SUN_IN, op: SUN_OUT + 30, m: popIn(SUN_IN, SUN_OUT), shapes: [{ d: ellipse(SUN[0], SUN[1], 26), fill: 'white' }] },
    hill(FAR_HILL, 'deep', FAR_IN, FAR_OUT),
    hill(NEAR_HILL, 'main', NEAR_IN, NEAR_OUT),
    { parent: 'frame', shapes: [{ d: CANVAS_PATH }] }, // the canvas edge, drawn again over the paint
    // the spark badge pinned to the frame's corner: turns a quarter as it starts, back as the canvas clears
    {
      parent: 'frame',
      a: BADGE,
      p: BADGE,
      m: { r: outAndBack(0, 90, THINK, 26, BADGE_HOME, 26) },
      shapes: [
        { d: ellipse(BADGE[0], BADGE[1], 34), fill: 'main', depth: 0.7 },
        { d: spark(BADGE[0], BADGE[1], 20), fill: 'white' },
      ],
    },
    // sparkles flicker over the blank canvas while it thinks
    glow('root', [-50, -60], 22, popIn(THINK + 4, SKY_IN - 8), { ip: THINK + 4, op: SKY_IN + 22 }),
    glow('root', [40, 10], 16, popIn(THINK + 10, SKY_IN - 4), { ip: THINK + 10, op: SKY_IN + 26 }),
    glow('root', [-20, 70], 14, popIn(THINK + 16, SKY_IN), { ip: THINK + 16, op: SKY_IN + 30 }),
    // and one on the beat the picture completes
    glow('root', [-178, -110], 24, popIn(SUN_IN + 4, SUN_OUT - 6), { ip: SUN_IN + 4, op: SUN_OUT + 24 }),
  ],
}

export default imageGeneration
