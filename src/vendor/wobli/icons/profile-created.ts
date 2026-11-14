// Profile Created
import { arc, ellipse, pill, rect } from '../engine.ts'
import { EXT, FACE, LINE, checkBadge, glow, outAndBack, popIn, popScale } from '../parts.ts'
import type { Icon, Vec } from '../engine.ts'

// A blank profile card waits with a grey silhouette. The shoulders grow up out of it in colour, the head follows a beat later,
// then the face pops on; the name lines fill from the left and a check lands on the corner, the card dipping under it.
// After a long hold everything goes back into the silhouette the way it came, last in first out.
const FILL = 18 // the shoulders grow out of the silhouette
const FACE_ON = FILL + 14 // eyes and smile pop on
const NAME = FILL + 18 // name lines fill from the left
const BADGE_ON = 52 // the check lands
const BACK = 128 // the way home starts
const DISC: Vec = [0, -46]
const SHOULDERS: Vec = [0, 4] // bottom of the shoulders, where they grow from
const HEAD: Vec = [0, -66]
const BADGE: Vec = [94, -112]
const LINE_1: Vec = [-72, 56]
const LINE_2: Vec = [-48, 90]

const shoulders = `M-40 ${SHOULDERS[1]}A40 36 0 0 1 40 ${SHOULDERS[1]}Z`

const profileCreated: Icon = {
  name: 'profile-created',
  frames: 180,
  still: 100,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [262, 268], shapes: [] },
    {
      id: 'card',
      parent: 'root',
      tilt: FACE,
      m: { p: outAndBack<Vec>([0, 0], [0, 7], BADGE_ON, 6, BADGE_ON + 6, 12) },
      shapes: [
        { d: rect(-112, -136, 224, 272, 28), fill: 'white', depth: 1 },
        { d: ellipse(DISC[0], DISC[1], 70), fill: 'tint', depth: 0.3 },
        { d: shoulders, fill: 'grey', depth: 0.2 },
        { d: ellipse(HEAD[0], HEAD[1], 24), fill: 'grey', depth: 0.2 },
        { d: pill(LINE_1[0], LINE_1[1], 144, 20), fill: 'grey', depth: 0.2 },
        { d: pill(LINE_2[0], LINE_2[1], 96, 16), fill: 'grey', depth: 0.2 },
      ],
    },
    // the silhouette filling in: shoulders first, the head following
    { parent: 'card', a: SHOULDERS, p: SHOULDERS, m: { s: popScale(FILL, BACK + 16) }, shapes: [{ d: shoulders, fill: 'main', depth: 0.4 }] },
    {
      id: 'head',
      parent: 'card',
      a: HEAD,
      p: HEAD,
      m: { s: popScale(FILL + 6, BACK + 12) },
      shapes: [{ d: ellipse(HEAD[0], HEAD[1], 26), fill: 'main', depth: 0.4 }],
    },
    {
      parent: 'head',
      a: HEAD,
      p: HEAD,
      m: { s: popScale(FACE_ON, BACK + 6) },
      shapes: [
        { d: ellipse(HEAD[0] - 9, HEAD[1] - 5, 4), fill: 'ink', line: false },
        { d: ellipse(HEAD[0] + 9, HEAD[1] - 5, 4), fill: 'ink', line: false },
        { d: arc(HEAD[0], HEAD[1] + 1, 11, 35, 145), line: 4, round: true },
      ],
    },
    // name lines filling from the left, the second a beat behind
    {
      parent: 'card',
      a: [LINE_1[0], LINE_1[1] + 10],
      p: [LINE_1[0], LINE_1[1] + 10],
      m: { s: outAndBack<Vec>([0, 100], [100, 100], NAME, 20, BACK + 4, 16) },
      shapes: [{ d: pill(LINE_1[0], LINE_1[1], 144, 20), fill: 'deep', depth: 0.3 }],
    },
    {
      parent: 'card',
      a: [LINE_2[0], LINE_2[1] + 8],
      p: [LINE_2[0], LINE_2[1] + 8],
      m: { s: outAndBack<Vec>([0, 100], [100, 100], NAME + 6, 18, BACK, 14) },
      shapes: [{ d: pill(LINE_2[0], LINE_2[1], 96, 16), fill: 'deep', depth: 0.3 }],
    },
    { parent: 'card', a: BADGE, p: BADGE, m: popIn(BADGE_ON - 10, BACK - 6), shapes: checkBadge(BADGE, 40, 0.5) },
    glow('root', [-140, -112], 22, popIn(BADGE_ON + 4, BACK - 12)),
  ],
}

export default profileCreated
