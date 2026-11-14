// Share Link
import { pill } from '../engine.ts'
import { IN, SOFT, springTurn } from '../motions.ts'
import { EXT, FACE, LINE, checkBadge, facePoint, glow, hit, outAndBack, popIn, sheet } from '../parts.ts'
import type { Icon, Track, Vec } from '../engine.ts'

// The chain link falls onto the file's corner faster and faster and snaps into place with a quick twist; the file takes the hit
// on the frame it lands. A beat later the "Copied" toast grows up out of the link with a sparkle. After a long hold the toast
// folds back into the link, and the link lifts off on the mirror of the way it came.
const SNAP = 34 // the link lands on the file
const TOAST_IN = 46 // the toast grows out of the link
const TOAST_OUT = 124 // the toast folds back into the link
const LIFT = 146 // the link lifts off

const LINK: Vec = [60, 54] // the link's centre on the face, over the file's lower right corner
const LINK_REST = facePoint(...LINK)
const LINK_TOP: Vec = [LINK_REST[0] + 40, LINK_REST[1] - 230]
const TOAST: Vec = [0, -206] // the toast's centre on the face
const KNOCK: Vec = [2, 9]

// a stadium ring along angle `ang` (degrees), its hole wound the other way so it stays open
const link = ([cx, cy]: Vec, half: number, r: number, hole: number, ang: number): string => {
  const [ux, uy] = [Math.cos((ang * Math.PI) / 180), Math.sin((ang * Math.PI) / 180)]
  const P = (s: number, t: number) => `${+(cx + ux * s - uy * t).toFixed(2)} ${+(cy + uy * s + ux * t).toFixed(2)}`
  return (
    `M${P(-half, -r)}L${P(half, -r)}A${r} ${r} 0 0 1 ${P(half, r)}L${P(-half, r)}A${r} ${r} 0 0 1 ${P(-half, -r)}Z` +
    `M${P(-half, -hole)}A${hole} ${hole} 0 0 0 ${P(-half, hole)}L${P(half, hole)}A${hole} ${hole} 0 0 0 ${P(half, -hole)}Z`
  )
}
const ANG = -26
const STEP = 44 // each loop's centre off the link's centre, along its axis
const LOOP_A: Vec = [LINK[0] - STEP * Math.cos((ANG * Math.PI) / 180), LINK[1] - STEP * Math.sin((ANG * Math.PI) / 180)]
const LOOP_B: Vec = [LINK[0] + STEP * Math.cos((ANG * Math.PI) / 180), LINK[1] + STEP * Math.sin((ANG * Math.PI) / 180)]

const DROP: Track<Vec> = [[0, LINK_TOP], [4, LINK_TOP, IN], [SNAP, LINK_REST, 0], [LIFT, LINK_REST, SOFT], [176, LINK_TOP]]

const shareLink: Icon = {
  name: 'share-link',
  frames: 180,
  still: 96,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [238, 290], m: hit(SNAP, KNOCK, 0.8), shapes: [] },
    { id: 'file', parent: 'root', tilt: FACE, shapes: sheet(190, 230, 'main', 'doc', -26, -6) },
    // the link: falls in growing, snaps a short twist home on the spring, lifts off on the mirror
    {
      id: 'link',
      parent: 'root',
      tilt: FACE,
      a: LINK,
      p: DROP,
      s: outAndBack<Vec>([0, 0], [100, 100], 0, 16, 162, 14),
      r: [...springTurn(0, SNAP, 0.8, 30), [LIFT, 0, SOFT], [176, 30]],
      shapes: [
        { d: link(LOOP_A, 22, 28, 17, ANG), fill: 'main', depth: 0.7 },
        { d: link(LOOP_B, 22, 28, 17, ANG), fill: 'main', depth: 0.7 },
      ],
    },
    // the toast: grows up out of the link, holds, folds back into it
    {
      parent: 'root',
      tilt: FACE,
      a: TOAST,
      ip: TOAST_IN - 2,
      op: TOAST_OUT + 24,
      p: outAndBack<Vec>(LINK_REST, facePoint(...TOAST), TOAST_IN, 22, TOAST_OUT, 22),
      s: outAndBack<Vec>([10, 10], [100, 100], TOAST_IN, 20, TOAST_OUT + 2, 20),
      shapes: [
        { d: pill(TOAST[0] - 92, TOAST[1] - 32, 184, 64), fill: 'white', depth: 0.6 },
        ...checkBadge([TOAST[0] - 58, TOAST[1]], 20, 0.4),
        { d: pill(TOAST[0] - 28, TOAST[1] - 8, 96, 16), fill: 'ink', line: false },
      ],
    },
    glow('root', [160, -150], 22, popIn(TOAST_IN + 14, TOAST_OUT - 6)),
    glow('root', [-176, 6], 16, popIn(TOAST_IN + 20, TOAST_OUT - 2)),
  ],
}

export default shareLink
