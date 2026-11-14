// Streaming Buffer
import { arc, ellipse, line, poly, rect, ring } from '../engine.ts'
import { SNAP, SOFT } from '../motions.ts'
import { EXT, FACE, LINE, glow, outAndBack, outIn, popIn } from '../parts.ts'
import type { Icon, Track, Vec } from '../engine.ts'

// The play button on the TV screen pops away and a buffer ring takes its place, spinning as its arc fills the circle.
// Once it closes the ring pops out, the hills rise into the picture, the sun follows a beat later and the progress
// line starts to run. The show folds back down the way it rose and the play button pops back for the next go.
const SC: Vec = [-36, -2] // the screen's centre
const FOOT: Vec = [-36, 80] // the screen's bottom edge, where the hills grow from
const SUN: Vec = [16, -42]

const PLAY_OUT = 4 // the play button pops away
const SPIN = 16 // the buffer ring pops in and starts to spin and fill
const DONE = 66 // the ring has closed
const SHOW = 90 // the show starts: hills rise
const OFF = 140 // the show folds away
const PLAY_IN = 148 // the play button pops back

// two full turns, wound up and slowed on one curve, while the arc fills; reset while the ring is hidden
const RING_R: Track<number> = [[SPIN, 0, SNAP], [DONE, 720]]
const RING_FILL: Track<number> = [[SPIN, 0.08, SOFT], [DONE, 1, 0], [100, 1, 0], [101, 0.08]]

const HILLS = `M-136 80L-136 34C-112 6 -76 4 -48 30C-24 6 12 2 64 26L64 80Z`

const streamingBuffer: Icon = {
  name: 'streaming-buffer',
  frames: 180,
  still: 122,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [262, 270], s: [94, 94], shapes: [] },
    // antennas behind the set
    {
      parent: 'root',
      tilt: FACE,
      shapes: [
        { d: line([-10, -104], [-70, -178]), line: 6 },
        { d: line([-10, -104], [44, -174]), line: 6 },
        { d: ellipse(-70, -178, 10), fill: 'gold', depth: 0.4 },
        { d: ellipse(44, -174, 10), fill: 'gold', depth: 0.4 },
      ],
    },
    {
      id: 'tv',
      parent: 'root',
      tilt: FACE,
      shapes: [
        { d: rect(-140, 100, 40, 26, 6), fill: 'deep', depth: 0.6 },
        { d: rect(80, 100, 40, 26, 6), fill: 'deep', depth: 0.6 },
        { d: rect(-162, -108, 324, 216, 30), fill: 'main', depth: 1 },
        { d: rect(-142, -88, 212, 176, 22), fill: 'deep', depth: 0.3 },
        { d: ellipse(-10, -104, 18), fill: 'deep', depth: 0.5 },
        { d: ellipse(116, -44, 18), fill: 'white', depth: 0.5 },
        { d: line([116, -58], [116, -44]) },
        { d: ellipse(116, 12, 18), fill: 'white', depth: 0.5 },
        { d: line([100, 54], [132, 54]) },
        { d: line([100, 70], [132, 70]) },
      ],
    },
    { id: 'screen', parent: 'tv', shapes: [{ d: rect(-136, -82, 200, 162, 18), fill: 'tint' }] },
    // the show: hills grow up from the screen's foot, the sun pops in after them
    {
      parent: 'tv',
      clip: 'screen',
      a: FOOT,
      p: FOOT,
      s: outAndBack<Vec>([100, 0], [100, 100], SHOW, 20, OFF + 2, 16),
      shapes: [{ d: HILLS, fill: 'ok' }],
    },
    { parent: 'tv', clip: 'screen', a: SUN, p: SUN, m: popIn(SHOW + 6, OFF - 4), shapes: [{ d: ellipse(SUN[0], SUN[1], 20), fill: 'gold' }] },
    { parent: 'tv', shapes: [{ d: line([-116, 62], [44, 62]), line: 6, trim: outAndBack(0, 0.6, SHOW + 12, 30, OFF - 10, 14) }] },
    // the play button
    {
      parent: 'tv',
      a: SC,
      p: SC,
      m: outIn(PLAY_OUT, PLAY_IN),
      shapes: [
        { d: ellipse(SC[0], SC[1], 38), fill: 'main', depth: 0.4 },
        { d: poly([[SC[0] - 11, SC[1] - 18], [SC[0] + 18, SC[1]], [SC[0] - 11, SC[1] + 18]], 4), fill: 'white', depth: 0.2 },
      ],
    },
    // the buffer ring: a white track, the ink arc filling it as it spins
    {
      parent: 'tv',
      a: SC,
      p: SC,
      r: RING_R,
      m: popIn(SPIN, DONE + 2),
      shapes: [
        { d: ring(SC[0], SC[1], 40, 28), fill: 'white', depth: 0.3 },
        { d: arc(SC[0], SC[1], 34, -90, 269.9), line: 8, round: true, trim: RING_FILL },
      ],
    },
    glow('root', [-176, -128], 24, popIn(SHOW + 8, OFF)),
    glow('root', [150, -150], 16, popIn(SHOW + 14, OFF + 4)),
  ],
}

export default streamingBuffer
