// Folder Organize
import { pill, poly, rect } from '../engine.ts'
import { IN, SOFT } from '../motions.ts'
import { EXT, FACE, LINE, glow, hit, popIn, sheet } from '../parts.ts'
import type { Icon, Layer, Shape, Vec } from '../engine.ts'

// Three loose files hang scattered over a row of colour coded folders. One after another each is thrown into the folder of
// its colour, crossing over the others, and the folder takes the hit on the frame the file lands. After a long hold the files
// lift back out to where they were, last in first out, so the loop closes on the same mess it opened with.
const GAP = 146 // between folder centres along the face
const SLOT: Vec = [0, -14] // inside a folder: where its file comes to rest, peeking over the front
const KNOCK: Vec = [0, 12]
const BACK = 120 // the first file starts back out
const FLY = 22
const RISE = 30
const FOLDER_BACK = poly([[-56, -54], [-22, -54], [-10, -40], [56, -40], [56, 50], [-56, 50]], [10, 5, 5, 10, 12, 12])

// a file thrown from `from` (absolute, on the face) into the folder at column `col`
const fileInto = (col: number, from: Vec, turn: number, land: number, back: number, tag: Shape['fill'], kind: 'doc' | 'img' | 'pdf'): Layer => {
  const rest: Vec = [from[0] - col * GAP, from[1]]
  return {
    parent: `folder${col}`,
    a: SLOT,
    p: SLOT,
    m: {
      p: [[0, rest], [land - FLY, rest, IN], [land, [0, 0], 0], [back, [0, 0], SOFT], [back + RISE, rest]],
      r: [[0, turn], [land - FLY, turn, IN], [land, 0, 0], [back, 0, SOFT], [back + RISE, turn]],
    },
    shapes: sheet(74, 94, tag, kind, SLOT[0], SLOT[1]),
  }
}

const folderBack = (col: number, fill: Shape['fill'], land: number): Layer => ({
  id: `folder${col}`,
  parent: 'shelf',
  p: [col * GAP, 0],
  m: hit(land, KNOCK, 0.7),
  shapes: [{ d: FOLDER_BACK, fill, depth: 1 }],
})

const folderFront = (col: number, fill: Shape['fill']): Layer => ({
  parent: `folder${col}`,
  shapes: [{ d: rect(-56, -12, 112, 62, 12), fill, depth: 1 }, { d: pill(-22, 6, 44, 16), fill: 'white', depth: 0.3 }],
})

const LANDS = [36, 50, 64]

const folderOrganize: Icon = {
  name: 'folder-organize',
  frames: 180,
  still: 104,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [256, 300], shapes: [] },
    { id: 'shelf', parent: 'root', tilt: FACE, s: [80, 80], shapes: [] },
    // farthest folder first, so each nearer one sits in front of the last
    folderBack(1, 'ok', LANDS[2]),
    fileInto(1, [10, -236], 10, LANDS[2], BACK, 'ok', 'pdf'),
    folderFront(1, 'ok'),
    folderBack(0, 'main', LANDS[1]),
    fileInto(0, [-130, -196], -12, LANDS[1], BACK + 4, 'main', 'img'),
    folderFront(0, 'main'),
    folderBack(-1, 'gold', LANDS[0]),
    fileInto(-1, [150, -180], 20, LANDS[0], BACK + 8, 'gold', 'doc'),
    folderFront(-1, 'gold'),
    glow('root', [-176, -60], 22, popIn(LANDS[2] + 2, BACK - 10)),
    glow('root', [150, -160], 18, popIn(LANDS[2] + 8, BACK - 6)),
  ],
}

export default folderOrganize
