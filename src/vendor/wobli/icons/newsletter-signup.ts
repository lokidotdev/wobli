// Newsletter Signup
import { ellipse, line, poly, rect, ring } from '../engine.ts'
import { DROP, OUT, twinkle } from '../motions.ts'
import { CURSOR, EXT, FACE, LINE, checkBadge, facePoint, glow, outAndBack, popIn, popScale, wave } from '../parts.ts'
import type { Icon, Key, Layer, Shape, Track, Vec } from '../engine.ts'

// A signup card waits with an empty email field. The address is typed in one character at a time, the caret stepping along
// behind it. The pointer glides in and clicks Subscribe: the button sinks, a ripple leaves the tip, and the address pops out of
// the field as a sealed envelope pops up out of it and is thrown up and right, all speed up front. A check pops on the card.
// After the hold the envelope flies on and is gone, the check pops away, and the card is back to its empty field.
const TYPE = 8 // the first character lands
const STEP = 5 // frames between characters
const GLIDE = 36 // the pointer sets off
const TAP = 62 // it lands on the button: the button sinks, the ripple leaves
const SEND = TAP + 2 // the address leaves the field, the envelope pops out of it
const FLY = SEND + 6 // the envelope is thrown
const ARRIVE = FLY + 40
const LEAVE_PTR = TAP + 14 // the pointer heads home
const DONE = SEND + 24 // the check pops in the emptied field
const LEAVE = 136 // the envelope flies on and away, the check pops off

// the card on the face
const CARD = { x: -160, y: -150, w: 320, h: 280 }
const FIELD = { x: -132, y: -44, w: 264, h: 58 }
const BTN = { x: -132, y: 40, w: 264, h: 60 }
const BTN_MID: Vec = [BTN.x + BTN.w / 2, BTN.y + BTN.h / 2]
const PUSH: Vec = [-1.3, 6] // the button sinks along its own side
const GIVE: Vec = [-0.4, 2.5] // the card gives a beat after it
const TAP_KNOCK: Vec = [2, 5] // the pointer presses in

// the typed address: short strokes for letters, a ring for the @, a dot before the domain
const GLYPH_Y = FIELD.y + FIELD.h / 2
type Glyph = { x: number; w: number; kind: 'letter' | 'at' | 'dot' }
const GLYPHS: ReadonlyArray<Glyph> = [
  { x: -112, w: 14, kind: 'letter' },
  { x: -88, w: 14, kind: 'letter' },
  { x: -58, w: 0, kind: 'at' },
  { x: -32, w: 14, kind: 'letter' },
  { x: -8, w: 14, kind: 'letter' },
  { x: 16, w: 14, kind: 'letter' },
  { x: 38, w: 0, kind: 'dot' },
  { x: 54, w: 14, kind: 'letter' },
  { x: 78, w: 14, kind: 'letter' },
]
const TYPED = (i: number) => TYPE + i * STEP
const glyphMid = (g: Glyph): Vec => [g.x + g.w / 2, GLYPH_Y]
const glyph = (g: Glyph): Shape =>
  g.kind === 'at'
    ? { d: ring(g.x, GLYPH_Y, 10, 4), fill: 'ink', line: false }
    : g.kind === 'dot'
      ? { d: ellipse(g.x, GLYPH_Y + 9, 5), fill: 'ink', line: false }
      : { d: rect(g.x, GLYPH_Y - 10, g.w, 20, 5), fill: 'ink', line: false }

// the caret steps along after each character, and snaps home when the address is sent
const CARET_X = (i: number) => (i < 0 ? 0 : GLYPHS[i].x + Math.max(GLYPHS[i].w, 8) + 16 - GLYPHS[0].x + 4)
const CARET: Track<Vec> = [
  [0, [0, 0], 0],
  ...GLYPHS.map((_, i): Key<Vec> => [TYPED(i), [CARET_X(i), 0], 0]),
  [SEND, [0, 0], 0],
  [180, [0, 0]],
]

const TARGET = facePoint(BTN_MID[0] + 34, BTN_MID[1] + 4) // the pointer's tip on the button, in root space
const FROM: Vec = [70, 64] // where the pointer comes in from, off the card's lower right
const FIELD_MID = facePoint(0, GLYPH_Y) // where the envelope comes from, in root space
const TRAVEL: Vec = [146, -178] // from the field to where the envelope hangs
const ONWARD: Vec = [40, -24] // the last stretch as it leaves
const BADGE: Vec = [FIELD.x + FIELD.w - 32, GLYPH_Y] // the check lands in the emptied field

