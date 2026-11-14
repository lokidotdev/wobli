// Megaphone Launch
import { arc, ellipse, line, poly, rect, star } from '../engine.ts'
import { IN, SOFT, glint } from '../motions.ts'
import { EXT, FACE, LINE, facePoint, glow, hit, outAndBack, popIn } from '../parts.ts'
import type { Icon, Key, Layer, Shape, Track, Vec } from '../engine.ts'

// The megaphone calls out three times. On each beat it kicks back in the hand, its bell swells, a sound wave leaves the
// mouth and an announcement card bursts out of it, growing as it flies to its place in a fan. A still hold with the cards
// up, then they shrink back into the mouth last out first home, and the megaphone rests for the next call.
const BEATS = [18, 40, 62] // each one: the kick, the swell, a wave and a card
const FLY = 24 // frames for a card to reach its place
const SWELL = 6 // frames out to the bell's swell
const SETTLE = 14 // frames back
const HOME = [128, 120, 112] // each card heads back into the mouth: last out first home
const HOME_LEN = 18

// the megaphone on the house face, mouth to the right: mouthpiece, cone, bell rim, handle under it
const BELL_X = 64 // the bell rim's centre along the cone
const MOUTH: Vec = facePoint(BELL_X + 14, 0) // where cards and waves leave, in the root's space

// where each card flies to from the mouth, and how far it turns on the way
const CARDS: ReadonlyArray<{ to: Vec; turn: number; kind: 'star' | 'avatar' }> = [
  { to: [58, -150], turn: -8, kind: 'star' },
  { to: [150, -86], turn: 6, kind: 'avatar' },
  { to: [160, 26], turn: -4, kind: 'star' },
]

// one announcement card: a white slab with a badge and two ink lines
const card = (kind: 'star' | 'avatar'): ReadonlyArray<Shape> => [
  { d: rect(-50, -34, 100, 68, 10), fill: 'white', depth: 0.4 },
  kind === 'star' ? { d: star(-24, 0, 17, 0.48, 5, 2), fill: 'gold', line: 4 } : { d: ellipse(-24, 0, 14), fill: 'main', line: 4 },
  { d: line([0, -10], [32, -10]), line: 4 },
  { d: line([0, 10], [22, 10]), line: 4 },
]

// a card's flight: out of the mouth on SOFT growing from nothing, home on IN shrinking back into it
const flight = (i: number): Layer => {
  const { to, turn, kind } = CARDS[i]
  const [out, back] = [BEATS[i], HOME[i]]
  return {
    parent: 'root',
    p: MOUTH,
    tilt: FACE,
    m: {
      p: outAndBack<Vec>([0, 0], to, out, FLY, back, HOME_LEN),
      s: outAndBack<Vec>([0, 0], [100, 100], out, FLY - 6, back + 4, HOME_LEN - 4),
      r: outAndBack(0, turn, out, FLY, back, HOME_LEN),
    },
    shapes: card(kind),
  }
}

// the bell swells on each beat: out on SOFT, home on IN
const SWELLS: Track<Vec> = BEATS.flatMap((b): Array<Key<Vec>> => [[b, [100, 100], SOFT], [b + SWELL, [108, 114], IN], [b + SWELL + SETTLE, [100, 100]]])

// a sound wave: an arc swelling out of the mouth on the glint keys
const soundWave = (b: number, r: number): Layer => ({
  parent: 'root',
  a: MOUTH,
  p: MOUTH,
  m: glint(b - 8, 100),
  shapes: [{ d: arc(MOUTH[0], MOUTH[1], r, -52, 22), round: true }],
})

const megaphoneLaunch: Icon = {
  name: 'megaphone-launch',
  frames: 180,
  still: 98,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [168, 300], shapes: [] },
    ...BEATS.map((b, i) => soundWave(b, 64 + i * 10)),
    // the megaphone kicks back toward the hand on every call
    { id: 'horn', parent: 'root', m: BEATS.map((b) => hit(b, [-10, 5], 0.4)), shapes: [] },
    {
      id: 'body',
      parent: 'horn',
      tilt: FACE,
      shapes: [
        { d: poly([[-44, 20], [-14, 20], [-20, 92], [-48, 92]], 8), fill: 'grey', depth: 0.8 }, // the handle
        { d: rect(-112, -20, 44, 40, 8), fill: 'grey', depth: 0.8 }, // the mouthpiece
        { d: poly([[-74, -28], [BELL_X, -72], [BELL_X, 72], [-74, 28]], 8), fill: 'main', depth: 1 }, // the cone
        { d: poly([[-22, -44], [-6, -49], [-6, 49], [-22, 44]], 2), fill: 'white', depth: 0.2 }, // a raised band
      ],
    },
    // the bell rim: swells on each beat
    { parent: 'body', a: [BELL_X, 0], p: [BELL_X, 0], s: SWELLS, shapes: [{ d: rect(BELL_X - 8, -84, 24, 168, 12), fill: 'white', depth: 1 }] },
    ...CARDS.map((_, i) => flight(i)),
    glow('root', [-40, -150], 22, popIn(BEATS[2] + 10, HOME[2] - 10)),
    glow('root', [262, 92], 16, popIn(BEATS[2] + 16, HOME[2] - 4)),
  ],
}

export default megaphoneLaunch
