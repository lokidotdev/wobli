// Rating Stars
import { ellipse, line, rect, star } from '../engine.ts'
import { twinkle } from '../motions.ts'
import { EXT, FACE, LINE, glow, outAndBack, popIn } from '../parts.ts'
import type { Icon, Layer, Vec } from '../engine.ts'

// A review card waits with five empty star slots. The stars fill gold one by one, left to right, each popping a touch proud
// and settling into its slot; on the frame the fifth lands the card pops, swelling and easing home, and two sparkles answer it.
// After the hold the stars empty back out, last in first out, so the loop closes on the empty card.
const STAR_Y = 6
const STARS: ReadonlyArray<Vec> = [-112, -56, 0, 56, 112].map((x): Vec => [x, STAR_Y])
const STAR_R = 26
const FIRST = 18 // the first star pops in
const GAP = 9 // frames between stars
const FIFTH = FIRST + GAP * 4 // the last star lands: the card pops on this frame
const EMPTY = 132 // the stars start emptying, last first
const EMPTY_GAP = 4

const goldStar = ([x, y]: Vec, i: number): Layer => ({
  parent: 'card',
  a: [x, y],
  p: [x, y],
  m: [twinkle(FIRST + i * GAP), twinkle(EMPTY + (4 - i) * EMPTY_GAP, true)],
  shapes: [{ d: star(x, y, STAR_R, 0.48, 5, 3), fill: 'gold', depth: 0.5 }],
})

const ratingStars: Icon = {
  name: 'rating-stars',
  frames: 180,
  still: 100,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [254, 256], m: { s: outAndBack<Vec>([100, 100], [108, 108], FIFTH, 6, FIFTH + 6, 16) }, shapes: [] },
    {
      id: 'card',
      parent: 'root',
      tilt: FACE,
      shapes: [
        { d: rect(-160, -110, 320, 220, 26), fill: 'white', depth: 1 },
        { d: ellipse(-118, -66, 22), fill: 'main', depth: 0.4 },
        { d: line([-82, -74], [24, -74]) },
        { d: line([-82, -54], [-24, -54]) },
        ...STARS.map(([x, y]) => ({ d: star(x, y, STAR_R, 0.48, 5, 3), fill: 'paper' as const, depth: 0.2 })),
        { d: line([-132, 62], [132, 62]) },
        { d: line([-132, 84], [40, 84]) },
      ],
    },
    ...STARS.map(goldStar),
    glow('root', [176, -132], 24, popIn(FIFTH + 2, EMPTY - 6)),
    glow('root', [-196, -56], 16, popIn(FIFTH + 8, EMPTY)),
  ],
}

export default ratingStars
