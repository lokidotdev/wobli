import { useId } from 'react'
import { cn } from '~/shared/lib/cn'

type Option<T extends string> = { value: T; label: string; count?: number }
type Props<T extends string> = {
  label: string
  value: T
  options: ReadonlyArray<Option<T>>
  onChange: (v: T) => void
  size?: 'md' | 'sm'
  /** `filled` for the primary choice; `quiet` (gray text) for a secondary row that sits back behind it. */
  variant?: 'filled' | 'quiet'
  className?: string
}

// Geist filter pills: one choice out of many, where a Switch would run out of room. They wrap onto as many lines as they need.
// Radios underneath, so arrows move between them.
export function Chips<T extends string>({ label, value, options, onChange, size = 'md', variant = 'filled', className }: Props<T>) {
  const name = useId()
  return (
    <div
      role="radiogroup"
      aria-label={label}
      // relative: the sr-only radios are absolutely placed, and must not escape the group and widen the page
      className={cn('relative flex flex-wrap gap-1', className)}
    >
      {options.map((o) => {
        const checked = o.value === value
        return (
          <label key={o.value} className="group shrink-0 cursor-pointer select-none p-px">
            <input type="radio" name={name} value={o.value} checked={checked} onChange={() => onChange(o.value)} className="peer sr-only" />
            <Pill option={o} checked={checked} size={size} variant={variant} />
          </label>
        )
      })}
    </div>
  )
}

function Pill<T extends string>({ option: o, checked, size, variant }: { option: Option<T>; checked: boolean; size: 'md' | 'sm'; variant: 'filled' | 'quiet' }) {
  return (
    <span
      className={cn(
        'flex items-center gap-1.5 rounded-full whitespace-nowrap transition-[background-color,color,box-shadow,scale] duration-150 ease-out group-active:scale-[0.96] motion-reduce:group-active:scale-100 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent',
        size === 'sm' ? 'h-7 px-2.5 text-[13px]' : 'h-8 px-3 text-[14px]',
        'font-medium',
        checked
          ? 'bg-contrast font-medium text-on-contrast'
          : cn('bg-bg shadow-[var(--shadow-border)] hover:bg-fill hover:shadow-[0_0_0_1px_var(--color-border-hover)]', variant === 'quiet' ? 'text-label-2 hover:text-label' : 'text-label'),
      )}
    >
      {o.label}
      {o.count != null && <span className={cn('font-mono text-[12px] tabular-nums', checked ? 'opacity-60' : 'text-label-3')}>{o.count}</span>}
    </span>
  )
}
