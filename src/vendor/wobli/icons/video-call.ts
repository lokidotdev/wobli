// Video Call
import { ellipse, line, poly, rect } from '../engine.ts'
import { IN, SNAP, SOFT } from '../motions.ts'
import { EXT, FACE, LINE, glow, laptop, outIn, popIn } from '../parts.ts'
import type { Icon, Layer, Shape, Track, Vec } from '../engine.ts'

// A four person call on the laptop. The gold speaker frame hands the floor from tile to tile: top left, top right, then down to
// bottom right, travelling slot to slot on SNAP. Each speaker's sound badge peaks on the frame the frame arrives and their head
// leans in a beat later; both settle back as the frame leaves. A long hold on the last speaker, then the floor goes home.
const TILE_W = 96
const TILE_H = 58
const TILE = (i: number): Vec => [-100 + (i % 2) * 104, -150 + Math.floor(i / 2) * 66] // top left of each tile on the screen
const GO = 24 // frames for one hand over
const TO_1 = 14 // the frame leaves tile 0
const TO_3 = 62 // leaves tile 1
const HOME = 128 // leaves tile 3, back on tile 0 by HOME + GO
const ARRIVE = [HOME + GO, TO_1 + GO, 0, TO_3 + GO] as const // when each tile gets the floor (tile 2 listens)
const LEAVE = [TO_1, TO_3, 0, HOME] as const
const AT = (i: number): Vec => [TILE(i)[0] - TILE(0)[0], TILE(i)[1] - TILE(0)[1]]
const SPEAKER: Track<Vec> = [
  [TO_1, AT(0), SNAP], [TO_1 + GO, AT(1), 0],
  [TO_3, AT(1), SNAP], [TO_3 + GO, AT(3), 0],
  [HOME, AT(3), SNAP], [HOME + GO, AT(0)],
]
const LEAN: Vec = [0, -6]
// a speaking head: leans in after the frame lands, back as it leaves; tile 0 starts the loop speaking
const lean = (i: number): Track<Vec> =>
  i === 0
    ? [[LEAVE[0], LEAN, IN], [LEAVE[0] + 12, [0, 0], 0], [ARRIVE[0] + 4, [0, 0], SOFT], [ARRIVE[0] + 16, LEAN]]
    : [[ARRIVE[i] + 4, [0, 0], SOFT], [ARRIVE[i] + 16, LEAN, 0], [LEAVE[i], LEAN, IN], [LEAVE[i] + 12, [0, 0]]]
// a rounded rect drawn the other way round, so it cuts a hole in the shape it follows
const hole = (x: number, y: number, w: number, h: number, r: number) => poly([[x, y], [x, y + h], [x + w, y + h], [x + w, y]], r)
const FILL = ['main', 'white', 'white', 'main'] as const
const SKIN = ['white', 'main', 'main', 'white'] as const

const tile = (i: number): ReadonlyArray<Layer> => {
  const [x, y] = TILE(i)
  const head: Vec = [x + TILE_W / 2 - 7, y + 25]
  const badge: Vec = [x + TILE_W - 19, y + 16]
  return [
    {
      parent: 'lap',
      shapes: [
        { d: rect(x, y, TILE_W, TILE_H, 8), fill: FILL[i], depth: 0.2 },
        { d: `M${head[0] - 22} ${y + TILE_H}A22 17 0 0 1 ${head[0] + 22} ${y + TILE_H}Z`, fill: SKIN[i], line: 4 },
      ],
    },
    { parent: 'lap', ...(i === 2 ? {} : { p: lean(i) }), shapes: [{ d: ellipse(head[0], head[1], 11), fill: SKIN[i], line: 4 }] },
    ...(i === 2
      ? []
      : [
          {
            parent: 'lap',
            a: badge,
            p: badge,
            m: i === 0 ? outIn(LEAVE[0] - 4, ARRIVE[0] - 10) : popIn(ARRIVE[i] - 10, LEAVE[i] - 4),
            shapes: [
              { d: rect(badge[0] - 12, badge[1] - 9, 24, 18, 7), fill: 'gold', depth: 0.3 },
              ...[-6, 0, 6].map((dx, k): Shape => ({ d: line([badge[0] + dx, badge[1] - (k === 1 ? 5 : 2)], [badge[0] + dx, badge[1] + (k === 1 ? 5 : 2)]), line: 3 })),
            ],
          } satisfies Layer,
        ]),
  ]
}

const videoCall: Icon = {
  name: 'video-call',
  frames: 180,
  still: 100,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [244, 296], shapes: [] },
    { id: 'lap', parent: 'root', tilt: FACE, shapes: laptop('deep') },
    ...[0, 1, 2, 3].flatMap(tile),
    {
      parent: 'lap',
      p: SPEAKER,
      shapes: [{ d: rect(TILE(0)[0] - 7, TILE(0)[1] - 7, TILE_W + 14, TILE_H + 14, 13) + hole(TILE(0)[0] - 1, TILE(0)[1] - 1, TILE_W + 2, TILE_H + 2, 9), fill: 'gold', depth: 0.3 }],
    },
    glow('root', [156, -168], 22, popIn(ARRIVE[3] - 8, 124)),
  ],
}

export default videoCall
