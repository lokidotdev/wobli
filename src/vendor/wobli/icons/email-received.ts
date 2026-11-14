// Email Received
import { ellipse, line, poly, rect } from '../engine.ts'
import { IN, SOFT, spring } from '../motions.ts'
import { EXT, FACE, LINE, facePoint, glow, popIn, popScale } from '../parts.ts'
import type { Icon, Vec } from '../engine.ts'

// An envelope pops in high on the right and swoops down on an arc, faster and faster, into the inbox tray, which takes the hit
// with the spring; the unread dot pops on the tray's corner a beat later. After a long hold the dot goes (read), the envelope is
// filed away into the tray, and the tray eases back up.
const LAND = 40 // the envelope reaches the tray
const MAIL_FROM: Vec = [96, -190]
const MAIL_AT: Vec = [0, -20]
const DOT: Vec = facePoint(150, -76)

const emailReceived: Icon = {
  name: 'email-received',
  frames: 180,
  still: 100,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [246, 296], m: { p: [...spring([2, 9], LAND, 0.8), [146, [2, 9], SOFT], [176, [0, 0]]] }, shapes: [] },
    // the tray's back wall and the mail already waiting in it
    {
      parent: 'root',
      tilt: FACE,
      shapes: [
        { d: rect(-164, -84, 328, 168, 24), fill: 'deep', depth: 1 },
        { d: rect(-144, -64, 288, 112, 12), fill: 'tint' },
        { d: rect(-116, -52, 232, 84, 8), fill: 'paper', depth: 0.3 },
        { d: line([-92, -32], [24, -32]) },
      ],
    },
    // the envelope: swoops in on an arc, filed away into the tray at the end
    {
      parent: 'root',
      tilt: FACE,
      p: [[6, MAIL_FROM, IN, [[-20, -30], [70, -40]]], [LAND, MAIL_AT]],
      r: [[6, 18, IN], [LAND, 0]],
      s: popScale(0, 140),
      shapes: [
        { d: rect(-92, -60, 184, 120, 12), fill: 'white', depth: 0.4 },
        { d: poly([[-92, -60], [92, -60], [0, 6]], [12, 12, 4]), fill: 'paper', depth: 0.15 },
        { d: ellipse(0, 2, 14), fill: 'gold', depth: 0.2 },
      ],
    },
    // the tray's front, with the inbox notch
    {
      parent: 'root',
      tilt: FACE,
      shapes: [
        { d: poly([[-164, 4], [-110, 4], [-88, 34], [88, 34], [110, 4], [164, 4], [164, 84], [-164, 84]], [10, 5, 5, 5, 5, 10, 24, 24]), fill: 'main', depth: 1 },
      ],
    },
    { parent: 'root', a: DOT, p: DOT, m: popIn(LAND + 5, 134), shapes: [{ d: ellipse(DOT[0], DOT[1], 26), fill: 'hot', depth: 0.6 }] },
    glow('root', [-186, -126], 24, popIn(LAND + 8, 124)),
  ],
}

export default emailReceived
