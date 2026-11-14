// Video Doorbell
import { ellipse, line, pill, rect, spark } from '../engine.ts'
import { wiggle } from '../motions.ts'
import { EXT, FACE, LINE, PHONE_SCREEN, buzz, facePoint, glow, outAndBack, phoneBody, popIn, popScale, wave } from '../parts.ts'
import type { Icon, Track, Vec } from '../engine.ts'

// A finger slides onto the doorbell and presses its button, which sinks under it. On the release the ring around the button
// lights, a chime ripples out and the phone buzzes; the visitor rises into the live feed on its screen, waves a beat later, and
// the green answer button pops up under them. After the hold the visitor sinks back out of the feed, the answer button and
// the light go out, the way they came.
const PRESS = 30 // the finger presses the button
const RING = PRESS + 6 // released: the ring lights and the chime goes out
const GLIDE = 20 // frames the finger takes to reach the button
const VISITOR = RING + 6 // the visitor rises into the feed
const RISE = 20
const WAVE = VISITOR + RISE - 6 // the visitor's hand waves
const LEAVE = 132 // the visitor sinks back out of the feed
const CLEAR = LEAVE + 8 // the answer button and the light go out

// the doorbell on the leaned face: lens at the top, button below
const BELL: Vec = [-104, -24]
const LENS: Vec = [0, -74]
const BUTTON: Vec = [0, 62]
const PUSH: Vec = [-1.5, 7] // the button sinks along its own side under the press
const FROM: Vec = [96, 22] // where the finger comes from, off the doorbell's right side

// the phone, the feed on its screen and the visitor in it
const PHONE: Vec = [112, 70]
const HEAD: Vec = [-10, -34]
const HAND: Vec = [32, -6] // the hand's wrist, where it pivots
const ANSWER: Vec = [0, 86]

const press = (down: number): Track<Vec> => outAndBack<Vec>([0, 0], PUSH, down, 5, down + 6, 6)

