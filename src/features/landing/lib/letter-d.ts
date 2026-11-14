// Letter D: the "D" of "FEATURED" in the landing page's grid headline, as a live sticker. Not a catalogue illustration, so it
// lives with the landing page and draws on the package's engine, presets and shared parts.
import { motions, parts, poly } from 'wobli'
import type { Icon, Vec } from 'wobli'

const { hop } = motions
const { EXT, FACE, LINE, glow, popIn } = parts

// The letter hops: it rises tilting, slams back through rest and rebounds twice (the hop preset, whole), the same move as the
// hero's I. The raised plate on its face trails the body by a few frames, and two sparkles pop on the frame it lands. Then a
// long still hold.
const LAND = 54 // the frame the hop slams through rest
const CLEAR = 132

// a box `w` by `h` centred on 0 0 with a square left side and a bowed right side; `hole` winds it the other way, to cut a counter
const bowl = (w: number, h: number, bend: number, r: number, hole = false): string => {
  const [x, y] = [w / 2, h / 2]
  const pts: ReadonlyArray<Vec> = [[-x, -y], [x, -y], [x, y], [-x, y]]
  const radii = [r, bend, bend, r]
  return hole ? poly([...pts].reverse(), [...radii].reverse()) : poly(pts, radii)
}
// a blocky capital D: `w` wide and `h` tall, stroke `t` thick, its bow rounded by `bend`
const blockD = (w: number, h: number, t: number, bend: number, r: number): string =>
  bowl(w, h, bend, r) + bowl(w - t * 2, h - t * 2, Math.max(bend - t, 4), Math.min(r, 6), true)

const letterD: Icon = {
  name: 'letter-d',
  frames: 180,
  still: 110,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', a: [0, 150], p: [250, 400], m: hop, shapes: [] }, // untilted, pivots at the foot: carries the hop and the sparkles
    { id: 'face', parent: 'root', tilt: FACE, shapes: [{ d: blockD(204, 300, 64, 96, 10), fill: 'main', depth: 1 }] },
    { parent: 'face', m: { ...hop, at: 5, k: 0.5 }, shapes: [{ d: blockD(156, 252, 14, 72, 4), fill: 'white', depth: 0.3 }] },
    glow('root', [-146, -142], 26, popIn(LAND, CLEAR)),
    glow('root', [140, 96], 16, popIn(LAND + 8, CLEAR + 6)),
  ],
}

export default letterD
