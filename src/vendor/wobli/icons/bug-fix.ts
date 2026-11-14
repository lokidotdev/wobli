// Bug Fix
import { ellipse, line, poly, rect } from '../engine.ts'
import { IN, SOFT, spring } from '../motions.ts'
import { check, checkBadge, EXT, FACE, facePoint, glow, LINE, outAndBack, popIn, popScale } from '../parts.ts'
import type { Icon, Layer, Shape, Track, Vec } from '../engine.ts'

// A bug sits on the code. The wrench swings down and taps it twice; the window takes each tap and the bug squashes under it.
// On the second tap the bug resolves: its shell shrinks into a green disc while its six legs and two feelers swing in and
// gather into the check. After a long hold the check comes apart back into legs and the shell grows round them, the mirror.
const BUG: Vec = [34, 10] // where the bug sits on the code panel, in face space
const R = 34 // the badge it resolves into
const TAP_1 = 26
const TAP_2 = 48
const FIX = 50 // the legs start gathering
const FIX_LEN = 22
const UNFIX = 140 // the check starts coming apart
const SQUASH: Vec = [84, 84]
const FULL: Vec = [100, 100]
const LIFT = 52 // degrees the wrench rests lifted off the bug

// eight strokes, all as M L pairs so each morphs into the next: legs, three a side, then the feelers
const LEGS: ReadonlyArray<readonly [Vec, Vec]> = [
  [[-22, -12], [-46, -26]],
  [[-26, 4], [-52, 4]],
  [[-22, 20], [-46, 38]],
  [[22, -12], [46, -26]],
  [[26, 4], [52, 4]],
  [[22, 20], [46, 38]],
  [[-8, -44], [-18, -64]],
  [[8, -44], [18, -64]],
]
// the same eight strokes laid along the check: left legs on the short arm, right legs on the long one, feelers on the joints
const lerp = (a: Vec, b: Vec, t: number): Vec => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]
const CK = check([0, 0], R)
  .slice(1)
  .split('L')
  .map((s): Vec => {
    const [x, y] = s.replace('M', '').trim().split(/[ ,]+/).map(Number)
    return [x, y]
  })
const [CA, CB, CC] = CK
const ON_CHECK: ReadonlyArray<readonly [Vec, Vec]> = [
  [CA, lerp(CA, CB, 0.6)],
  [lerp(CA, CB, 0.3), CB],
  [lerp(CA, CB, 0.5), CB],
  [CB, lerp(CB, CC, 0.5)],
  [lerp(CB, CC, 0.3), lerp(CB, CC, 0.8)],
  [lerp(CB, CC, 0.5), CC],
  [CA, lerp(CA, CB, 0.4)],
  [lerp(CB, CC, 0.7), CC],
]
const strokes = (segs: ReadonlyArray<readonly [Vec, Vec]>) => segs.map(([a, b]) => line(a, b)).join('')
const LEGS_PATH = strokes(LEGS)
const CHECK_PATH = strokes(ON_CHECK)

// squashed on the tap, sprung back out
const squash = (t: number): Track<Vec> => [[t - 2, FULL, IN], [t, SQUASH, 0], ...spring(FULL, t, 0.5, SQUASH)]

// an open end wrench, head at 0 0 with the jaw facing down the handle's far end, handle running along +y
const WRENCH = poly(
  [[-11, -40], [-32, -34], [-40, -6], [-14, 20], [-12, 150], [12, 150], [14, 20], [40, -6], [32, -34], [11, -40], [11, -14], [-11, -14]],
  [4, 14, 14, 6, 12, 12, 6, 14, 14, 4, 3, 3],
)
const GRIP: Vec = [0, 150] // the far end of the handle, where it swings from

const at = (v: Vec): Vec => {
  const [x, y] = facePoint(v[0], v[1])
  return [x, y]
}
const BUG_AT = at(BUG)

