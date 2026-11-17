import type { ReactNode } from 'react'
import { cn } from '~/shared/lib/cn'
import { tint } from './slush'

/** A numbered section's title in display type, its number a tilted sticker in the list's colour. Docs and the guide share it. */
export function NumberedHeading({ n, title }: { n: number; title: string }) {
  return (
    <h2 className="flex items-center gap-3 text-[clamp(2rem,4.4vw,3.5rem)] slush-display sm:gap-4">
      <span aria-hidden className={cn('grid size-[2em] shrink-0 -rotate-6 place-items-center rounded-full border border-black text-[0.4em] leading-none', tint(n - 1))}>
        {n}
      </span>
      {title}
    </h2>
  )
}

/** A paragraph of body copy on the sticker-book pages, with inline code as small grey chips. */
export function P({ children }: { children: ReactNode }) {
  return (
    <p className="max-w-3xl text-[17px] leading-[1.5] font-medium [&_code]:rounded-[6px] [&_code]:bg-slush-mist [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.85em]">
      {children}
    </p>
  )
}
