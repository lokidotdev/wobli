// Code Deploy
import { ellipse, line, poly, rect } from '../engine.ts'
import { flicker, IN, OUT } from '../motions.ts'
import { checkBadge, EXT, FACE, glow, hit, LINE, outAndBack, popIn, popScale } from '../parts.ts'
import type { Icon, Layer, Track, Vec } from '../engine.ts'

// A command types itself at the prompt; on enter the terminal takes the keystroke and the rocket launches up out of it, the
// flame and two puffs of smoke catching up a beat behind. The rocket rides the spring to a hover, a check and the output line
// print under the command. After the hold the rocket sinks back into the terminal it came from and the lines draw back.
const TERM: Vec = [244, 352] // the terminal's centre, where the rocket rests hidden behind it
const TYPE = 8
const ENTER = 34
const LIFT = ENTER + 4
const RISE: Vec = [0, -196]
const DONE = 80 // the rocket tops out and the deploy reports back
const CHECK_OUT = 136
const SINK = 140
const SINK_LEN = 22
const LINES_BACK = 150

const ROCKET_BODY = 'M0 -74C30 -54 36 -14 30 38L-30 38C-36 -14 -30 -54 0 -74Z'
// two flames on the same commands, so they morph into each other
const flame = (w: number, h: number) => `M${-w} 52C${-w} ${52 + h * 0.4} ${-w * 0.3} ${52 + h * 0.7} 0 ${52 + h}C${w * 0.3} ${52 + h * 0.7} ${w} ${52 + h * 0.4} ${w} 52Z`
const FLAMES = [flame(16, 46), flame(13, 34), flame(17, 42)]
// the flicker preset's steps, repeated every 6 frames for the whole flight
const FLAME_TRACK = flicker(Array.from({ length: Math.ceil((SINK + SINK_LEN - LIFT) / 6 / 3) * 3 }, (_, i) => FLAMES[i % 3]), 6).map(([t, d, e]) => [t + LIFT, d, e] as const)

// launched, all speed up front, then held at the hover; it sinks home on IN along the path it rose by
const ROCKET_TRACK: Track<Vec> = [[LIFT, [0, 0], OUT], [LIFT + 44, RISE, 0], [SINK, RISE, IN], [SINK + SINK_LEN, [0, 0]]]

const puff = (x: number, r: number, i: number): Layer => {
  const c: Vec = [TERM[0] + x, TERM[1] - 128]
  return {
    parent: 'root',
    a: c,
    p: c,
    m: { p: [[LIFT + i * 5, [0, 0], OUT], [LIFT + 40 + i * 5, [x * 0.5, -10]]] },
    s: popScale(LIFT + i * 5, LIFT + 28 + i * 5),
    ip: LIFT + i * 5,
    op: LIFT + 60 + i * 5,
    shapes: [{ d: ellipse(c[0], c[1], r, r * 0.8), fill: 'white', depth: 0.3 }],
  }
}

const codeDeploy: Icon = {
  name: 'code-deploy',
  frames: 180,
  still: 118,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', shapes: [] },
    // the rocket sits behind the terminal, so at rest it is hidden and on launch it rises out of it
    { id: 'rocket', parent: 'root', p: ROCKET_TRACK, shapes: [] },
    { id: 'ship', parent: 'rocket', p: TERM, tilt: FACE, shapes: [] },
    {
      parent: 'ship',
      a: [0, 52],
      p: [0, 52],
      ip: LIFT - 2,
      op: SINK + SINK_LEN + 1,
      shapes: [{ d: FLAME_TRACK, fill: 'gold' }],
      s: [[LIFT - 2, [0, 0], OUT], [LIFT + 10, [100, 100], 0], [SINK, [100, 100], IN], [SINK + SINK_LEN, [0, 0]]],
    },
    {
      parent: 'ship',
      shapes: [
        { d: poly([[-30, 2], [-54, 30], [-54, 52], [-30, 38]], 4), fill: 'main', depth: 0.6 },
        { d: poly([[30, 2], [54, 30], [54, 52], [30, 38]], 4), fill: 'main', depth: 0.6 },
        { d: rect(-20, 36, 40, 16, 4), fill: 'grey', depth: 0.6 },
        { d: ROCKET_BODY, fill: 'white', depth: 1 },
        { d: 'M-18 -56C-8 -66 8 -66 18 -56C10 -62 -10 -62 -18 -56Z', fill: 'main', line: false },
        { d: ellipse(0, -12, 15), fill: 'tint', depth: 0.3 },
      ],
    },
    // the terminal window takes the keystroke on enter
    {
      id: 'term',
      parent: 'root',
      p: TERM,
      tilt: FACE,
      m: hit(ENTER, [3, 7], 0.6),
      shapes: [
        { d: rect(-134, -96, 268, 192, 20), fill: 'deep', depth: 1 },
        ...[-110, -90, -70].map((x) => ({ d: ellipse(x, -76, 6), fill: 'white' as const })),
        { d: rect(-116, -58, 232, 136, 10), fill: 'tint' },
        { d: line([-96, -38], [-84, -28], [-96, -18]) },
      ],
    },
    { parent: 'term', shapes: [{ d: line([-70, -28], [52, -28]), trim: outAndBack(0, 1, TYPE, 22, LINES_BACK, 14) }] },
    { parent: 'term', shapes: [{ d: line([-54, 22], [36, 22]), trim: outAndBack(0, 1, DONE + 6, 16, LINES_BACK - 8, 14) }] },
    { parent: 'term', a: [-86, 22], p: [-86, 22], m: popIn(DONE, CHECK_OUT), shapes: checkBadge([-86, 22], 20, 0.4) },
    puff(-52, 18, 0),
    puff(48, 15, 1),
    glow('rocket', [TERM[0] + 92, TERM[1] - 70], 22, popIn(DONE + 4, CHECK_OUT - 4)),
  ],
}

export default codeDeploy
