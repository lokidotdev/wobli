// SVG path data through a 2d affine: every command made absolute, H/V/S/T expanded and arcs turned to cubics,
// so the output is only M L C Q Z and stays exact under any skew or squash.

type M6 = readonly [number, number, number, number, number, number]

const num = /[-+]?(?:\d*\.\d+|\d+\.?)(?:[eE][-+]?\d+)?/g
const r2 = (v: number) => +v.toFixed(2)

function tokens(d: string): Array<[string, Array<number>]> {
  const out: Array<[string, Array<number>]> = []
  for (const m of d.matchAll(/([MmLlHhVvCcSsQqTtAaZz])([^MmLlHhVvCcSsQqTtAaZz]*)/g)) {
    const raw = m[2]
    // arc flags may be written run together ("011"), so pull numbers with flags split out
    let args: Array<number>
    if (m[1] === 'A' || m[1] === 'a') {
      args = []
      let s = raw.trim()
      let i = 0
      while (s.length) {
        s = s.replace(/^[\s,]+/, '')
        if (!s) break
        const slot = i % 7
        if (slot === 3 || slot === 4) {
          args.push(s[0] === '1' ? 1 : 0)
          s = s.slice(1)
        } else {
          const hit = s.match(/^[-+]?(?:\d*\.\d+|\d+\.?)(?:[eE][-+]?\d+)?/)
          if (!hit) break
          args.push(+hit[0])
          s = s.slice(hit[0].length)
        }
        i++
      }
    } else args = (raw.match(num) ?? []).map(Number)
    out.push([m[1], args])
  }
  return out
}

// endpoint arc to cubic beziers, as in the SVG implementation notes
function arcToCubics(x1: number, y1: number, rx: number, ry: number, phiDeg: number, fa: number, fs: number, x2: number, y2: number) {
  const out: Array<number> = []
  if (x1 === x2 && y1 === y2) return out
  if (!rx || !ry) return [x1, y1, x2, y2, x2, y2]
  rx = Math.abs(rx)
  ry = Math.abs(ry)
  const phi = (phiDeg * Math.PI) / 180
  const [cos, sin] = [Math.cos(phi), Math.sin(phi)]
  const [dx, dy] = [(x1 - x2) / 2, (y1 - y2) / 2]
  const x1p = cos * dx + sin * dy
  const y1p = -sin * dx + cos * dy
  const lam = (x1p * x1p) / (rx * rx) + (y1p * y1p) / (ry * ry)
  if (lam > 1) {
    rx *= Math.sqrt(lam)
    ry *= Math.sqrt(lam)
  }
  const num2 = rx * rx * ry * ry - rx * rx * y1p * y1p - ry * ry * x1p * x1p
  const den = rx * rx * y1p * y1p + ry * ry * x1p * x1p
  let co = Math.sqrt(Math.max(0, num2 / den))
  if (fa === fs) co = -co
  const cxp = (co * rx * y1p) / ry
  const cyp = (-co * ry * x1p) / rx
  const cx = cos * cxp - sin * cyp + (x1 + x2) / 2
  const cy = sin * cxp + cos * cyp + (y1 + y2) / 2
  const ang = (ux: number, uy: number, vx: number, vy: number) => Math.atan2(ux * vy - uy * vx, ux * vx + uy * vy)
  const t1 = ang(1, 0, (x1p - cxp) / rx, (y1p - cyp) / ry)
  let dt = ang((x1p - cxp) / rx, (y1p - cyp) / ry, (-x1p - cxp) / rx, (-y1p - cyp) / ry)
  if (!fs && dt > 0) dt -= 2 * Math.PI
  if (fs && dt < 0) dt += 2 * Math.PI
  const n = Math.max(1, Math.ceil(Math.abs(dt) / (Math.PI / 2) - 1e-9))
  const seg = dt / n
  const k = (4 / 3) * Math.tan(seg / 4)
  const on = (t: number) => {
    const [ex, ey] = [rx * Math.cos(t), ry * Math.sin(t)]
    return [cos * ex - sin * ey + cx, sin * ex + cos * ey + cy]
  }
  const tan = (t: number) => {
    const [ex, ey] = [-rx * Math.sin(t), ry * Math.cos(t)]
    return [cos * ex - sin * ey, sin * ex + cos * ey]
  }
  for (let i = 0; i < n; i++) {
    const [a, b] = [t1 + i * seg, t1 + (i + 1) * seg]
    const [p0, p3, d0, d3] = [on(a), on(b), tan(a), tan(b)]
    out.push(p0[0] + k * d0[0], p0[1] + k * d0[1], p3[0] - k * d3[0], p3[1] - k * d3[1], p3[0], p3[1])
  }
  // land exactly on the endpoint the path asked for
  out[out.length - 2] = x2
  out[out.length - 1] = y2
  return out
}

