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
  /** Keep the pills on one line that scrolls sideways at every width, with soft fades where it runs off the edge. */
  scroll?: boolean
  /** Wrap onto as many lines as it needs at every width, e.g. inside a drawer. */
  wrap?: boolean
  className?: string
}

// Geist filter pills: one choice out of many, where a Switch would run out of room. A row of pills that scrolls sideways on a phone
// and wraps on a wide screen (or always scrolls, with `scroll`). Radios underneath, so arrows move between them.
export function Chips<T extends string>({ label, value, options, onChange, size = 'md', variant = 'filled', scroll = false, wrap = false, className }: Props<T>) {
  const name = useId()
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn(
        // relative: the sr-only radios are absolutely placed, and must not escape a scrolled row and widen the page
        wrap
          ? 'relative flex flex-wrap gap-1'
          : cn('scrollbar-none relative -mx-4 flex gap-1 overflow-x-auto pl-4 sm:mx-0 sm:pl-0', scroll ? 'scroll-fade' : 'pr-4 sm:flex-wrap sm:pr-0'),
        className,
      )}
    >
      {options.map((o) => {
        const checked = o.value === value
        return (
          <label key={o.value} className="shrink-0 cursor-pointer select-none p-px">
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
        'flex items-center gap-1.5 rounded-full whitespace-nowrap transition-[background-color,color,box-shadow] duration-150 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent',
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

type MultiProps<T extends string> = {
  label: string
  /** The chosen values; none means no filter, and lights the `all` pill. */
  value: ReadonlyArray<T>
  options: ReadonlyArray<Option<T>>
  onChange: (v: T[]) => void
  /** The leading pill that clears the choice. */
  all: { label: string; count?: number }
  size?: 'md' | 'sm'
  variant?: 'filled' | 'quiet'
  className?: string
}

/** The same pills, any number chosen at once: checkboxes underneath. Always wraps. */
export function MultiChips<T extends string>({ label, value, options, onChange, all, size = 'md', variant = 'filled', className }: MultiProps<T>) {
  const toggle = (v: T) => onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v])
  return (
    <div role="group" aria-label={label} className={cn('relative flex flex-wrap gap-1', className)}>
      <label className="shrink-0 cursor-pointer select-none p-px">
        <input type="checkbox" checked={value.length === 0} onChange={() => onChange([])} className="peer sr-only" />
        <Pill option={{ value: '', ...all }} checked={value.length === 0} size={size} variant={variant} />
      </label>
      {options.map((o) => (
        <label key={o.value} className="shrink-0 cursor-pointer select-none p-px">
          <input type="checkbox" checked={value.includes(o.value)} onChange={() => toggle(o.value)} className="peer sr-only" />
          <Pill option={o} checked={value.includes(o.value)} size={size} variant={variant} />
        </label>
      ))}
    </div>
  )
}
