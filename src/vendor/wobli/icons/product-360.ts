// Product 360
import { at, ellipse, line, poly, view } from '../engine.ts'
import { SNAP } from '../motions.ts'
import { EXT, glow, LINE, popIn } from '../parts.ts'
import type { Icon, Key, Layer, Shape, Track, Vec } from '../engine.ts'

// The turntable takes the product box once all the way round on one smooth sweep: the labelled front leaves, a narrow side,
// the barcoded back and the other side come past, and the front comes home. A curved arrow grows out of the turntable a beat
// after the turn starts and shrinks back into it a beat after it ends; a sparkle pops on the frame the front faces us again.
const SPIN = 12 // the turntable starts the turn
const SPIN_END = 100 // and brings the front home
const ARROW_IN = SPIN + 6 // the arrow follows the turn in, and out
const ARROW_OUT = SPIN_END + 8
const FRAMES = 180

const YAW: Track<number> = [[SPIN, 0, SNAP], [SPIN_END, 360]]

// the box is modelled in 3d, x and y across the platter, z up, standing on the platter's top at the origin
const [W, D, H] = [52, 36, 150] // half width, half depth, height
type P3 = readonly [number, number, number]
const BASE = 28 // the house yaw, so the rest pose faces top right like every other sticker
const PITCH = 30
const cam = (yaw: number) => view(BASE + yaw, PITCH)
const face = (yaw: number, pts: ReadonlyArray<P3>, r = 5) => poly(pts.map((p) => cam(yaw)(p)), r)

// a path rebuilt on every frame its layer shows from the eased yaw, so the box turns on its axis instead of morphing straight
// across. Keys never reach past the span: a side keyed after it has turned away winds the other way, its corners' arc sweep
// flags flip, and a morph across that tears the shape on the frame between. Where flags still change between two frames the
// earlier key holds, and a still stretch keeps just its two ends.
type Span = { ip?: number; op?: number }
const sweeps = (d: string) => (d.match(/A[^A-Z]*/g) ?? []).map((a) => a.trim().split(/[ ,]+/)[4]).join('')
const bake = (shape: (yaw: number) => string, { ip = 0, op = FRAMES }: Span = {}): Track<string> => {
  const ds = Array.from({ length: op - ip }, (_, i) => shape(at(YAW, ip + i)))
  const keys = ds.map((d, i) => (i < ds.length - 1 && sweeps(d) !== sweeps(ds[i + 1]) ? [ip + i, d, 0] : [ip + i, d]) as Key<string>)
  return keys.filter((k, i) => i === 0 || i === keys.length - 1 || k[1] !== keys[i - 1][1] || k[1] !== keys[i + 1][1])
}

// whether a point or face with outward normal n (in the xy plane) faces the viewer at this yaw
const toward = ([nx, ny]: Vec, yaw: number) => {
  const a = ((BASE + yaw) * Math.PI) / 180
  return -(nx * Math.sin(a) + ny * Math.cos(a))
}
// every stretch of the loop over which a test holds, as ip and op; a side seen at both ends of the turn gets two stretches
const spans = (test: (yaw: number) => boolean) => {
  const out: Array<Span> = []
  let start = -1
  for (let f = 0; f <= FRAMES + 1; f++) {
    const on = f <= FRAMES && test(at(YAW, f))
    if (on && start < 0) start = f
    if (!on && start >= 0) {
      out.push({ ...(start > 0 ? { ip: start } : {}), ...(f <= FRAMES ? { op: f } : {}) })
      start = -1
    }
  }
  return out
}

// side k runs from corner k to corner k + 1, counter clockwise seen from above; 1 and 3 are the wide faces
const CORNER: ReadonlyArray<Vec> = [[W, -D], [W, D], [-W, D], [-W, -D]]
const NORMAL: ReadonlyArray<Vec> = [[1, 0], [0, 1], [-1, 0], [0, -1]]
// a point on side k: u along its edge from 0 to 1, z up it, pushed out off the face by lift
const onSide = (k: number, u: number, z: number, lift = 0): P3 => {
  const [[ax, ay], [bx, by]] = [CORNER[k], CORNER[(k + 1) % 4]]
  const [nx, ny] = NORMAL[k]
  return [ax + (bx - ax) * u + nx * lift, ay + (by - ay) * u + ny * lift, z]
}
const quad = (k: number, u0: number, u1: number, z0: number, z1: number, lift = 0): ReadonlyArray<P3> => [
  onSide(k, u0, z0, lift),
  onSide(k, u1, z0, lift),
  onSide(k, u1, z1, lift),
  onSide(k, u0, z1, lift),
]

