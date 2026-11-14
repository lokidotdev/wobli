// Device Restart
import { arc, ellipse, line, pill, rect } from '../engine.ts'
import { IN, POP, SNAP, SOFT } from '../motions.ts'
import { EXT, FACE, LINE, PHONE_SCREEN, buzz, glow, outAndBack, phoneBody, popIn, popScale } from '../parts.ts'
import type { Icon, Layer, Shape, Track, Vec } from '../engine.ts'

// The side key is pressed and the power icon on the dark screen dips under it, then shrinks away into a spinner that turns
// twice. The spinner folds into the middle as the screen lights up out of it with a buzz, and the home screen's apps pop in.
// After a long hold the apps go, the light shrinks back to the middle and the power icon comes back where it was.
const PRESS = 10 // the side key goes in
const PRESS_LEN = 8
const RELEASE = 20
const SPIN_IN = 30 // the spinner grows out of the power icon
const SPIN_OUT = 80
const LIGHT = 86 // the screen lights up out of the spinner
const APPS = 98 // the apps pop in, one after another
const OFF = 140 // the apps go, then the light
const DARK = 148
const POWER_BACK = 150

const KEY: Vec = [-6, 0] // how far the side key goes into the body, along the face
const SCREEN_MID: Vec = [0, -6]

// the power icon dips with the key, then shrinks into the spinner; it pops back once the screen is dark
const POWER_SCALE: Track<Vec> = [
  [PRESS, [100, 100], SOFT],
  [PRESS + PRESS_LEN, [86, 86], 0],
  [RELEASE + 4, [86, 86], IN],
  [SPIN_IN + 8, [0, 0], 0],
  [POWER_BACK, [0, 0], POP],
  [POWER_BACK + 10, [110, 110], POP],
  [POWER_BACK + 30, [100, 100]],
]

// the power glyph: a white disc with the broken ring and its stem
const power = ([x, y]: Vec): ReadonlyArray<Shape> => [
  { d: ellipse(x, y, 44), fill: 'white', depth: 0.3 },
  { d: arc(x, y, 22, -55, 235), line: 7, round: true },
  { d: line([x, y - 30], [x, y - 6]), line: 7, round: true },
]

// the spinner: eight white dots round the middle, growing along the way it turns
const SPINNER: ReadonlyArray<Shape> = Array.from({ length: 8 }, (_, i): Shape => {
  const a = (i / 8) * Math.PI * 2
  return { d: ellipse(SCREEN_MID[0] + Math.cos(a) * 34, SCREEN_MID[1] + Math.sin(a) * 34, 5 + i), fill: 'white', line: 4 }
})

// the home screen: a clock bar and a grid of apps, each popping in from its own centre
const APP_COLOURS = ['main', 'white', 'main', 'white', 'main', 'white', 'main', 'white', 'main'] as const
const app = (i: number): Layer => {
  const c: Vec = [-44 + (i % 3) * 44, -50 + Math.floor(i / 3) * 44]
  return {
    parent: 'face',
    clip: 'screen',
    a: c,
    p: c,
    m: popIn(APPS + i * 2, OFF + i),
    shapes: [{ d: rect(c[0] - 17, c[1] - 17, 34, 34, 10), fill: APP_COLOURS[i], depth: 0.3 }],
  }
}

const deviceRestart: Icon = {
  name: 'device-restart',
  frames: 180,
  still: 130,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [256, 252], s: [114, 114], shapes: [] },
    { id: 'phone', parent: 'root', m: buzz(LIGHT, 2.5), shapes: [] },
    { id: 'face', parent: 'phone', tilt: FACE, shapes: [] },
    // the side key, behind the body so it sinks into it
    {
      parent: 'face',
      p: outAndBack<Vec>([0, 0], KEY, PRESS, PRESS_LEN, RELEASE),
      shapes: [{ d: rect(76, -96, 16, 54, 5), fill: 'deep', depth: 0.9 }],
    },
    { parent: 'face', shapes: phoneBody(32, 'deep') },
    { id: 'screen', parent: 'face', shapes: [{ d: PHONE_SCREEN(22), fill: 'ink' }] },
    // the light, swelling out of the middle and shrinking back into it
    {
      parent: 'face',
      clip: 'screen',
      a: SCREEN_MID,
      p: SCREEN_MID,
      s: popScale(LIGHT, DARK),
      shapes: [{ d: ellipse(SCREEN_MID[0], SCREEN_MID[1], 176), fill: 'tint', line: false }],
    },
    {
      parent: 'face',
      clip: 'screen',
      a: [0, -104],
      p: [0, -104],
      m: popIn(APPS - 4, OFF - 2),
      shapes: [{ d: pill(-38, -112, 76, 16), fill: 'ink', line: false }],
    },
    ...Array.from({ length: 9 }, (_, i) => app(i)),
    { parent: 'face', a: SCREEN_MID, p: SCREEN_MID, s: POWER_SCALE, shapes: power(SCREEN_MID) },
    {
      parent: 'face',
      a: SCREEN_MID,
      p: SCREEN_MID,
      r: [[SPIN_IN, 0, SNAP], [SPIN_OUT + 20, 720]],
      m: popIn(SPIN_IN, SPIN_OUT),
      shapes: SPINNER,
    },
    glow('root', [128, -158], 22, popIn(LIGHT + 4, OFF - 10)),
    glow('root', [-132, -96], 15, popIn(LIGHT + 10, OFF - 4)),
  ],
}

export default deviceRestart
