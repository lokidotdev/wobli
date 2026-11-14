// Git Merge
import { ellipse, line, rect } from '../engine.ts'
import { checkBadge, EXT, FACE, glow, LINE, outAndBack, popIn } from '../parts.ts'
import type { Icon, Layer, Shape, Vec } from '../engine.ts'

// Main runs along the bottom of the board. A branch line grows up out of its first commit, picks up two commits of its own,
// then curves back down into main, and the merge commit lands as a check with a sparkle. After the hold it all goes home the
// way it came: the check shrinks, the branch draws back last out first home, its commits shrink as the line passes them.
const MAIN_Y = 52
const BRANCH_Y = -50
const X = 100 // fork and merge sit this far either side of the middle
const FORK: Vec = [-X, MAIN_Y] // where the branch leaves main
const MERGE: Vec = [X, MAIN_Y] // where it comes back
const SPLIT = `M${-X} ${MAIN_Y}C${-X} -10 ${-X + 18} ${BRANCH_Y} ${-X + 50} ${BRANCH_Y}L0 ${BRANCH_Y}` // up out of main, half the branch
const JOIN = `M0 ${BRANCH_Y}L${X - 50} ${BRANCH_Y}C${X - 18} ${BRANCH_Y} ${X} -10 ${X} ${MAIN_Y}` // the other half, down into main

const OUT_A = 10 // the branch starts growing
const LEN = 22
const NODE_1 = 22 // the line reaches the first branch commit
const OUT_B = 30
const NODE_2 = 34
const DONE = OUT_B + LEN // merged: the check lands
const CHECK_OUT = 124
const BACK_B = 128 // the second half draws back first
const NODE_2_OUT = 132
const BACK_A = BACK_B + LEN
const NODE_1_OUT = 146

const commit = (c: Vec, fill: Shape['fill']): Shape => ({ d: ellipse(c[0], c[1], 17), fill, depth: 0.5 })

const branchCommit = (c: Vec, a: number, b: number): Layer => ({ parent: 'board', a: c, p: c, m: popIn(a, b), shapes: [commit(c, 'white')] })

const gitMerge: Icon = {
  name: 'git-merge',
  frames: 180,
  still: 96,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'root', p: [250, 258], shapes: [] },
    {
      id: 'board',
      parent: 'root',
      tilt: FACE,
      shapes: [
        { d: rect(-150, -112, 300, 224, 26), fill: 'white', depth: 1 },
        { d: line([-126, MAIN_Y], [126, MAIN_Y]), line: 9, round: true },
      ],
    },
    { parent: 'board', shapes: [{ d: SPLIT, line: 9, round: true, trim: outAndBack(0, 1, OUT_A, LEN, BACK_A, LEN) }] },
    { parent: 'board', shapes: [{ d: JOIN, line: 9, round: true, trim: outAndBack(0, 1, OUT_B, LEN, BACK_B, LEN) }] },
    { parent: 'board', shapes: [commit(FORK, 'main'), commit([0, MAIN_Y], 'main'), commit(MERGE, 'main')] },
    branchCommit([-36, BRANCH_Y], NODE_1, NODE_1_OUT),
    branchCommit([36, BRANCH_Y], NODE_2, NODE_2_OUT),
    { parent: 'board', a: MERGE, p: MERGE, m: popIn(DONE, CHECK_OUT), shapes: checkBadge(MERGE, 30, 0.6) },
    glow('root', [158, -128], 22, popIn(DONE + 4, CHECK_OUT - 4)),
  ],
}

export default gitMerge
