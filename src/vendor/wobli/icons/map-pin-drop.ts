// Map Pin Drop
import { ellipse, rect } from '../engine.ts'
import { DROP, IN, OUT, glint, spring } from '../motions.ts'
import { EXT, FACE, LINE, facePoint, glow, hit, mapPin, popIn, popScale } from '../parts.ts'
import type { Icon, Track, Vec } from '../engine.ts'

// The pin pops in high over the map tile and drops onto its spot. On the frame it lands the tile takes the hit, the pin
// squashes into the ground and springs upright, and two ripples ring out across the map from the tip. After the hold the pin
// lifts back up the way it fell and pops away where it appeared.
const SPOT: Vec = [60, 52] // where the pin lands, on the tile's face
const TIP = facePoint(...SPOT)
const PIN_K = 0.5
const HEAD: Vec = [TIP[0], TIP[1] - 160 * PIN_K]
const HIGH = 112 // how far above its spot the pin hangs before it falls

const APPEAR = 4
const FALL = 24
const LAND = 46
const LIFT = 128
const GONE = 146

const SQUASH: Vec = [114, 84]
const PIN_P: Track<Vec> = [[FALL, [TIP[0], TIP[1] - HIGH], DROP], [LAND, TIP, 0], [LIFT, TIP, OUT], [LIFT + 22, [TIP[0], TIP[1] - HIGH]]]
const PIN_S: Track<Vec> = [[LAND - 2, [100, 100], IN], ...spring([100, 100], LAND, 0.6, SQUASH)]

const mapPinDrop: Icon = {
  name: 'map-pin-drop',
  frames: 180,
  still: 100,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [250, 290], m: hit(LAND, [0, 9]), shapes: [] },
    // the map tile and what is printed on it, each with its own thickness
    { id: 'tile', parent: 'root', tilt: FACE, shapes: [{ d: rect(-130, -130, 260, 260, 26), fill: 'tint', depth: 1 }] },
    {
      parent: 'root',
      tilt: FACE,
      clip: 'tile',
      shapes: [
        { d: rect(-140, -46, 280, 24), fill: 'white', line: 4, depth: 0.2 },
        { d: rect(-24, -140, 22, 280), fill: 'white', line: 4, depth: 0.2 },
        { d: rect(-104, -110, 64, 48, 10), fill: 'ok', line: 4, depth: 0.35 },
        { d: rect(30, -114, 70, 50, 10), fill: 'grey', line: 4, depth: 0.35 },
        { d: rect(-104, 28, 60, 72, 10), fill: 'white', line: 4, depth: 0.25 },
      ],
    },
    // the spot it lands on, then the two ripples that ring out from it
    { parent: 'root', tilt: FACE, shapes: [{ d: ellipse(SPOT[0], SPOT[1], 14), fill: 'white', line: 4, depth: 0.2 }] },
    { parent: 'root', tilt: FACE, a: SPOT, p: SPOT, m: glint(LAND, 100), shapes: [{ d: ellipse(SPOT[0], SPOT[1], 46) }] },
    { parent: 'root', tilt: FACE, a: SPOT, p: SPOT, m: glint(LAND + 6, 150), shapes: [{ d: ellipse(SPOT[0], SPOT[1], 46), line: 4 }] },
    // the pin: squashes on its tip as it lands
    {
      parent: 'root',
      a: TIP,
      p: PIN_P,
      s: PIN_S,
      m: { s: popScale(APPEAR, GONE) },
      shapes: [
        { d: mapPin(TIP[0], TIP[1], PIN_K), fill: 'hot', depth: 0.7 },
        { d: ellipse(HEAD[0], HEAD[1], 19), fill: 'white', line: 4, depth: 0.3 },
      ],
    },
    glow('root', [TIP[0] - 108, TIP[1] - 140], 22, popIn(LAND + 2, LIFT - 8)),
    glow('root', [TIP[0] + 92, TIP[1] - 96], 15, popIn(LAND + 8, LIFT - 4)),
  ],
}

export default mapPinDrop