// what sits on each side: the front carries a raised label with a star, the back a barcode, the narrow sides a tuck strip
const FRONT = 3
const BACK = 1
const sideParts = (k: number, span: Span): ReadonlyArray<Shape> => {
  const b = (shape: (yaw: number) => string) => bake(shape, span)
  const wide = k === FRONT || k === BACK
  const body: Shape = { d: b((yaw) => face(yaw, quad(k, 0, 1, 0, H))), fill: wide ? 'main' : 'deep' }
  if (k === FRONT)
    return [
      body,
      { d: b((yaw) => face(yaw, quad(k, 0.16, 0.84, 34, 116, 1.5), 8)), fill: 'white', line: 4 },
      { d: b((yaw) => face(yaw, quad(k, 0.32, 0.68, 62, 98, 2), 18)), fill: 'deep', line: 4 },
      { d: b((yaw) => line(cam(yaw)(onSide(k, 0.3, 48, 2)), cam(yaw)(onSide(k, 0.7, 48, 2)))), line: 4 },
    ]
  if (k === BACK)
    return [
      body,
      { d: b((yaw) => face(yaw, quad(k, 0.2, 0.8, 22, 72, 1.5), 6)), fill: 'white', line: 4 },
      ...[0.3, 0.38, 0.5, 0.58, 0.7].map((u): Shape => ({ d: b((yaw) => line(cam(yaw)(onSide(k, u, 34, 2)), cam(yaw)(onSide(k, u, 62, 2)))), line: 4 })),
    ]
  return [body, { d: b((yaw) => face(yaw, quad(k, 0, 1, H - 26, H - 20, 1.5), 0)), fill: 'white', line: 4 }]
}
const side = (k: number): ReadonlyArray<Layer> =>
  spans((yaw) => toward(NORMAL[k], yaw) > 0.02).map((span): Layer => ({ parent: 'box', ...span, shapes: sideParts(k, span) }))

const TOP: ReadonlyArray<P3> = CORNER.map(([x, y]): P3 => [x, y, H])
const TOP_FLAP: ReadonlyArray<P3> = CORNER.map(([x, y]): P3 => [x * 0.82, y * 0.5, H + 1])

// the platter is round, so it never needs rebaking; a marker dot on its rim shows it turning, behind the box or in front of it
const R = 96
const PLATTER = ellipse(0, 0, R, R / 2)
const MARK: P3 = [0, -R * 0.82, 0] // starts at the front, under the label
const MARK_N: Vec = [0, -1]
const markDot = (yaw: number) => {
  const [x, y] = cam(yaw)(MARK)
  return ellipse(x, y, 10, 5)
}
const marker = (front: boolean): ReadonlyArray<Layer> =>
  spans((yaw) => toward(MARK_N, yaw) > 0 === front).map((span): Layer => ({ parent: 'box', ...span, shapes: [{ d: bake(markDot, span), fill: 'deep', depth: 0.2 }] }))

// a curved arrow on the floor round the front of the turntable, pointing the way the front travels
const [ARX, ARY, ACY, AW] = [160, 80, 24, 9]
const onArrow = (t: number, off: number): Vec => {
  const a = (t * Math.PI) / 180
  return [(ARX + off) * Math.cos(a), ACY + (ARY + off / 2) * Math.sin(a)]
}
// one smooth band, outer edge along its ellipse to the head, inner edge back, so it bends without creases
const P = ([x, y]: Vec) => `${Math.round(x * 10) / 10} ${Math.round(y * 10) / 10}`
const [TAIL, HEAD, TIP] = [158, 38, 16]
const ARROW = [
  `M${P(onArrow(TAIL, AW))}`,
  `A${ARX + AW} ${ARY + AW / 2} 0 0 0 ${P(onArrow(HEAD, AW))}`,
  `L${P(onArrow(HEAD, AW + 14))}L${P(onArrow(TIP, 0))}L${P(onArrow(HEAD, -AW - 14))}L${P(onArrow(HEAD, -AW))}`,
  `A${ARX - AW} ${ARY - AW / 2} 0 0 1 ${P(onArrow(TAIL, -AW))}Z`,
].join('')
const ARROW_FROM: Vec = [0, ACY + ARY] // it grows and shrinks in place, under the turntable's front

const product360: Icon = {
  name: 'product-360',
  frames: FRAMES,
  still: 136,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [250, 298], shapes: [] },
    {
      id: 'box',
      parent: 'root',
      shapes: [
        { d: ellipse(0, 20, R + 16, (R + 16) / 2), fill: 'grey', depth: 1 },
        { d: PLATTER, fill: 'white', depth: 0.6 },
      ],
    },
    // the arrow lies on the floor clear of the base, so it draws over it and under nothing
    { parent: 'root', a: ARROW_FROM, p: ARROW_FROM, m: popIn(ARROW_IN, ARROW_OUT), shapes: [{ d: ARROW, fill: 'main', depth: 0.5 }] },
    ...marker(false),
    ...[0, 1, 2, 3].flatMap(side),
    {
      parent: 'box',
      shapes: [
        { d: bake((yaw) => face(yaw, TOP)), fill: 'white' },
        { d: bake((yaw) => face(yaw, TOP_FLAP, 4)), fill: 'deep', line: 4 },
      ],
    },
    ...marker(true),
    glow('root', [104, -196], 24, popIn(SPIN_END, SPIN_END + 40)),
    glow('root', [-120, -132], 16, popIn(SPIN_END + 6, SPIN_END + 44)),
  ],
}

export default product360
