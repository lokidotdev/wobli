// Luggage Tracking
import { ellipse, line, poly, rect } from '../engine.ts'
import { SOFT, hop, springTurn } from '../motions.ts'
import { EXT, FACE, LINE, facePoint, glow, mapPin, popIn, popScale, shackle, wave } from '../parts.ts'
import type { Icon, Track, Vec } from '../engine.ts'

// The suitcase hops and slams back down on its wheels. The landing kicks its tag out on the strap and the tag swings home
// through rest on the spring, each swing half the last. On the same frame a location pin pops up over the case and two
// signal waves pulse out from its head, a sparkle on the find. After the hold the pin pops away where it appeared.
const PIVOT: Vec = [30, -112] // where the tag's strap loops round the handle: the tag swings about it
const HOLE: Vec = [62, -58]
const TAG = { x: 62, y: -66, w: 64, h: 104 } // centre top of the tag and its size
const PIN_TIP: Vec = facePoint(118, -150)
const PIN_K = 0.42
const PIN_HEAD: Vec = [PIN_TIP[0], PIN_TIP[1] - 160 * PIN_K]

const LAND = 54 // the hop slams through rest: the tag and the pin answer here
const PACE = 0.8
const GONE = 150
const SWING: Track<number> = [[LAND - 4, 0, SOFT], ...springTurn(0, LAND, PACE, -24)]

const tagBody = poly(
  [
    [TAG.x, TAG.y],
    [TAG.x + TAG.w / 2, TAG.y + 22],
    [TAG.x + TAG.w / 2, TAG.y + TAG.h],
    [TAG.x - TAG.w / 2, TAG.y + TAG.h],
    [TAG.x - TAG.w / 2, TAG.y + 22],
  ],
  [8, 10, 12, 12, 10],
)

const luggageTracking: Icon = {
  name: 'luggage-tracking',
  frames: 180,
  still: 112,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [236, 308], m: hop, shapes: [] },
    // the case: wheels and handle behind the body, two straps across it
    {
      id: 'case',
      parent: 'root',
      tilt: FACE,
      shapes: [
        { d: ellipse(-70, 132, 17), fill: 'deep', depth: 0.6 },
        { d: ellipse(70, 132, 17), fill: 'deep', depth: 0.6 },
        { d: shackle(100, 20, -98, 8), fill: 'deep', depth: 0.8 },
        { d: rect(-112, -106, 224, 236, 30), fill: 'main', depth: 1 },
        { d: rect(-74, -106, 22, 236), fill: 'deep', depth: 0.25 },
        { d: rect(52, -106, 22, 236), fill: 'deep', depth: 0.25 },
        { d: rect(-34, -84, 68, 18, 8), fill: 'white', depth: 0.3 },
      ],
    },
    // the tag on its strap, swinging from the handle
    {
      parent: 'case',
      a: PIVOT,
      p: PIVOT,
      m: { r: SWING },
      shapes: [
        { d: line(PIVOT, HOLE), line: 6, round: true },
        { d: tagBody, fill: 'white', depth: 0.5 },
        { d: ellipse(HOLE[0], HOLE[1], 7), fill: 'ink', line: false },
        { d: mapPin(TAG.x, TAG.y + 82, 0.22), fill: 'hot', line: 4, depth: 0.3 },
        { d: ellipse(TAG.x, TAG.y + 82 - 160 * 0.22, 6), fill: 'white', line: 3 },
      ],
    },
    // the location pin over the case and its signal
    wave('root', PIN_HEAD, 56, LAND + 2, -125, -55),
    wave('root', PIN_HEAD, 76, LAND + 10, -120, -60),
    {
      parent: 'root',
      a: PIN_TIP,
      p: PIN_TIP,
      m: { s: popScale(LAND - 6, GONE) },
      shapes: [
        { d: mapPin(PIN_TIP[0], PIN_TIP[1], PIN_K), fill: 'hot', depth: 0.7 },
        { d: ellipse(PIN_HEAD[0], PIN_HEAD[1], 16), fill: 'white', line: 4, depth: 0.3 },
      ],
    },
    glow('root', [-150, -150], 22, popIn(LAND + 6, GONE - 14)),
  ],
}

export default luggageTracking
