// Robot Vacuum
import { arc, bezier, ellipse, line, onFace, rect } from '../engine.ts'
import { EASY, SNAP } from '../motions.ts'
import { EXT, FACE, LINE, facePoint, glow, hit, outIn, popIn, popScale } from '../parts.ts'
import type { Icon, Key, Layer, Shape, Track, Vec } from '../engine.ts'

// The robot vacuum's light comes on, its side brush starts to spin and it sets off round the rug, sucking up each dust speck
// it passes and leaving two clean stripes behind it. It comes all the way round to where it started, takes the stop on a small
// spring and a sparkle lands on the clean ring. After the hold the light goes out, the stripes fade back along the way they
// came and the dust settles back onto the floor, speck by speck, for the next lap.
const HX = 124 // the lap: a rounded rectangle round the rug, on the floor's face
const HY = 90
const R = 60
const SWATH = 30 // half the width of the clean stripe the vacuum leaves
const START: Vec = [-20, HY] // on the front edge, heading right

const LIGHT_ON = 4
const DEPART = 14
const ARRIVE = 110
const LIGHT_OFF = 150
const RETRACT = 154
const FADE = 24 // frames the stripes take to fade back
const RESET = 192 // the vacuum is still, so its heading and brush unwind a whole turn unseen

// one lap anticlockwise from the start, sampled evenly along the rounded rectangle, with each point's outward normal
type Step = { p: Vec; n: Vec }
const straight = (a: Vec, b: Vec, n: Vec, k: number): Array<Step> =>
  Array.from({ length: k }, (_, i) => ({ p: [a[0] + ((b[0] - a[0]) * i) / k, a[1] + ((b[1] - a[1]) * i) / k], n }))
const corner = (c: Vec, from: number, k: number): Array<Step> =>
  Array.from({ length: k }, (_, i) => {
    const t = ((from - (90 * i) / k) * Math.PI) / 180
    return { p: [c[0] + R * Math.cos(t), c[1] + R * Math.sin(t)], n: [Math.cos(t), Math.sin(t)] }
  })
const LAP: ReadonlyArray<Step> = [
  ...straight(START, [HX - R, HY], [0, 1], 16),
  ...corner([HX - R, HY - R], 90, 14),
  ...straight([HX, HY - R], [HX, R - HY], [1, 0], 10),
  ...corner([HX - R, R - HY], 0, 14),
  ...straight([HX - R, -HY], [R - HX, -HY], [0, -1], 28),
  ...corner([R - HX, R - HY], -90, 14),
  ...straight([-HX, R - HY], [-HX, HY - R], [-1, 0], 10),
  ...corner([R - HX, HY - R], -180, 14),
  ...straight([R - HX, HY], START, [0, 1], 6),
  { p: START, n: [0, 1] },
]
const SAMPLES = LAP.map((s) => s.p)