type Pt = [number, number]
// one drawn segment, all points absolute and already through the matrix: a line, a quadratic or a cubic
type Seg = { a: Pt; c: Array<Pt>; b: Pt }
type Sub = { segs: Array<Seg>; closed: boolean; start: Pt }

function parse(d: string, m: M6): Array<Sub> {
  const T = (x: number, y: number): Pt => [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]]
  const subs: Array<Sub> = []
  let sub: Sub | null = null
  let [cx, cy, sx, sy] = [0, 0, 0, 0]
  // the last control point, for S and T reflections
  let [qx, qy, ccx, ccy] = [0, 0, 0, 0]
  let prev = ''
  const seg = (ctrl: Array<Pt>, x: number, y: number) => {
    if (!sub) subs.push((sub = { segs: [], closed: false, start: T(cx, cy) }))
    sub.segs.push({ a: T(cx, cy), c: ctrl, b: T(x, y) })
    ;[cx, cy] = [x, y]
  }
  for (const [cmd, a] of tokens(d)) {
    const rel = cmd === cmd.toLowerCase()
    const C = cmd.toUpperCase()
    if (C === 'Z') {
      if (sub) {
        if (cx !== sx || cy !== sy) seg([], sx, sy)
        sub.closed = true
      }
      sub = null
      ;[cx, cy] = [sx, sy]
      prev = 'Z'
      continue
    }
    const size = { M: 2, L: 2, H: 1, V: 1, C: 6, S: 4, Q: 4, T: 2, A: 7 }[C] ?? 2
    for (let i = 0; i + size <= a.length; i += size) {
      const v = a.slice(i, i + size)
      const [ox, oy] = rel ? [cx, cy] : [0, 0]
      if (C === 'M' && i === 0) {
        ;[cx, cy] = [v[0] + ox, v[1] + oy]
        ;[sx, sy] = [cx, cy]
        subs.push((sub = { segs: [], closed: false, start: T(cx, cy) }))
        prev = 'M'
      } else if (C === 'M' || C === 'L' || C === 'H' || C === 'V') {
        const x = C === 'V' ? cx : v[0] + ox
        const y = C === 'H' ? cy : C === 'V' ? v[0] + oy : v[1] + oy
        seg([], x, y)
        prev = 'L'
      } else if (C === 'C' || C === 'S') {
        const [x1, y1] = C === 'C' ? [v[0] + ox, v[1] + oy] : prev === 'C' ? [2 * cx - ccx, 2 * cy - ccy] : [cx, cy]
        const r = C === 'C' ? v.slice(2) : v
        const [x2, y2, x, y] = [r[0] + ox, r[1] + oy, r[2] + ox, r[3] + oy]
        seg([T(x1, y1), T(x2, y2)], x, y)
        ;[ccx, ccy] = [x2, y2]
        prev = 'C'
      } else if (C === 'Q' || C === 'T') {
        const [x1, y1] = C === 'Q' ? [v[0] + ox, v[1] + oy] : prev === 'Q' ? [2 * cx - qx, 2 * cy - qy] : [cx, cy]
        const r = C === 'Q' ? v.slice(2) : v
        const [x, y] = [r[0] + ox, r[1] + oy]
        seg([T(x1, y1)], x, y)
        ;[qx, qy] = [x1, y1]
        prev = 'Q'
      } else if (C === 'A') {
        const [x, y] = [v[5] + ox, v[6] + oy]
        const c = arcToCubics(cx, cy, v[0], v[1], v[2], v[3], v[4], x, y)
        for (let j = 0; j < c.length; j += 6) {
          const end: Pt = j + 6 >= c.length ? [x, y] : [c[j + 4], c[j + 5]]
          seg([T(c[j], c[j + 1]), T(c[j + 2], c[j + 3])], end[0], end[1])
        }
        ;[cx, cy] = [x, y]
        prev = 'A'
      }
    }
  }
  return subs
}

const P = ([x, y]: Pt, ox: number, oy: number) => `${r2(x + ox)} ${r2(y + oy)}`
const segOut = (s: Seg, ox = 0, oy = 0) => (s.c.length === 2 ? 'C' : s.c.length === 1 ? 'Q' : 'L') + [...s.c, s.b].map((q) => P(q, ox, oy)).join(' ')
const rev = (s: Seg): Seg => ({ a: s.b, c: [...s.c].reverse(), b: s.a })

