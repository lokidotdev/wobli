// File Download
import { pill, poly, rect } from '../engine.ts'
import { EASY, IN, SOFT, spring } from '../motions.ts'
import { EXT, FACE, LINE, facePoint, glow, outAndBack, outIn, popIn, sheet } from '../parts.ts'
import type { Icon, Track, Vec } from '../engine.ts'

// The arrow falls faster and faster into the tray, which takes the hit with the spring on the frame it lands. The bar under
// the tray fills, and as it tops out the file rises out of the tray it was dropped into. After a long hold the file sinks back
// first, the bar drains behind it, and the arrow lifts off on the mirror of the way it came.
const LAND = 30
const FILLED = 72
const SINK = 130
const ARROW_TOP: Vec = [0, -178]
const ARROW_IN: Vec = [0, -44]
const SLOT: Vec = [0, 30] // inside the tray: where the file comes from and goes back to
const HIT: Vec = [2, 8]
const FILL: Track<Vec> = [[LAND + 4, [0, 100], EASY], [FILLED, [100, 100], 0], [SINK + 8, [100, 100], EASY], [SINK + 34, [0, 100]]]

const fileDownload: Icon = {
  name: 'file-download',
  frames: 180,
  still: 108,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [250, 306], m: { p: [...spring(HIT, LAND, 0.92), [SINK + 10, HIT, SOFT], [176, [0, 0]]] }, shapes: [] },
    { id: 'tray', parent: 'root', tilt: FACE, shapes: [{ d: rect(-124, -60, 248, 120, 18), fill: 'deep', depth: 1 }] },
    {
      parent: 'root',
      tilt: FACE,
      a: SLOT,
      ip: FILLED - 4,
      op: SINK + 24,
      p: outAndBack<Vec>(facePoint(...SLOT), facePoint(0, -92), FILLED - 4, 26, SINK, 24),
      s: outAndBack<Vec>([24, 24], [100, 100], FILLED - 4, 22, SINK + 2, 22),
      shapes: sheet(112, 132, 'ok', 'doc', SLOT[0], SLOT[1]),
    },
    {
      parent: 'root',
      tilt: FACE,
      p: [[0, ARROW_TOP], [6, ARROW_TOP, IN], [LAND, ARROW_IN, 0], [150, ARROW_IN, SOFT], [176, ARROW_TOP]],
      m: outIn(LAND, 146),
      shapes: [{ d: poly([[0, 56], [-54, 0], [-22, 0], [-22, -56], [22, -56], [22, 0], [54, 0]], 6), fill: 'ok', depth: 0.8 }],
    },
    {
      parent: 'tray',
      shapes: [{ d: poly([[-124, -10], [-84, -10], [-66, 18], [66, 18], [84, -10], [124, -10], [124, 60], [-124, 60]], [8, 4, 4, 4, 4, 8, 18, 18]), fill: 'main', depth: 1 }],
    },
    { parent: 'tray', shapes: [{ d: pill(-114, 86, 228, 30), fill: 'white', depth: 0.6 }] },
    { parent: 'tray', a: [-104, 101], p: [-104, 101], s: FILL, shapes: [{ d: pill(-104, 93, 208, 16), fill: 'ok', line: false }] },
    glow('root', [136, -150], 24, popIn(FILLED + 6, SINK)),
    glow('root', [-158, -70], 16, popIn(FILLED + 12, SINK + 4)),
  ],
}

export default fileDownload
