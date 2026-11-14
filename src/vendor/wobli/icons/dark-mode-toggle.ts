// Dark Mode Toggle
import { ellipse, line, pill, rect } from '../engine.ts'
import { EXT, FACE, LINE, glow, outAndBack, outIn, popIn } from '../parts.ts'
import type { Icon, Layer, Shape, Vec } from '../engine.ts'

// The switch under the card flips: its knob rolls across, the sun on it shrinks away and a moon pops up in its place, and the
// track fills from under the knob. A beat behind the knob the night spreads over the card from the switch outward, and two
// stars come out. After the hold it all goes home the way it came: the night shrinks back into the switch, then the knob rolls home.
const FLIP = 16 // the knob starts across
const FLIP_LEN = 24
const NIGHT = FLIP + 8 // the dark grows out of the switch, behind the knob
const NIGHT_LEN = 36
const DAWN = 116 // the dark shrinks back into the switch
const HOME = DAWN + 14 // then the knob rolls home
const ROLL = 120 // degrees the knob turns on its way across

const TRACK = { x: 8, y: 92, w: 156, h: 72 }
const KNOB_R = 30
const KNOB: Vec = [TRACK.x + TRACK.h / 2, TRACK.y + TRACK.h / 2]
const TRAVEL = TRACK.w - TRACK.h
const KNOB_ON: Vec = [KNOB[0] + TRAVEL, KNOB[1]]
const SCREEN = rect(-104, -150, 208, 270, 16)

// a sun on the knob: a gold disc and eight short ink rays
const SUN: ReadonlyArray<Shape> = [
  // eight spaced rays round a small disc, so it reads as a sun and not a cog
  { d: ellipse(KNOB[0], KNOB[1], 9), fill: 'gold' },
  ...Array.from({ length: 8 }, (_, i): Shape => {
    const t = (i * Math.PI) / 4
    const at = (r: number): Vec => [KNOB[0] + Math.cos(t) * r, KNOB[1] + Math.sin(t) * r]
    return { d: line(at(15), at(21)), line: 4 }
  }),
]

// a crescent moon on the knob, its bite toward the upper right
const MOON = ((): string => {
  const [R, r] = [17, 15]
  const tip = (deg: number) => {
    const t = (deg * Math.PI) / 180
    return `${(KNOB[0] + Math.cos(t) * R).toFixed(2)} ${(KNOB[1] + Math.sin(t) * R).toFixed(2)}`
  }
  return `M${tip(-100)}A${R} ${R} 0 1 0 ${tip(10)}A${r} ${r} 0 0 1 ${tip(-100)}Z`
})()

const KNOB_MOVE = {
  p: outAndBack<Vec>([0, 0], [TRAVEL, 0], FLIP, FLIP_LEN, HOME),
  r: outAndBack(0, ROLL, FLIP, FLIP_LEN, HOME),
}

const darkModeToggle: Icon = {
  name: 'dark-mode-toggle',
  frames: 180,
  still: 96,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [236, 262], shapes: [] },
    {
      id: 'card',
      parent: 'root',
      tilt: FACE,
      shapes: [{ d: rect(-124, -172, 248, 316, 30), fill: 'main', depth: 1 }],
    },
    { id: 'screen', parent: 'card', shapes: [{ d: SCREEN, fill: 'white', depth: 0.2 }] },
    // the night: one dark disc swelling out of the switch, masked to the screen
    {
      parent: 'card',
      clip: 'screen',
      a: KNOB_ON,
      p: KNOB_ON,
      s: outAndBack<Vec>([0, 0], [100, 100], NIGHT, NIGHT_LEN, DAWN, NIGHT_LEN),
      shapes: [{ d: ellipse(KNOB_ON[0], KNOB_ON[1], 360), fill: 'ink', line: false }],
    },
    // the card's content, which reads on either background
    {
      parent: 'card',
      shapes: [
        { d: ellipse(-66, -112, 20), fill: 'tint', depth: 0.3 },
        { d: pill(-36, -124, 104, 12), fill: 'grey', depth: 0.2 },
        { d: pill(-36, -104, 66, 12), fill: 'grey', depth: 0.2 },
        { d: rect(-84, -76, 168, 84, 12), fill: 'tint', depth: 0.3 },
        { d: pill(-84, 28, 140, 12), fill: 'grey', depth: 0.2 },
        { d: pill(-84, 50, 92, 12), fill: 'grey', depth: 0.2 },
      ],
    },
    // the switch, standing proud of the card's corner; the on colour grows out from under the knob
    {
      parent: 'card',
      shapes: [
        { d: pill(TRACK.x, TRACK.y, TRACK.w, TRACK.h), fill: 'grey', depth: 0.7 },
        {
          d: outAndBack(pill(KNOB[0] - 20, KNOB[1] - 20, 40, 40), pill(TRACK.x, TRACK.y, TRACK.w, TRACK.h), FLIP, FLIP_LEN, HOME),
          fill: 'deep',
          depth: 0.7,
        },
      ],
    },
    { id: 'knob', parent: 'card', a: KNOB, p: KNOB, m: KNOB_MOVE, shapes: [{ d: ellipse(KNOB[0], KNOB[1], KNOB_R), fill: 'white', depth: 0.6 }] },
    { parent: 'knob', a: KNOB, p: KNOB, m: outIn(FLIP + 4, HOME + 10), shapes: SUN },
    { parent: 'knob', a: KNOB, p: KNOB, r: -ROLL, m: popIn(FLIP + 12, HOME + 2), shapes: [{ d: MOON, fill: 'gold' }] },
    glow('root', [-132, -188], 22, popIn(NIGHT + 24, DAWN - 4)),
    glow('root', [168, -96], 16, popIn(NIGHT + 30, DAWN)),
  ],
}

export default darkModeToggle
