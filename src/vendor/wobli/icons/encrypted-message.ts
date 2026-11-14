// Encrypted Message
import { ellipse, line, rect } from '../engine.ts'
import { IN, SOFT } from '../motions.ts'
import { bubble, EXT, FACE, glow, hit, LINE, outAndBack, outIn, popIn, shackle } from '../parts.ts'
import type { Icon, Layer, Track, Vec } from '../engine.ts'

// Three lines of text sit in a message bubble. They scramble into jagged cipher one after another, then shrink into the middle of
// the bubble and a padlock grows out of that same point; its shackle slams shut and the bubble takes the clunk, one sparkle on that
// beat. After a long hold the shackle springs open, the padlock shrinks back into the middle and the lines grow out of it, last in
// first out, and unscramble into text.
const SCRAMBLE = 6 // the first line starts to scramble
const SCRAMBLE_GAP = 4
const SCRAMBLE_LEN = 14
const GATHER = 26 // the scrambled lines shrink into the middle
const GATHER_GAP = 3
const LOCK_IN = 40 // the padlock grows out of the middle
const SHUT = 60 // the shackle slams
const SHUT_LEN = 14
const CLUNK = SHUT + SHUT_LEN // the shackle lands, the bubble takes the hit
const UNLOCK = 120 // the shackle springs open
const UNLOCK_LEN = 20
const LOCK_OUT = 132 // the padlock shrinks back into the middle
const ROWS_BACK = 140 // the lines grow back out, last in first
const UNSCRAMBLE = 146
const MID: Vec = [0, -15] // the middle of the bubble: lines gather into it, the padlock grows from it
const ROWS = [
  { y: -56, x1: 100 },
  { y: -16, x1: 60 },
  { y: 24, x1: 4 },
] as const
const ROW_X0 = -100
const JAG = [0, -12, 10, -6, 12, -10, 8, -12, 0] // the cipher's jagged offsets, one per point
const SHACKLE_HINGE: Vec = [-34, -48] // the leg that stays in the body
// last line in comes home first
const CLOSE_ORDER = (i: number) => ROWS.length - 1 - i

// one line of text: the same nine points straight, or jagged into cipher, so the two morph
const row = (y: number, x1: number, jag: boolean): string =>
  line(...JAG.map((o, i): Vec => [ROW_X0 + ((x1 - ROW_X0) * i) / (JAG.length - 1), y + (jag ? o : 0)]))

const textRow = (i: number): Layer => {
  const { y, x1 } = ROWS[i]
  const back = CLOSE_ORDER(i)
  return {
    parent: 'bubble',
    a: MID,
    p: MID,
    m: outIn(GATHER + i * GATHER_GAP, ROWS_BACK + back * 4),
    shapes: [
      {
        d: outAndBack(row(y, x1, false), row(y, x1, true), SCRAMBLE + i * SCRAMBLE_GAP, SCRAMBLE_LEN, UNSCRAMBLE + back * SCRAMBLE_GAP, SCRAMBLE_LEN),
        line: 11,
        round: true,
      },
    ],
  }
}

// the shackle is open while the padlock grows in, slams shut, and springs open again before it shrinks away
const SHACKLE_P: Track<Vec> = [[0, [-6, -16], 0], [SHUT, [-6, -16], IN], [CLUNK, [0, 0], 0], [UNLOCK, [0, 0], SOFT], [UNLOCK + UNLOCK_LEN, [-6, -16]]]
const SHACKLE_R: Track<number> = [[0, -33, 0], [SHUT, -33, IN], [CLUNK, 0, 0], [UNLOCK, 0, SOFT], [UNLOCK + UNLOCK_LEN, -33]]

const encryptedMessage: Icon = {
  name: 'encrypted-message',
  frames: 180,
  still: 100,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [262, 262], m: hit(CLUNK, [3, 8]), shapes: [] },
    {
      id: 'bubble',
      parent: 'root',
      tilt: FACE,
      shapes: [
        { d: bubble(-150, -112, 300, 194, 'left', 32), fill: 'main', depth: 1 },
        { d: rect(-128, -92, 256, 154, 18), fill: 'white', depth: 0.3 },
      ],
    },
    ...[0, 1, 2].map(textRow),
    // the padlock: body and keyhole, grown from the middle of the bubble
    { id: 'lock', parent: 'bubble', a: MID, p: MID, m: popIn(LOCK_IN, LOCK_OUT), shapes: [] },
    {
      parent: 'lock',
      a: SHACKLE_HINGE,
      p: SHACKLE_HINGE,
      m: { p: SHACKLE_P, r: SHACKLE_R },
      shapes: [{ d: shackle(88, 20, -30, 44), fill: 'grey', depth: 0.7 }],
    },
    {
      parent: 'lock',
      shapes: [
        { d: rect(-60, -48, 120, 92, 18), fill: 'deep', depth: 1 },
        { d: ellipse(0, -2, 22), fill: 'white', depth: 0.3 },
        { d: ellipse(0, -6, 7), fill: 'ink', line: false },
        { d: rect(-4, -4, 8, 18, 2), fill: 'ink', line: false },
      ],
    },
    glow('root', [-178, -120], 24, popIn(CLUNK, UNLOCK - 6)),
  ],
}

export default encryptedMessage
