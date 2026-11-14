// Team Invite
import { ellipse, line } from '../engine.ts'
import { EXT, FACE, LINE, glow, outAndBack, popIn, popScale } from '../parts.ts'
import type { Icon, Layer, Shape, Track, Vec } from '../engine.ts'

// The plus button is pressed and the first teammate grows out of it, sliding up to its seat beside the host, who makes room
// on the frame it arrives; a second press brings the second teammate to the other side, with a sparkle on the full group.
// After a long hold they go back into the plus the way they came, last in first out.
const HOST: Vec = [0, 30]
const PLUS: Vec = [78, 100]
const SEATS: ReadonlyArray<Vec> = [[-64, -100], [54, -128]]
const PRESS = [8, 40] // the plus is pressed
const JOIN = [14, 46] // a teammate grows out of the plus
const TRAVEL = 30 // plus to seat
const LEAVE = [146, 126] // a teammate heads home, the last one in first
const HOME_LEN = 22

// an avatar disc: slab body, raised white head and shoulders
const avatar = (r: number, fill: Shape['fill']): ReadonlyArray<Shape> => [
  { d: ellipse(0, 0, r), fill, depth: 1 },
  { d: ellipse(0, -r * 0.24, r * 0.3), fill: 'white', depth: 0.3 },
  { d: `M${-r * 0.56} ${r * 0.62}A${r * 0.56} ${r * 0.46} 0 0 1 ${r * 0.56} ${r * 0.62}Z`, fill: 'white', depth: 0.3 },
]

const teammate = (seat: Vec, i: number): Layer => {
  const from: Vec = [PLUS[0] - seat[0], PLUS[1] - seat[1]]
  const pos: Track<Vec> = outAndBack<Vec>(from, [0, 0], JOIN[i], TRAVEL, LEAVE[i], HOME_LEN)
  return {
    parent: 'face',
    p: seat,
    m: { p: pos, s: popScale(JOIN[i] - 4, LEAVE[i] + 2) },
    shapes: avatar(56, 'deep'),
  }
}

// the host makes room as each teammate lands, away from the side it lands on
const room = (i: number): Track<Vec> => {
  const arrive = JOIN[i] + TRAVEL - 6
  return outAndBack<Vec>([0, 0], [i ? -6 : 6, 3], arrive, 8, arrive + 12, 14)
}

const teamInvite: Icon = {
  name: 'team-invite',
  frames: 180,
  still: 100,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [256, 288], shapes: [] },
    { id: 'face', parent: 'root', tilt: FACE, shapes: [] },
    ...SEATS.map(teammate),
    { parent: 'face', p: HOST, m: [{ p: room(0) }, { p: room(1) }], shapes: avatar(74, 'main') },
    { parent: 'face', p: PLUS, shapes: [{ d: ellipse(0, 0, 34), fill: 'deep', depth: 0.5 }] },
    {
      parent: 'face',
      p: PLUS,
      m: PRESS.map((t) => ({ p: outAndBack<Vec>([0, 0], [2, 7], t, 5, t + 8, 9) })),
      shapes: [
        { d: ellipse(0, -8, 31), fill: 'white', depth: 0.45 },
        { d: line([-13, -8], [13, -8]), line: 8 },
        { d: line([0, -21], [0, 5]), line: 8 },
      ],
    },
    glow('root', [-100, -150], 22, popIn(JOIN[1] + TRAVEL, 96)),
  ],
}

export default teamInvite