const videoDoorbell: Icon = {
  name: 'video-doorbell',
  frames: 180,
  still: 100,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [244, 250], shapes: [] },

    // the doorbell: a dark bezel, the white body, the lens and the button's ring
    { id: 'bell', parent: 'root', p: BELL, s: [86, 86], shapes: [] },
    {
      parent: 'bell',
      tilt: FACE,
      shapes: [
        { d: rect(-60, -140, 120, 280, 60), fill: 'deep', depth: 0.5 },
        { d: rect(-48, -128, 96, 256, 48), fill: 'white', depth: 1 },
        { d: ellipse(LENS[0], LENS[1], 28), fill: 'deep', depth: 0.6 },
        { d: ellipse(LENS[0], LENS[1], 13), fill: 'grey', depth: 0.3 },
        { d: spark(LENS[0] - 8, LENS[1] - 8, 7), fill: 'white', line: 3 },
        { d: line([-18, -14], [18, -14]) },
        { d: line([-18, 4], [18, 4]) },
        { d: ellipse(BUTTON[0], BUTTON[1], 36), fill: 'grey', depth: 0.3 },
      ],
    },
    // the ring lights on the release
    {
      parent: 'bell',
      tilt: FACE,
      a: BUTTON,
      p: facePoint(...BUTTON),
      s: popScale(RING, CLEAR),
      shapes: [{ d: ellipse(BUTTON[0], BUTTON[1], 36), fill: 'main', depth: 0.3 }],
    },
    // the button sinks under the finger
    { parent: 'bell', tilt: FACE, p: press(PRESS), shapes: [{ d: ellipse(BUTTON[0], BUTTON[1], 25), fill: 'white', depth: 0.6 }] },
    // the finger slides in from the right, presses with the button and slides back out
    {
      parent: 'bell',
      tilt: FACE,
      a: BUTTON,
      p: facePoint(...BUTTON),
      ip: PRESS - GLIDE - 4,
      op: PRESS + 52,
      m: [{ p: outAndBack<Vec>(FROM, [0, 0], PRESS - GLIDE, GLIDE - 2, PRESS + 16, 20) }, { p: press(PRESS) }, { s: popScale(PRESS - GLIDE - 4, PRESS + 22) }],
      shapes: [
        { d: pill(BUTTON[0] - 14, BUTTON[1] - 16, 104, 32), fill: 'white', depth: 0.6 },
        { d: rect(BUTTON[0] - 6, BUTTON[1] - 10, 20, 20, 7), fill: 'grey' },
        { d: rect(BUTTON[0] + 72, BUTTON[1] - 24, 70, 70, 26), fill: 'white', depth: 0.8 },
        { d: line([BUTTON[0] + 76, BUTTON[1] + 20], [BUTTON[0] + 100, BUTTON[1] + 20]), line: 4 },
        { d: line([BUTTON[0] + 76, BUTTON[1] + 34], [BUTTON[0] + 96, BUTTON[1] + 34]), line: 4 },
      ],
    },
    wave('root', [BELL[0] + facePoint(...BUTTON)[0] * 0.86, BELL[1] + facePoint(...BUTTON)[1] * 0.86], 70, RING - 2),

    // the phone: buzzes on the frame the chime goes out
    { id: 'phone', parent: 'root', p: PHONE, s: [64, 64], m: buzz(RING + 2, 3), shapes: [] },
    { parent: 'phone', tilt: FACE, shapes: phoneBody(32, 'deep') },
    { parent: 'phone', tilt: FACE, shapes: [{ d: PHONE_SCREEN(22), fill: 'tint' }] },
    { id: 'feed', parent: 'phone', tilt: FACE, shapes: [{ d: rect(-56, -110, 112, 150, 16), fill: 'main', depth: 0.3 }] },
    // the visitor rises into the feed and sinks back out of it
    {
      id: 'visitor',
      parent: 'phone',
      tilt: FACE,
      p: outAndBack<Vec>([0, 120], [0, 0], VISITOR, RISE, LEAVE, RISE),
      shapes: [],
    },
    {
      parent: 'visitor',
      clip: 'feed',
      a: HAND,
      p: HAND,
      m: { ...wiggle, at: WAVE, k: 1.4 },
      shapes: [
        { d: rect(HAND[0] - 7, HAND[1] - 20, 14, 26, 5), fill: 'white' },
        { d: ellipse(HAND[0] - 13, HAND[1] - 26, 6), fill: 'white' },
        { d: rect(HAND[0] - 12, HAND[1] - 50, 24, 34, 11), fill: 'white' },
        { d: line([HAND[0] - 3, HAND[1] - 48], [HAND[0] - 3, HAND[1] - 36]), line: 3 },
        { d: line([HAND[0] + 4, HAND[1] - 48], [HAND[0] + 4, HAND[1] - 36]), line: 3 },
      ],
    },
    {
      parent: 'visitor',
      clip: 'feed',
      shapes: [
        { d: `M${HEAD[0] - 40} 40A40 36 0 0 1 ${HEAD[0] + 40} 40Z`, fill: 'white' },
        { d: ellipse(HEAD[0], HEAD[1], 24), fill: 'white' },
        { d: ellipse(HEAD[0] - 8, HEAD[1] - 2, 3.5), fill: 'ink', line: false },
        { d: ellipse(HEAD[0] + 8, HEAD[1] - 2, 3.5), fill: 'ink', line: false },
        { d: `M${HEAD[0] - 8} ${HEAD[1] + 9}Q${HEAD[0]} ${HEAD[1] + 15} ${HEAD[0] + 8} ${HEAD[1] + 9}`, line: 3, round: true },
      ],
    },
    // the answer button pops up under the feed once the visitor is in
    {
      parent: 'phone',
      tilt: FACE,
      a: ANSWER,
      p: facePoint(...ANSWER),
      s: popScale(VISITOR + 10, CLEAR - 6),
      shapes: [
        { d: pill(-44, 68, 88, 36), fill: 'ok', depth: 0.4 },
        { d: line([-12, 86], [12, 86]), line: 6 },
      ],
    },
    { parent: 'phone', tilt: FACE, shapes: [{ d: pill(-24, -131, 48, 13), fill: 'ink', line: false }] },
    glow('root', [196, -62], 20, popIn(WAVE + 6, LEAVE - 8)),
  ],
}

export default videoDoorbell
