// Employee Badge
import { ellipse, line, pill, poly, rect, ring } from '../engine.ts'
import { IN, SOFT, springTurn } from '../motions.ts'
import { EXT, FACE, LINE, checkBadge, glow, hit, popIn, wave } from '../parts.ts'
import type { Icon, Track, Vec } from '../engine.ts'

// The badge hangs on its lanyard from a wall hook. It draws back, then swings in faster and faster and taps the scanner,
// which takes the hit; the scanner beeps with a ripple, its light pops from red to green and a check lands on its screen.
// The badge swings back out through rest on the spring, each swing half the last, the card trailing the lanyard by a beat.
// After a long still hold the check clears and the light pops back to red.
const HANG: Vec = [-70, -176] // the hook the lanyard hangs from: everything swings about it
const CLIP: Vec = [-70, -34] // where the card clips onto the lanyard
const SCAN: Vec = [96, 34] // the scanner's screen centre
const LIGHT: Vec = [96, -42]

// the lanyard's two straps: a narrow band from a to b
const strap = ([ax, ay]: Vec, [bx, by]: Vec, w: number) => {
  const l = Math.hypot(bx - ax, by - ay)
  const [nx, ny] = [((by - ay) / l) * (w / 2), (-(bx - ax) / l) * (w / 2)]
  return poly([[ax + nx, ay + ny], [bx + nx, by + ny], [bx - nx, by - ny], [ax - nx, ay - ny]])
}
const TOP_L: Vec = [HANG[0] - 8, HANG[1] + 6]
const TOP_R: Vec = [HANG[0] + 8, HANG[1] + 6]
const BOT_L: Vec = [CLIP[0] - 30, CLIP[1] - 4]
const BOT_R: Vec = [CLIP[0] + 30, CLIP[1] - 4]

const DRAW = 4
const TAP = 40
const GREEN = TAP + 2
const PACE = 0.85
const CLEAR = 150
const TOUCH = -16 // the swing that reaches the scanner

const SWING: Track<number> = [[DRAW, 0, SOFT], [22, 12, IN], [TAP, TOUCH, 0], ...springTurn(0, TAP, PACE, TOUCH)]

const employeeBadge: Icon = {
  name: 'employee-badge',
  frames: 180,
  still: 120,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [244, 262], s: [108, 108], shapes: [] },
    { id: 'face', parent: 'root', tilt: FACE, shapes: [] },
    // the wall scanner: a dark body, a light above a pale screen, taking the badge's hit
    {
      id: 'scanner',
      parent: 'face',
      m: hit(TAP, [4, -2]),
      shapes: [
        { d: rect(52, -70, 88, 164, 16), fill: 'deep', depth: 1 },
        { d: rect(64, 2, 64, 64, 10), fill: 'tint', depth: 0.3 },
        { d: ellipse(LIGHT[0], LIGHT[1], 10), fill: 'hot', depth: 0.3 },
      ],
    },
    { parent: 'scanner', a: LIGHT, p: LIGHT, m: popIn(GREEN, CLEAR), shapes: [{ d: ellipse(LIGHT[0], LIGHT[1], 10), fill: 'ok', depth: 0.3 }] },
    { parent: 'scanner', a: SCAN, p: SCAN, m: popIn(GREEN + 4, CLEAR - 4), shapes: checkBadge(SCAN, 22, 0.4) },
    wave('root', [80, -10], 130, TAP - 10, -60, -10),
    // the hook on the wall
    { parent: 'face', shapes: [{ d: rect(HANG[0] - 22, HANG[1] - 16, 44, 22, 8), fill: 'white', depth: 0.6 }] },
    // the lanyard, swinging about the hook
    {
      id: 'lanyard',
      parent: 'face',
      a: HANG,
      p: HANG,
      m: { r: SWING },
      shapes: [
        { d: ring(HANG[0], HANG[1], 13, 6), fill: 'grey', depth: 0.4 },
        { d: strap(TOP_L, BOT_L, 14), fill: 'main', depth: 0.3 },
        { d: strap(TOP_R, BOT_R, 14), fill: 'main', depth: 0.3 },
        { d: rect(CLIP[0] - 12, CLIP[1] - 14, 24, 24, 6), fill: 'grey', depth: 0.5 },
      ],
    },
    // the card, trailing the lanyard about its clip
    {
      parent: 'lanyard',
      a: CLIP,
      p: CLIP,
      m: { r: SWING, at: 5, k: 0.5 },
      shapes: [
        { d: rect(CLIP[0] - 62, CLIP[1] + 4, 124, 166, 14), fill: 'white', depth: 0.6 },
        { d: rect(CLIP[0] - 62, CLIP[1] + 4, 124, 34), fill: 'main' },
        { d: pill(CLIP[0] - 16, CLIP[1] + 14, 32, 10), fill: 'white' },
        { d: rect(CLIP[0] - 28, CLIP[1] + 52, 56, 56, 10), fill: 'tint', depth: 0.3 },
        { d: ellipse(CLIP[0], CLIP[1] + 72, 11), fill: 'main' },
        { d: line([CLIP[0] - 34, CLIP[1] + 128], [CLIP[0] + 34, CLIP[1] + 128]), line: 4 },
        { d: line([CLIP[0] - 22, CLIP[1] + 146], [CLIP[0] + 22, CLIP[1] + 146]), line: 4 },
      ],
    },
    glow('root', [170, -150], 22, popIn(GREEN + 6, CLEAR - 8)),
  ],
}

export default employeeBadge
