// Screen Recording
import { ellipse, line, pill, rect } from '../engine.ts'
import { EASY, IN, SNAP } from '../motions.ts'
import { CURSOR, EXT, FACE, LAP, LINE, glow, laptop, outAndBack, popIn, wave } from '../parts.ts'
import type { Icon, Track, Vec } from '../engine.ts'

// The REC badge pops onto the laptop screen and its red dot sends out a ripple: recording. The pointer travels across the
// screen slot to slot, clicks the second window (which dips under it), then moves on while the timeline bar fills. Recording
// stops: the badge pops away on a sparkle, the pointer goes home the way it came and the bar empties.
const DOT: Vec = [42, -134] // the red dot inside the REC badge
const P0: Vec = [-52, -112] // the pointer's rest, over the first window
const P1: Vec = [26, -78] // the second window, where it clicks
const P2: Vec = [58, -100] // where it ends up while the recording runs
const MOVE = 20 // frames for one pointer move
const REC = 8 // the badge pops in
const TO_1 = 26 // the pointer sets off for the second window
const CLICK = TO_1 + MOVE + 4
const TO_2 = 68 // the pointer moves on
const STOP = 118 // the badge pops away
const HOME = 132 // the pointer starts home
const BAR = { x: -92, y: -42, w: 184, h: 12 }
const BAR_START: Vec = [BAR.x, BAR.y + BAR.h / 2]

const FROM_REST = ([x, y]: Vec): Vec => [x - P0[0], y - P0[1]]
const POINTER: Track<Vec> = [
  [TO_1, FROM_REST(P0), SNAP], [TO_1 + MOVE, FROM_REST(P1), 0],
  [TO_2, FROM_REST(P1), SNAP], [TO_2 + MOVE, FROM_REST(P2), 0],
  [HOME, FROM_REST(P2), SNAP], [HOME + MOVE, FROM_REST(P1), 0],
  [HOME + MOVE + 2, FROM_REST(P1), SNAP], [HOME + MOVE * 2 + 2, FROM_REST(P0)],
]
// the timeline fills while recording runs and empties on IN once the pointer is home
const FILL: Track<Vec> = [[REC + 6, [6, 100], EASY], [STOP, [100, 100], 0], [HOME + 8, [100, 100], IN], [HOME + 36, [6, 100]]]

const screenRecording: Icon = {
  name: 'screen-recording',
  frames: 180,
  still: 100,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [244, 300], shapes: [] },
    { id: 'lap', parent: 'root', tilt: FACE, shapes: laptop('deep') },
    { id: 'screen', parent: 'lap', shapes: [{ d: rect(LAP.x, LAP.y, LAP.w, LAP.h, 8), fill: 'tint' }] },
    // two windows on the desktop
    {
      parent: 'lap',
      clip: 'screen',
      shapes: [
        { d: rect(-92, -144, 104, 74, 8), fill: 'white', depth: 0.2 },
        { d: line([-80, -128], [-28, -128]), line: 4 },
        { d: line([-80, -114], [-46, -114]), line: 4 },
      ],
    },
    {
      parent: 'lap',
      clip: 'screen',
      a: P1,
      p: P1,
      s: outAndBack<Vec>([100, 100], [94, 94], CLICK - 4, 6, CLICK + 2, 6),
      shapes: [{ d: rect(-8, -108, 82, 56, 8), fill: 'main', depth: 0.3 }],
    },
    // the timeline: a white track and a red fill growing from its left end
    { parent: 'lap', shapes: [{ d: pill(BAR.x, BAR.y, BAR.w, BAR.h), fill: 'white', depth: 0.2 }] },
    { parent: 'lap', a: BAR_START, p: BAR_START, s: FILL, shapes: [{ d: pill(BAR.x, BAR.y, BAR.w, BAR.h), fill: 'hot', depth: 0.2 }] },
    // the REC badge: pops in, its dot ripples on the start, pops away when recording stops
    {
      id: 'rec',
      parent: 'lap',
      a: DOT,
      p: DOT,
      m: popIn(REC, STOP),
      shapes: [
        { d: pill(24, -150, 76, 32), fill: 'white', depth: 0.5 },
        { d: ellipse(DOT[0], DOT[1], 10), fill: 'hot', depth: 0.3, line: 4 },
        { d: line([62, -134], [86, -134]), line: 5 },
      ],
    },
    wave('rec', DOT, 26, REC + 10),
    // the pointer: travels slot to slot, dips under the click, retraces its path home
    { id: 'ptr', parent: 'lap', p: POINTER, shapes: [] },
    {
      parent: 'ptr',
      clip: 'screen',
      a: P0,
      p: P0,
      s: outAndBack<Vec>([56, 56], [48, 48], CLICK - 4, 6, CLICK + 2, 6),
      shapes: [{ d: CURSOR(P0[0], P0[1]), fill: 'white', depth: 0.4 }],
    },
    glow('root', [-150, -170], 22, popIn(STOP + 2, 144)),
    glow('root', [150, -150], 16, popIn(REC + 14, STOP - 10)),
  ],
}

export default screenRecording
