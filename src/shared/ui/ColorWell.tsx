import { cn } from '~/shared/lib/cn'

type Props = { label: string; value: string; onChange: (hex: string) => void; className?: string; showLabel?: boolean }

// A round swatch over the system colour picker. The picker owns keyboard and AT; the ring shows focus.
export function ColorWell({ label, value, onChange, className, showLabel = true }: Props) {
  return (
    <label className={cn('group flex cursor-pointer flex-col items-center gap-1.5', className)}>
      <span
        className={cn(
          'swatch-edge relative block rounded-full outline-offset-2 transition-[outline-color] duration-150 group-has-focus-visible:outline-2 group-has-focus-visible:outline-accent',
          'size-9',
        )}
        style={{ background: value }}
      >
        <input type="color" value={value} onChange={(e) => onChange(e.currentTarget.value)} aria-label={label} className="absolute inset-0 size-full cursor-pointer opacity-0" />
      </span>
      {showLabel && <span className="text-[12px] leading-4 font-medium text-label-2">{label}</span>}
    </label>
  )
}
