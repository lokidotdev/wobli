// Group Chat
import { ellipse, line, pill, rect } from '../engine.ts'
import { EXT, FACE, LINE, glow, popIn, popScale } from '../parts.ts'
import type { Icon, Layer, Shape, Vec } from '../engine.ts'

// A group chat card lies open. One after another, three members' avatar bubbles pop in around its edge, each with its tail
// pointing at the card, and on the same beat that member's message grows into the thread from their side. A sparkle lands on
// the last one; after a long hold the messages and avatars pop away in reverse, last in first out.
const CARD = { x: -124, y: -138, w: 248, h: 276 }
const AVATAR_R = 40
const STEP = 16 // between one member and the next
const JOIN = [10, 10 + STEP, 10 + STEP * 2] // an avatar pops in
const REPLY = 6 // its message follows this many frames later
const LEAVE = [150, 142, 134] // last in, first out
const ROW_W = 132
const ROW_H = 30

// each member: where their avatar sits, which way its tail points (degrees, y down), their colour, their message row
const MEMBERS: ReadonlyArray<{ at: Vec; tail: number; fill: Shape['fill']; side: 'left' | 'right'; y: number }> = [
  { at: [-160, -66], tail: 20, fill: 'main', side: 'left', y: -50 },
  { at: [164, 4], tail: 160, fill: 'deep', side: 'right', y: 10 },
  { at: [-156, 110], tail: -20, fill: 'gold', side: 'left', y: 70 },
]

// a round speech bubble: a circle whose tail juts out at angle `tail`
const roundBubble = (r: number, tail: number): string => {
  const rad = (d: number) => (d * Math.PI) / 180
  const at = (d: number, k = r): Vec => [Math.cos(rad(d)) * k, Math.sin(rad(d)) * k]
  const [a, b, tip] = [at(tail + 24), at(tail - 24), at(tail, r * 1.5)]
  return `M${a[0]} ${a[1]}A${r} ${r} 0 1 1 ${b[0]} ${b[1]}L${tip[0]} ${tip[1]}Z`
}

// an avatar bubble: slab bubble, raised white head and shoulders
const avatar = (tail: number, fill: Shape['fill']): ReadonlyArray<Shape> => {
  const r = AVATAR_R
  return [
    { d: roundBubble(r, tail), fill, depth: 1 },
    { d: ellipse(0, -r * 0.24, r * 0.3), fill: 'white', depth: 0.3 },
    { d: `M${-r * 0.56} ${r * 0.62}A${r * 0.56} ${r * 0.46} 0 0 1 ${r * 0.56} ${r * 0.62}Z`, fill: 'white', depth: 0.3 },
  ]
}

const member = ({ at, tail, fill }: (typeof MEMBERS)[number], i: number): Layer => ({
  parent: 'face',
  a: [0, 0],
  p: at,
  s: popScale(JOIN[i], LEAVE[i]),
  shapes: avatar(tail, fill),
})

// the member's message grows out of the card's edge on their side
const message = ({ side, y, fill }: (typeof MEMBERS)[number], i: number): Layer => {
  const x = side === 'left' ? CARD.x + 18 : CARD.x + CARD.w - 18 - ROW_W
  const edge: Vec = [side === 'left' ? x : x + ROW_W, y]
  return {
    parent: 'face',
    a: edge,
    p: edge,
    s: popScale(JOIN[i] + REPLY, LEAVE[i] - REPLY),
    shapes: [
      { d: pill(x, y - ROW_H / 2, ROW_W, ROW_H), fill: fill === 'deep' ? 'tint' : 'white', depth: 0.3 },
      { d: line([x + 18, y], [x + ROW_W - 40, y]) },
    ],
  }
}

const groupChat: Icon = {
  name: 'group-chat',
  frames: 180,
  still: 100,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [250, 258], shapes: [] },
    {
      id: 'face',
      parent: 'root',
      tilt: FACE,
      shapes: [
        { d: rect(CARD.x, CARD.y, CARD.w, CARD.h, 26), fill: 'paper', depth: 1 },
        { d: rect(CARD.x + 14, CARD.y + 14, CARD.w - 28, 40, 14), fill: 'deep', depth: 0.4 },
        { d: line([CARD.x + 34, CARD.y + 34], [CARD.x + 110, CARD.y + 34]), line: 7 },
        ...[0, 1, 2].map((k): Shape => ({ d: ellipse(CARD.x + CARD.w - 40 - k * 16, CARD.y + 34, 5), fill: 'white' })),
      ],
    },
    ...MEMBERS.map(message),
    ...MEMBERS.map(member),
    glow('root', [140, -170], 22, popIn(JOIN[2] + 8, 120)),
  ],
}

export default groupChat
