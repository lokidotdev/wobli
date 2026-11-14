// Face ID Unlock
import { arc, ellipse, line, pill, rect } from '../engine.ts'
import { SNAP } from '../motions.ts'
import { EXT, FACE, LINE, PHONE_SCREEN, checkBadge, glow, outAndBack, outIn, phoneBody, popIn } from '../parts.ts'
import type { Icon, Shape, Vec } from '../engine.ts'

// A scan line grows out of the middle of the screen and sweeps down the face inside its frame, then shrinks back into itself.
// The face and its frame turn into a check, and on that same beat the padlock above springs open. After a long hold the check
// goes, the face comes back and the shackle drops home along the path it rose on.
const FACE_MID: Vec = [0, -6]
const LOCK: Vec = [0, -94] // the padlock body's centre, at the top of the screen
const SCAN_TOP: Vec = [0, -62]
const UNLOCK = 52 // the frame the face starts turning into the check
const RELOCK = 140 // the check leaves, the lock closes

// four corner brackets around the face, the Face ID frame
const BRACKETS: ReadonlyArray<Shape> = [-1, 1].flatMap((sx) =>
  [-1, 1].map((sy): Shape => ({ d: line([sx * 58, FACE_MID[1] + sy * 34], [sx * 58, FACE_MID[1] + sy * 58], [sx * 34, FACE_MID[1] + sy * 58]), line: 7 })),
)

const faceUnlock: Icon = {
  name: 'face-unlock',
  frames: 180,
  still: 100,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [258, 252], s: [114, 114], shapes: [] },
    { parent: 'root', tilt: FACE, shapes: phoneBody(32, 'deep') },
    { id: 'screen', parent: 'root', tilt: FACE, shapes: [{ d: PHONE_SCREEN(22), fill: 'tint' }] },
    { parent: 'root', tilt: FACE, shapes: [{ d: pill(-36, 116, 72, 8), fill: 'ink', line: false }] },
    // the padlock: shackle behind the body, rising and swinging off its left leg
    { id: 'lock', parent: 'root', tilt: FACE, shapes: [] },
    {
      parent: 'lock',
      a: [LOCK[0] - 13, LOCK[1] - 10],
      p: [LOCK[0] - 13, LOCK[1] - 10],
      m: { p: outAndBack<Vec>([0, 0], [0, -12], UNLOCK + 4, 22, RELOCK, 22), r: outAndBack(0, -28, UNLOCK + 8, 22, RELOCK - 4, 22) },
      shapes: [{ d: `M${LOCK[0] - 13} ${LOCK[1] - 6}L${LOCK[0] - 13} ${LOCK[1] - 20}A13 13 0 0 1 ${LOCK[0] + 13} ${LOCK[1] - 20}L${LOCK[0] + 13} ${LOCK[1] - 6}`, line: 6 }],
    },
    { parent: 'lock', shapes: [{ d: rect(LOCK[0] - 22, LOCK[1] - 10, 44, 30, 7), fill: 'white', depth: 0.4 }, { d: line([LOCK[0], LOCK[1]], [LOCK[0], LOCK[1] + 10]), line: 5 }] },
    // the face inside its frame
    {
      parent: 'root',
      tilt: FACE,
      a: FACE_MID,
      p: FACE_MID,
      m: outIn(UNLOCK - 4, RELOCK + 8),
      shapes: [
        ...BRACKETS,
        { d: ellipse(FACE_MID[0], FACE_MID[1], 34, 40), fill: 'white', depth: 0.2 },
        { d: line([-13, -20], [-13, -10]) },
        { d: line([13, -20], [13, -10]) },
        { d: line([2, -10], [2, 4], [-4, 4]) },
        { d: arc(0, 2, 16, 35, 145) },
      ],
    },
    // the scan line: grows out of its middle, sweeps down the face, shrinks back into itself
    {
      parent: 'root',
      tilt: FACE,
      clip: 'screen',
      a: SCAN_TOP,
      p: SCAN_TOP,
      ip: 4,
      op: 54,
      s: outAndBack<Vec>([0, 100], [100, 100], 4, 12, 40, 12),
      m: { p: [[8, [0, 0], SNAP], [46, [0, 108]]] },
      shapes: [{ d: pill(-62, SCAN_TOP[1] - 5, 124, 10), fill: 'ok', line: 4 }],
    },
    { parent: 'root', tilt: FACE, a: FACE_MID, p: FACE_MID, m: popIn(UNLOCK + 2, RELOCK), shapes: checkBadge(FACE_MID, 46, 0.5) },
    glow('root', [136, -150], 24, popIn(UNLOCK + 8, RELOCK - 12)),
    glow('root', [-146, -56], 16, popIn(UNLOCK + 14, RELOCK - 6)),
  ],
}

export default faceUnlock
