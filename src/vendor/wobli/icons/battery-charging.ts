// Battery Charging
import { ellipse, pill, poly, rect } from '../engine.ts'
import { EASY, IN, SOFT, twinkle } from '../motions.ts'
import { EXT, FACE, LINE, PHONE_SCREEN, facePoint, glow, hit, outAndBack, phoneBody, popIn, wave } from '../parts.ts'
import type { Icon, Track, Vec } from '../engine.ts'

// The phone comes down onto the pad, which takes the hit as a wave ripples out and its light comes on. A bolt pops onto the
// battery and pulses with each step the charge climbs, and a sparkle lands on full. After a long hold the phone lifts off the
// way it came, the bolt and light go out and the charge drains back to where it started.
const DROP = 8 // the phone starts down
const LAND = 28 // and touches the pad
const STEPS = [LAND + 4, 62, 80] as const // the charge climbs a step on each, the first as the bolt pops in
const STEP_LEN = 12
const FULL = STEPS[2] + STEP_LEN
const LIFT = 144 // the phone lifts off
const DRAIN = 148
const UP: Vec = facePoint(0, -64) // the phone hovering above the pad
const BOLT: Vec = [0, -2] // the bolt's centre on the battery

// the charge: one rect morphing taller from the battery's floor, so every key shares its commands
const FLOOR = 50
const level = (h: number) => rect(-24, FLOOR - h, 48, h, 7)
const LEVELS = [20, 48, 76, 102] as const
const CHARGE: Track<string> = [
  [STEPS[0], level(LEVELS[0]), SOFT],
  [STEPS[0] + STEP_LEN, level(LEVELS[1]), 0],
  [STEPS[1], level(LEVELS[1]), SOFT],
  [STEPS[1] + STEP_LEN, level(LEVELS[2]), 0],
  [STEPS[2], level(LEVELS[2]), SOFT],
  [FULL, level(LEVELS[3]), 0],
  [DRAIN, level(LEVELS[3]), IN],
  [DRAIN + 26, level(LEVELS[0])],
]

// the bolt pops in on contact, beats with each charge step, and pops out as the phone lifts
const pulse = (t: number, k: number): Track<Vec> => outAndBack<Vec>([100, 100], [k, k], t, 6, t + 6, 10)
const BOLT_SCALE: Track<Vec> = [
  ...(twinkle(STEPS[0]).s ?? []),
  ...pulse(STEPS[1], 112),
  ...pulse(STEPS[2], 124),
  ...(twinkle(LIFT, true).s ?? []),
]

const batteryCharging: Icon = {
  name: 'battery-charging',
  frames: 180,
  still: 112,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [262, 250], s: [84, 84], shapes: [] },
    { id: 'dock', parent: 'root', m: hit(LAND, [-1, 7], 0.6), shapes: [] },
    wave('dock', [0, -10], 184, LAND + 2, -64, -24),
    // the pad: a low slab with its light
    {
      parent: 'dock',
      tilt: FACE,
      shapes: [
        { d: rect(-156, 126, 312, 62, 31), fill: 'main', depth: 1 },
        { d: rect(-132, 134, 264, 40, 20), fill: 'white', depth: 0.3 },
      ],
    },
    { parent: 'dock', tilt: FACE, a: [118, 160], p: facePoint(118, 160), m: popIn(LAND, LIFT), shapes: [{ d: ellipse(118, 160, 8), fill: 'ok', line: 4 }] },
    // the phone, riding the pad once it lands
    { id: 'phone', parent: 'dock', p: [[DROP, UP, IN], [LAND, [0, 0], 0], [LIFT, [0, 0], SOFT], [LIFT + 26, UP]], shapes: [] },
    { parent: 'phone', tilt: FACE, shapes: phoneBody(32, 'deep') },
    { parent: 'phone', tilt: FACE, shapes: [{ d: PHONE_SCREEN(22), fill: 'tint' }, { d: pill(-36, 116, 72, 8), fill: 'ink', line: false }] },
    // the battery on the screen
    {
      parent: 'phone',
      tilt: FACE,
      shapes: [
        { d: rect(-14, -80, 28, 16, 5), fill: 'white', depth: 0.3 },
        { d: rect(-36, -66, 72, 128, 16), fill: 'white', depth: 0.3 },
        { d: [[0, level(LEVELS[0]), EASY], ...CHARGE], fill: 'ok', line: 4 },
      ],
    },
    {
      parent: 'phone',
      tilt: FACE,
      a: BOLT,
      p: BOLT,
      s: BOLT_SCALE,
      shapes: [{ d: poly([[8, -40], [-20, 6], [-2, 6], [-8, 38], [20, -10], [2, -10]], 3), fill: 'gold', line: 4 }],
    },
    glow('root', [136, -168], 24, popIn(FULL, LIFT - 10)),
    glow('root', [-150, -70], 15, popIn(FULL + 6, LIFT - 4)),
  ],
}

export default batteryCharging
