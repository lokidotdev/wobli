// Email Campaign
import { at, line, pill, poly, rect } from '../engine.ts'
import { IN, SOFT } from '../motions.ts'
import { EXT, FACE, LINE, checkBadge, glow, outAndBack, popIn, popScale } from '../parts.ts'
import type { Icon, Key, Layer, Shape, Track, Vec } from '../engine.ts'

// Three envelopes sit in a column beside the open-rate card. One after another their flaps flip open and the letter inside
// rises out; on each letter's rise the card's bar climbs a step, and the third fills it, popping a check and a sparkle.
// After the hold the letters sink back and the flaps close, last opened first, while the bar drains, so the seam is all closed.
const OPEN = [14, 38, 62] // each flap starts to open
const FLAP_LEN = 14
const LIFT = 6 // the letter follows the flap this much later
const LIFT_LEN = 16
const RISE = 18 // frames the bar takes to climb a step
const STEP = (i: number) => OPEN[i] + LIFT + 2 // the bar answers the letter
const FULL = STEP(2) + RISE
const BACK = 122 // the letters start to sink
const CLOSE = [BACK + 16, BACK + 8, BACK] // last opened, first closed
const CLOSE_LEN = 14
const HALF = FLAP_LEN / 2

// the flap turns over its hinge in two halves, so the open flap can sit behind the letter: the near half folds down to flat
// speeding up, the far half carries on to open slowing down; closing runs the same keys backwards
const FRONT_FLAP = (i: number): Track<Vec> => [
  [OPEN[i], [100, 100], IN],
  [OPEN[i] + HALF, [100, 0], 0],
  [CLOSE[i] + LIFT + HALF, [100, 0], SOFT],
  [CLOSE[i] + LIFT + FLAP_LEN, [100, 100]],
]
const BACK_FLAP = (i: number): Track<Vec> => [
  [OPEN[i] + HALF, [100, 0], SOFT],
  [OPEN[i] + FLAP_LEN, [100, -100], 0],
  [CLOSE[i] + LIFT, [100, -100], IN],
  [CLOSE[i] + LIFT + HALF, [100, 0]],
]

// an envelope on the face, centred on its seat: W by H, the flap's V reaching NOTCH down
const W = 144
const H = 94
const NOTCH = H * 0.56
const SEATS: ReadonlyArray<Vec> = [[-112, -116], [-84, 4], [-56, 124]]
const LETTER_UP = 52 // how far a letter rises out

// the bar card: a tall track with the fill rising from its foot
const CARD = { x: 62, y: -150, w: 128, h: 296 }
const BAR = { x: 98, y: -98, w: 56, h: 212 }
const BAR_FOOT = BAR.y + BAR.h

// share of the bar: a step per letter on SOFT, home in one sweep on IN, its mirror
const LEVEL: Track<number> = [
  ...[0, 1, 2].flatMap((i): ReadonlyArray<Key<number>> => [
    [STEP(i), i / 3, SOFT],
    [STEP(i) + RISE, (i + 1) / 3, 0],
  ]),
  [BACK, 1, IN],
  [CLOSE[0] + CLOSE_LEN, 0],
]
const fill = (share: number) => {
  const h = BAR.w + share * (BAR.h - BAR.w) // never shorter than its own round ends
  return pill(BAR.x, BAR_FOOT - h, BAR.w, h)
}
const FRAMES = Array.from({ length: 181 }, (_, f) => f)
// keyed every other frame while it moves, held still between, so the pill morphs
const FILL: Track<string> = FRAMES.filter((f, i) => i % 2 === 0 || f === 180)
  .filter((f) => f === 0 || f === 180 || at(LEVEL, f) !== at(LEVEL, f - 2) || at(LEVEL, f + 2) !== at(LEVEL, f))
  .map((f) => [f, fill(at(LEVEL, f))] as const)

const BADGE: Vec = [CARD.x + CARD.w - 4, CARD.y + 4]

// one envelope: back panel, the letter, the front pocket with its V, and the flap hinged on the top edge
const envelope = (seat: Vec, i: number): ReadonlyArray<Layer> => {
  const id = `env${i}`
  const [l, t] = [-W / 2, -H / 2]
  const hinge: Vec = [0, t]
  const flap: Shape = { d: poly([[l, t], [-l, t], [0, t + NOTCH]], [10, 10, 6]), fill: 'paper', depth: 0.3 }
  return [
    { id, parent: 'face', p: seat, shapes: [{ d: rect(l, t, W, H, 10), fill: 'main', depth: 1 }] },
    // the flap's far half, behind the letter: from flat at the hinge up to fully open
    { parent: id, a: hinge, p: hinge, s: BACK_FLAP(i), shapes: [flap] },
    {
      parent: id,
      p: outAndBack<Vec>([0, 0], [0, -LETTER_UP], OPEN[i] + LIFT, LIFT_LEN, CLOSE[i], CLOSE_LEN),
      shapes: [
        { d: rect(l + 16, t + 8, W - 32, H - 20, 6), fill: 'white', depth: 0.3 },
        { d: line([l + 34, t + 26], [l + 92, t + 26]) },
        { d: line([l + 34, t + 44], [l + 74, t + 44]) },
      ],
    },
    {
      parent: id,
      shapes: [
        { d: poly([[l, t], [0, t + NOTCH], [-l, t], [-l, -t], [l, -t]], [10, 6, 10, 10, 10]), fill: 'white', depth: 0.4 },
      ],
    },
    // the flap's near half, over the pocket: closed down to flat at the hinge
    { parent: id, a: hinge, p: hinge, s: FRONT_FLAP(i), shapes: [flap] },
  ]
}

const emailCampaign: Icon = {
  name: 'email-campaign',
  frames: 180,
  still: 104,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [250, 262], shapes: [] },
    { id: 'face', parent: 'root', tilt: FACE, shapes: [] },
    {
      id: 'card',
      parent: 'face',
      shapes: [
        { d: rect(CARD.x, CARD.y, CARD.w, CARD.h, 26), fill: 'white', depth: 1 },
        { d: line([CARD.x + 30, CARD.y + 28], [CARD.x + 82, CARD.y + 28]) },
        { d: pill(BAR.x, BAR.y, BAR.w, BAR.h), fill: 'paper', depth: 0.3 },
        { d: FILL, fill: 'deep', depth: 0.3, crease: false },
      ],
    },
    ...SEATS.flatMap(envelope),
    { parent: 'card', a: BADGE, p: BADGE, s: popScale(FULL, BACK - 6), shapes: checkBadge(BADGE, 26) },
    glow('root', [-170, -150], 22, popIn(FULL + 2, BACK - 14)),
    glow('root', [180, 120], 15, popIn(FULL + 8, BACK - 8)),
  ],
}

export default emailCampaign
