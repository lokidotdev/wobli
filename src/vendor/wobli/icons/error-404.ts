// Error 404
import { ellipse, line, pill, poly, rect } from '../engine.ts'
import { IN, SOFT, springTurn } from '../motions.ts'
import { EXT, FACE, LINE, facePoint, glow, hit, numeral, outIn, popIn } from '../parts.ts'
import type { Icon, Layer, Shape, Track, Vec } from '../engine.ts'

// The browser's cable sits plugged into a socket. It slips out and drops: the cable swings like a pendulum, the plug lagging a
// beat behind, and the window takes the tug on the same frame. The page pops away and 404 pops on, one digit after another.
// After a long hold the cable is lifted back into the socket, 404 goes and the page comes back the moment the plug lands.
const WIN: Vec = [236, 176]
const ANCHOR = facePoint(30, 100) // where the cable leaves the window's bottom edge
const PLUGGED = -54 // the cable's turn while plugged in, swung up and right
const UNPLUG = 16
const PAGE_OUT = UNPLUG + 2
const ERR = UNPLUG + 12 // 404 pops on, a digit every 5 frames
const BACK = 150 // the cable is lifted home
const PLUG_IN = BACK + 28
const CABLE = 92
const PLUG = 46 // plug body length below the cable
const PRONG = 18

// a cable tube hanging down from 0 0, a gentle S so it reads soft
const CABLE_PATH = `M-8 -6C-8 ${CABLE * 0.35} 6 ${CABLE * 0.5} 6 ${CABLE * 0.7}L8 ${CABLE + 2}L-8 ${CABLE + 2}L-6 ${CABLE * 0.7}C-6 ${CABLE * 0.55} 8 ${CABLE * 0.35} 8 -6Z`
const PLUG_TOP: Vec = [0, CABLE]

// dropped, it swings on the baked spring; lifted home on SOFT and held in the socket through the seam
const CABLE_TURN: Track<number> = [...springTurn(0, UNPLUG, 1.3, PLUGGED), [BACK, 0, SOFT], [PLUG_IN, PLUGGED]]

const digit = (n: number, x: number, i: number): Layer => {
  const c: Vec = [x + 15, 20]
  return {
    parent: 'window',
    a: c,
    p: c,
    m: popIn(ERR + i * 5, BACK - 10 + i * 4),
    shapes: [{ d: numeral(n, x, -6, 30, 52), line: 11, round: true }],
  }
}

const plug: ReadonlyArray<Shape> = [
  { d: rect(-14, CABLE + PLUG - 4, 8, PRONG + 4, 2), fill: 'grey', depth: 0.3 },
  { d: rect(6, CABLE + PLUG - 4, 8, PRONG + 4, 2), fill: 'grey', depth: 0.3 },
  { d: rect(-22, CABLE - 4, 44, PLUG, 10), fill: 'deep', depth: 0.7 },
  { d: line([-12, CABLE + 14], [12, CABLE + 14]) },
]

const error404: Icon = {
  name: 'error-404',
  frames: 210,
  still: 120,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', shapes: [] },
    // the window takes the tug on the frame the plug drops; the cable rides it
    { id: 'win', parent: 'root', p: WIN, m: hit(UNPLUG + 2, [4, 6], 0.6), shapes: [] },
    // the cable hangs from under the window's bottom edge, drawn behind it; the plug lags it on the swing
    { id: 'cable', parent: 'win', a: [0, 0], p: ANCHOR, r: CABLE_TURN, shapes: [{ d: CABLE_PATH, fill: 'deep', depth: 0.4 }] },
    {
      parent: 'cable',
      a: PLUG_TOP,
      p: PLUG_TOP,
      m: { r: [[UNPLUG, 0, IN], [UNPLUG + 4, 14, 0], ...springTurn(0, UNPLUG + 4, 0.8, 14)] },
      shapes: plug,
    },
    {
      id: 'window',
      parent: 'win',
      tilt: FACE,
      shapes: [
        { d: rect(-140, -100, 280, 200, 22), fill: 'white', depth: 1 },
        { d: poly([[-140, -100], [140, -100], [140, -58], [-140, -58]], [22, 22, 0, 0]), fill: 'main', depth: 0.2 },
        ...[-116, -96, -76].map((x): Shape => ({ d: ellipse(x, -79, 6), fill: 'white' })),
        { d: pill(-56, -90, 176, 22), fill: 'white' },
        { d: rect(-122, -42, 244, 126, 10), fill: 'tint' },
      ],
    },
    // the page that was there: a picture block and two lines, gone while the cable is out
    {
      parent: 'window',
      a: [0, 20],
      p: [0, 20],
      m: outIn(PAGE_OUT, PLUG_IN),
      shapes: [
        { d: rect(-102, -24, 92, 88, 8), fill: 'main', depth: 0.3 },
        { d: pill(8, -16, 90, 16), fill: 'grey', depth: 0.2 },
        { d: pill(8, 12, 72, 16), fill: 'grey', depth: 0.2 },
        { d: pill(8, 40, 82, 16), fill: 'grey', depth: 0.2 },
      ],
    },
    digit(4, -78, 0),
    digit(0, -15, 1),
    digit(4, 48, 2),
    // the socket stays put where the plug was, turned to meet it
    {
      parent: 'root',
      a: [0, 0],
      p: [WIN[0] + ANCHOR[0], WIN[1] + ANCHOR[1]],
      r: PLUGGED,
      shapes: [
        { d: rect(-44, CABLE + PLUG + 6, 88, 36, 10), fill: 'white', depth: 1 },
        { d: line([-24, CABLE + PLUG + 30], [24, CABLE + PLUG + 30]) },
        { d: rect(-16, CABLE + PLUG + 10, 9, 13, 2), fill: 'ink', line: false },
        { d: rect(7, CABLE + PLUG + 10, 9, 13, 2), fill: 'ink', line: false },
      ],
    },
    glow('root', [WIN[0] + 168, WIN[1] + 112], 18, popIn(UNPLUG, UNPLUG + 26)),
    glow('root', [WIN[0] - 150, WIN[1] - 128], 24, popIn(ERR + 14, BACK - 20)),
  ],
}

export default error404
