// Return & Refund
import { line, poly, rect } from '../engine.ts'
import { IN, SNAP, SOFT, twinkle } from '../motions.ts'
import { coin, EXT, FACE, facePoint, glow, hit, LINE, popIn } from '../parts.ts'
import type { Icon, Shape, Track, Vec } from '../engine.ts'

// The parcel slides back to the shop and shrinks into its doorway; the shop takes it with a knock on that frame. A beat later
// a coin pops out of the same door, arcs over and drops into the wallet, which takes the hit as it lands. After the hold the
// coin sinks into the pocket and a fresh parcel pops in where the first one stood, ready to go back again.
const SEND = 8 // the parcel sets off for the door
const DOORSTEP = 40 // it reaches the door and is gone inside
const COIN_IN = 48 // the coin pops up in the doorway
const COIN_OUT = COIN_IN + 10 // and sets off
const TOP = COIN_OUT + 18 // the top of its arc
const LAND = TOP + 18 // it drops into the wallet
const SINK = 132 // the coin sinks into the pocket
const BACK = 146 // a new parcel pops in at its spot

// face points: the shop on the left, the parcel at its right, the wallet in front
const DOOR: Vec = [-62, 4] // the door's centre
const PARCEL: Vec = [108, -16] // the parcel's centre at rest
const POCKET: Vec = [92, 118] // where the coin rests, peeking out of the wallet

const DOOR_AT = facePoint(...DOOR)
const PARCEL_AT = facePoint(...PARCEL)
const POCKET_AT = facePoint(...POCKET)
const APEX: Vec = [(DOOR_AT[0] + POCKET_AT[0]) / 2 + 20, DOOR_AT[1] - 150]
const DEEP: Vec = [POCKET_AT[0], POCKET_AT[1] + 46] // sunk out of sight behind the pocket front

// the parcel: SNAP from its spot to the door, held there while it is shrunk away, home again unseen before it pops back
const CARRY: Track<Vec> = [[SEND, PARCEL_AT, SNAP], [DOORSTEP, DOOR_AT, 0], [BACK - 2, PARCEL_AT]]
const SHRINK: Track<Vec> = [[DOORSTEP - 10, [100, 100], IN], [DOORSTEP, [0, 0], 0], ...(twinkle(BACK).s ?? [])]

// the coin's flight: out of the door on SOFT, up to the top, then down faster and faster on IN, the way money-send throws it
const FLIGHT: Track<Vec> = [
  [COIN_IN, DOOR_AT, 0],
  [COIN_OUT, DOOR_AT, SOFT, [[10, -70], [-60, 0]]],
  [TOP, APEX, IN, [[50, 0], [0, -80]]],
  [LAND, POCKET_AT, 0],
  [SINK, POCKET_AT, IN],
  [SINK + 16, DEEP],
]

// a shop front: wall, striped awning, door, window, and a sign with the return arrow
const AWNING = (x: number, w: number, y: number, n: number): string => {
  const step = w / n
  const scallops = Array.from({ length: n }, (_, i) => `A${step / 2} ${step / 2} 0 0 1 ${x + w - (i + 1) * step} ${y + 26}`).join('')
  return `M${x} ${y}L${x + w} ${y}L${x + w} ${y + 26}${scallops}Z`
}
const shop = (): ReadonlyArray<Shape> => [
  { d: rect(-158, -116, 176, 166, 10), fill: 'white', depth: 1 },
  { d: rect(-170, -176, 200, 52, 12), fill: 'main', depth: 0.8 },
  { d: AWNING(-170, 200, -126, 5), fill: 'main', depth: 0.5 },
  ...[-130, -50].map((x): Shape => ({ d: rect(x, -126, 40, 24), fill: 'white', line: false })),
  { d: rect(-90, -46, 56, 96, 6), fill: 'ink', line: false },
  { d: rect(-140, -46, 36, 40, 6), fill: 'grey', depth: 0.3 },
  { d: rect(-118, -168, 96, 36, 8), fill: 'white', depth: 0.3 },
  { d: line([-40, -142], [-40, -158], [-96, -158]) },
  { d: line([-84, -168], [-98, -158], [-84, -148]) },
]
const parcel = (): ReadonlyArray<Shape> => [
  { d: rect(PARCEL[0] - 48, PARCEL[1] - 40, 96, 80, 6), fill: 'gold', depth: 1 },
  { d: rect(PARCEL[0] - 52, PARCEL[1] - 46, 104, 20, 5), fill: 'gold', depth: 0.4 },
  { d: rect(PARCEL[0] - 10, PARCEL[1] - 46, 20, 86), fill: 'white', line: 4 },
  { d: rect(PARCEL[0] + 18, PARCEL[1] + 6, 20, 18, 3), fill: 'white', line: 3 },
]

const returnRefund: Icon = {
  name: 'return-refund',
  frames: 180,
  still: 112,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [232, 244], shapes: [] },
    { parent: 'root', tilt: FACE, m: hit(DOORSTEP, [-2, 6], 0.7), shapes: shop() },
    { parent: 'root', a: PARCEL, p: CARRY, s: SHRINK, tilt: FACE, shapes: parcel() },
    { id: 'wallet', parent: 'root', tilt: FACE, m: hit(LAND, [1, 6], 0.6), shapes: [{ d: rect(POCKET[0] - 100, POCKET[1] - 40, 200, 110, 22), fill: 'main', depth: 1 }] },
    { parent: 'root', p: FLIGHT, r: [[COIN_OUT, 0, SOFT], [TOP, -180, IN], [LAND, -360]], ip: COIN_IN, op: SINK + 16, m: twinkle(COIN_IN), tilt: FACE, shapes: coin(30) },
    {
      parent: 'root',
      tilt: FACE,
      m: hit(LAND + 3, [1, 6], 0.6),
      shapes: [
        { d: rect(POCKET[0] - 100, POCKET[1] + 10, 200, 70, 22), fill: 'main', depth: 1 },
        { d: poly([[POCKET[0] + 30, POCKET[1] + 22], [POCKET[0] + 100, POCKET[1] + 22], [POCKET[0] + 100, POCKET[1] + 62], [POCKET[0] + 30, POCKET[1] + 62]], [14, 0, 0, 14]), fill: 'white', depth: 0.5 },
      ],
    },
    glow('root', [POCKET_AT[0] + 54, POCKET_AT[1] - 96], 22, popIn(LAND + 2, SINK - 6)),
  ],
}

export default returnRefund
