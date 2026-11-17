import { forwardRef } from 'react'
import type { ButtonHTMLAttributes } from 'react'
import { cn } from '~/shared/lib/cn'

type Size = 'sm' | 'md' | 'lg'
type Tone = 'quiet' | 'filled' | 'solid'

const sizes: Record<Size, string> = { sm: 'size-8', md: 'size-10', lg: 'size-12' }
const tones: Record<Tone, string> = {
  quiet: 'text-label-2 hover:bg-gray-alpha-100 hover:text-label active:bg-gray-alpha-200',
  filled: 'bg-bg text-label shadow-[var(--shadow-border-small)] hover:bg-fill',
  solid: 'bg-contrast text-on-contrast hover:bg-contrast/80',
}

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { label: string; size?: Size; tone: Tone }

/** A square Geist icon-only button (6px radius). `label` is its accessible name and its tooltip: name the action and target. */
export const IconButton = forwardRef<HTMLButtonElement, Props>(({ label, size = 'md', tone, className, type = 'button', ...props }, ref) => (
  <button
    ref={ref}
    type={type}
    aria-label={label}
    title={label}
    className={cn(
      'grid shrink-0 place-items-center rounded-(--radius-control) transition-[background-color,color,box-shadow] duration-150 disabled:pointer-events-none disabled:opacity-40',
      sizes[size],
      tones[tone],
      className,
    )}
    {...props}
  />
))
