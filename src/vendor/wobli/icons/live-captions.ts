// Live Captions
import { ellipse, line, poly, rect } from '../engine.ts'
import { EXT, FACE, LINE, glow, outAndBack, popIn } from '../parts.ts'
import type { Icon, Layer, Shape, Vec } from '../engine.ts'

// A video plays on a card, its progress bar creeping along. A white caption strip pops up under the card and its words type
// in one after another; a beat later a second strip in the other language pops in under it and types its own words. A sparkle
// marks the pair and everything holds. After the hold each strip erases last word first and shrinks away, the second before the
// first, while the progress bar slides back to where it started.
const POP_1 = 8 // first strip pops in, its words type TYPE_GAP apart after WORD_LAG
const POP_2 = 40 // second strip, in the other language
const WORD_LAG = 10
const TYPE_GAP = 6
const TYPE = 5 // frames to type one word
const OUT_2 = 100 // second strip starts erasing
const OUT_1 = 112 // then the first
const ERASE_GAP = 4
const PLAY = 10 // the progress bar creeps along
const PLAY_LEN = 90
const REWIND = 124
const REWIND_LEN = 40
const BAR_X = -132
const BAR_Y = 48
const BAR_FROM = 70
const BAR_TO = 190

const CAPTIONS = [
  { y: 122, x: -136, w: 272, fill: 'white', pop: POP_1, out: OUT_1, words: [[-112, -70], [-54, -6], [10, 40], [56, 112]] },
  { y: 172, x: -110, w: 220, fill: 'main', pop: POP_2, out: OUT_2, words: [[-86, -38], [-22, 30], [46, 86]] },
] as const

const bar = (w: number) => rect(BAR_X, BAR_Y - 6, w, 12, 6)

const caption = ({ y, x, w, fill, pop, out, words }: (typeof CAPTIONS)[number]): Layer => {
  const n = words.length
  const done = out + n * ERASE_GAP + TYPE // the strip shrinks once its words are gone
  return {
    parent: 'face',
    a: [0, y],
    p: [0, y],
    m: popIn(pop, done),
    shapes: [
      { d: rect(x, y - 19, w, 38, 12), fill, depth: 0.5 },
      ...words.map(([a, b], i): Shape => ({
        d: line([a, y], [b, y]),
        // typed in left to right, erased right to left
        trim: outAndBack(0, 1, pop + WORD_LAG + i * TYPE_GAP, TYPE, out + (n - 1 - i) * ERASE_GAP, TYPE),
      })),
    ],
  }
}

const liveCaptions: Icon = {
  name: 'live-captions',
  frames: 180,
  still: 96,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [250, 240], s: [78, 78], shapes: [] },
    {
      id: 'face',
      parent: 'root',
      tilt: FACE,
      shapes: [
        { d: rect(-160, -150, 320, 228, 28), fill: 'deep', depth: 1 },
        { d: rect(-140, -130, 280, 152, 16), fill: 'tint', depth: 0.3 },
        // the picture: a sun over two hills standing on the bottom of the screen
        { d: ellipse(-84, -84, 18), fill: 'white', depth: 0.3 },
        { d: poly([[-128, 22], [-48, -50], [32, 22]], 4), fill: 'main', depth: 0.3 },
        { d: poly([[4, 22], [76, -80], [128, 22]], 4), fill: 'white', depth: 0.3 },
        { d: bar(264), fill: 'grey', depth: 0.3 },
        { d: outAndBack(bar(BAR_FROM), bar(BAR_TO), PLAY, PLAY_LEN, REWIND, REWIND_LEN), fill: 'white', depth: 0.3 },
      ],
    },
    // the scrubber rides the end of the bar
    {
      parent: 'face',
      p: outAndBack<Vec>([BAR_X + BAR_FROM, BAR_Y], [BAR_X + BAR_TO, BAR_Y], PLAY, PLAY_LEN, REWIND, REWIND_LEN),
      shapes: [{ d: ellipse(0, 0, 13), fill: 'white', depth: 0.5 }],
    },
    ...CAPTIONS.map(caption),
    glow('root', [160, -150], 24, popIn(POP_2 + 32, OUT_2 - 6)),
    glow('root', [-178, 118], 16, popIn(POP_2 + 38, OUT_2)),
  ],
}

export default liveCaptions
