// Video Editor
import { line, poly, rect } from '../engine.ts'
import { EXT, FACE, LINE, glow, hit, outAndBack, popIn } from '../parts.ts'
import type { Icon, Layer, Shape, Vec } from '../engine.ts'

// Four clips leave the media bin one after another and slide down into their places on the two timeline tracks; the
// editor takes the last one landing and a sparkle marks the cut being whole. The playhead sweeps across the edit and
// holds, then glides home, and the clips slide back into the bin last in, first home.
const CLIP_H = 30
const BIN_X = 48
const BIN_Y = [-104, -82, -60, -38] // each clip's place in the bin's pile, back first
const SLOTS: ReadonlyArray<Vec> = [[-112, 20], [-12, 20], [-142, 72], [-58, 72]] // each clip's place on the timeline
const WIDTHS = [96, 100, 80, 100]
const FILLS: ReadonlyArray<Shape['fill']> = ['main', 'gold', 'gold', 'main']

const CLIP_ON = 8 // the first clip sets off
const CLIP_GAP = 8 // the next follows this many frames later
const CLIP_LEN = 20
const LANDED = CLIP_ON + CLIP_GAP * 3 + CLIP_LEN // the last clip lands
const PLAY = LANDED + 6 // the playhead sets off
const PLAY_LEN = 56
const PLAY_X = 222 // how far it sweeps
const PLAY_BACK = 122
const PLAY_BLEN = 18
const CLIP_BACK = 132 // the last clip in leaves first
const HEAD_X = -138 // the playhead's rest

const clip = ([x, y]: Vec, i: number): Layer => {
  const order = SLOTS.length - 1 - i
  const bin: Vec = [BIN_X - x, BIN_Y[i] - y]
  return {
    parent: 'deck',
    p: outAndBack<Vec>(bin, [0, 0], CLIP_ON + i * CLIP_GAP, CLIP_LEN, CLIP_BACK + order * CLIP_GAP, CLIP_LEN),
    shapes: [
      { d: rect(x, y, WIDTHS[i], CLIP_H, 8), fill: FILLS[i], depth: 0.5 },
      { d: line([x + WIDTHS[i] / 3, y + 8], [x + WIDTHS[i] / 3, y + CLIP_H - 8]), line: 3 },
      { d: line([x + (WIDTHS[i] * 2) / 3, y + 8], [x + (WIDTHS[i] * 2) / 3, y + CLIP_H - 8]), line: 3 },
    ],
  }
}

const videoEditor: Icon = {
  name: 'video-editor',
  frames: 180,
  still: 118,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [254, 262], s: [92, 92], shapes: [] },
    {
      id: 'deck',
      parent: 'root',
      tilt: FACE,
      m: hit(LANDED, [0, 4], 0.5),
      shapes: [
        { d: rect(-175, -128, 350, 256, 28), fill: 'deep', depth: 1 },
        // the preview with its play button
        { d: rect(-154, -114, 182, 110, 14), fill: 'tint', depth: 0.3 },
        { d: poly([[-80, -80], [-80, -38], [-44, -59]], 4), fill: 'white', depth: 0.3 },
        // the media bin
        { d: rect(BIN_X - 10, -114, 116, 110, 14), fill: 'grey', depth: 0.3 },
        // the timeline and its two tracks
        { d: rect(-154, 8, 308, 106, 14), fill: 'grey', depth: 0.3 },
        { d: line([-144, 61], [144, 61]), line: 3 },
      ],
    },
    ...SLOTS.map(clip),
    // the playhead rides over the tracks
    {
      parent: 'deck',
      p: outAndBack<Vec>([0, 0], [PLAY_X, 0], PLAY, PLAY_LEN, PLAY_BACK, PLAY_BLEN),
      shapes: [
        { d: line([HEAD_X, 16], [HEAD_X, 108]) },
        { d: poly([[HEAD_X - 11, 2], [HEAD_X + 11, 2], [HEAD_X + 11, 12], [HEAD_X, 22], [HEAD_X - 11, 12]], 3), fill: 'white', depth: 0.4 },
      ],
    },
    glow('root', [-178, -148], 24, popIn(LANDED + 2, PLAY_BACK)),
    glow('root', [182, 120], 16, popIn(PLAY + PLAY_LEN - 4, PLAY_BACK + 4)),
  ],
}

export default videoEditor
