// Email Verified
import { line, poly, rect, rosette } from '../engine.ts'
import { IN, SOFT } from '../motions.ts'
import { EXT, FACE, LINE, check, facePoint, glow, outAndBack, popIn, popScale } from '../parts.ts'
import type { Icon, Key, Vec } from '../engine.ts'

// The envelope's flap swings up off its hinge, and a beat behind it the letter rises out of the pocket; as it tops out the
// verified rosette pops above it, with a sparkle on the beat. After a long hold the rosette pops away, the letter sinks back
// in and the flap folds shut, last out first home.
const OPEN = 14 // the flap starts to lift
const RISE = OPEN + 6 // the letter follows
const BADGE = 46 // the rosette pops as the letter tops out
const SINK = 136 // the letter heads home
const SHUT = 154 // the flap folds back down
const W = 124 // envelope half width
const TOP = -82 // the flap's hinge
const FLAT = TOP // tip on the hinge: the flap edge on
const CLOSED = 8 // tip down in the pocket's notch
const OPENED = -158 // tip up, opened out behind the letter
const BADGE_AT: Vec = facePoint(100, -148)
const HINGE: Vec = [0, TOP]
const HINGE_AT: Vec = facePoint(0, TOP)
// each flap is shown only on its side of the hinge, cut where it is edge on, so it never draws as a bar
const cut = (a: number, b: number, v: number): ReadonlyArray<Key<Vec>> => [[a, [v, v], 0], [a + 1, [100 - v, 100 - v], 0], [b, [100 - v, 100 - v], 0], [b + 1, [v, v]]]

// the flap as one triangle off the hinge, tip at y, so every pose morphs
const flap = (tip: number) => `M${-W} ${TOP}L${W} ${TOP}L0 ${tip}Z`
// the flap swings through edge on: the front half folds up to the hinge, the back half carries on up, and the mirror home
const FRONT: ReadonlyArray<Key<string>> = [[OPEN, flap(CLOSED), IN], [OPEN + 8, flap(FLAT), 0], [SHUT + 14, flap(FLAT), SOFT], [SHUT + 24, flap(CLOSED)]]
const BACK: ReadonlyArray<Key<string>> = [[OPEN + 8, flap(FLAT), SOFT], [OPEN + 24, flap(OPENED), 0], [SHUT, flap(OPENED), IN], [SHUT + 14, flap(FLAT)]]

const emailVerified: Icon = {
  name: 'email-verified',
  frames: 180,
  still: 100,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [238, 318], shapes: [] }, // untilted: carries the rosette and the sparkles
    // the envelope's back and the flap once it has swung open behind the letter
    {
      parent: 'root',
      tilt: FACE,
      shapes: [{ d: rect(-W, TOP, W * 2, 164, 14), fill: 'white', depth: 0.8 }],
    },
    { parent: 'root', tilt: FACE, a: HINGE, p: HINGE_AT, s: cut(OPEN + 7, SHUT + 13, 0), shapes: [{ d: BACK, fill: 'tint', depth: 0.15 }] },
    // the letter: rises out of the pocket a beat behind the flap, sinks home before it shuts
    {
      parent: 'root',
      tilt: FACE,
      p: outAndBack<Vec>([0, 0], [0, -84], RISE, 26, SINK, 20),
      shapes: [
        { d: rect(-100, -70, 200, 140, 8), fill: 'paper', depth: 0.3 },
        { d: rect(-80, -52, 44, 30, 6), fill: 'main', depth: 0.2 },
        { d: line([-80, -4], [10, -4]) },
        { d: line([-80, 14], [-14, 14]) },
      ],
    },
    // the pocket's front, notched where the flap folds in, and the closed flap over it
    {
      parent: 'root',
      tilt: FACE,
      shapes: [
        { d: poly([[-W, TOP + 20], [0, 12], [W, TOP + 20], [W, 82], [-W, 82]], [4, 4, 4, 14, 14]), fill: 'main', depth: 0.9 },
        { d: line([-W + 18, 64], [-30, 24]) },
        { d: line([W - 18, 64], [30, 24]) },
      ],
    },
    { parent: 'root', tilt: FACE, a: HINGE, p: HINGE_AT, s: cut(OPEN + 7, SHUT + 13, 100), shapes: [{ d: FRONT, fill: 'tint', depth: 0.15 }] },
    // the verified rosette, upright, popping above the risen letter
    {
      parent: 'root',
      a: BADGE_AT,
      p: BADGE_AT,
      s: popScale(BADGE, SINK - 8),
      shapes: [
        { d: rosette(BADGE_AT[0], BADGE_AT[1], 50, 10, 0.5), fill: 'ok', depth: 0.6 },
        { d: check(BADGE_AT, 46), line: 8 },
      ],
    },
    glow('root', [BADGE_AT[0] + 70, BADGE_AT[1] - 48], 24, popIn(BADGE + 6, SINK - 14)),
    glow('root', [BADGE_AT[0] - 180, BADGE_AT[1] - 4], 16, popIn(BADGE + 12, SINK - 10)),
  ],
}

export default emailVerified
