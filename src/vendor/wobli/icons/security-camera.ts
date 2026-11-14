// Security Camera
import { ellipse, line, pill, rect, spark } from '../engine.ts'
import { EASY } from '../motions.ts'
import { EXT, FACE, LINE, PHONE_SCREEN, buzz, facePoint, glow, outAndBack, phoneBody, popIn, popScale, wave } from '../parts.ts'
import type { Icon, Track, Vec } from '../engine.ts'

// The camera on its wall arm pans up and away, then sweeps back down toward the phone and stops: its light turns on and a
// figure appears in the live feed. On the next beat the alert banner unfolds out of the phone's notch and lands with a buzz.
// After the hold the banner folds back into the notch, the light and the figure go out and the camera pans home.
const PAN_UP = 4 // the camera starts up and away
const PAN_DOWN = 32 // it sweeps back down toward the phone
const SPOT = 60 // it stops: motion spotted, the light comes on
const ALERT = SPOT + 4 // the banner starts out of the notch
const ALERT_LEN = 24
const LAND = ALERT + ALERT_LEN // the banner lands: the phone buzzes
const FOLD = 132 // the banner folds back
const FOLD_LEN = 22
const CLEAR = FOLD + 10 // the light and the figure go out
const HOME = 146 // the camera pans home
const HOME_LEN = 28

// the camera, drawn on the leaned face: wall plate, arm, joint, then the head that turns about the joint
const CAM: Vec = [-92, -92]
const PIVOT: Vec = [-30, 0]
const LENS: Vec = [112, 4]
const LED: Vec = [-2, 4]

// the pan, in degrees about the joint: up and away, a beat, back down past rest toward the phone, held, home
const pan = (d = 0): Track<number> => [
  [PAN_UP + d, 0, EASY],
  [PAN_DOWN - 4 + d, -14, EASY],
  [PAN_DOWN + d, -14, EASY],
  [SPOT + d, 28, 0],
  [HOME + d, 28, EASY],
  [HOME + HOME_LEN + d, 0],
]

// the phone, and the feed and banner on its screen
const PHONE: Vec = [108, 82]
const NOTCH: Vec = [0, -128]
const FIGURE: Vec = [14, 44]

const securityCamera: Icon = {
  name: 'security-camera',
  frames: 180,
  still: 104,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [262, 246], shapes: [] },
    { id: 'cam', parent: 'root', p: CAM, shapes: [] },
    {
      parent: 'cam',
      tilt: FACE,
      shapes: [
        { d: rect(-128, -54, 30, 108, 9), fill: 'grey', depth: 0.8 },
        { d: rect(-100, -11, 64, 22, 6), fill: 'grey', depth: 0.6 },
      ],
    },
    // the visor rides the head a few frames behind it
    {
      parent: 'cam',
      tilt: FACE,
      a: PIVOT,
      p: facePoint(...PIVOT),
      r: pan(3),
      shapes: [{ d: rect(-50, -48, 182, 24, 10), fill: 'main', depth: 0.8 }],
    },
    {
      id: 'head',
      parent: 'cam',
      tilt: FACE,
      a: PIVOT,
      p: facePoint(...PIVOT),
      r: pan(),
      shapes: [
        { d: rect(-42, -26, 150, 62, 22), fill: 'white', depth: 1 },
        { d: line([30, -12], [30, 22]) },
        { d: line([46, -12], [46, 22]) },
        { d: ellipse(LENS[0], LENS[1], 30), fill: 'deep', depth: 0.8 },
        { d: ellipse(LENS[0], LENS[1], 15), fill: 'grey', depth: 0.3 },
        { d: spark(LENS[0] - 8, LENS[1] - 8, 7), fill: 'white', line: 3 },
        { d: ellipse(LED[0], LED[1], 9), fill: 'grey' },
      ],
    },
    // the light turns on where the camera stops
    { parent: 'head', a: LED, p: LED, s: popScale(SPOT, CLEAR), shapes: [{ d: ellipse(LED[0], LED[1], 9), fill: 'hot' }] },
    { parent: 'cam', tilt: FACE, shapes: [{ d: ellipse(PIVOT[0], PIVOT[1], 17), fill: 'deep', depth: 0.6 }] },

    // the phone: buzzes on the frame the banner lands
    { id: 'phone', parent: 'root', p: PHONE, s: [64, 64], m: buzz(LAND - 2, 3), shapes: [] },
    { parent: 'phone', tilt: FACE, shapes: phoneBody(32, 'deep') },
    { id: 'screen', parent: 'phone', tilt: FACE, shapes: [{ d: PHONE_SCREEN(22), fill: 'tint' }] },
    {
      parent: 'phone',
      tilt: FACE,
      shapes: [
        { d: rect(-54, -30, 108, 120, 16), fill: 'white', depth: 0.3 },
        { d: line([-38, 70], [38, 70]) },
        { d: rect(-36, 104, 72, 14, 7), fill: 'grey' },
      ],
    },
    // the figure in the live feed, there from the moment the camera stops
    {
      parent: 'phone',
      tilt: FACE,
      a: FIGURE,
      p: facePoint(...FIGURE),
      s: popScale(SPOT + 2, CLEAR + 2),
      shapes: [
        { d: pill(FIGURE[0] - 18, FIGURE[1] - 4, 36, 30), fill: 'deep' },
        { d: ellipse(FIGURE[0], FIGURE[1] - 18, 12), fill: 'deep' },
      ],
    },
    // the alert banner unfolds out of the notch and folds back into it
    {
      parent: 'phone',
      tilt: FACE,
      clip: 'screen',
      a: NOTCH,
      p: facePoint(...NOTCH),
      ip: ALERT,
      op: FOLD + FOLD_LEN + 1,
      s: outAndBack<Vec>([18, 8], [100, 100], ALERT, ALERT_LEN, FOLD, FOLD_LEN),
      shapes: [
        { d: rect(-62, -118, 124, 60, 16), fill: 'white', depth: 0.3 },
        { d: rect(-52, -108, 40, 40, 11), fill: 'hot', depth: 0.3 },
        { d: line([-32, -100], [-32, -86]), line: 6 },
        { d: ellipse(-32, -77, 3.5), fill: 'ink', line: false },
        { d: line([-2, -98], [46, -98]) },
        { d: line([-2, -80], [24, -80]) },
      ],
    },
    { parent: 'phone', tilt: FACE, shapes: [{ d: pill(-24, -131, 48, 13), fill: 'ink', line: false }] },
    wave('root', PHONE, 118, LAND - 2, -64, -24),
    glow('root', [176, -60], 20, popIn(LAND + 2, FOLD - 8)),
  ],
}

export default securityCamera
