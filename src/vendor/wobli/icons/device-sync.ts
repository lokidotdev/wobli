// Device Sync
import { arc, poly } from '../engine.ts'
import { EXT, FACE, LINE, PHONE_SCREEN, buzz, checkBadge, facePoint, glow, laptop, outAndBack, phoneBody, popIn, sheet } from '../parts.ts'
import type { Icon, Shape, Vec } from '../engine.ts'

// The sync arrows turn half a circle and, a few frames behind them, a copy of the laptop's file lifts off its screen and
// crosses to the phone, which buzzes on the frame it lands; a check pops on the copy. After a long hold the check goes, the
// copy travels back into the file it came from on the same line, and the arrows wind home last.
const LAPTOP: Vec = [72, 44]
const PHONE: Vec = [-150, 78]
const PHONE_SIZE: Vec = [58, 58]
const FILE_HOME: Vec = [LAPTOP[0] + facePoint(0, -88)[0], LAPTOP[1] + facePoint(0, -88)[1]] // the middle of the laptop's display
const FILE_AWAY: Vec = [PHONE[0] + facePoint(0, -14)[0], PHONE[1] + facePoint(0, -14)[1]]
const DONE: Vec = [FILE_AWAY[0] + facePoint(24, 30)[0], FILE_AWAY[1] + facePoint(24, 30)[1]]
const SYNC: Vec = [-70, -150]
const TURN = 8 // the arrows start
const LEAVE = 14 // the copy follows
const TRIP = 44
const LAND = LEAVE + TRIP
const RETURN = 124

// a curved arrow: an ink arc ending in a slab head
const arrowArc = (c: Vec, r: number, from: number, to: number): ReadonlyArray<Shape> => {
  const b = (to * Math.PI) / 180
  const tip: Vec = [c[0] + Math.cos(b) * r, c[1] + Math.sin(b) * r]
  const [tx, ty] = [-Math.sin(b), Math.cos(b)]
  const [nx, ny] = [Math.cos(b), Math.sin(b)]
  return [
    { d: arc(c[0], c[1], r, from, to - 12), line: 9, round: true },
    { d: poly([[tip[0] + tx * 18, tip[1] + ty * 18], [tip[0] - tx * 4 + nx * 16, tip[1] - ty * 4 + ny * 16], [tip[0] - tx * 4 - nx * 16, tip[1] - ty * 4 - ny * 16]], 3), fill: 'ok', depth: 0.5 },
  ]
}

const deviceSync: Icon = {
  name: 'device-sync',
  frames: 180,
  still: 96,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [262, 300], shapes: [] },
    { parent: 'root', p: LAPTOP, tilt: FACE, shapes: [...laptop('deep'), ...sheet(70, 90, 'ok', 'img', 0, -88)] },
    { id: 'phone', parent: 'root', p: PHONE, s: PHONE_SIZE, tilt: FACE, m: buzz(LAND, 2.5), shapes: [...phoneBody(32, 'main'), { d: PHONE_SCREEN(), fill: 'tint' }] },
    { parent: 'root', a: SYNC, p: SYNC, r: outAndBack(0, 180, TURN, 48, RETURN + 6, 48), shapes: [...arrowArc(SYNC, 44, 200, 340), ...arrowArc(SYNC, 44, 20, 160)] },
    {
      parent: 'root',
      tilt: FACE,
      p: outAndBack(FILE_HOME, FILE_AWAY, LEAVE, TRIP, RETURN),
      s: outAndBack<Vec>([100, 100], [76, 76], LEAVE, TRIP, RETURN),
      shapes: sheet(70, 90, 'ok', 'img'),
    },
    { parent: 'root', a: DONE, p: DONE, m: popIn(LAND + 2, RETURN - 22), shapes: checkBadge(DONE, 20) },
    glow('root', [-190, -70], 20, popIn(LAND + 4, RETURN - 14)),
  ],
}

export default deviceSync
