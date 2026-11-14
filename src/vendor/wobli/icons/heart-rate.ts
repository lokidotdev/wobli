// Heart Rate
import { at, line, rect } from '../engine.ts'
import { SNAP } from '../motions.ts'
import { EXT, FACE, LINE, glow, numeral, outAndBack, popIn } from '../parts.ts'
import type { Icon, Shape, Track, Vec } from '../engine.ts'

// The ECG trace draws across the watch face. Each time it climbs a beat's spike the heart thumps and the reading ticks up one,
// on the same frame, and a sparkle lands after the second beat. After a long hold the trace draws back the way it came and the
// reading counts down as it passes each spike again.
const HEART = 'M0 92C-24 74 -132 8 -132 -48C-132 -94 -98 -122 -62 -122C-34 -122 -12 -106 0 -84C12 -106 34 -122 62 -122C98 -122 132 -94 132 -48C132 8 24 74 0 92Z'
const HEART_AT: Vec = [-38, -44]
const BASE = 44
const TRACE: ReadonlyArray<Vec> = [
  [-66, BASE], [-58, BASE], [-52, BASE + 8], [-44, BASE - 40], [-36, BASE + 22], [-29, BASE],
  [22, BASE], [28, BASE + 8], [36, BASE - 40], [44, BASE + 22], [51, BASE], [66, BASE],
]
const PEAKS = [3, 8] // the R spike of each beat, as an index into TRACE

// the trace is revealed by a sweep: a screen-coloured matte that grows from the left edge and shrinks back to it
const SWEEP_X = -74
const SWEEP_W = 148
const DRAW = 8 // the sweep starts across, on the slide ease so the two spikes land well apart
const LEN = 76
const UNDRAW = 130 // the way home: the sweep draws back
const BACK = 42
const SWEEP: Track<Vec> = [[DRAW, [0, 100], SNAP], [DRAW + LEN, [100, 100], 0], [UNDRAW, [100, 100], SNAP], [UNDRAW + BACK, [0, 100]]]

// how far across each spike sits, and the frame the sweep passes it going out and coming home
const SHARE = PEAKS.map((k) => (TRACE[k][0] - SWEEP_X) / SWEEP_W)
const passes = (from: number, share: number, home = false) => {
  let f = from
  while (home ? at(SWEEP, f)[0] / 100 > share + 1e-6 : at(SWEEP, f)[0] / 100 < share - 1e-6) f++
  return f
}
const BEATS = SHARE.map((s) => passes(DRAW, s))
const UNBEATS = SHARE.map((s) => passes(UNDRAW, s, true))

// the reading: 7 stays, the ones digit ticks 0, 1, 2 on the beats and back down on the way home
const DIGIT_W = 17
const DIGIT_H = 30
const NUM_Y = HEART_AT[1] - DIGIT_H / 2
const digit = (n: number, i: number) => numeral(n, 2 + i * (DIGIT_W + 9), NUM_Y, DIGIT_W, DIGIT_H)
const ONES: Track<string> = [
  [0, digit(0, 1), 0],
  [BEATS[0], digit(1, 1), 0],
  [BEATS[1], digit(2, 1), 0],
  [UNBEATS[1], digit(1, 1), 0],
  [UNBEATS[0], digit(0, 1), 0],
  [180, digit(0, 1)],
]

// a thump: swells on the soft ease and comes home on its mirror
const thump = (t: number): Track<Vec> => outAndBack<Vec>([100, 100], [128, 128], t, 4, t + 4, 7)

const heartRate: Icon = {
  name: 'heart-rate',
  frames: 180,
  still: 96,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [246, 254], shapes: [] },
    {
      parent: 'root',
      tilt: FACE,
      shapes: [
        { d: rect(-56, -172, 112, 90, 22), fill: 'grey', depth: 0.8 },
        { d: rect(-56, 82, 112, 90, 22), fill: 'grey', depth: 0.8 },
        ...[-1, 1].map((s): Shape => ({ d: line([-32, s * 136], [32, s * 136]) })),
        { d: rect(90, -36, 24, 52, 7), fill: 'gold', depth: 0.8 },
        { d: rect(-98, -112, 196, 224, 50), fill: 'deep', depth: 1 },
      ],
    },
    { id: 'screen', parent: 'root', tilt: FACE, shapes: [{ d: rect(-80, -94, 160, 188, 36), fill: 'tint' }] },
    { id: 'sweep', parent: 'screen', a: [SWEEP_X, 0], p: [SWEEP_X, 0], s: SWEEP, shapes: [{ d: rect(SWEEP_X, BASE - 48, SWEEP_W, 78), fill: 'tint', line: false }] },
    { id: 'beat', parent: 'screen', p: HEART_AT, s: [...thump(BEATS[0]), ...thump(BEATS[1])], shapes: [] },
    { parent: 'beat', s: [19, 19], shapes: [{ d: HEART, fill: 'hot', depth: 0.4 }] },
    { parent: 'screen', shapes: [{ d: digit(7, 0), line: 6, round: true }, { d: ONES, line: 6, round: true }] },
    { parent: 'screen', clip: 'sweep', shapes: [{ d: line(...TRACE), line: 7, round: true }] },
    glow('root', [140, -130], 22, popIn(BEATS[1] + 6, UNDRAW - 6)),
  ],
}

export default heartRate
