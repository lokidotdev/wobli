// Hotel Key Card
import { ellipse, line, rect } from '../engine.ts'
import { IN, SOFT } from '../motions.ts'
import { EXT, FACE, LINE, glow, hit, numeral, outAndBack, popIn, wave } from '../parts.ts'
import type { Icon, Track, Vec } from '../engine.ts'

// The key card comes in faster and faster and taps the lock on the room door, which takes the hit; a wave ripples off the
// reader and the lock's light pops from red to green, the handle dipping a beat later as the door unlocks. The card lifts off
// on the mirror of the way it came; after the hold the handle comes back up and the light pops back to red.
const READER: Vec = [60, -6] // the reader pad's centre on the door
const LIGHT: Vec = [60, -52] // the lock's light, above the reader
const KNOB: Vec = [60, 66] // the handle's pivot, below the lock

const TAP = 30
const GREEN = TAP + 2
const DIP = GREEN + 8
const RAISE = 138
const RELOCK = 150

const AWAY: Vec = [190, 24] // where the card waits, beside the door
const CARD_P: Track<Vec> = [[6, AWAY, IN], [TAP, READER, 0], [TAP + 12, READER, SOFT], [TAP + 42, AWAY]]
const CARD_R: Track<number> = [[6, 14, IN], [TAP, -8, 0], [TAP + 12, -8, SOFT], [TAP + 42, 14]]

const hotelKeyCard: Icon = {
  name: 'hotel-key-card',
  frames: 180,
  still: 96,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [204, 264], s: [90, 90], shapes: [] },
    // the door in its frame, with the room number plate
    {
      id: 'door',
      parent: 'root',
      tilt: FACE,
      shapes: [
        { d: rect(-112, -214, 224, 428, 10), fill: 'white', depth: 1 },
        { d: rect(-90, -192, 180, 406, 6), fill: 'main', depth: 0.5 },
        { d: rect(-36, -166, 72, 44, 8), fill: 'white', depth: 0.3 },
        { d: numeral(2, -22, -157, 16, 26), line: 5 },
        { d: numeral(1, 4, -157, 16, 26), line: 5 },
        { d: rect(-64, -96, 80, 290, 6), line: 4 },
      ],
    },
    // the lock: a dark body with the reader pad and the light, taking the card's hit
    {
      id: 'lock',
      parent: 'door',
      m: hit(TAP, [-3, 2]),
      shapes: [
        { d: rect(32, -76, 56, 112, 14), fill: 'deep', depth: 0.6 },
        { d: rect(42, -30, 36, 48, 8), fill: 'tint', depth: 0.2 },
        { d: line([52, -14], [68, -14]), line: 4 },
        { d: line([52, 2], [68, 2]), line: 4 },
        { d: ellipse(LIGHT[0], LIGHT[1], 9), fill: 'hot', depth: 0.2 },
      ],
    },
    { parent: 'lock', a: LIGHT, p: LIGHT, m: popIn(GREEN, RELOCK), shapes: [{ d: ellipse(LIGHT[0], LIGHT[1], 9), fill: 'ok', depth: 0.2 }] },
    // the lever handle, dipping as the door unlocks
    {
      parent: 'door',
      a: KNOB,
      p: KNOB,
      m: { r: outAndBack(0, -26, DIP, 16, RAISE, 16) },
      shapes: [
        { d: rect(-4, KNOB[1] - 7, KNOB[0] + 4, 14, 7), fill: 'white', depth: 0.6 },
        { d: ellipse(KNOB[0], KNOB[1], 14), fill: 'white', depth: 0.7 },
      ],
    },
    wave('root', [56, -60], 74, TAP, -60, -10),
    // the key card, in the door's plane, tapping the reader
    {
      parent: 'door',
      p: CARD_P,
      r: CARD_R,
      shapes: [
        { d: rect(-62, -40, 124, 80, 10), fill: 'white', depth: 0.4 },
        { d: rect(-62, -26, 124, 16), fill: 'deep' },
        { d: ellipse(-36, 18, 10), fill: 'main', depth: 0.2 },
        { d: line([-18, 18], [36, 18]), line: 4 },
      ],
    },
    glow('root', [140, -170], 22, popIn(GREEN + 6, RELOCK - 8)),
  ],
}

export default hotelKeyCard
