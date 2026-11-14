// Step Progress
import { ellipse, line, pill, rect } from '../engine.ts'
import { EXT, FACE, LINE, check, glow, outAndBack, popIn } from '../parts.ts'
import type { Icon, Layer, Shape, Track, Vec } from '../engine.ts'

// An onboarding card with a four step stepper, the first step already done. The Next button sinks under a tap, the bar to the next
// dot fills out of the dot before it, and the dot fills the moment the bar reaches it; three taps carry it to the last dot, which
// lands green with a sparkle. After the long hold the steps empty last on first off, so the card is back where it began at the seam.
const TAP = 12 // the first tap
const GAP = 24 // each next tap follows this much later
const BAR_LAG = 4 // the bar starts filling this long after its tap
const BAR_LEN = 16
const DOT_LEN = 12
const BACK = 126 // the last dot starts to empty
const BACK_GAP = 7 // each next part empties this much later, dot then bar, walking back to the first step
const DONE = TAP + 2 * GAP + BAR_LAG + BAR_LEN // the last dot fills

const STEP_Y = -64
const DOTS = [-99, -33, 33, 99]
const DOT_R = 19
const BAR_H = 12

const tapAt = (i: number) => TAP + (i - 1) * GAP // the tap that fills dot i (1 to 3)
const fillAt = (i: number) => tapAt(i) + BAR_LAG + BAR_LEN
// emptying walks backwards: dot 3, bar 2, dot 2, bar 1, dot 1, bar 0
const dotBack = (i: number) => BACK + (3 - i) * 2 * BACK_GAP
const barBack = (i: number) => dotBack(i + 1) + BACK_GAP

// a press into the button's own side and back, without overshoot, once per step
const PUSH: Vec = [-1.5, 7]
const TAPS: Track<Vec> = [1, 2, 3].flatMap((i) => outAndBack<Vec>([0, 0], PUSH, tapAt(i), 5, tapAt(i) + 6, 8))

// the filled bar from dot i to dot i + 1, grown out from under dot i
const bar = (i: number): Layer => {
  const [x, w] = [DOTS[i], DOTS[i + 1] - DOTS[i]]
  const y = STEP_Y - BAR_H / 2
  return {
    parent: 'panel',
    shapes: [{ d: outAndBack(pill(x, y, BAR_H, BAR_H), pill(x, y, w, BAR_H), tapAt(i + 1) + BAR_LAG, BAR_LEN, barBack(i)), fill: 'main', depth: 0.2 }],
  }
}

// the filled dot i, swelling out of its centre the moment its bar arrives; the last one is the finish, green
const filled = (i: number, fill: Shape['fill']): ReadonlyArray<Shape> => {
  const c: Vec = [DOTS[i], STEP_Y]
  return [
    { d: ellipse(c[0], c[1], DOT_R), fill, depth: 0.4 },
    { d: check(c, DOT_R * 1.15), line: 5 },
  ]
}
const dot = (i: number): Layer => {
  const c: Vec = [DOTS[i], STEP_Y]
  return {
    parent: 'panel',
    a: c,
    p: c,
    s: outAndBack<Vec>([0, 0], [100, 100], fillAt(i), DOT_LEN, dotBack(i)),
    shapes: filled(i, i === 3 ? 'ok' : 'main'),
  }
}

const stepProgress: Icon = {
  name: 'step-progress',
  frames: 180,
  still: 100,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [252, 250], shapes: [] },
    {
      id: 'panel',
      parent: 'root',
      tilt: FACE,
      shapes: [
        { d: rect(-150, -130, 300, 260, 28), fill: 'deep', depth: 1 },
        { d: rect(-130, -110, 260, 220, 16), fill: 'white', depth: 0.2 },
        { d: pill(DOTS[0], STEP_Y - BAR_H / 2, DOTS[3] - DOTS[0], BAR_H), fill: 'grey', depth: 0.2 },
        { d: line([-105, -18], [-5, -18]) },
        { d: line([-105, 10], [45, 10]) },
        { d: line([-105, 34], [15, 34]) },
      ],
    },
    ...[0, 1, 2].map(bar),
    // the empty dots, over the bars so a bar grows out from under its dot
    { parent: 'panel', shapes: DOTS.map((x): Shape => ({ d: ellipse(x, STEP_Y, DOT_R), fill: 'white', depth: 0.4 })) },
    { parent: 'panel', shapes: filled(0, 'main') },
    ...[1, 2, 3].map(dot),
    {
      parent: 'panel',
      p: TAPS,
      shapes: [
        { d: pill(4, 58, 112, 40), fill: 'main', depth: 0.6 },
        { d: line([42, 78], [78, 78]) },
        { d: line([66, 67], [78, 78], [66, 89]) },
      ],
    },
    glow('root', [168, -150], 24, popIn(DONE + 6, BACK - 8)),
    glow('root', [-176, 118], 16, popIn(DONE + 12, BACK - 2)),
  ],
}

export default stepProgress
