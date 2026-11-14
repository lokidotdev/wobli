// Backup Restore
import { ellipse, line, pill, poly, rect } from '../engine.ts'
import { IN } from '../motions.ts'
import { EXT, FACE, LINE, glow, hit, outAndBack, popIn, popScale, sheet } from '../parts.ts'
import type { Icon, Layer, Shape, Vec } from '../engine.ts'

// The folder sits empty with a backup clock on its corner. The clock's arrow winds back a full turn and, as it does, the lost
// files pop back into being above the folder one after another, then drop home into it; the folder takes each hit on the frame
// the file lands. After a long hold the clock winds forward along the same turn and the files shrink away into the folder, last
// home first gone, so the loop opens on the same empty folder.
const REWIND = 8 // the clock starts winding back
const WIND = 40 // frames the wind takes, back and forward
const FORWARD = 134 // the clock winds forward again
const FLY = 18 // frames a file takes to drop from where it appeared into its slot
const LANDS = [50, 58, 66] as const
const GONE = [142, 138, 134] as const // files shrink away, last home first gone
const KNOCK: Vec = [0, 9]
const W = 96
const H = 124
const SLOT_Y = -58 // a filed sheet's centre, peeking over the front
const FOLD_BACK = poly([[-130, -100], [-56, -100], [-34, -76], [130, -76], [130, 92], [-130, 92]], [18, 8, 8, 18, 18, 18])
const CLOCK: Vec = [116, 74] // the backup badge, over the folder front's bottom right corner
const ARROW_R = 62 // centre line of the rewind arrow's band
const BAND = 13

// a thick arc band from `from` to `to` degrees (clockwise in canvas space), as one closed slab path
const band = (r: number, w: number, from: number, to: number): string => {
  const [o, i] = [r + w / 2, r - w / 2]
  const pt = (rad: number, deg: number) => `${(Math.cos((deg * Math.PI) / 180) * rad).toFixed(2)} ${(Math.sin((deg * Math.PI) / 180) * rad).toFixed(2)}`
  const large = to - from > 180 ? 1 : 0
  return `M${pt(o, from)}A${o} ${o} 0 ${large} 1 ${pt(o, to)}L${pt(i, to)}A${i} ${i} 0 ${large} 0 ${pt(i, from)}Z`
}

// the rewind arrow: a band round the clock with its head at the top right, pointing anticlockwise
const ARROW_FROM = -56
const ARROW_HEAD = (() => {
  const t = (ARROW_FROM * Math.PI) / 180
  const [c, s] = [Math.cos(t), Math.sin(t)]
  const dir: Vec = [s, -c] // anticlockwise tangent
  const base: Vec = [c * ARROW_R, s * ARROW_R]
  const tip: Vec = [base[0] + dir[0] * 30, base[1] + dir[1] * 30]
  const half = BAND * 1.7
  return poly([tip, [base[0] + c * half, base[1] + s * half], [base[0] - c * half, base[1] - s * half]], 3)
})()

// a lost file: pops into being at `from` (its offset above the slot), drops home on IN, shrinks away at `gone`
const file = (x: number, from: Vec, turn: number, land: number, gone: number, kind: 'doc' | 'img' | 'pdf', tag: Shape['fill']): Layer => ({
  parent: 'folder',
  a: [x, SLOT_Y],
  p: [x, SLOT_Y],
  m: {
    s: popScale(land - FLY - 24, gone),
    p: [[0, from], [land - FLY, from, IN], [land, [0, 0]]],
    r: [[0, turn], [land - FLY, turn, IN], [land, 0]],
  },
  shapes: sheet(W, H, tag, kind, x, SLOT_Y),
})

const backupRestore: Icon = {
  name: 'backup-restore',
  frames: 180,
  still: 96,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [228, 296], shapes: [] },
    // the folder takes each landing; the files already home ride it
    { id: 'folder', parent: 'root', tilt: FACE, m: LANDS.map((t) => hit(t, KNOCK, 0.6)), shapes: [{ d: FOLD_BACK, fill: 'main', depth: 1 }] },
    file(-76, [20, -176], -14, LANDS[0], GONE[0], 'doc', 'deep'),
    file(0, [46, -206], 6, LANDS[1], GONE[1], 'img', 'main'),
    file(76, [70, -160], 16, LANDS[2], GONE[2], 'pdf', 'deep'),
    {
      parent: 'folder',
      shapes: [{ d: rect(-130, -46, 260, 138, 18), fill: 'main', depth: 1 }, { d: pill(-92, -12, 92, 28), fill: 'white', depth: 0.3 }],
    },
    // the backup clock: its arrow winds back as the files return, forward as they go
    {
      id: 'clock',
      parent: 'folder',
      p: CLOCK,
      shapes: [{ d: ellipse(0, 0, 44), fill: 'white', depth: 0.8 }, { d: ellipse(0, 0, 32) }],
    },
    {
      parent: 'clock',
      r: outAndBack<number>(0, -360, REWIND, WIND, FORWARD, WIND),
      shapes: [{ d: band(ARROW_R, BAND, ARROW_FROM, 214), fill: 'deep', depth: 0.6 }, { d: ARROW_HEAD, fill: 'deep', depth: 0.6 }],
    },
    {
      parent: 'clock',
      r: outAndBack<number>(0, -720, REWIND + 4, WIND, FORWARD + 4, WIND),
      shapes: [{ d: line([0, 4], [0, -22]), line: 6 }],
    },
    {
      parent: 'clock',
      shapes: [{ d: line([0, 0], [14, 0]), line: 6 }, { d: ellipse(0, 0, 5), fill: 'ink', line: false }],
    },
    glow('root', [-178, -150], 22, popIn(LANDS[2] + 2, FORWARD - 10)),
    glow('root', [150, -196], 16, popIn(LANDS[2] + 8, FORWARD - 6)),
  ],
}

export default backupRestore
