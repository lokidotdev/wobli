// Candidate Match
import { ellipse, line, rect } from '../engine.ts'
import { SOFT, sparkle } from '../motions.ts'
import { EXT, FACE, LINE, checkBadge, glow, hit, outAndBack, popIn } from '../parts.ts'
import type { Icon, Layer, Motion, Shape, Track, Vec } from '../engine.ts'

// A stack of candidate profiles. The top card swipes off to the left, tipping as it goes, and shrinks away; the next card
// steps forward into its place, the one behind following a beat later. A check badge stamps onto the new top card, which takes
// the stamp, and sparkles pop on the beat. After the hold the badge lifts off, the cards step back and the swiped card comes
// home along the path it left by.
const W = 200 // one profile card
const H = 250
const LEFT = -W / 2
const TOP = -H / 2
const CARD = 0.45 // a card's thickness, as a share of the extrusion
const BEHIND = (n: number): Vec => [12 * n, -20 * n] // the nth card back, peeking out above and right

const SWIPE = 14 // the top card leaves
const SWIPE_LEN = 24
const SHRINK = SWIPE + 6 // it shrinks away as it goes
const SHRINK_LEN = 20
const STEP = SWIPE + 10 // the next card steps forward
const STEP_LEN = 22
const LAG = 5 // the card behind follows
const MATCH = STEP + STEP_LEN + 4 // the badge stamps on
const BACK = 128 // the badge lifts, the cards step back
const RETURN = BACK + 6 // the swiped card grows back
const BADGE: Vec = [LEFT + W - 34, TOP + 34] // the badge on the top card's corner

const OFF: Vec = [-130, -24] // where the swipe carries the card before it is gone
// out: moves first and shrinks last; home: grows first and lands last, the same path both ways
const SWIPE_P: Track<Vec> = outAndBack<Vec>([0, 0], OFF, SWIPE, SWIPE_LEN, RETURN + 6, SWIPE_LEN)
const SWIPE_R: Track<number> = outAndBack(0, -18, SWIPE, SWIPE_LEN, RETURN + 6, SWIPE_LEN)
const SWIPE_S: Track<Vec> = outAndBack<Vec>([100, 100], [0, 0], SHRINK, SHRINK_LEN, RETURN, SHRINK_LEN)

// a profile card: white slab, a tinted photo plate with a head and shoulders, a name bar and a line of detail
const profile = (face: Shape['fill'], name: Shape['fill']): ReadonlyArray<Shape> => [
  { d: rect(LEFT, TOP, W, H, 20), fill: 'white', depth: CARD },
  { d: rect(LEFT + 16, TOP + 16, W - 32, 140, 12), fill: 'tint', depth: 0.15 },
  { d: ellipse(0, TOP + 70, 30), fill: face, depth: 0.3 },
  { d: `M-54 ${TOP + 156}A54 46 0 0 1 54 ${TOP + 156}Z`, fill: face, depth: 0.3 },
  { d: rect(LEFT + 16, TOP + 174, 112, 18, 9), fill: name, depth: 0.15 },
  { d: line([LEFT + 16, TOP + 214], [LEFT + 150, TOP + 214]), line: 4 },
]

// a card waiting in the stack, stepping forward one place when the top card goes
const waiting = (id: string, n: number, delay: number, extra: ReadonlyArray<Motion> = []): Layer => ({
  id,
  parent: 'root',
  p: BEHIND(n),
  m: [{ p: outAndBack<Vec>([0, 0], [-BEHIND(1)[0], -BEHIND(1)[1]], STEP + delay, STEP_LEN, BACK + delay, STEP_LEN) }, ...extra],
  shapes: [],
})

const candidateMatch: Icon = {
  name: 'candidate-match',
  frames: 180,
  still: 96,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [258, 266], shapes: [] },
    // the last card: blank, follows a beat behind the one in front
    waiting('third', 2, LAG),
    { parent: 'third', tilt: FACE, shapes: [{ d: rect(LEFT, TOP, W, H, 20), fill: 'white', depth: CARD }, { d: rect(LEFT + 16, TOP + 16, W - 32, 140, 12), fill: 'grey', depth: 0.15 }] },
    // the match: steps forward and takes the badge's stamp
    waiting('match', 1, 0, [hit(MATCH, [3, 8], 0.7)]),
    { id: 'face', parent: 'match', tilt: FACE, shapes: profile('main', 'deep') },
    { parent: 'face', a: BADGE, p: BADGE, m: popIn(MATCH - 8, BACK - 10), shapes: checkBadge(BADGE, 38, 0.4) },
    // the top card, swiped off to the left, tipping and shrinking away
    { id: 'top', parent: 'root', m: { p: SWIPE_P, r: SWIPE_R, s: SWIPE_S }, shapes: [] },
    { parent: 'top', tilt: FACE, shapes: profile('deep', 'grey') },
    glow('root', [148, -180], 24, sparkle(MATCH)),
    glow('root', [-178, 112], 16, sparkle(MATCH + 8)),
  ],
}

export default candidateMatch
