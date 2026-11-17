import { useId } from 'react'
import { cn } from '~/shared/lib/cn'

type Props = {
  label: string
  value: number
  min: number
  max: number
  step?: number
  onChange: (v: number) => void
  format?: (v: number) => string
  className?: string
  /** `stacked` puts the label and value above the track; `inline` lays label, track and value out in one compact row. */
  layout?: 'stacked' | 'inline'
}

// A native range (1:1 tracking, keyboard, AT for free) styled as a Geist slider, with its live value in tabular nums.
export function Slider({ label, value, min, max, step = 0.05, onChange, format = (v) => v.toFixed(2), className, layout = 'stacked' }: Props) {
  const id = useId()
  const fill = ((value - min) / (max - min)) * 100
  const input = (
    <input
      id={id}
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.currentTarget.value))}
      className={cn('range', layout === 'inline' && 'min-w-0 flex-1')}
      style={{ ['--fill' as string]: `${fill}%` }}
    />
  )
  if (layout === 'inline') {
    return (
      <div className={cn('flex items-center gap-3 text-[13px]', className)}>
        <label htmlFor={id} className={'shrink-0 text-label-2'}>
          {label}
        </label>
        {input}
        <output htmlFor={id} className="w-10 shrink-0 font-mono tabular-nums text-label">
          {format(value)}
        </output>
      </div>
    )
  }
  return (
    <div className={cn('flex flex-col', className)}>
      <div className={'flex items-baseline justify-between text-[14px]'}>
        <label htmlFor={id}>{label}</label>
        <output htmlFor={id} className="font-mono text-[13px] tabular-nums text-label-2">
          {format(value)}
        </output>
      </div>
      {input}
    </div>
  )
}
