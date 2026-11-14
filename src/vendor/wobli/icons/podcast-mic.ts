// Podcast Mic
import { ellipse, line, pill, rect } from '../engine.ts'
import { EASY } from '../motions.ts'
import { EXT, FACE, LINE, bubble, buzz, glow, outAndBack, popIn } from '../parts.ts'
import type { Icon, Layer, Shape, Track, Vec } from '../engine.ts'

// The ON AIR lamp lights and the sign buzzes on the same frame; the mic nods forward on its yoke and a waveform bubble
// grows out of it, its bars scrolling left as the voice runs. After a still hold the bubble folds back into the mic,
// the mic nods home and the lamp goes dark.
const LIVE = 8 // the lamp lights, the sign buzzes
const SPEAK = 16 // the mic nods, the bubble grows out of it
const SCROLL = 24 // the waveform starts to run
const RUN = 96 // frames the waveform runs for
const QUIET = 138 // the bubble folds home, the mic nods back
const DARK = 146 // the lamp goes dark

const YOKE: Vec = [0, -96] // where the capsule hinges in its yoke
const TAIL: Vec = [104, -94] // the bubble's tail tip, by the capsule's grille
const WIN = { x: 112, y: -214, w: 132, h: 76 } // the waveform window inside the bubble
const GAP = 18
const HEIGHTS = [22, 46, 30, 56, 18, 40] // one period of the waveform, repeated so the run ends on the pose it started on
const STEPS = HEIGHTS.length
const BARS = Math.ceil(WIN.w / GAP) + STEPS + 1
const WAVE_MID = WIN.y + WIN.h / 2

// the waveform strip: bars marching left over the run, one whole period, so the last pose matches the first
const SCROLLING: Track<Vec> = [[SCROLL, [0, 0], EASY], [SCROLL + RUN, [-STEPS * GAP, 0], 0], [QUIET + 30, [0, 0]]]

// ON AIR in ink strokes, 10 wide and 18 tall per letter, from x y
const letters = (x: number, y: number): ReadonlyArray<Shape> => {
  const [w, h] = [10, 18]
  const at = (i: number) => x + i * 15
  return [
    { d: ellipse(at(0) + w / 2, y + h / 2, w / 2, h / 2) },
    { d: line([at(1), y + h], [at(1), y], [at(1) + w, y + h], [at(1) + w, y]) },
    { d: line([at(2.6), y + h], [at(2.6) + w / 2, y], [at(2.6) + w, y + h]) },
    { d: line([at(2.6) + 2, y + h * 0.66], [at(2.6) + w - 2, y + h * 0.66]) },
    { d: line([at(3.6) + w / 2, y], [at(3.6) + w / 2, y + h]) },
    { d: `M${at(4.4)} ${y + h}L${at(4.4)} ${y}L${at(4.4) + w * 0.6} ${y}A${w * 0.4} ${h / 4} 0 0 1 ${at(4.4) + w * 0.6} ${y + h / 2}L${at(4.4)} ${y + h / 2}M${at(4.4) + w * 0.4} ${y + h / 2}L${at(4.4) + w} ${y + h}` },
  ]
}
const SIGN = { x: -130, y: -262, w: 112, h: 46 }
const LAMP = { x: SIGN.x + 10, y: SIGN.y + 9, w: SIGN.w - 20, h: SIGN.h - 18 }

const bar = (i: number): Shape => {
  const h = HEIGHTS[i % HEIGHTS.length]
  return { d: pill(WIN.x + 10 + i * GAP - 5, WAVE_MID - h / 2, 10, h), fill: 'deep', line: 4, depth: 0.3 }
}

const sign: Layer = {
  id: 'sign',
  parent: 'root',
  tilt: FACE,
  a: [SIGN.x + SIGN.w / 2, SIGN.y + SIGN.h],
  p: [SIGN.x + SIGN.w / 2, SIGN.y + SIGN.h],
  m: buzz(LIVE, 4, 5),
  shapes: [
    { d: rect(SIGN.x, SIGN.y, SIGN.w, SIGN.h, 10), fill: 'deep', depth: 0.8 },
    { d: rect(LAMP.x, LAMP.y, LAMP.w, LAMP.h, 6), fill: 'grey', depth: 0.2 },
  ],
}

const podcastMic: Icon = {
  name: 'podcast-mic',
  frames: 180,
  still: 92,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [226, 318], shapes: [] },
    sign,
    // the lit lamp grows over the dark one, the letters ride on top in both states
    {
      parent: 'sign',
      a: [LAMP.x + LAMP.w / 2, LAMP.y + LAMP.h / 2],
      p: [LAMP.x + LAMP.w / 2, LAMP.y + LAMP.h / 2],
      m: popIn(LIVE, DARK),
      shapes: [{ d: rect(LAMP.x, LAMP.y, LAMP.w, LAMP.h, 6), fill: 'hot', depth: 0.2 }],
    },
    { parent: 'sign', shapes: letters(LAMP.x + 9, LAMP.y + 5) },
    {
      id: 'stand',
      parent: 'root',
      tilt: FACE,
      shapes: [
        { d: rect(-74, 114, 148, 30, 15), fill: 'deep', depth: 1 },
        { d: rect(-9, -10, 18, 126, 4), fill: 'grey', depth: 0.6 },
        { d: `M-60 -96L-60 -40A60 60 0 0 0 60 -40L60 -96L47 -96L47 -40A47 47 0 0 1 -47 -40L-47 -96Z`, fill: 'deep', depth: 0.7 },
      ],
    },
    {
      id: 'capsule',
      parent: 'stand',
      a: YOKE,
      p: YOKE,
      m: { r: outAndBack(0, 7, SPEAK - 4, 18, QUIET + 4, 18) },
      shapes: [
        { d: pill(-40, -186, 80, 150), fill: 'main', depth: 1 },
        { d: pill(-28, -174, 56, 82), fill: 'white', depth: 0.3 },
        ...[-150, -132, -114].map((y): Shape => ({ d: line([-22, y], [22, y]) })),
        { d: rect(-46, -70, 92, 16, 6), fill: 'deep', depth: 0.5 },
      ],
    },
    { parent: 'stand', shapes: [-1, 1].map((s): Shape => ({ d: ellipse(s * 54, YOKE[1], 11), fill: 'grey', depth: 0.6 })) },
    {
      id: 'bubble',
      parent: 'stand',
      a: TAIL,
      p: TAIL,
      s: outAndBack<Vec>([0, 0], [100, 100], SPEAK, 20, QUIET, 20),
      shapes: [{ d: bubble(WIN.x - 14, WIN.y - 14, WIN.w + 28, WIN.h + 28, 'left', 22), fill: 'white', depth: 0.5 }],
    },
    { id: 'window', parent: 'bubble', shapes: [{ d: rect(WIN.x, WIN.y, WIN.w, WIN.h, 12), fill: 'tint', line: 4 }] },
    { parent: 'bubble', clip: 'window', m: { p: SCROLLING }, shapes: Array.from({ length: BARS }, (_, i) => bar(i)) },
    glow('root', [-170, -150], 20, popIn(LIVE + 6, QUIET - 6)),
    glow('root', [196, -40], 16, popIn(SCROLL + 10, QUIET - 2)),
  ],
}

export default podcastMic
