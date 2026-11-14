// Video Play
import { ellipse, pill, poly, rect } from '../engine.ts'
import { IN } from '../motions.ts'
import { CURSOR, EXT, FACE, LINE, facePoint, glow, outAndBack, outIn, popIn, popScale } from '../parts.ts'
import type { Icon, Track, Vec } from '../engine.ts'

// The pointer glides onto the play button and presses it; the button sinks under the tap and pops away. The frame plays:
// the sun climbs over the hills, a cloud drifts across and the progress bar fills with the scrubber riding its edge. At the
// end the play button pops back, then the bar, the cloud and the sun rewind home on IN and the pointer leaves the way it came.
const SCREEN = rect(-150, -104, 300, 152, 16)
const BUTTON: Vec = [0, -28] // the play button's centre on the face
const BAR = { x: -150, y: 76, w: 300, h: 16 }
const BAR_START: Vec = [BAR.x, BAR.y + BAR.h / 2]
const KNOB_RUN = BAR.w - 12 // the scrubber's travel, so it rides the fill's edge from the first frame to the last

const ARRIVE = 4 // the pointer sets off
const TAP = 26 // the pointer lands and presses
const PLAY = 34 // the button has popped away, the frame plays
const DONE = 116 // the frame ends, the button pops back
const REWIND = 140 // the bar, cloud and sun go home
const REWIND_LEN = 20
const LEAVE = PLAY + 8 // the pointer heads off once the frame plays

// playback runs at a constant rate, so the fill and scrubber move linearly; the rewind retraces it on IN
const run = <T>(rest: T, to: T): Track<T> => [[PLAY, rest], [DONE, to, 0], [REWIND, to, IN], [REWIND + REWIND_LEN, rest]]

const HILLS =
  'M-160 60L-160 10C-120 -30 -70 -34 -20 6C20 -20 70 -26 160 -6L160 60Z'

const videoPlay: Icon = {
  name: 'video-play',
  frames: 180,
  still: 92,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [250, 262], s: [104, 104], shapes: [] },
    {
      id: 'player',
      parent: 'root',
      tilt: FACE,
      shapes: [{ d: rect(-174, -128, 348, 246, 28), fill: 'deep', depth: 1 }],
    },
    { id: 'screen', parent: 'player', shapes: [{ d: SCREEN, fill: 'tint', depth: 0.2 }] },
    // the frame: the sun rises from behind the hills while it plays and sets back on the rewind
    {
      parent: 'player',
      clip: 'screen',
      p: run<Vec>([0, 56], [0, 0]),
      shapes: [{ d: ellipse(70, -52, 26), fill: 'gold', depth: 0.2 }],
    },
    {
      parent: 'player',
      clip: 'screen',
      p: run<Vec>([0, 0], [150, 0]),
      shapes: [{ d: pill(-170, -82, 70, 24), fill: 'white', depth: 0.2 }],
    },
    { parent: 'player', clip: 'screen', shapes: [{ d: HILLS, fill: 'main', depth: 0.2 }] },
    // the progress bar: the fill grows from the left, the scrubber rides its edge
    {
      parent: 'player',
      shapes: [{ d: pill(BAR.x, BAR.y, BAR.w, BAR.h), fill: 'white', depth: 0.3 }],
    },
    {
      parent: 'player',
      a: BAR_START,
      p: BAR_START,
      s: run<Vec>([4, 100], [100, 100]),
      shapes: [{ d: pill(BAR.x, BAR.y, BAR.w, BAR.h), fill: 'main', depth: 0.3 }],
    },
    {
      parent: 'player',
      p: run<Vec>([0, 0], [KNOB_RUN, 0]),
      shapes: [{ d: ellipse(BAR_START[0] + 6, BAR_START[1], 15), fill: 'gold', depth: 0.6 }],
    },
    // the play button: sinks under the tap, pops away as the frame plays, pops back when it ends
    {
      parent: 'player',
      a: BUTTON,
      p: BUTTON,
      s: outAndBack<Vec>([100, 100], [86, 86], TAP - 4, 6, TAP + 2, 6),
      m: outIn(TAP + 4, DONE),
      shapes: [
        { d: ellipse(BUTTON[0], BUTTON[1], 50), fill: 'white', depth: 0.7 },
        { d: poly([[BUTTON[0] - 14, BUTTON[1] - 24], [BUTTON[0] + 26, BUTTON[1]], [BUTTON[0] - 14, BUTTON[1] + 24]], 6), fill: 'main', depth: 0.3 },
      ],
    },
    // the pointer: glides onto the button, dips with the tap, leaves along the path it came in on
    {
      parent: 'root',
      p: facePoint(BUTTON[0] + 10, BUTTON[1] + 12),
      m: [
        { p: outAndBack<Vec>([150, 110], [0, 0], ARRIVE, TAP - 4 - ARRIVE, LEAVE, 24) },
        { s: outAndBack<Vec>([100, 100], [88, 88], TAP - 4, 6, TAP + 2, 6) },
      ],
      s: popScale(ARRIVE - 4, LEAVE + 14),
      shapes: [{ d: CURSOR(0, 0), fill: 'white', depth: 0.5 }],
    },
    glow('root', [-176, -150], 24, popIn(PLAY, DONE - 6)),
    glow('root', [184, -120], 16, popIn(DONE + 2, REWIND)),
  ],
}

export default videoPlay
