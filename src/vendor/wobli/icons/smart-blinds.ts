// Smart Blinds
import { ellipse, pill, rect, star } from '../engine.ts'
import { EXT, FACE, LINE, glow, outAndBack, popIn, popScale } from '../parts.ts'
import type { Icon, Layer, Shape, Vec } from '../engine.ts'

// The sun glints in the window and the blinds answer it: the motor light comes on and the bottom rail runs down, unfolding
// the slats out of the head rail one after another until the window is shaded. After the hold the light comes on again,
// the slats fold back up into the head rail with the rail gathering them a beat behind, and the sun is back.
const LOWER = 22 // the bottom rail starts down
const RAISE = 104 // the slats start back up
const ROLL = 44 // frames a full run takes
const SLATS = 8
const PITCH = 28 // slat spacing once lowered
const SLAT_TOP = -112 // the top slat's top edge once lowered
const SLAT_H = 20
const RAIL_TOP = -116 // the bottom rail tucked under the head rail
const RAIL_DROP = 222 // how far the bottom rail runs down
const SUN: Vec = [34, -22]
const LED: Vec = [92, -130]

// each slat folds into the head rail by its own distance, so they all arrive together: the lower the slat, the further it runs.
// On the way down the rail leads and the slats follow it out; on the way up the slats lead and the rail gathers them.
const slat = (i: number): Layer => {
  const y = SLAT_TOP + i * PITCH
  const up: Vec = [0, -(i * PITCH + SLAT_H + 8)]
  return {
    parent: 'window',
    clip: 'opening',
    m: { p: outAndBack<Vec>(up, [0, 0], LOWER + 2 + (SLATS - 1 - i), ROLL, RAISE + i, ROLL) },
    shapes: [{ d: rect(-100, y, 200, SLAT_H, 3), fill: 'white', depth: 0.3 }],
  }
}

const sky = (): ReadonlyArray<Shape> => [
  { d: star(SUN[0], SUN[1], 52, 0.74, 12, 2), fill: 'gold', depth: 0.4 },
  { d: ellipse(SUN[0], SUN[1], 32), fill: 'gold', depth: 0.6 },
  { d: pill(-84, 40, 76, 26), fill: 'white', depth: 0.4 },
]

const smartBlinds: Icon = {
  name: 'smart-blinds',
  frames: 180,
  still: 84,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [244, 258], s: [112, 112], shapes: [] },
    // the window: frame, sky and sill
    {
      id: 'window',
      parent: 'root',
      tilt: FACE,
      shapes: [
        { d: rect(-130, -152, 260, 290, 12), fill: 'main', depth: 1 },
        { d: rect(-104, -120, 208, 232, 4), fill: 'tint' },
      ],
    },
    // the opening is the slats' matte: above it they fold away behind the head rail
    { id: 'opening', parent: 'window', o: 0, shapes: [{ d: rect(-104, -120, 208, 232, 4) }] },
    { parent: 'window', clip: 'opening', shapes: sky() },
    ...Array.from({ length: SLATS }, (_, i) => slat(i)),
    {
      parent: 'window',
      m: { p: outAndBack<Vec>([0, 0], [0, RAIL_DROP], LOWER, ROLL, RAISE + 6, ROLL) },
      shapes: [{ d: rect(-106, RAIL_TOP, 212, 12, 4), fill: 'deep', depth: 0.5 }],
    },
    {
      parent: 'window',
      shapes: [
        { d: rect(-150, 128, 300, 24, 5), fill: 'white', depth: 1 },
        { d: rect(-118, -146, 236, 30, 8), fill: 'deep', depth: 0.8 },
      ],
    },
    // the motor light on the head rail, on while the blinds run
    {
      parent: 'window',
      a: LED,
      p: LED,
      m: { s: [...popScale(LOWER - 6, LOWER + ROLL + 4), ...popScale(RAISE - 6, RAISE + ROLL - 2)] },
      shapes: [{ d: ellipse(LED[0], LED[1], 7), fill: 'ok', depth: 0.3 }],
    },
    glow('root', [150, -176], 24, popIn(4, LOWER + 18)),
    glow('root', [178, -110], 15, popIn(10, LOWER + 22)),
  ],
}

export default smartBlinds