function format(subs: Array<Sub>, ox = 0, oy = 0) {
  let out = ''
  for (const s of subs) out += `M${P(s.start, ox, oy)}` + s.segs.map((g) => segOut(g, ox, oy)).join('') + (s.closed ? 'Z' : '')
  return out
}

/** Path data d with every point mapped through m, optionally shifted after by (ox, oy). Output is only M L C Q Z. */
export function transformPath(d: string, m: M6, ox = 0, oy = 0): string {
  return format(parse(d, m), ox, oy)
}

const lerp = (p: Pt, q: Pt, t: number): Pt => [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]
// de Casteljau split at t
function split(s: Seg, t: number): [Seg, Seg] {
  const pts = [s.a, ...s.c, s.b]
  const left: Array<Pt> = [pts[0]]
  const right: Array<Pt> = [pts[pts.length - 1]]
  let row = pts
  while (row.length > 1) {
    row = row.slice(1).map((q, i) => lerp(row[i], q, t))
    left.push(row[0])
    right.unshift(row[row.length - 1])
  }
  return [
    { a: left[0], c: left.slice(1, -1), b: left[left.length - 1] },
    { a: right[0], c: right.slice(1, -1), b: right[right.length - 1] },
  ]
}

// where a curve's tangent runs parallel to v, so each piece between is one-sided to the sweep and its band is a simple shape
function turns(s: Seg, vx: number, vy: number): Array<number> {
  const x = (p: Pt, q: Pt) => (q[0] - p[0]) * vy - (q[1] - p[1]) * vx
  const pts = [s.a, ...s.c, s.b]
  const ts: Array<number> = []
  if (pts.length === 3) {
    const [A, B] = [x(pts[0], pts[1]), x(pts[1], pts[2])]
    if (A !== B) ts.push(A / (A - B))
  } else if (pts.length === 4) {
    const [A, B, C] = [x(pts[0], pts[1]), x(pts[1], pts[2]), x(pts[2], pts[3])]
    const [qa, qb, qc] = [A - 2 * B + C, 2 * (B - A), A]
    if (Math.abs(qa) < 1e-9) {
      if (qb) ts.push(-qc / qb)
    } else {
      const disc = qb * qb - 4 * qa * qc
      if (disc >= 0) {
        const r = Math.sqrt(disc)
        ts.push((-qb - r) / (2 * qa), (-qb + r) / (2 * qa))
      }
    }
  }
  return ts.filter((t) => t > 1e-4 && t < 1 - 1e-4).sort((a, b) => a - b)
}

/**
 * The solid a closed path sweeps when pushed along (vx, vy), as one path whose every part winds the same way:
 * the face at both ends plus a band per edge, so a nonzero fill of both is their exact union and a stroke behind it leaves the outline.
 * Bands are kept apart so they can be stroked with round joins: their corners are seams inside the solid, and a miter there pokes out.
 */
export function extrudePath(d: string, m: M6, vx: number, vy: number): { faces: string; bands: string } {
  const subs = parse(d, m)
  // which way the face winds overall, from its control polygons; the bands are turned to match so nothing cancels
  let area = 0
  for (const s of subs) {
    const ring = s.segs.flatMap((g) => [g.a, ...g.c])
    ring.forEach((p, i) => {
      const q = ring[(i + 1) % ring.length]
      area += p[0] * q[1] - q[0] * p[1]
    })
  }
  const sign = Math.sign(area) || 1
  const faces = format(subs, vx, vy) + format(subs)
  let bands = ''
  for (const s of subs)
    for (const g of s.segs) {
      let pieces = [g]
      let last = 0
      for (const t of turns(g, vx, vy)) {
        const [a, b] = split(pieces.pop() as Seg, (t - last) / (1 - last))
        pieces.push(a, b)
        last = t
      }
      for (const p of pieces) {
        const chord = (p.b[0] - p.a[0]) * vy - (p.b[1] - p.a[1]) * vx
        if (Math.abs(chord) < 1e-6) continue
        // the band: along the edge, across to the far end, back along the shifted edge, and closed
        const band = Math.sign(chord) === sign ? p : rev(p)
        bands += `M${P(band.a, 0, 0)}${segOut(band)}L${P(band.b, vx, vy)}${segOut(rev(band), vx, vy)}Z`
      }
    }
  return { faces, bands }
}
