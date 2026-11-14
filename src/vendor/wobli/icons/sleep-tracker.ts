// Sleep Tracker
import { line, pill, poly } from '../engine.ts'
import { SNAP, SOFT } from '../motions.ts'
import { EXT, FACE, LINE, PHONE_SCREEN, facePoint, glow, phoneBody, popIn, popScale } from '../parts.ts'
import type { Icon, Layer, Shape, Track, Vec } from '../engine.ts'

// Night falls on the phone: a gold moon pops onto the screen, and three Zs rise out of it one after another, each a little
// bigger than the last. Under the moon the night's sleep graph draws itself left to right, stage by stage, and a sparkle lands
// on the frame it finishes. After the hold the graph draws back the way it came and the moon goes out, so the loop starts awake.
const MOON_IN = 6
const FIRST_Z = 20
const Z_GAP = 12 // frames between Zs
const Z_RISE = 60 // frames a Z takes to float up out of the moon
const Z_LIFE = 72 // frames from a Z popping in to it popping out
const DRAW = 22 // the graph starts drawing
const DRAW_LEN = 64
const DONE = DRAW + DRAW_LEN // the graph lands, and the sparkle with it
const UNDRAW = 124 // the graph draws back home
const UNDRAW_LEN = 30
const MOON_OUT = 146

// the moon on the screen, a crescent with its bite toward the upper right
const MOON_AT: Vec = [0, -56]
const MOON = ((): string => {
  const [R, r] = [36, 30]
  const tip = (deg: number) => {
    const t = (deg * Math.PI) / 180
    return `${(MOON_AT[0] + Math.cos(t) * R).toFixed(2)} ${(MOON_AT[1] + Math.sin(t) * R).toFixed(2)}`
  }
  return `M${tip(-100)}A${R} ${R} 0 1 0 ${tip(10)}A${r} ${r} 0 0 1 ${tip(-100)}Z`
})()

// the hypnogram: awake at the top, deep sleep at the bottom, stepping through the night
const LEVEL = [16, 38, 60, 82] // awake, rem, light, deep
const STAGES = [0, 2, 3, 2, 1, 2, 3, 1, 2, 0]
const GRAPH_X = -54
const STEP_W = 108 / STAGES.length
const GRAPH = line(
  ...STAGES.flatMap((s, i): ReadonlyArray<Vec> => [
    [GRAPH_X + i * STEP_W, LEVEL[s]],
    [GRAPH_X + (i + 1) * STEP_W, LEVEL[s]],
  ]),
)
const TRACE: Track<number> = [[DRAW, 0, SNAP], [DONE, 1, 0], [UNDRAW, 1, SNAP], [UNDRAW + UNDRAW_LEN, 0]]

// a Z of half size h, drawn as one thick slab
const zed = (h: number): string => {
  const t = h * 0.38
  return poly(
    [[-h, -h], [h, -h], [h, -h + t], [-h + t * 1.5, h - t], [h, h - t], [h, h], [-h, h], [-h, h - t], [h - t * 1.5, -h + t], [-h, -h + t]],
    2,
  )
}

// one Z: pops out of the moon, floats up and right on the soft ease, and pops away at the top of its climb
const MOON_UP = facePoint(MOON_AT[0] + 20, MOON_AT[1] - 16)
const Z_TO: ReadonlyArray<Vec> = [[66, -78], [118, -120], [178, -150]]
const Z_SIZE = [12, 16, 20]
const z = (i: number): Layer => {
  const t = FIRST_Z + i * Z_GAP
  const to: Vec = [MOON_UP[0] + Z_TO[i][0], MOON_UP[1] + Z_TO[i][1]]
  return {
    parent: 'root',
    ip: t,
    op: t + Z_LIFE + 30,
    p: [[t, MOON_UP, SOFT], [t + Z_RISE, to]],
    r: -10,
    s: popScale(t, t + Z_LIFE),
    shapes: [{ d: zed(Z_SIZE[i]), fill: 'white', depth: 0.4 }],
  }
}

const sleepTracker: Icon = {
  name: 'sleep-tracker',
  frames: 180,
  still: 92,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [222, 276], shapes: [] },
    { parent: 'root', tilt: FACE, shapes: phoneBody(32, 'deep') },
    {
      parent: 'root',
      tilt: FACE,
      shapes: [
        { d: PHONE_SCREEN(22), fill: 'tint' },
        { d: pill(-22, -128, 44, 12), fill: 'ink', line: false },
        { d: line([-22, 122], [22, 122]), round: true },
      ] satisfies ReadonlyArray<Shape>,
    },
    // the graph sits on a white card, and draws across it
    {
      parent: 'root',
      tilt: FACE,
      shapes: [
        { d: poly([[-62, 2], [62, 2], [62, 98], [-62, 98]], 12), fill: 'white', depth: 0.3 },
        { d: GRAPH, line: 6, trim: TRACE },
      ],
    },
    // the moon pops onto the screen and goes out at the end of the night
    { parent: 'root', tilt: FACE, a: MOON_AT, p: MOON_AT, s: popScale(MOON_IN, MOON_OUT), shapes: [{ d: MOON, fill: 'gold', depth: 0.5 }] },
    ...[0, 1, 2].map(z),
    glow('root', facePoint(80, 30), 20, popIn(DONE, UNDRAW - 4)),
  ],
}

export default sleepTracker
