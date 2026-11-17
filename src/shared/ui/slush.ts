import { cn } from '~/shared/lib/cn'

// The sticker-book classes (DESIGN.md), shared by the chrome and the pages: pills, their sizes, and the page band.
export const PILL = 'inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-full border border-black slush-label transition-colors duration-150'
export const GHOST = cn(PILL, 'bg-white text-black hover:bg-slush-mist')
export const FILLED = cn(PILL, 'bg-black text-white hover:bg-black/80')
export const SM = 'h-10 px-4 text-[12px] sm:text-[13px]'
export const LG = 'h-12 px-6 text-[14px]'
// GitHubStar is a Geist button underneath: these win over its own box
const STAR = 'rounded-full! border border-black font-bold! tracking-[0.032em] uppercase shadow-none!'
export const STAR_GHOST = cn(STAR, 'bg-white! text-black! hover:bg-slush-mist!')
export const STAR_FILLED = cn(STAR, 'bg-black! text-white! hover:bg-black/80!')

export const BAND = 'mx-auto w-full max-w-[1440px] px-4 sm:px-8 lg:px-12'

/** The sticker colours a numbered list cycles through: step numbers, section markers, the docs thread. */
export const TINTS = ['bg-slush-sunburst', 'bg-slush-mint', 'bg-slush-lavender', 'bg-slush-blue', 'bg-slush-ember', 'bg-slush-violet text-white'] as const
export const tint = (i: number) => TINTS[i % TINTS.length]