const bugFix: Icon = {
  name: 'bug-fix',
  frames: 180,
  still: 110,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [236, 254], shapes: [] },
    // the window takes each tap, pushed down on the frame the wrench lands
    { id: 'body', parent: 'root', m: [{ p: [[TAP_1 - 2, [0, 0], IN], [TAP_1, [2, 6], 0], ...spring([0, 0], TAP_1, 0.5, [2, 6])] }, { p: [[TAP_2 - 2, [0, 0], IN], [TAP_2, [2, 6], 0], ...spring([0, 0], TAP_2, 0.5, [2, 6])] }], shapes: [] },
    {
      id: 'window',
      parent: 'body',
      tilt: FACE,
      shapes: [
        { d: rect(-140, -120, 280, 236, 22), fill: 'deep', depth: 1 },
        ...[0, 1, 2].map((i): Shape => ({ d: ellipse(-116 + i * 20, -100, 6), fill: 'white', line: 4 })),
        { d: rect(-120, -80, 240, 178, 12), fill: 'white', depth: 0.2 },
        ...([[-100, -56, 40, 60], [-80, -30, 70, 30], [-80, -4, 20, -16], [-100, 22, 30, 50], [-80, 48, 50, 0], [-100, 74, 10, 40]] as const).flatMap(
          ([x, y, tok, end]): ReadonlyArray<Shape> => [
            { d: rect(x, y - 6, tok, 12, 6), fill: 'main', line: 3 },
            { d: line([x + tok + 12, y], [end, y]), line: 4, round: true },
          ],
        ),
      ],
    },
    // the bug: squashed by each tap, on its spot on the code
    { id: 'bug', parent: 'window', a: BUG, p: BUG, s: [...squash(TAP_1), ...squash(TAP_2).slice(1)], shapes: [] },
    // the disc it resolves into, growing out of its middle
    { parent: 'bug', p: BUG, s: popScale(FIX + 2, UNFIX + 2), shapes: checkBadge([0, 0], R, 0.5).slice(0, 1) },
    // legs and feelers, swinging in to become the check and back out again
    {
      parent: 'bug',
      p: BUG,
      shapes: [{ d: [[FIX, LEGS_PATH, SOFT], [FIX + FIX_LEN, CHECK_PATH, 0], [UNFIX, CHECK_PATH, IN], [UNFIX + FIX_LEN, LEGS_PATH]], line: 6, round: true }],
    },
    // the shell: shrinks away into the disc on the fix, grows back round the legs on the way home
    {
      parent: 'bug',
      p: BUG,
      s: outAndBack<Vec>(FULL, [0, 0], FIX, FIX_LEN - 4, UNFIX + 4),
      shapes: [
        { d: ellipse(0, -36, 15, 12), fill: 'ink', line: false, depth: 0.4 },
        { d: ellipse(0, 4, 30, 36), fill: 'hot', depth: 0.5 },
        { d: line([0, -30], [0, 40]), line: 4 },
        ...([[-13, -8], [14, 14], [-12, 22]] as const).map(([x, y]): Shape => ({ d: ellipse(x, y, 6), fill: 'ink', line: false })),
      ],
    },
    // the wrench rests lifted off the window; it swings down from its grip onto the bug twice, then back up to rest
    {
      parent: 'root',
      a: GRIP,
      p: [BUG_AT[0] + 94, BUG_AT[1] - 46],
      r: -128 + LIFT,
      s: [80, 80],
      m: {
        r: [
          [TAP_1 - 14, 0, IN], [TAP_1, -LIFT, 0], [TAP_1 + 2, -LIFT, SOFT], [TAP_2 - 12, -LIFT / 2, IN], [TAP_2, -LIFT, 0],
          [TAP_2 + 4, -LIFT, SOFT], [TAP_2 + 34, 0],
        ],
      },
      shapes: [{ d: WRENCH, fill: 'grey', depth: 0.6 }, { d: line([0, 40], [0, 120]), line: 4, round: true }],
    },
    glow('root', [BUG_AT[0] + 84, BUG_AT[1] + 34], 22, popIn(FIX + 14, UNFIX - 8)),
    glow('root', [BUG_AT[0] - 70, BUG_AT[1] + 40], 16, popIn(FIX + 20, UNFIX - 14)),
  ] satisfies ReadonlyArray<Layer>,
}

export default bugFix
