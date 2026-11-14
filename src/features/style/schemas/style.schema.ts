import { z } from 'zod'

// The editor's style as it sits in the URL: short keys, strings only, every one optional (only what differs from the default
// is written). Values are checked again when decoded, so a hand-edited link can never break the page.
//   ?p=sunset  &q=hue.40 | brand.0a84ff.ff7a1a | mono.ff58a8  &c=main-ff7a3d.deep-6b2d91  &ink=1d1d1f
//   &lw=1.5  &d=0.8  &bg=paper | fff  &sp=1.5  &once=1
const s = z.string().optional().catch(undefined)
export const styleSearchSchema = z.object({ p: s, q: s, c: s, ink: s, lw: s, d: s, bg: s, sp: s, once: s })
export type StyleSearch = z.infer<typeof styleSearchSchema>
