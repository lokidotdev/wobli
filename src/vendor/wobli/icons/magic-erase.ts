// Magic Erase
import { ellipse, pill, poly, rect, star } from '../engine.ts'
import { EXT, FACE, LINE, glow, outAndBack, outIn, popIn } from '../parts.ts'
import type { Icon, Vec } from '../engine.ts'

// A photo lies on the table with a stray figure standing on the hill. The wand sweeps across it and straight back, the star
// tip trailing a beat, and the figure shrinks away into its own feet on the frame the tip passes, sparkles left where it stood.
// After a long hold the wand makes the same pass again and the figure grows back out of the same spot, ready for the loop.
const PIC = { x: -110, y: -84, w: 220, h: 144 }
const PIC_PATH = rect(PIC.x, PIC.y, PIC.w, PIC.h, 8)
const HILLS = poly([[PIC.x - 10, 70], [-56, -4], [-6, 30], [56, 6], [PIC.x + PIC.w + 10, 70]], [0, 10, 8, 10, 0])
const SUN: Vec = [-60, -46]
const FEET: Vec = [52, 16] // the figure stands here and shrinks into it

const GRIP: Vec = [150, 132] // the wand's hand hold, in root space
const WAND = 190
const TIP: Vec = [0, -WAND - 8]

const LEN = 24 // one way across
const PASS = 7 // after a sweep starts, the tip is over the figure
const ERASE = 12 // first sweep: across and straight home
const ERASE_HOME = 40
const RESTORE = 150 // after the hold, the second sweep brings the figure back
const RESTORE_HOME = 176
const VANISH = ERASE + PASS
const RETURN = RESTORE + PASS
const LAG = 5
const SWEPT = -66
const sweeps = (to: number, at: number) => [...outAndBack(0, to, ERASE + at, LEN, ERASE_HOME + at), ...outAndBack(0, to, RESTORE + at, LEN, RESTORE_HOME + at)]

const magicErase: Icon = {
  name: 'magic-erase',
  frames: 210,
  still: 100,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [236, 250], shapes: [] },
    {
      id: 'photo',
      parent: 'root',
      tilt: FACE,
      shapes: [
        { d: rect(-130, -104, 260, 208, 16), fill: 'white', depth: 1 },
        { d: PIC_PATH, fill: 'tint', depth: 0.25 },
      ],
    },
    { id: 'pic', parent: 'photo', shapes: [{ d: PIC_PATH, line: false }] },
    { parent: 'pic', clip: 'pic', shapes: [{ d: ellipse(SUN[0], SUN[1], 18), fill: 'white' }] },
    { parent: 'pic', clip: 'pic', shapes: [{ d: HILLS, fill: 'deep' }] },
    // the stray figure on the hill: body then head, shrinking into its feet
    {
      parent: 'pic',
      clip: 'pic',
      a: FEET,
      p: FEET,
      m: outIn(VANISH, RETURN),
      shapes: [
        { d: pill(FEET[0] - 14, FEET[1] - 36, 28, 40), fill: 'main', depth: 0.3 },
        { d: ellipse(FEET[0], FEET[1] - 50, 12), fill: 'main', depth: 0.3 },
      ],
    },
    { parent: 'photo', shapes: [{ d: PIC_PATH }] }, // the picture's edge, drawn again over the paint
    // the wand pivots in the hand below the photo and sweeps its tip across the picture and home, twice
    {
      id: 'wand',
      parent: 'root',
      a: [0, 0],
      p: GRIP,
      r: 14,
      m: { r: sweeps(SWEPT, 0) },
      shapes: [
        { d: rect(-8, -WAND, 16, WAND, 6), fill: 'deep', depth: 0.5 },
        { d: rect(-11, -WAND + 6, 22, 26, 5), fill: 'white', depth: 0.5 },
        { d: rect(-13, -58, 26, 64, 9), fill: 'deep', depth: 0.6 },
      ],
    },
    // the star tip trails the stick a beat
    {
      parent: 'wand',
      a: TIP,
      p: TIP,
      m: { r: sweeps(-36, LAG) },
      shapes: [{ d: star(TIP[0], TIP[1], 32, 0.5, 5, 3), fill: 'gold', depth: 0.6 }],
    },
    // sparkles where the figure stood, on the beat it goes
    glow('root', [40, -60], 22, popIn(VANISH + 2, 110), { ip: VANISH + 2, op: 142 }),
    glow('root', [92, -22], 15, popIn(VANISH + 8, 116), { ip: VANISH + 8, op: 148 }),
  ],
}

export default magicErase