// the envelope: a white body, the closed flap and its pocket folds, a stamp in the corner
const envelope: ReadonlyArray<Shape> = [
  { d: rect(-62, -40, 124, 80, 9), fill: 'white', depth: 0.6 },
  { d: line([-62, 36], [-14, -2]) },
  { d: line([62, 36], [14, -2]) },
  { d: poly([[-62, -40], [62, -40], [0, 8]], [9, 9, 6]), fill: 'main', depth: 0.25 },
]

const newsletterSignup: Icon = {
  name: 'newsletter-signup',
  frames: 180,
  still: 128,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [238, 286], shapes: [] },
    {
      id: 'card',
      parent: 'root',
      tilt: FACE,
      m: { p: outAndBack<Vec>([0, 0], GIVE, TAP - 2, 4, TAP + 2, 14) },
      shapes: [
        { d: rect(CARD.x, CARD.y, CARD.w, CARD.h, 28), fill: 'white', depth: 1 },
        // the header: a small envelope mark beside the title lines
        { d: rect(-132, -124, 62, 44, 8), fill: 'main', depth: 0.4 },
        { d: line([-132, -122], [-101, -100], [-70, -122]) },
        { d: line([-46, -112], [104, -112]) },
        { d: line([-46, -90], [56, -90]) },
        { d: rect(FIELD.x, FIELD.y, FIELD.w, FIELD.h, 14), fill: 'paper', depth: 0.3 },
      ],
    },
    // each character pops in as it is typed and out as the address is sent, last typed first gone
    ...GLYPHS.map((g, i): Layer => ({
      parent: 'card',
      a: glyphMid(g),
      p: glyphMid(g),
      s: popScale(TYPED(i), SEND + (GLYPHS.length - 1 - i) * 2),
      shapes: [glyph(g)],
    })),
    { parent: 'card', p: CARET, shapes: [{ d: line([GLYPHS[0].x - 4, GLYPH_Y - 16], [GLYPHS[0].x - 4, GLYPH_Y + 16]), line: 4 }] },
    // the button sinks under the click on the frame the pointer lands
    {
      parent: 'card',
      m: { p: outAndBack<Vec>([0, 0], PUSH, TAP - 4, 4, TAP, 12) },
      shapes: [
        { d: rect(BTN.x, BTN.y, BTN.w, BTN.h, 16), fill: 'main', depth: 0.5 },
        { d: line([BTN_MID[0] - 52, BTN_MID[1]], [BTN_MID[0] + 52, BTN_MID[1]]), line: 7, round: true },
      ],
    },
    { parent: 'card', a: BADGE, p: BADGE, s: popScale(DONE, LEAVE), shapes: checkBadge(BADGE, 21, 0.5) },
    wave('root', TARGET, 46, TAP - 8),
    // the pointer glides in to the button, clicks, and leaves along the path it came in on
    {
      parent: 'root',
      p: TARGET,
      m: [
        { p: outAndBack<Vec>(FROM, [0, 0], GLIDE, TAP - 4 - GLIDE, LEAVE_PTR, 26) },
        { p: outAndBack<Vec>([0, 0], TAP_KNOCK, TAP - 4, 4, TAP, 12) },
        { s: popScale(GLIDE - 6, LEAVE_PTR + 12) },
      ],
      shapes: [{ d: CURSOR(0, 0), fill: 'white', depth: 0.5 }],
    },
    // the envelope pops up out of the field, is thrown up and right, hangs, then flies on and is gone
    {
      id: 'carrier',
      parent: 'root',
      p: FIELD_MID,
      ip: SEND,
      op: LEAVE + 30,
      m: [
        { s: [...(twinkle(SEND).s ?? []), ...(twinkle(LEAVE, true).s ?? [])] },
        {
          p: [
            [FLY, [0, 0], OUT, [[40, -10], [-70, 40]]],
            [ARRIVE, TRAVEL, 0],
            [LEAVE, TRAVEL, DROP],
            [LEAVE + 30, [TRAVEL[0] + ONWARD[0], TRAVEL[1] + ONWARD[1]]],
          ],
          r: [[FLY, 0, OUT], [ARRIVE, -12]],
        },
      ],
      shapes: [],
    },
    { parent: 'carrier', tilt: FACE, shapes: envelope },
    glow('root', [-186, -110], 20, popIn(SEND + 2, LEAVE - 12)),
    glow('root', [FIELD_MID[0] + TRAVEL[0] - 96, FIELD_MID[1] + TRAVEL[1] - 30], 18, popIn(ARRIVE - 6, LEAVE - 6)),
  ],
}

export default newsletterSignup
