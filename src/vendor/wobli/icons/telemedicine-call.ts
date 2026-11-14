// Telemedicine Call
import { ellipse, line, poly, rect } from '../engine.ts'
import { EXT, FACE, LINE, PHONE_SCREEN, buzz, facePoint, glow, outAndBack, phoneBody, popIn, wave } from '../parts.ts'
import type { Icon, Shape, Track, Vec } from '../engine.ts'

// The call connects: the phone buzzes and the self view pops in over the doctor's video. The stethoscope badge on the corner
// beats twice, lub then dub, with a ripple on the first beat, and the doctor nods a beat later. A sparkle lands, then a long
// still hold on the call before the self view folds away for the next loop.
const CONNECT = 10
const LUB = 34
const DUB = LUB + 16
const NOD = LUB + 6
const CLOSE = 146

const BADGE: Vec = [74, -124] // the stethoscope badge, over the phone's top right corner
const SELF: Vec = [-44, -100] // centre of the self view tile
const HEAD: Vec = [0, -34]

// a heartbeat: swells on the soft ease and comes home on its mirror
const thump = (t: number, k = 124): Track<Vec> => outAndBack<Vec>([100, 100], [k, k], t, 4, t + 4, 8)

// the stethoscope, ink on the badge: ear tips, the U of the tubes, the tube down to the chest piece
const stethoscope = ([x, y]: Vec): ReadonlyArray<Shape> => [
  { d: `M${x - 13} ${y - 17}L${x - 13} ${y - 4}A13 13 0 0 0 ${x + 13} ${y - 4}L${x + 13} ${y - 17}`, line: 4, round: true },
  { d: `M${x} ${y + 9}C${x} ${y + 22} ${x + 16} ${y + 22} ${x + 16} ${y + 9}`, line: 4, round: true },
  { d: ellipse(x + 16, y + 3, 7), fill: 'white', line: 4 },
  { d: ellipse(x - 13, y - 19, 3.5), fill: 'ink', line: false },
  { d: ellipse(x + 13, y - 19, 3.5), fill: 'ink', line: false },
]

const telemedicineCall: Icon = {
  name: 'telemedicine-call',
  frames: 180,
  still: 100,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [248, 262], m: buzz(CONNECT, 3), shapes: [] },
    { parent: 'root', tilt: FACE, shapes: phoneBody() },
    { id: 'screen', parent: 'root', tilt: FACE, shapes: [{ d: PHONE_SCREEN(), fill: 'tint' }] },
    // the doctor's video: white coat over main scrubs, a red cross on the pocket
    {
      parent: 'screen',
      clip: 'screen',
      shapes: [
        { d: 'M-66 140L-66 60C-66 24 -40 10 0 10C40 10 66 24 66 60L66 140Z', fill: 'white', depth: 0.25 },
        { d: poly([[-18, 12], [18, 12], [0, 44]], 3), fill: 'main' },
        { d: line([-18, 12], [-8, 90]) },
        { d: line([18, 12], [8, 90]) },
        { d: rect(28, 48, 22, 20, 4), fill: 'hot' },
        { d: line([39, 52], [39, 64]), line: 3 },
        { d: line([33, 58], [45, 58]), line: 3 },
      ],
    },
    {
      parent: 'screen',
      p: outAndBack<Vec>([0, 0], [0, 7], NOD, 7, NOD + 9, 10),
      shapes: [
        { d: ellipse(HEAD[0], HEAD[1], 30, 32), fill: 'white', depth: 0.25 },
        { d: `M-30 ${HEAD[1] - 4}C-30 -82 30 -82 30 ${HEAD[1] - 4}C14 -58 -14 -58 -30 ${HEAD[1] - 4}Z`, fill: 'deep' },
      ],
    },
    // call controls: mic, hang up, camera
    {
      parent: 'screen',
      shapes: [
        { d: rect(-62, 96, 124, 30, 15), fill: 'white', depth: 0.3 },
        { d: rect(-20, 101, 40, 20, 10), fill: 'hot', depth: 0.2 },
        { d: ellipse(-44, 111, 6), fill: 'deep', line: false },
        { d: ellipse(44, 111, 6), fill: 'deep', line: false },
      ],
    },
    // the self view pops in as the call connects
    {
      parent: 'root',
      tilt: FACE,
      a: SELF,
      p: facePoint(...SELF),
      m: popIn(CONNECT + 4, CLOSE),
      shapes: [
        { d: rect(SELF[0] - 18, SELF[1] - 26, 36, 52, 8), fill: 'main', depth: 0.3 },
        { d: `M${SELF[0] - 13} ${SELF[1] + 26}A13 11 0 0 1 ${SELF[0] + 13} ${SELF[1] + 26}Z`, fill: 'white', line: 4 },
        { d: ellipse(SELF[0], SELF[1] + 2, 8), fill: 'white', line: 4 },
      ],
    },
    wave('root', facePoint(...BADGE), 58, LUB, -70, -20),
    {
      parent: 'root',
      tilt: FACE,
      a: BADGE,
      p: facePoint(...BADGE),
      s: [...thump(LUB), ...thump(DUB, 116)],
      shapes: [{ d: ellipse(BADGE[0], BADGE[1], 32), fill: 'hot', depth: 0.6 }, ...stethoscope(BADGE)],
    },
    glow('root', [-146, -150], 22, popIn(DUB + 6, CLOSE - 26)),
  ],
}

export default telemedicineCall