// measured as it lands on screen, the way the stripes' trim measures them, so the vacuum and its stripes stay together
const LENS = SAMPLES.reduce<Array<number>>((acc, p, i) => {
  if (!i) return [0]
  const [a, b] = [onFace(FACE, SAMPLES[i - 1]), onFace(FACE, p)]
  return [...acc, acc[i - 1] + Math.hypot(b[0] - a[0], b[1] - a[1])]
}, [])
const TOTAL = LENS[LENS.length - 1]
const along = (share: number): { p: Vec; turn: number } => {
  const goal = share * TOTAL
  let i = 1
  while (i < LENS.length - 1 && LENS[i] < goal) i++
  const k = (goal - LENS[i - 1]) / (LENS[i] - LENS[i - 1] || 1)
  const [a, b] = [SAMPLES[i - 1], SAMPLES[i]]
  return { p: [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k], turn: (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI + 90 }
}

// the two clean stripes either side of the vacuum's path
const stripe = (side: number) => line(...LAP.map(({ p, n }): Vec => [p[0] + n[0] * SWATH * side, p[1] + n[1] * SWATH * side]))

// the vacuum's pose sampled every other frame on one easy ease, its heading unwrapped so it never spins the long way round
const EASED = bezier(...EASY)
const STEPS = Array.from({ length: (ARRIVE - DEPART) / 2 + 1 }, (_, i) => DEPART + i * 2)
const POSES = STEPS.map((f) => along(EASED((f - DEPART) / (ARRIVE - DEPART))))
const HEADING = POSES.reduce<Array<number>>((acc, { turn }, i) => {
  if (!i) return [turn]
  let t = turn
  while (t - acc[i - 1] > 180) t -= 360
  while (t - acc[i - 1] < -180) t += 360
  return [...acc, t]
}, [])
const LAST = HEADING[HEADING.length - 1]
const BOT_P: Track<Vec> = STEPS.map((f, i): Key<Vec> => [f, POSES[i].p])
const BOT_R: Track<number> = [...STEPS.map((f, i): Key<number> => [f, HEADING[i]]), [RESET, LAST, 0], [RESET + 1, HEADING[0]]]
const BRUSH_R: Track<number> = [[DEPART - 8, 0, EASY], [ARRIVE + 8, -2160, 0], [RESET, -2160, 0], [RESET + 1, 0]]
const TRAIL: Track<number> = [[DEPART, 0, EASY], [ARRIVE, 1], [RETRACT, 1, SNAP], [RETRACT + FADE, 0]]

// the frame a share of the lap is reached on an ease, from frame a over len frames
const reach = (ease: (u: number) => number, share: number, a: number, len: number) => {
  let f = a
  while (f < a + len && ease((f - a) / len) < share) f++
  return f
}
const FADED = bezier(...SNAP)

// dust on the lap, each speck sucked up as the vacuum's front reaches it and settling back as the stripes fade past it
const DUST: ReadonlyArray<readonly [share: number, off: number]> = [
  [0.1, -8], [0.2, 10], [0.31, -6], [0.42, 8], [0.52, -10], [0.62, 6], [0.72, -8], [0.82, 10], [0.92, -4],
]
const speck = ([share, off]: readonly [number, number]): Layer => {
  const { p, turn } = along(share)
  const t = ((turn - 90) * Math.PI) / 180
  const c: Vec = [p[0] - Math.sin(t) * off, p[1] + Math.cos(t) * off]
  const gone = reach(EASED, share - 0.05, DEPART, ARRIVE - DEPART)
  const back = reach((u) => 1 - FADED(u), 1 - share, RETRACT, FADE) // the fade passes it going backwards
  return { parent: 'floor', a: c, p: c, m: outIn(gone, back), shapes: [{ d: ellipse(c[0], c[1], 7), fill: 'grey', line: 3, depth: 0.2 }] }
}

// a round vacuum, nose up, centred on 0 0: body, a raised lid, the laser turret and its status light
const BODY: ReadonlyArray<Shape> = [
  { d: ellipse(0, 0, 44), fill: 'deep', depth: 0.8 },
  { d: arc(0, 0, 36, -145, -35), line: 4 },
  { d: ellipse(0, 6, 28), fill: 'deep', line: 4, depth: 0.3 },
  { d: ellipse(0, -4, 12), fill: 'white', line: 4, depth: 0.5 },
]
const BRUSH: Vec = [-34, -32]
const SPARK = facePoint(150, HY + 10)

const robotVacuum: Icon = {
  name: 'robot-vacuum',
  frames: 210,
  still: 130,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [250, 252], s: [86, 86], shapes: [] },
    // the floor tile, with the rug the vacuum laps
    {
      id: 'floor',
      parent: 'root',
      tilt: FACE,
      shapes: [
        { d: rect(-186, -150, 372, 300, 14), fill: 'white', depth: 1 },
        { d: rect(-60, -28, 120, 56, 10), fill: 'tint', line: 4, depth: 0.2 },
        { d: rect(-48, -16, 96, 32, 6), line: 3 },
      ],
    },
    // the clean stripes it leaves, and the dust it picks up
    { parent: 'floor', shapes: [-1, 1].map((side): Shape => ({ d: stripe(side), line: 3, round: true, trim: TRAIL })) },
    ...DUST.map(speck),
    // the side brush, under the body's front corner, spinning while it drives
    { id: 'bot', parent: 'floor', p: BOT_P, r: BOT_R, m: hit(ARRIVE, [3, 0]), shapes: [] },
    {
      parent: 'bot',
      a: BRUSH,
      p: BRUSH,
      r: BRUSH_R,
      shapes: [0, 120, 240].map((deg): Shape => {
        const t = (deg * Math.PI) / 180
        return { d: line(BRUSH, [BRUSH[0] + Math.cos(t) * 22, BRUSH[1] + Math.sin(t) * 22]), line: 4, round: true }
      }),
    },
    { parent: 'bot', shapes: BODY },
    { parent: 'bot', a: [0, 22], p: [0, 22], s: popScale(LIGHT_ON, LIGHT_OFF), shapes: [{ d: ellipse(0, 24, 5), fill: 'ok', line: 3 }] },
    glow('root', SPARK, 22, popIn(ARRIVE + 4, LIGHT_OFF - 6)),
  ],
}

export default robotVacuum
