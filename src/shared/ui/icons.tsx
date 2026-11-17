// A few SF Symbols-like glyphs, drawn on a 24 grid with round caps.
import type { SVGProps } from 'react'

const base = (p: SVGProps<SVGSVGElement>) => ({
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  width: 20,
  height: 20,
  ...p,
})

export const Play = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)} fill="currentColor" stroke="none"><path d="M7 4.8v14.4c0 .8.9 1.3 1.6.8l11-7.2a1 1 0 0 0 0-1.6l-11-7.2C7.9 3.5 7 4 7 4.8Z" /></svg>
)
export const Pause = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)} fill="currentColor" stroke="none"><rect x="6" y="4" width="4.2" height="16" rx="1.3" /><rect x="13.8" y="4" width="4.2" height="16" rx="1.3" /></svg>
)
export const ChevronLeft = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><path d="m15 5-7 7 7 7" /></svg>
export const Link2 = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" /><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" /></svg>
)
export const Download = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><path d="M12 4v11m-5-5 5 5 5-5M5 20h14" /></svg>
export const Shuffle = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><path d="M3 7h3.5c2 0 3 1 4.2 3l2.6 4c1.2 2 2.2 3 4.2 3H21m0 0-3-3m3 3-3 3M3 17h3.5c1.4 0 2.3-.5 3.1-1.5M21 7h-3.5c-1.4 0-2.3.5-3.1 1.5M21 7l-3-3m3 3-3 3" /></svg>
)
export const Reset = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4.5h4.5" /></svg>
export const Check = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>
export const Copy = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><rect x="8" y="8" width="12" height="12" rx="2.5" /><path d="M16 8V6.5A2.5 2.5 0 0 0 13.5 4h-7A2.5 2.5 0 0 0 4 6.5v7A2.5 2.5 0 0 0 6.5 16H8" /></svg>
)
export const Search = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.2-4.2" /></svg>
export const Filter = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><path d="M4 7h16M7 12h10M10 17h4" /></svg>
export const Close = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><path d="M6 6l12 12M18 6 6 18" /></svg>
