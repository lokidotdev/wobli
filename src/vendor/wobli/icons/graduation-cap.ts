// Graduation Cap
import { ellipse, line, rect } from '../engine.ts'
import { IN, SOFT, springTurn } from '../motions.ts'
import { EXT, LINE, glow, hit, outAndBack, popIn } from '../parts.ts'
import type { Icon, Track, Vec } from '../engine.ts'

// The book kicks up and tosses the cap off its cover: the cap rises turning over, its tassel trailing, slows at the top and
// falls back faster and faster, spinning home. It lands flat on the book, which takes the hit with the spring, the tassel
// swings out and settles through rest, and a sparkle marks the landing. A still hold, then the next toss.
const FLAT: Vec = [-45, 55] // the book and the board lie flat
const LAUNCH = 16 // the book kicks the cap up
const RISE = 28
const APEX = LAUNCH + RISE
const FALL = 26
const LAND = APEX + FALL // the cap lands on the cover: the book and the tassel answer here
const GONE = 150

const BOARD_Y = -68 // the board's centre over the cover
const BOARD = 64 // half the board's side
const CAP_MID: Vec = [0, -40] // the cap turns about its middle
const TASSEL_TOP: Vec = [Math.round(BOARD * Math.SQRT2) - 6, BOARD_Y + 4] // the cord drops off the board's right corner

// up on SOFT, back down on IN, its mirror: a throw slows to the top and falls away faster
const FLIGHT: Track<Vec> = outAndBack<Vec>([0, 0], [8, -128], LAUNCH, RISE, APEX, FALL)
// half a turn on the way up, the other half on the way down
const SPIN: Track<Vec> = outAndBack<Vec>([100, 100], [-100, 100], LAUNCH, RISE, APEX, FALL)
const TILT: Track<number> = outAndBack(0, -10, LAUNCH, RISE, APEX, FALL)
// the tassel trails the rise, floats up as the cap falls, kicks out on the landing and swings home
const TASSEL: Track<number> = [[LAUNCH, 0, SOFT], [APEX, 18, 0], [APEX, 18, IN], [LAND - 2, -46, 0], ...springTurn(0, LAND, 0.8, -46)]

const graduationCap: Icon = {
  name: 'graduation-cap',
  frames: 180,
  still: 124,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [250, 318], shapes: [] },
    // the book: kicks up to throw, takes the hit on the landing
    { id: 'book', parent: 'root', m: [hit(LAUNCH, [0, -8], 0.5), hit(LAND, [2, 10], 0.7)], shapes: [] },
    { parent: 'book', p: [0, 24], tilt: FLAT, shapes: [{ d: rect(-86, -110, 172, 220, 10), fill: 'main', depth: 0.4 }] },
    { parent: 'book', p: [0, 6], tilt: FLAT, shapes: [{ d: rect(-82, -104, 162, 208, 4), fill: 'white', depth: 1 }] },
    {
      parent: 'book',
      tilt: FLAT,
      shapes: [
        { d: rect(-86, -110, 172, 220, 10), fill: 'main', depth: 0.25 },
        { d: rect(-86, -110, 26, 220, 6), fill: 'deep', depth: 0.25 },
        { d: rect(-36, -70, 92, 44, 6), fill: 'white', depth: 0.2 },
        { d: line([-26, -48], [40, -48]), line: 4 },
      ],
    },
    // the cap: flies up turning over and lands back on the cover
    { id: 'cap', parent: 'book', a: CAP_MID, p: CAP_MID, m: { p: FLIGHT, s: SPIN, r: TILT }, shapes: [] },
    { parent: 'cap', shapes: [{ d: 'M-46 -70L-46 -14C-46 6 46 6 46 -14L46 -70Z', fill: 'deep', depth: 0.6 }] },
    {
      parent: 'cap',
      p: [0, BOARD_Y],
      tilt: FLAT,
      shapes: [
        { d: rect(-BOARD, -BOARD, BOARD * 2, BOARD * 2, 6), fill: 'deep', depth: 0.5 },
        { d: ellipse(0, 0, 10), fill: 'gold', line: 4 },
      ],
    },
    {
      parent: 'cap',
      a: TASSEL_TOP,
      p: TASSEL_TOP,
      m: { r: TASSEL },
      shapes: [
        { d: line([0, BOARD_Y], TASSEL_TOP, [TASSEL_TOP[0], TASSEL_TOP[1] + 40]), line: 4 },
        { d: rect(TASSEL_TOP[0] - 8, TASSEL_TOP[1] + 36, 16, 26, 4), fill: 'gold', line: 4 },
      ],
    },
    glow('root', [-140, -130], 24, popIn(LAND + 4, GONE)),
    glow('root', [138, -40], 16, popIn(LAND + 10, GONE - 6)),
  ],
}

export default graduationCap
