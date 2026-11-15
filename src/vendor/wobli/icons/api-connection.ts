// API Connection
import { ellipse, line, rect } from '../engine.ts'
import { IN } from '../motions.ts'
import { EXT, FACE, LINE, glow, hit, numeral, popIn, popScale } from '../parts.ts'
import type { Icon, Layer, Shape, Vec } from '../engine.ts'

// A request: a white `{ }` packet pops out of the client card, speeds along the top lane and strikes the server stack, which
// takes the hit with the spring; the packet is swallowed and the server's light comes on. The reply: a green 200 chip pops out of
// the server, runs back along the bottom lane and strikes the client, which takes it in turn. After a long hold the chip pops away
// and the light goes out.
const SEND = 8 // the request packet pops out of the client
const GO = 16 // it sets off
const ARRIVE = 42 // it strikes the server
const REPLY = 60 // the 200 chip pops out of the server
const RETURN = 68 // it sets off back
const LAND = 94 // it strikes the client
const CLEAR = 146 // the chip pops away
const DARK = 150 // the server light goes out

const REQ_Y = -34 // the top lane, request
const RES_Y = 38 // the bottom lane, response
const CLIENT_EDGE = -86 // where a chip sits against the client
const SERVER_EDGE = 86 // where a chip sits against the server
const LED: Vec = [160, -58]

// the client: a window card with a title bar of three dots and a screen of text lines
const client: ReadonlyArray<Shape> = [
  { d: rect(-190, -96, 104, 192, 20), fill: 'main', depth: 1 },
  { d: rect(-176, -60, 76, 140, 10), fill: 'white', depth: 0.25 },
  ...[-170, -155, -140].map((x): Shape => ({ d: ellipse(x, -78, 5), fill: 'white', line: 4 })),
  { d: line([-162, -36], [-120, -36]) },
  { d: line([-150, -14], [-114, -14]) },
  { d: line([-162, 8], [-130, 8]) },
]

// the server: a deep stack of two blades, each with a light and a vent
const server: ReadonlyArray<Shape> = [
  { d: rect(86, -96, 104, 192, 20), fill: 'deep', depth: 1 },
  ...[-82, 8].flatMap((y): ReadonlyArray<Shape> => [
    { d: rect(100, y, 76, 70, 10), fill: 'white', depth: 0.35 },
    { d: ellipse(160, y + 24, 9), fill: 'grey', line: 4 },
    { d: line([114, y + 24], [138, y + 24]) },
    { d: line([114, y + 46], [162, y + 46]) },
  ]),
]

// a lane between the two, with a chevron saying which way it runs
const lane = (y: number, dir: 1 | -1): ReadonlyArray<Shape> => [
  { d: rect(-86, y - 8, 172, 16, 8), fill: 'grey', depth: 0.3 },
  { d: line([-6 * dir, y - 14], [8 * dir, y], [-6 * dir, y + 14]), round: true },
]

// a brace `{` or `}` as one ink stroke, opening towards dir
const brace = (x: number, dir: 1 | -1): string =>
  line([x + 6 * dir, -13], [x, -13], [x, -4], [x - 5 * dir, 0], [x, 4], [x, 13], [x + 6 * dir, 13])

const request: Layer = {
  parent: 'face',
  p: [[GO, [CLIENT_EDGE + 30, REQ_Y], IN], [ARRIVE, [SERVER_EDGE - 30, REQ_Y]]],
  s: popScale(SEND, ARRIVE),
  shapes: [
    { d: rect(-30, -19, 60, 38, 11), fill: 'white', depth: 0.5 },
    { d: brace(-10, 1), round: true },
    { d: brace(10, -1), round: true },
  ],
}

const response: Layer = {
  parent: 'face',
  p: [[RETURN, [SERVER_EDGE - 40, RES_Y], IN], [LAND, [CLIENT_EDGE + 38, RES_Y]]],
  s: popScale(REPLY, CLEAR),
  shapes: [
    { d: rect(-38, -19, 76, 38, 11), fill: 'ok', depth: 0.5 },
    { d: numeral(2, -27, -11, 12, 22), line: 4, round: true },
    { d: numeral(0, -6, -11, 12, 22), line: 4, round: true },
    { d: numeral(0, 15, -11, 12, 22), line: 4, round: true },
  ],
}

const apiConnection: Icon = {
  name: 'api-connection',
  frames: 180,
  still: 110,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [250, 250], shapes: [] },
    { id: 'face', parent: 'root', tilt: FACE, shapes: [] },
    { parent: 'face', shapes: [...lane(REQ_Y, 1), ...lane(RES_Y, -1)] },
    { id: 'server', parent: 'face', m: hit(ARRIVE, [8, 0]), shapes: server },
    { parent: 'server', a: LED, p: LED, m: popIn(ARRIVE + 2, DARK), shapes: [{ d: ellipse(LED[0], LED[1], 9), fill: 'ok', line: 4 }] },
    { id: 'client', parent: 'face', m: hit(LAND, [-8, 0]), shapes: client },
    request,
    response,
    glow('root', [-150, -150], 22, popIn(LAND + 2, CLEAR - 10)),
  ],
}

export default apiConnection
