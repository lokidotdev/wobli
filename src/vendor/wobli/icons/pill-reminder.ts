// Pill Reminder
import { arc, ellipse, pill, poly, rect, ring } from '../engine.ts'
import { EASY, OUT, SOFT, springTurn } from '../motions.ts'
import { EXT, FACE, LINE, facePoint, glow, outAndBack, popIn, wave } from '../parts.ts'
import type { Icon, Shape, Track, Vec } from '../engine.ts'

// The bell above the pill box is drawn back and let go: it rings through rest on the spring, each swing half the last, and a
// ripple leaves its rim. On the first strike the box's lid springs open about its back hinge and two capsules rise out of
// it a few frames apart, a sparkle popping on the reveal. After the hold the capsules sink back in, last out first home,
// the lid shuts along the way it opened and the box takes the landing.
const BELL = 'M-96 40C-94 -20 -80 -96 0 -98C80 -96 94 -20 96 40C108 46 120 54 122 66Q0 96 -122 66C-120 54 -108 46 -96 40Z'
const LIP = 'M-122 66Q0 96 122 66A9 9 0 0 1 124 84Q0 116 -124 84A9 9 0 0 1 -122 66Z'
const HANG: Vec = [0, -116] // where the bell hangs from: it swings about it
const BELL_AT: Vec = [150, -236] // the bell's hang point on the face, above the box's right end
const BELL_K = 46 // the bell's scale, percent

const WIND = 6
const RELEASE = 20
const PACE = 0.85
const STRIKE = RELEASE + Math.round(13 * PACE) // the first swing's far end: the lid answers on this frame
const SWING: Track<number> = [[WIND, 0, SOFT], ...springTurn(0, RELEASE, PACE, 16)]

const HINGE: Vec = [-118, -34] // the lid's back left corner: it tips open about it
const LID_OPEN = -28
const OPEN_LEN = 16
const RISE_LEN = 30
const PILL_UP = facePoint(0, -112)
const SINK = 116 // the capsules start home, the second one first
const SHUT = 140 // the lid starts to close
const LAND = SHUT + OPEN_LEN // the lid is home and the box takes it
const DIP = (t: number): Track<Vec> => [[t - 2, [0, 0], OUT], [t + 4, [0, 5], EASY], [t + 20, [0, 0]]]

// a capsule: a white body with a coloured half, centred on its layer
const CAPSULE: ReadonlyArray<Shape> = [
  { d: pill(-46, -17, 92, 34), fill: 'white', depth: 0.6 },
  { d: poly([[-46, -17], [0, -17], [0, 17], [-46, 17]], [17, 0, 0, 17]), fill: 'main', depth: 0.6 },
]

const pillReminder: Icon = {
  name: 'pill-reminder',
  frames: 180,
  still: 96,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [222, 322], m: { p: DIP(LAND) }, shapes: [] },
    // the box: a body with a raised day label
    {
      parent: 'root',
      tilt: FACE,
      shapes: [
        { d: rect(-110, -34, 220, 112, 16), fill: 'main', depth: 1 },
        { d: rect(-74, -6, 148, 56, 12), fill: 'white', depth: 0.3 },
        { d: ellipse(-40, 22, 9), fill: 'main', depth: 0.2 },
        { d: ellipse(0, 22, 9), fill: 'main', depth: 0.2 },
        { d: ellipse(40, 22, 9), fill: 'gold', depth: 0.2 },
      ],
    },
    // the lid, hinged at the back left corner
    {
      parent: 'root',
      tilt: FACE,
      a: HINGE,
      p: facePoint(...HINGE),
      m: { r: outAndBack(0, LID_OPEN, STRIKE, OPEN_LEN, SHUT, OPEN_LEN) },
      shapes: [
        { d: rect(-118, -70, 236, 36, 12), fill: 'main', depth: 0.8 },
        { d: rect(82, -40, 30, 16, 6), fill: 'white', depth: 0.5 }, // the catch
      ],
    },
    // the open top of the box: the capsules only show above it, so they rise out of it and in front of the lid
    { id: 'mouth', parent: 'root', tilt: FACE, o: 0, shapes: [{ d: rect(-200, -400, 400, 366) }] },
    {
      parent: 'root',
      tilt: FACE,
      m: { p: outAndBack<Vec>([0, 0], PILL_UP, STRIKE + 4, RISE_LEN, SINK + 6, 22) },
      shapes: [],
      id: 'pillA',
    },
    { parent: 'pillA', clip: 'mouth', a: [-30, 30], p: [-30, 30], r: -24, shapes: CAPSULE },
    {
      parent: 'root',
      tilt: FACE,
      m: { p: outAndBack<Vec>([0, 0], facePoint(0, -92), STRIKE + 10, RISE_LEN, SINK, 22) },
      shapes: [],
      id: 'pillB',
    },
    { parent: 'pillB', clip: 'mouth', a: [36, 34], p: [36, 34], r: 18, shapes: CAPSULE },
    // the bell, ringing above the box
    wave('root', facePoint(BELL_AT[0], BELL_AT[1] + 58), 92, STRIKE - 10, -24, 14),
    { id: 'face', parent: 'root', tilt: FACE, shapes: [] },
    { id: 'bellAt', parent: 'face', p: BELL_AT, s: [BELL_K, BELL_K], shapes: [] },
    { id: 'bell', parent: 'bellAt', a: HANG, p: [0, 0], m: { r: SWING }, shapes: [] },
    { parent: 'bell', a: [0, 30], p: [0, 30], m: { r: SWING, at: 5, k: 0.5 }, shapes: [{ d: ellipse(0, 112, 24), fill: 'main', depth: 0.8 }] },
    {
      parent: 'bell',
      shapes: [
        { d: ring(0, -116, 22, 9), fill: 'gold', depth: 0.6 },
        { d: BELL, fill: 'gold', depth: 1 },
        { d: LIP, fill: 'gold', depth: 1 },
        { d: arc(0, 6, 78, 196, 236), round: true },
      ],
    },
    glow('root', [-170, -150], 24, popIn(STRIKE + 18, SINK - 6)),
    glow('root', [-120, -214], 15, popIn(STRIKE + 24, SINK)),
  ],
}

export default pillReminder
