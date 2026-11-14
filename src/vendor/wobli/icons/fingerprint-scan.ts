// Fingerprint Scan
import { ellipse, line, rect } from '../engine.ts'
import { EASY } from '../motions.ts'
import { EXT, FACE, glow, LINE, outAndBack, popIn, shackle } from '../parts.ts'
import type { Icon, Shape, Track, Vec } from '../engine.ts'

// The reader fills green from the bottom of the print to the top, and on the frame the scan completes the little lock's shackle
// springs open, the body lifting a beat behind it. After a long hold the shackle comes home the way it went, and only then does
// the green drain back down the print.
const SCANNED = 60 // the scan reaches the top: the lock answers on this frame
const SHUT = 128 // the shackle starts home
const DRAIN = 148 // the green starts back down
const LOCK: Vec = [142, -112]
const PIVOT: Vec = [-35, -30] // the shackle's left leg, the one that stays in

// a print ridge: an arch over the core with two legs of their own length
const ridge = (r: number, left: number, right: number, cy = 5) => `M${-r} ${cy + left}L${-r} ${cy}A${r} ${r} 0 0 1 ${r} ${cy}L${r} ${cy + right}`
const RIDGES = [ridge(16, 23, 12), ridge(32, 35, 26), ridge(48, 40, 37), ridge(63, 32, 42), line([0, -1], [0, 30])]
const FILL: Track<Vec> = [[8, [100, 0], EASY], [SCANNED, [100, 100], 0], [DRAIN, [100, 100], EASY], [DRAIN + 24, [100, 0]]]

const fingerprintScan: Icon = {
  name: 'fingerprint-scan',
  frames: 180,
  still: 96,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [222, 296], shapes: [] },
    { id: 'pad', parent: 'root', tilt: FACE, shapes: [{ d: rect(-110, -110, 220, 220, 48), fill: 'deep', depth: 1 }, { d: ellipse(0, 0, 88), fill: 'white' }] },
    { id: 'sensor', parent: 'pad', shapes: [{ d: ellipse(0, 0, 88), line: false }] },
    { parent: 'pad', clip: 'sensor', a: [0, 88], p: [0, 88], s: FILL, shapes: [{ d: rect(-88, -88, 176, 176), fill: 'ok', line: false }] },
    { parent: 'pad', shapes: RIDGES.map((d): Shape => ({ d, line: 7, round: true })) },
    { id: 'lock', parent: 'root', a: LOCK, p: LOCK, m: { p: outAndBack<Vec>([0, 0], [-4, -8], SCANNED + 4, 26, SHUT + 4, 26) }, shapes: [] },
    {
      parent: 'body',
      a: PIVOT,
      p: PIVOT,
      m: { r: outAndBack(0, -33, SCANNED, 30, SHUT, 30), p: outAndBack<Vec>([0, 0], [-8, -22], SCANNED, 30, SHUT, 30) },
      shapes: [{ d: shackle(90, 20, -22, 40), fill: 'grey', depth: 0.6 }],
    },
    {
      id: 'body',
      parent: 'lock',
      p: LOCK,
      tilt: FACE,
      shapes: [
        { d: rect(-64, -34, 128, 100, 18), fill: 'gold', depth: 0.8 },
        { d: ellipse(0, 10, 12), fill: 'ink', line: false },
        { d: rect(-4, 14, 8, 24, 3), fill: 'ink', line: false },
      ],
    },
    glow('root', [196, -196], 20, popIn(SCANNED + 4, 124)),
  ],
}

export default fingerprintScan
