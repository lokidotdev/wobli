import { useId } from 'react'
import type { ReactNode } from 'react'
import { cn } from '~/shared/lib/cn'

type Option<T extends string> = { value: T; label: ReactNode; title?: string }
type Props<T extends string> = {
  label: string // accessible group name
  value: T
  options: ReadonlyArray<Option<T>>
  onChange: (v: T) => void
  className?: string
  size?: 'md' | 'sm'
}

// 2-5 mutually exclusive views of one thing, as a pill track: a filled thumb slides under the choice; radios underneath.
export function Segmented<T extends string>({ label, value, options, onChange, className, size = 'md' }: Props<T>) {
  const name = useId()
  const i = Math.max(0, options.findIndex((o) => o.value === value))
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn('relative grid rounded-(--radius-control) bg-bg p-1 shadow-[var(--shadow-border)]', size === 'md' ? 'h-10' : 'h-8', className)}
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      <span
        aria-hidden
        className="absolute inset-y-1 left-1 rounded-(--radius-control) bg-contrast transition-transform duration-200 ease-out"
        style={{ width: `calc((100% - 8px) / ${options.length})`, transform: `translateX(${i * 100}%)` }}
      />
      {options.map((o) => (
        <label key={o.value} title={o.title} className="relative z-10 flex cursor-pointer select-none items-center justify-center">
          <input type="radio" name={name} value={o.value} checked={o.value === value} onChange={() => onChange(o.value)} className="peer sr-only" />
          <span
            className={cn(
              'flex items-center gap-1 truncate px-2 [font-weight:var(--control-weight,500)] [letter-spacing:var(--control-tracking,normal)] transition-colors duration-150 peer-focus-visible:rounded-(--radius-control) peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent',
              size === 'md' ? 'text-[13px]' : 'text-[12px]',
              o.value === value ? 'text-on-contrast' : 'text-label hover:text-label-3',
            )}
          >
            {o.label}
          </span>
        </label>
      ))}
    </div>
  )
}
