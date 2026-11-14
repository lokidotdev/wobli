// Push Permission
import { ellipse, line, pill, rect, ring } from '../engine.ts'
import { SOFT, springTurn } from '../motions.ts'
import { EXT, FACE, LINE, PHONE_SCREEN, facePoint, glow, outAndBack, phoneBody, popIn, wave } from '../parts.ts'
import type { Icon, Shape, Track, Vec } from '../engine.ts'

// The permission dialog grows out of the middle of the screen. A finger slides in and taps Allow: the button and the finger
// sink together, and on that same frame the grey bell lights gold and rings, swinging on the spring with a ripple and a
// sparkle. The finger lifts away the way it came, the dialog shrinks back into the screen, and after a long hold the bell
// goes dark again for the loop.
const DIALOG: Vec = [0, -6] // the dialog's centre: where it grows from and goes back to
const ALLOW: Vec = [27, 26] // the Allow button's centre, where the fingertip lands
const PUSH: Vec = [-1.3, 6] // a press sinks along the slab's own side
const HAND_FROM: Vec = [110, 120] // off the lower right corner of the screen, along the face
const HANG: Vec = [0, -64] // where the bell hangs from: it swings about it
const BELL_AT: Vec = [150, -140] // the bell's place beside the phone, in the root's space

const OPEN = 8 // the dialog grows out of the screen
const REACH = 32 // the finger slides in
const TAP = 62 // the finger lands on Allow: the bell lights and rings
const LIFT = TAP + 26 // the finger lifts away
const CLOSE = TAP + 32 // the dialog shrinks back into the screen
const DARK = 146 // the bell goes dark again

// grows a path of plain x y pairs about the origin by k and moves it to c
const place = (d: string, k: number, [cx, cy]: Vec) =>
  d.replace(/(-?\d+\.?\d*) (-?\d+\.?\d*)/g, (_, x: string, y: string) => `${+(cx + +x * k).toFixed(2)} ${+(cy + +y * k).toFixed(2)}`)
const BELL = 'M-96 40C-94 -20 -80 -96 0 -98C80 -96 94 -20 96 40C108 46 120 54 122 66Q0 96 -122 66C-120 54 -108 46 -96 40Z'
const LIP = 'M-122 66Q0 96 122 66C130 66 132 78 124 84Q0 116 -124 84C-132 78 -130 66 -122 66Z'
const K = 0.52
const bell = (fill: Shape['fill']): ReadonlyArray<Shape> => [
  { d: ring(0, HANG[1], 12, 5), fill, depth: 0.6 },
  { d: place(BELL, K, [0, 0]), fill, depth: 1 },
  { d: place(LIP, K, [0, 0]), fill, depth: 1 },
]

// the bell is drawn back as the tap lands and rings through rest, each swing half the last
const SWING: Track<number> = [[TAP, 0, SOFT], ...springTurn(0, TAP + 6, 0.85, 16)]

// a pointing hand on the face, fingertip at 0 0: index finger up, curled fist below, a sleeve cuff
const hand = (): ReadonlyArray<Shape> => [
  { d: pill(-14, -8, 28, 92), fill: 'white', depth: 0.6 },
  { d: rect(-20, 56, 84, 70, 28), fill: 'white', depth: 0.6 },
  { d: line([16, 72], [16, 92]) },
  { d: line([38, 72], [38, 92]) },
  { d: pill(-26, 88, 46, 22), fill: 'white', depth: 0.3 },
  { d: rect(-14, 120, 74, 26, 8), fill: 'main', depth: 0.7 },
]

const at = (v: Vec): Vec => facePoint(...v)

const pushPermission: Icon = {
  name: 'push-permission',
  frames: 180,
  still: TAP + 20,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [226, 272], s: [90, 90], shapes: [] },
    { parent: 'root', tilt: FACE, shapes: phoneBody(32, 'deep') },
    {
      id: 'screen',
      parent: 'root',
      tilt: FACE,
      shapes: [
        { d: PHONE_SCREEN(22), fill: 'tint' },
        { d: pill(-24, -128, 48, 12), fill: 'ink', line: false },
      ],
    },
    // the dialog grows out of the screen's middle and goes back into it the same way
    {
      id: 'dialog',
      parent: 'root',
      tilt: FACE,
      a: DIALOG,
      p: at(DIALOG),
      ip: OPEN,
      op: CLOSE + 24,
      s: outAndBack<Vec>([0, 0], [100, 100], OPEN, 22, CLOSE, 22),
      shapes: [
        { d: rect(-58, -66, 116, 120, 18), fill: 'white', depth: 0.4 },
        { d: rect(-15, -54, 30, 30, 9), fill: 'gold', depth: 0.3 },
        { d: place(BELL, 0.1, [0, -38]), fill: 'ink', line: false },
        { d: line([-36, -8], [36, -8]) },
        { d: line([-24, 4], [24, 4]) },
        { d: pill(-48, 16, 42, 20), fill: 'grey', depth: 0.3 },
      ],
    },
    // Allow sinks under the finger, on the same frames
    {
      parent: 'dialog',
      m: { p: outAndBack<Vec>([0, 0], PUSH, TAP - 4, 4, TAP + 2, 10) },
      shapes: [{ d: pill(6, 16, 42, 20), fill: 'main', depth: 0.3 }],
    },
    // the bell beside the phone: grey until the tap, then gold, ringing
    { id: 'bellFace', parent: 'root', p: BELL_AT, tilt: FACE, shapes: [] },
    wave('root', BELL_AT, 92, TAP - 6, -64, -20),
    { parent: 'bellFace', a: HANG, p: HANG, m: { r: SWING, at: 5, k: 0.5 }, shapes: [{ d: ellipse(0, 60, 12), fill: 'hot', depth: 0.8 }] },
    { id: 'bell', parent: 'bellFace', a: HANG, p: HANG, m: { r: SWING }, shapes: bell('grey') },
    { parent: 'bell', a: [0, 0], p: [0, 0], m: popIn(TAP, DARK), shapes: bell('gold') },
    // the finger slides in along the face, taps, and lifts away the way it came
    {
      parent: 'root',
      tilt: FACE,
      a: [0, 0],
      p: at(ALLOW),
      m: [
        { p: outAndBack<Vec>(at(HAND_FROM), [0, 0], REACH, 24, LIFT, 24) },
        { p: outAndBack<Vec>([0, 0], PUSH, TAP - 4, 4, TAP + 4, 10) },
      ],
      s: outAndBack<Vec>([0, 0], [100, 100], REACH, 18, LIFT + 6, 18),
      shapes: hand(),
    },
    glow('root', [64, -196], 22, popIn(TAP + 4, DARK - 4)),
  ],
}

export default pushPermission
