// Do Not Disturb
import { ellipse, line, pill, rect } from '../engine.ts'
import { SOFT, twinkle } from '../motions.ts'
import { EXT, FACE, LINE, PHONE_SCREEN, facePoint, glow, outAndBack, phoneBody, popIn } from '../parts.ts'
import type { Icon, Layer, Shape, Vec } from '../engine.ts'

// A finger taps the Focus pill on the lock screen: it sinks under the tap, the dark fills out of the moon's disc across the pill
// and a gold moon pops in a beat behind. Then three notifications slide down from the top of the screen, one after another,
// and each one shrinks away before it reaches its slot; the phone never stirs. After the hold the pill empties back into the
// disc and the moon goes out, so the loop starts quiet again.
const TAP = 12 // the pill sinks under the tap
const TAP_LEN = 6
const ON = TAP + TAP_LEN // the dark grows out of the moon's disc
const ON_LEN = 24
const OFF = 146 // the dark shrinks back into the disc
const OFF_LEN = 20
const FIRST_CARD = 50
const CARD_GAP = 20 // frames between cards
const CARD_RUN = 60 // frames from behind the top edge to the slot, which no card ever reaches
const HUSH = 8 // frames into its run that a card starts shrinking away
const CARD_H = 48
const SCREEN_TOP = -136
const SLOT_Y = -10
const APPS = ['hot', 'ok', 'gold'] as const

const PILL = { x: -60, y: 62, w: 120, h: 52 }
const DISC: Vec = [PILL.x + PILL.h / 2, PILL.y + PILL.h / 2]
const DISC_R = 19

// a crescent moon on the disc, its bite toward the upper right
const MOON = ((): string => {
  const [R, r] = [13, 11.5]
  const tip = (deg: number) => {
    const t = (deg * Math.PI) / 180
    return `${(DISC[0] + Math.cos(t) * R).toFixed(2)} ${(DISC[1] + Math.sin(t) * R).toFixed(2)}`
  }
  return `M${tip(-100)}A${R} ${R} 0 1 0 ${tip(10)}A${r} ${r} 0 0 1 ${tip(-100)}Z`
})()

const arrives = (i: number) => FIRST_CARD + i * CARD_GAP

// one notification: slides down out of the top edge on SOFT and is shrunk to nothing before it can land
const card = (i: number): Layer => {
  const t = arrives(i)
  return {
    parent: 'root',
    tilt: FACE,
    clip: 'screen',
    ip: t,
    op: t + HUSH + 30,
    p: [[t, facePoint(0, SCREEN_TOP - CARD_H), SOFT], [t + CARD_RUN, facePoint(0, SLOT_Y)]],
    m: twinkle(t + HUSH, true),
    shapes: [
      { d: rect(-62, -CARD_H / 2, 124, CARD_H, 12), fill: 'white', depth: 0.3 },
      { d: rect(-52, -14, 28, 28, 8), fill: APPS[i], depth: 0.2 },
      { d: line([-14, -7], [44, -7]) },
      { d: line([-14, 9], [20, 9]) },
    ] satisfies ReadonlyArray<Shape>,
  }
}

const doNotDisturb: Icon = {
  name: 'do-not-disturb',
  frames: 180,
  still: 98,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [250, 256], shapes: [] },
    { parent: 'root', tilt: FACE, shapes: phoneBody(32, 'main') },
    {
      id: 'screen',
      parent: 'root',
      tilt: FACE,
      shapes: [{ d: PHONE_SCREEN(22), fill: 'tint' }, { d: pill(-36, -104, 72, 24), fill: 'white' }, { d: line([-22, 122], [22, 122]), round: true }],
    },
    ...[0, 1, 2].map(card),
    // the Focus pill: sinks a touch under the tap, then the dark fills it out from under the moon's disc
    {
      id: 'focus',
      parent: 'root',
      tilt: FACE,
      p: outAndBack<Vec>([0, 0], [0, 5], TAP, TAP_LEN, TAP + TAP_LEN, TAP_LEN),
      shapes: [
        { d: pill(PILL.x, PILL.y, PILL.w, PILL.h), fill: 'grey', depth: 0.6 },
        {
          d: outAndBack(pill(DISC[0] - DISC_R, DISC[1] - DISC_R, DISC_R * 2, DISC_R * 2), pill(PILL.x, PILL.y, PILL.w, PILL.h), ON, ON_LEN, OFF, OFF_LEN),
          fill: 'deep',
          depth: 0.6,
        },
        { d: ellipse(DISC[0], DISC[1], DISC_R), fill: 'white', depth: 0.3 },
        { d: pill(DISC[0] + 30, DISC[1] - 12, 46, 10), fill: 'white', depth: 0.2 },
        { d: pill(DISC[0] + 30, DISC[1] + 4, 28, 10), fill: 'white', depth: 0.2 },
      ],
    },
    // the moon pops in a beat behind the dark, and goes out just before it drains
    { parent: 'focus', a: DISC, p: DISC, m: popIn(ON + 4, OFF - 4), shapes: [{ d: MOON, fill: 'gold' }] },
    { parent: 'root', tilt: FACE, shapes: [{ d: pill(-22, -128, 44, 12), fill: 'ink', line: false }] },
    glow('root', [126, 30], 20, popIn(ON + 10, OFF - 8)),
    glow('root', [-124, -132], 15, popIn(ON + 16, OFF - 2)),
  ],
}

export default doNotDisturb
