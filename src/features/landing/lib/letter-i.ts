// Letter I: the "I" of "LIVE" in the hero headline, as a live sticker. Not a catalogue illustration, so it lives with the
// landing page and draws on the package's engine, presets and shared parts.
import { line, motions, parts, poly } from 'wobli'
import type { Icon, Vec } from 'wobli'

const { hop } = motions
const { EXT, FACE, LINE, glow, popIn } = parts

// The letter hops: it rises tilting, slams back through rest and rebounds twice (the hop preset, whole). The raised plate on
// its face trails the body by a few frames, and two sparkles pop on the frame it lands. Then a long still hold.
const LAND = 54 // the frame the hop slams through rest
const CLEAR = 132

// a slab serif capital: `w` wide and `h` tall, bars `bar` thick, stem `stem` wide, centred on 0 0
const serifI = (w: number, h: number, bar: number, stem: number, r: number): string => {
  const [x, y, s] = [w / 2, h / 2, stem / 2]
  const pts: ReadonlyArray<Vec> = [[-x, -y], [x, -y], [x, -y + bar], [s, -y + bar], [s, y - bar], [x, y - bar], [x, y], [-x, y], [-x, y - bar], [-s, y - bar], [-s, -y + bar], [-x, -y + bar]]
  return poly(pts, r)
}

const letterI: Icon = {
  name: 'letter-i',
  frames: 180,
  still: 110,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', a: [0, 150], p: [250, 400], m: hop, shapes: [] }, // untilted, pivots at the foot: carries the hop and the sparkles
    { id: 'face', parent: 'root', tilt: FACE, shapes: [{ d: serifI(190, 300, 74, 84, 10), fill: 'main', depth: 1 }] },
    {
      parent: 'face',
      m: { ...hop, at: 5, k: 0.5 },
      shapes: [
        { d: serifI(134, 244, 30, 36, 5), fill: 'white', depth: 0.3 },
        { d: line([0, -62], [0, 62]), line: 4 },
      ],
    },
    glow('root', [-142, -140], 26, popIn(LAND, CLEAR)),
    glow('root', [132, 96], 16, popIn(LAND + 8, CLEAR + 6)),
  ],
}

export default letterI
