// Pomodoro Timer
import { arc, ellipse, line, poly } from '../engine.ts'
import { EASY, SOFT } from '../motions.ts'
import { EXT, FACE, LINE, buzz, facePoint, glow, popIn, wave } from '../parts.ts'
import type { Icon, Track, Vec } from '../engine.ts'

// The tomato timer runs down: the ring on its dial empties and the hand sweeps back to the top with it. On the frame it hits
// zero the timer dings, shaking on its base, the leaves on top rattle a beat later and ring waves swell off it. Then it is
// wound again, the hand spinning one turn as the ring fills, and it stands still, full, for the hold.
const RUN = 10 // the ring starts to empty
const DING = 76 // empty: the ding
const WIND = 100 // wound back up
const WIND_LEN = 26
const DIAL: Vec = [0, 16] // the dial's centre on the face
const R = 64 // the ring's radius

// the share of the ring left, and the hand riding its end: one turn is a full ring
const LEFT: Track<number> = [[RUN, 1, EASY], [DING, 0, 0], [WIND, 0, SOFT], [WIND + WIND_LEN, 1]]
const HAND: Track<number> = LEFT.map(([t, v, e]) => [t, v * 360, e] as const)
const RING_MID: Vec = facePoint(0, -40) // where the waves swell from, in the untilted root

const pomodoroTimer: Icon = {
  name: 'pomodoro-timer',
  frames: 180,
  still: 130,
  line: LINE,
  extrude: EXT,
  layers: [
    // untilted, pivoting on the base: carries the shake, the waves and the sparkles
    { id: 'root', a: [0, 128], p: [250, 382], m: buzz(DING, 6, 6), shapes: [] },
    wave('root', RING_MID, 150, DING + 2, -64, -22),
    wave('root', RING_MID, 180, DING + 8, -64, -22),
    { id: 'timer', parent: 'root', tilt: FACE, shapes: [] },
    // the tomato and its dial
    {
      parent: 'timer',
      shapes: [
        { d: ellipse(0, 0, 146, 128), fill: 'hot', depth: 1 },
        { d: ellipse(DIAL[0], DIAL[1], 90), fill: 'white', depth: 0.3 },
        { d: arc(DIAL[0], DIAL[1], R, -90, 269.9), line: 13, round: true, trim: LEFT },
      ],
    },
    // the hand, sweeping with the ring's end
    {
      parent: 'timer',
      a: DIAL,
      p: DIAL,
      r: HAND,
      shapes: [{ d: line(DIAL, [DIAL[0], DIAL[1] - 38]), line: 7, round: true }, { d: ellipse(DIAL[0], DIAL[1], 10), fill: 'hot', depth: 0.3 }],
    },
    // the leaves and stem on top, rattling a beat after the ding
    {
      parent: 'timer',
      a: [0, -124],
      p: [0, -124],
      m: buzz(DING + 4, 10, 5),
      shapes: [
        {
          d: poly([[-78, -118], [-26, -138], [-12, -170], [10, -140], [54, -156], [36, -126], [82, -112], [24, -110], [0, -96], [-22, -110]], 6),
          fill: 'ok',
          depth: 0.6,
        },
        { d: poly([[-10, -132], [-6, -180], [10, -180], [12, -132]], 4), fill: 'ok', depth: 0.8 },
      ],
    },
    glow('root', [-150, -150], 24, popIn(DING + 6, 140)),
    glow('root', [168, -40], 16, popIn(DING + 12, 146)),
  ],
}

export default pomodoroTimer
