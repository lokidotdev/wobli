// Server Status
import { ellipse, line, pill, rect } from '../engine.ts'
import { IN, POP, SOFT, twinkle } from '../motions.ts'
import { EXT, FACE, LINE, glow, popIn } from '../parts.ts'
import type { Icon, Layer, Motion, Shape, Track, Vec } from '../engine.ts'

// The server boots: each blade's LED blinks in a chase down the tower, twice, then locks on one after another. On the frame the
// last one holds, a green dot pops at the left of the status pill and stretches across it; a sparkle lands as it fills. After a
// long hold the way home retraces the way out: the green draws back into its dot and pops away, the LEDs go dark bottom first.
const BLADES = [-92, -14, 64] // top of each blade on the face
const BLADE_H = 66
const LED = (i: number): Vec => [-64, BLADES[i] + BLADE_H / 2]
const VENTS = [-6, 14, 34, 54] // the grille's slits on each blade
const DOT: Vec = [-62, -130] // the status pill's left dot centre

const BOOT = 6 // the first LED blinks
const CHASE = 5 // frames between neighbouring LEDs
const LAP = 18 // frames between the two passes of the chase
const LOCK = 48 // the first LED locks on
const FILL = 60 // the green dot stretches across the pill
const FILL_LEN = 24
const DRAIN = 124 // the green draws back
const DARK = 136 // the LEDs start going dark, bottom first

// a blink on the star pop's ease: on, a beat lit, off
const BLINK = 16
const blink = (t: number): Track<Vec> => [[t, [0, 0], POP], [t + 5, [100, 100], 0], [t + 10, [100, 100], POP], [t + BLINK, [0, 0], 0]]

const FILL_OFF = rect(DOT[0] - 16, DOT[1] - 16, 32, 32, 16)
const FILL_ON = rect(DOT[0] - 16, DOT[1] - 16, 156, 32, 16)
const STATUS: Track<string> = [[FILL, FILL_OFF, SOFT], [FILL + FILL_LEN, FILL_ON, 0], [DRAIN, FILL_ON, IN], [DRAIN + FILL_LEN, FILL_OFF]]

const blade = (y: number): ReadonlyArray<Shape> => [
  { d: rect(-90, y, 180, BLADE_H, 12), fill: 'white', depth: 0.4 },
  { d: ellipse(-64, y + BLADE_H / 2, 10), fill: 'grey', line: 4 },
  ...VENTS.map((x): Shape => ({ d: line([x, y + 18], [x, y + BLADE_H - 18]), line: 6 })),
]

const led = (i: number): Layer => {
  const c = LED(i)
  const lit: Motion = {
    s: [
      ...blink(BOOT + i * CHASE),
      ...blink(BOOT + LAP + i * CHASE),
      ...(twinkle(LOCK + i * 4).s ?? []),
      ...(twinkle(DARK + (2 - i) * 4, true).s ?? []),
    ],
  }
  return { parent: 'tower', a: c, p: c, m: lit, shapes: [{ d: ellipse(c[0], c[1], 10), fill: 'ok', line: 4 }] }
}

const serverStatus: Icon = {
  name: 'server-status',
  frames: 180,
  still: 100,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [254, 262], shapes: [] },
    {
      id: 'tower',
      parent: 'root',
      tilt: FACE,
      shapes: [
        ...[-78, 46].map((x): Shape => ({ d: rect(x, 146, 32, 22, 6), fill: 'deep', depth: 0.6 })),
        { d: rect(-110, -170, 220, 324, 24), fill: 'deep', depth: 1 },
        { d: pill(-84, -152, 168, 44), fill: 'grey', depth: 0.3 },
        ...BLADES.flatMap(blade),
      ],
    },
    ...[0, 1, 2].map(led),
    {
      parent: 'tower',
      a: DOT,
      p: DOT,
      m: [twinkle(FILL - 6), twinkle(DRAIN + FILL_LEN, true)],
      shapes: [{ d: STATUS, fill: 'ok', line: 4 }],
    },
    glow('root', [150, -170], 24, popIn(FILL + FILL_LEN - 4, DRAIN - 12)),
  ],
}

export default serverStatus
