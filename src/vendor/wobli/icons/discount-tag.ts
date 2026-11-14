// Discount Tag
import { ellipse, line, pill, poly } from '../engine.ts'
import { SOFT, springTurn } from '../motions.ts'
import { EXT, FACE, LINE, glow, outAndBack, popIn } from '../parts.ts'
import type { Icon, Track, Vec } from '../engine.ts'

// The % badge slaps onto the tag's corner and its hit kicks the tag out on its string; the tag swings home through rest on the
// spring, each swing half the last, the badge trailing a beat. Once it hangs still the old price is struck through and the new
// price pops in under it. After a long hold the new price goes, the strike draws back and the badge leaves, last in first out.
const PIN: Vec = [0, 0] // where the string hangs from: the tag swings about it
const HOLE: Vec = [0, 84]
const BADGE: Vec = [74, 272]
const NEW: Vec = [-14, 206]

const HIT = 24 // the badge's pop peaks: the tag takes the hit here
const KICK = 36 // the far end of the first swing
const PACE = 0.8
const STRIKE = 54
const DEAL = 68 // the new price lands
const CLEAR = 132
const SWING: Track<number> = [[HIT, 0, SOFT], ...springTurn(0, KICK, PACE, 12)]

const tagBody = poly([[0, 34], [80, 104], [80, 290], [-80, 290], [-80, 104]], [10, 14, 18, 18, 14])

const discountTag: Icon = {
  name: 'discount-tag',
  frames: 180,
  still: 116,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [186, 124], shapes: [] },
    { id: 'face', parent: 'root', tilt: FACE, shapes: [] },
    {
      id: 'tag',
      parent: 'face',
      a: PIN,
      p: PIN,
      m: { r: SWING },
      shapes: [
        { d: tagBody, fill: 'gold', depth: 1 },
        { d: ellipse(HOLE[0], HOLE[1], 16), fill: 'white', depth: 0.3 },
        { d: ellipse(HOLE[0], HOLE[1], 6), fill: 'ink', line: false },
        { d: line(PIN, HOLE), line: 6, round: true },
        { d: pill(-54, 132, 108, 30), fill: 'white', depth: 0.3 },
        { d: line([-24, 147], [24, 147]), line: 6 },
      ],
    },
    { parent: 'tag', shapes: [{ d: line([-64, 164], [64, 130]), line: 7, round: true, trim: outAndBack(0, 1, STRIKE, 14, CLEAR + 8, 14) }] },
    {
      parent: 'tag',
      a: NEW,
      p: NEW,
      m: popIn(DEAL, CLEAR),
      shapes: [{ d: pill(NEW[0] - 46, NEW[1] - 20, 92, 40), fill: 'hot', depth: 0.4 }, { d: line([NEW[0] - 22, NEW[1]], [NEW[0] + 22, NEW[1]]), line: 6 }],
    },
    {
      parent: 'tag',
      a: BADGE,
      p: BADGE,
      m: [...popIn(HIT - 10, CLEAR + 16), { r: SWING, at: 5, k: 0.6 }],
      shapes: [
        { d: ellipse(BADGE[0], BADGE[1], 40), fill: 'hot', depth: 0.7 },
        { d: line([BADGE[0] + 15, BADGE[1] - 19], [BADGE[0] - 15, BADGE[1] + 19]), line: 6, round: true },
        { d: ellipse(BADGE[0] - 13, BADGE[1] - 12, 7), fill: 'white', line: 4 },
        { d: ellipse(BADGE[0] + 13, BADGE[1] + 12, 7), fill: 'white', line: 4 },
      ],
    },
    { parent: 'root', shapes: [{ d: ellipse(0, 0, 12), fill: 'grey', depth: 0.6 }] },
    glow('root', [-46, 206], 22, popIn(DEAL + 2, CLEAR - 6)),
  ],
}

export default discountTag
