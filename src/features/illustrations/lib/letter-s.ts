// Letter S: the last "S" of "ILLUSTRATIONS" in the page headline, as a live sticker. Not a catalogue illustration, so it
// lives with the page and draws on the package's engine, presets and shared parts.
import { motions, parts, poly } from 'wobli'
import type { Icon, Vec } from 'wobli'

const { hop } = motions
const { EXT, FACE, LINE, glow, popIn } = parts

// The letter hops: it rises tilting, slams back through rest and rebounds twice (the hop preset, whole), the same move as the
// landing page's I. The raised plate on its face trails the body by a few frames, and two sparkles pop on the frame it lands.
// Then a long still hold.
const LAND = 54 // the frame the hop slams through rest
const CLEAR = 132

// a blocky capital S: `w` wide and `h` tall, stroke `t` thick, each end hooked back by `hook` so it never reads as a 5;
// bends rounded by `bend` and the rest by `r`, centred on 0 0
const blockS = (w: number, h: number, t: number, hook: number, bend: number, r: number): string => {
  const [x, y, m] = [w / 2, h / 2, t / 2]
  const half: ReadonlyArray<Vec> = [[-x, -y], [x, -y], [x, -y + t + hook], [x - t, -y + t + hook], [x - t, -y + t], [-x + t, -y + t], [-x + t, -m], [x, -m]]
  // the lower half is the upper turned half a turn
  const pts = [...half, ...half.map(([px, py]): Vec => [-px, -py])]
  const radii = [bend, bend, r, r, r, r, r, bend]
  return poly(pts, [...radii, ...radii])
}

const letterS: Icon = {
  name: 'letter-s',
  frames: 180,
  still: 110,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', a: [0, 150], p: [250, 400], m: hop, shapes: [] }, // untilted, pivots at the foot: carries the hop and the sparkles
    { id: 'face', parent: 'root', tilt: FACE, shapes: [{ d: blockS(200, 300, 62, 30, 50, 10), fill: 'main', depth: 1 }] },
    { parent: 'face', m: { ...hop, at: 5, k: 0.5 }, shapes: [{ d: blockS(152, 252, 14, 30, 28, 4), fill: 'white', depth: 0.3 }] },
    glow('root', [-146, -142], 26, popIn(LAND, CLEAR)),
    glow('root', [138, 96], 16, popIn(LAND + 8, CLEAR + 6)),
  ],
}

export default letterS
