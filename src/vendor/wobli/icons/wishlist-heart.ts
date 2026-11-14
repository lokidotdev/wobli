// Wishlist Heart
import { ellipse, line, pill, poly, rect } from '../engine.ts'
import { glint } from '../motions.ts'
import { CURSOR, EXT, FACE, LINE, facePoint, glow, outAndBack, popIn, popScale } from '../parts.ts'
import type { Icon, Shape, Vec } from '../engine.ts'

// The pointer glides in to the heart on the product card and presses it: the button sinks under it and the card gives a little
// on the same frame, the heart fills hot and a burst of rays swells out round it. The pointer leaves the way it came; after the
// hold the heart empties back into its outline.
const HEART = 'M0 92C-24 74 -132 8 -132 -48C-132 -94 -98 -122 -62 -122C-34 -122 -12 -106 0 -84C12 -106 34 -122 62 -122C98 -122 132 -94 132 -48C132 8 24 74 0 92Z'
// grows a path of plain x y pairs about the origin and moves it to c
const place = (d: string, k: number, [cx, cy]: Vec) =>
  d.replace(/(-?\d+\.?\d*) (-?\d+\.?\d*)/g, (_, x: string, y: string) => `${+(cx + +x * k).toFixed(2)} ${+(cy + +y * k).toFixed(2)}`)
const TEE = poly(
  ([[-34, -58], [-12, -58], [0, -48], [12, -58], [34, -58], [62, -30], [46, -10], [34, -20], [34, 50], [-34, 50], [-34, -20], [-46, -10], [-62, -30]] as const).map(([x, y]): Vec => [x - 24, y - 34]),
  4,
)

const LIKE: Vec = [56, -100] // the heart button's centre on the card
const TIP = facePoint(LIKE[0] + 12, LIKE[1] + 14) // the pointer's tip on the button
const FROM: Vec = [176, 70] // where the pointer comes from, off the card's right side
const PUSH: Vec = [-1.3, 6] // a third of the extrusion: the button sinks along its own side
const GLIDE = 4 // the pointer sets off
const TAP = 30 // the button goes down: the heart fills on this frame
const LEAVE = 116
const EMPTY = 140 // the heart pops away after the hold

const wishlistHeart: Icon = {
  name: 'wishlist-heart',
  frames: 180,
  still: 64,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [262, 262], m: { p: outAndBack<Vec>([0, 0], [2, 5], TAP - 4, 4, TAP, 16) }, shapes: [] },
    {
      id: 'card',
      parent: 'root',
      tilt: FACE,
      shapes: [
        { d: rect(-100, -140, 200, 280, 22), fill: 'white', depth: 1 },
        { d: rect(-82, -122, 164, 150, 14), fill: 'tint' },
        { d: TEE, fill: 'main', depth: 0.3 },
        { d: line([-80, 56], [30, 56]) },
        { d: line([-80, 78], [-10, 78]) },
        { d: pill(-82, 96, 72, 26), fill: 'deep', depth: 0.3 },
      ],
    },
    {
      id: 'button',
      parent: 'card',
      a: LIKE,
      p: LIKE,
      m: { p: outAndBack<Vec>([0, 0], PUSH, TAP - 4, 4, TAP, 10) },
      shapes: [{ d: ellipse(LIKE[0], LIKE[1], 30), fill: 'white', depth: 0.5 }, { d: place(HEART, 0.15, [LIKE[0], LIKE[1] + 2]) }],
    },
    {
      parent: 'card',
      a: LIKE,
      p: LIKE,
      m: glint(TAP + 2, 100),
      shapes: Array.from({ length: 8 }, (_, i): Shape => {
        const t = (i * Math.PI) / 4 + Math.PI / 8
        return { d: line([LIKE[0] + Math.cos(t) * 42, LIKE[1] + Math.sin(t) * 42], [LIKE[0] + Math.cos(t) * 62, LIKE[1] + Math.sin(t) * 62]), line: 6, round: true }
      }),
    },
    {
      parent: 'button',
      a: LIKE,
      p: LIKE,
      m: popIn(TAP, EMPTY),
      shapes: [{ d: place(HEART, 0.15, [LIKE[0], LIKE[1] + 2]), fill: 'hot', depth: 0.4, edges: [[LIKE[0], LIKE[1] + 15.8]] }],
    },
    {
      parent: 'root',
      m: { p: outAndBack<Vec>(FROM, TIP, GLIDE, TAP - 4 - GLIDE, LEAVE, 26), s: popScale(0, LEAVE + 10) },
      shapes: [{ d: CURSOR(0, 0), fill: 'white', depth: 0.5 }],
    },
    glow('root', [150, -170], 24, popIn(TAP + 6, 120)),
    glow('root', [-160, -70], 16, popIn(TAP + 12, 126)),
  ],
}

export default wishlistHeart
