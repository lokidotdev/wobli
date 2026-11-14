// Wi-Fi Connecting
import { ellipse, pill, rect } from '../engine.ts'
import { checkBadge, EXT, FACE, glow, LINE, outAndBack, popIn } from '../parts.ts'
import type { Icon, Layer, Shape, Vec } from '../engine.ts'

// Above the router the Wi-Fi mark fills green from its dot outward, one arc after another, each light swelling out of the
// one below it while the matching status light on the router comes on. On the frame the last arc fills the mark lifts and a
// check pops beside it. After a long hold everything goes home the way it came: outer arc first, the dot last.
const DOT: Vec = [0, -58] // the mark's centre, where every light swells from
const LIGHT = (i: number) => 12 + i * 12 // the dot, then each arc, fills
const FILL = 16 // frames for one light to fill
const CONNECTED = 60 // the last arc is full
const LET_GO = 124 // the mark settles, the check leaves
const DRAIN = (i: number) => 136 + (3 - i) * 6 // outer arc first, the dot last
const BADGE: Vec = [158, -112]
const BANDS: ReadonlyArray<readonly [number, number]> = [[34, 56], [72, 94], [110, 132]] // inner and outer radius of each arc
const SPREAD = 46 // degrees either side of straight up

// an arc band of the mark, a filled ring sector around the dot with squared ends
const band = (r0: number, r1: number): string => {
  const [a, b] = [((-90 - SPREAD) * Math.PI) / 180, ((-90 + SPREAD) * Math.PI) / 180]
  const at = (r: number, t: number) => `${(DOT[0] + Math.cos(t) * r).toFixed(2)} ${(DOT[1] + Math.sin(t) * r).toFixed(2)}`
  return `M${at(r1, a)}A${r1} ${r1} 0 0 1 ${at(r1, b)}L${at(r0, b)}A${r0} ${r0} 0 0 0 ${at(r0, a)}Z`
}
const PIECES = [ellipse(DOT[0], DOT[1], 17), ...BANDS.map(([r0, r1]) => band(r0, r1))]
const LED = (i: number): Vec => [-84 + i * 26, 36]

// a light: green swelling out of the dot, masked to one piece of the mark
const light = (i: number): Layer => ({
  parent: 'mark',
  clip: `piece${i}`,
  a: DOT,
  p: DOT,
  s: outAndBack<Vec>([0, 0], [100, 100], LIGHT(i), FILL, DRAIN(i), FILL),
  shapes: [{ d: ellipse(DOT[0], DOT[1], (BANDS[i - 1]?.[1] ?? 17) + 6), fill: 'ok', line: false }],
})

const wifiConnect: Icon = {
  name: 'wifi-connect',
  frames: 180,
  still: 96,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [250, 312], shapes: [] },
    ...[-1, 1].map((side): Layer => ({ parent: 'router', shapes: [{ d: pill(side * 104 - 9, -54, 18, 74), fill: 'deep', depth: 0.6 }] })),
    {
      id: 'router',
      parent: 'root',
      tilt: FACE,
      shapes: [
        { d: rect(-132, -4, 264, 80, 22), fill: 'deep', depth: 1 },
        ...[0, 1, 2, 3].map((i): Shape => ({ d: ellipse(...LED(i), 7), fill: 'white', depth: 0.2 })),
        { d: rect(54, 28, 52, 16, 6), fill: 'white', depth: 0.3 },
      ],
    },
    ...[0, 1, 2, 3].map((i): Layer => ({ parent: 'router', a: LED(i), p: LED(i), m: popIn(LIGHT(i) + 6, DRAIN(i) + 4), shapes: [{ d: ellipse(...LED(i), 7), fill: 'ok', line: false }] })),
    { id: 'mark', parent: 'router', a: DOT, p: DOT, m: { p: outAndBack<Vec>([0, 0], [0, -10], CONNECTED, 22, LET_GO, 22) }, shapes: PIECES.map((d): Shape => ({ d, fill: 'white', depth: 0.6 })) },
    ...PIECES.map((d, i): Layer => ({ id: `piece${i}`, parent: 'mark', shapes: [{ d, line: false }] })),
    ...[0, 1, 2, 3].map(light),
    { parent: 'router', a: BADGE, p: BADGE, m: popIn(CONNECTED + 4, LET_GO - 4), shapes: checkBadge(BADGE, 34, 0.5) },
    glow('root', [-176, -150], 22, popIn(CONNECTED + 10, LET_GO - 12)),
  ],
}

export default wifiConnect
