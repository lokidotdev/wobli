// Camera Capture
import { ellipse, line, pill, poly, rect, spark } from '../engine.ts'
import { EXT, FACE, LINE, facePoint, glow, hit, outAndBack, popIn, popScale, wave } from '../parts.ts'
import type { Icon, Vec } from '../engine.ts'

// The shutter button sinks under a press and the body takes the click; on the same beat the flash bursts and the lens iris
// snaps shut and open. The photo slides out of the slot underneath and its picture develops, sun first, then the hill.
// After a long hold the picture fades back to blank and the photo slides home into the camera the way it came.
const LENS: Vec = [30, 8]
const FLASH: Vec = [-104, -62]

const PRESS = 8 // the button goes down
const CLICK = PRESS + 8 // it bottoms out: the shutter fires, the flash bursts
const EJECT = 30 // the photo starts out of the slot
const EJECT_LEN = 30
const DEVELOP = EJECT + EJECT_LEN - 4 // the picture appears
const CLEAR = 118 // the picture goes blank
const RETRACT = 140 // the photo slides home
const RETRACT_LEN = 24

const cameraCapture: Icon = {
  name: 'camera-capture',
  frames: 180,
  still: 96,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [248, 200], s: [84, 84], shapes: [] },
    // the photo, tucked behind the body, slides down out of the slot and home again along the same path
    {
      id: 'photo',
      parent: 'root',
      tilt: FACE,
      p: outAndBack<Vec>([0, 0], [0, 168], EJECT, EJECT_LEN, RETRACT, RETRACT_LEN),
      shapes: [
        { d: rect(-80, -60, 160, 156, 8), fill: 'white', depth: 0.25 },
        { d: rect(-64, -44, 128, 102, 4), fill: 'tint' },
      ],
    },
    { parent: 'photo', a: [-30, -16], p: [-30, -16], s: popScale(DEVELOP, CLEAR), shapes: [{ d: ellipse(-30, -16, 15), fill: 'gold' }] },
    {
      parent: 'photo',
      a: [10, 58],
      p: [10, 58],
      s: popScale(DEVELOP + 5, CLEAR + 4),
      shapes: [{ d: poly([[-64, 58], [-18, 6], [14, 34], [34, 16], [64, 50], [64, 58]], [0, 6, 4, 6, 0, 0]), fill: 'main' }],
    },
    // the shutter button sits on top of the body and sinks into it
    {
      parent: 'root',
      tilt: FACE,
      p: outAndBack<Vec>([0, 0], [0, 14], PRESS, CLICK - PRESS, CLICK + 6, 12),
      shapes: [{ d: rect(84, -132, 48, 40, 8), fill: 'white', depth: 0.6 }],
    },
    {
      id: 'cam',
      parent: 'root',
      tilt: FACE,
      m: hit(CLICK, [0, 5], 0.5),
      shapes: [
        { d: rect(-64, -134, 116, 50, 12), fill: 'deep', depth: 1 },
        { d: rect(-150, -100, 300, 200, 30), fill: 'main', depth: 1 },
        { d: rect(-130, -82, 52, 40, 8), fill: 'white', depth: 0.3 },
        { d: pill(-84, 76, 168, 12), fill: 'ink', line: false },
        { d: ellipse(LENS[0], LENS[1], 76), fill: 'deep', depth: 0.8 },
        { d: ellipse(LENS[0], LENS[1], 56), fill: 'grey', depth: 0.4 },
        { d: line([96, -76], [124, -76]) },
      ],
    },
    // the iris: snaps shut on the click and opens again
    {
      parent: 'cam',
      a: LENS,
      p: LENS,
      s: outAndBack<Vec>([100, 100], [30, 30], CLICK - 2, 6, CLICK + 6, 14),
      shapes: [
        { d: ellipse(LENS[0], LENS[1], 36), fill: 'deep' },
        { d: spark(LENS[0] - 14, LENS[1] - 14, 10), fill: 'white', line: 3 },
      ],
    },
    // the flash burst, upright and centred on the flash window
    { parent: 'root', a: facePoint(...FLASH), p: facePoint(...FLASH), m: popIn(CLICK - 4, CLICK + 26), shapes: [{ d: spark(...facePoint(...FLASH), 46, 0.22), fill: 'gold' }] },
    wave('root', facePoint(...FLASH), 64, CLICK + 2, -150, -100),
    glow('root', [150, -150], 22, popIn(CLICK + 4, CLEAR - 10)),
    glow('root', [150, 230], 18, popIn(DEVELOP + 4, CLEAR)),
  ],
}

export default cameraCapture
