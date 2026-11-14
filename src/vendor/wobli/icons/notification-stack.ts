// Stacked Notifications
import { line, pill, rect } from '../engine.ts'
import { IN, SOFT, spring } from '../motions.ts'
import { EXT, FACE, LINE, PHONE_SCREEN, facePoint, glow, phoneBody, popIn } from '../parts.ts'
import type { Icon, Layer, Motion, Shape, Vec } from '../engine.ts'

// Three notification cards fall out of the top of the lock screen, faster and faster, and stack from the bottom up. The phone
// takes each landing with the spring, sinking a little further per card. After a long still hold the cards lift off on the
// mirror of the way they came, last in first out, and the phone eases home as each one leaves.
const FALL = 18
const GAP = 16 // frames between landings, and between lift-offs
const FIRST_LAND = 30
const FIRST_LIFT = 118
const HIT: Vec = [1, 3] // what one landing pushes the phone
const SCREEN_TOP = -136
const CARD_H = 48
const SLOTS = [78, 24, -30] as const // bottom slot first: the stack grows upward
const APPS = ['ok', 'main', 'hot'] as const

const lands = (i: number) => FIRST_LAND + i * GAP
const lifts = (i: number) => FIRST_LIFT + (SLOTS.length - 1 - i) * GAP // last in, first out

// the phone under one landing: springs along HIT on the frame the card touches, holds, eases home as that card lifts
const landing = (i: number): Motion => ({ p: [...spring(HIT, lands(i), 0.6), [lifts(i), HIT, SOFT], [lifts(i) + FALL, [0, 0]]] })

const card = (y: number, i: number): Layer => {
  const above = facePoint(0, SCREEN_TOP - CARD_H) // fully behind the top edge of the screen
  const slot = facePoint(0, y)
  return {
    parent: 'root',
    tilt: FACE,
    clip: 'screen',
    ip: lands(i) - FALL,
    op: lifts(i) + FALL,
    p: [[lands(i) - FALL, above, IN], [lands(i), slot, 0], [lifts(i), slot, SOFT], [lifts(i) + FALL, above]],
    shapes: [
      { d: rect(-62, -CARD_H / 2, 124, CARD_H, 12), fill: 'white', depth: 0.3 },
      { d: rect(-52, -14, 28, 28, 8), fill: APPS[i], depth: 0.2 },
      { d: line([-14, -7], [44, -7]) },
      { d: line([-14, 9], [20, 9]) },
    ] satisfies ReadonlyArray<Shape>,
  }
}

const notificationStack: Icon = {
  name: 'notification-stack',
  frames: 180,
  still: 96,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [246, 258], m: SLOTS.map((_, i) => landing(i)), shapes: [] },
    { parent: 'root', tilt: FACE, shapes: phoneBody(32, 'deep') },
    {
      id: 'screen',
      parent: 'root',
      tilt: FACE,
      shapes: [{ d: PHONE_SCREEN(22), fill: 'tint' }, { d: pill(-36, -104, 72, 24), fill: 'white' }, { d: line([-22, 122], [22, 122]), round: true }],
    },
    ...SLOTS.map(card),
    { parent: 'root', tilt: FACE, shapes: [{ d: pill(-22, -128, 44, 12), fill: 'ink', line: false }] },
    glow('root', [140, -150], 22, popIn(lands(2) + 2, 124)),
    glow('root', [-150, 40], 15, popIn(lands(2) + 8, 130)),
  ],
}

export default notificationStack
