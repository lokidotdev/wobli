// Location Share
import { ellipse, rect } from '../engine.ts'
import { DROP, IN, OUT, glint, spring } from '../motions.ts'
import { EXT, FACE, LINE, facePoint, glow, hit, mapPin, outAndBack, popIn, popScale, wave } from '../parts.ts'
import type { Icon, Layer, Shape, Track, Vec } from '../engine.ts'

// Your avatar pin stands on the map tile and pulses twice, a ring swelling out across the map from its tip each time. Then
// a friend's pin pops in high and drops onto the map nearby: the tile takes the hit, the pin squashes and springs upright,
// and a trail of dots runs from the friend over to you. When it reaches you your pin pulses once more and a sparkle lands. After
// the hold the dots go back into the friend, whose pin lifts away the way it fell and pops out where it appeared.
const MINE: Vec = [-80, 66] // your pin's tip, on the tile's face
const THEIRS: Vec = [90, -72] // where the friend's pin lands
const MINE_TIP = facePoint(...MINE)
const THEIRS_TIP = facePoint(...THEIRS)
const MINE_K = 0.46
const THEIRS_K = 0.42
const HIGH = 72 // how far above its spot the friend's pin hangs before it falls
const REST: Vec = [100, 100]
const SWELL: Vec = [108, 108]
const SQUASH: Vec = [114, 84]

const PULSE = [4, 24] // your pin pulses
const APPEAR = 44 // the friend's pin pops in high
const FALL = 56
const LAND = 78
const LINK = LAND + 6 // the dots start out of the friend's spot
const REACH = LINK + 24 // and reaches you
const UNLINK = 128
const LIFT = 140
const GONE = 158

// a trail of dots between the two spots: out of the friend's spot one after another, back in last out first home
const DOTS = 5
const DOT_GAP = (REACH - LINK) / DOTS
const dot = (i: number): Layer => {
  const k = (i + 1) / (DOTS + 1)
  const c: Vec = [THEIRS[0] + (MINE[0] - THEIRS[0]) * k, THEIRS[1] + (MINE[1] - THEIRS[1]) * k]
  return { parent: 'root', tilt: FACE, a: c, p: c, m: { s: popScale(LINK + i * DOT_GAP, UNLINK + (DOTS - 1 - i) * 3) }, shapes: [{ d: ellipse(c[0], c[1], 8), fill: 'white', line: 4, depth: 0.2 }] }
}

// your pin swells on each pulse and once more when the friend's dots reach it
const MINE_S: Track<Vec> = [
  ...outAndBack(REST, SWELL, PULSE[0], 8, PULSE[0] + 10, 10),
  ...outAndBack(REST, SWELL, PULSE[1], 8, PULSE[1] + 10, 10),
  ...outAndBack(REST, SWELL, REACH, 8, REACH + 10, 10),
]

const THEIRS_P: Track<Vec> = [
  [FALL, [THEIRS_TIP[0], THEIRS_TIP[1] - HIGH], DROP],
  [LAND, THEIRS_TIP, 0],
  [LIFT, THEIRS_TIP, OUT],
  [LIFT + 22, [THEIRS_TIP[0], THEIRS_TIP[1] - HIGH]],
]
const THEIRS_S: Track<Vec> = [[LAND - 2, REST, IN], ...spring(REST, LAND, 0.6, SQUASH)]

// a pin with an avatar in its head: the white disc, and a head and shoulders clipped inside it
const pin = (id: string, tip: Vec, k: number, fill: Shape['fill'], extra: Partial<Layer>): ReadonlyArray<Layer> => {
  const head: Vec = [tip[0], tip[1] - 160 * k]
  const r = 62 * k
  return [
    {
      id,
      parent: 'root',
      a: tip,
      p: tip,
      ...extra,
      shapes: [{ d: mapPin(tip[0], tip[1], k), fill, depth: 0.7 }],
    },
    { id: `${id}-disc`, parent: id, shapes: [{ d: ellipse(head[0], head[1], r), fill: 'white', line: 4, depth: 0.3 }] },
    {
      parent: id,
      clip: `${id}-disc`,
      shapes: [
        { d: ellipse(head[0], head[1] + r * 0.95, r * 0.72, r * 0.55), fill, line: 4 },
        { d: ellipse(head[0], head[1] - r * 0.18, r * 0.34), fill, line: 4 },
      ],
    },
  ]
}

const locationShare: Icon = {
  name: 'location-share',
  frames: 180,
  still: 124,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [250, 298], m: hit(LAND, [0, 8]), shapes: [] },
    // the map tile and what is printed on it, each with its own thickness
    { id: 'tile', parent: 'root', tilt: FACE, shapes: [{ d: rect(-130, -130, 260, 260, 26), fill: 'tint', depth: 1 }] },
    {
      parent: 'root',
      tilt: FACE,
      clip: 'tile',
      shapes: [
        { d: rect(-140, -6, 280, 24), fill: 'white', line: 4, depth: 0.2 },
        { d: rect(2, -140, 22, 280), fill: 'white', line: 4, depth: 0.2 },
        { d: rect(-108, -112, 84, 56, 10), fill: 'grey', line: 4, depth: 0.35 },
        { d: rect(48, 50, 56, 60, 10), fill: 'grey', line: 4, depth: 0.35 },
      ],
    },
    // the two spots, and the trail of dots between them
    {
      parent: 'root',
      tilt: FACE,
      shapes: [
        { d: ellipse(MINE[0], MINE[1], 13), fill: 'white', line: 4, depth: 0.2 },
      ],
    },
    ...Array.from({ length: DOTS }, (_, i) => dot(i)),
    { parent: 'root', tilt: FACE, a: THEIRS, p: THEIRS, m: { s: popScale(LAND - 4, GONE) }, shapes: [{ d: ellipse(THEIRS[0], THEIRS[1], 12), fill: 'white', line: 4, depth: 0.2 }] },
    // your pulses ringing out from your spot
    { parent: 'root', tilt: FACE, a: MINE, p: MINE, m: glint(PULSE[0] + 2, 140), shapes: [{ d: ellipse(MINE[0], MINE[1], 56), line: 4 }] },
    { parent: 'root', tilt: FACE, a: MINE, p: MINE, m: glint(PULSE[1] + 2, 140), shapes: [{ d: ellipse(MINE[0], MINE[1], 56), line: 4 }] },
    // the friend's pin, behind yours: drops in and squashes on its tip
    ...pin('friend', THEIRS_TIP, THEIRS_K, 'hot', { p: THEIRS_P, s: THEIRS_S, m: { s: popScale(APPEAR, GONE) } }),
    wave('root', THEIRS_TIP, 40, LAND, -60, -20),
    // your pin, standing the whole loop
    ...pin('me', MINE_TIP, MINE_K, 'main', { s: MINE_S }),
    glow('root', [MINE_TIP[0] - 96, MINE_TIP[1] - 132], 22, popIn(REACH + 2, UNLINK)),
    glow('root', [THEIRS_TIP[0] + 80, THEIRS_TIP[1] - 70], 15, popIn(REACH + 8, UNLINK + 4)),
  ],
}

export default locationShare
