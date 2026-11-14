import { useId } from 'react'
import type { PaletteName } from 'wobli'
import { cn } from '~/shared/lib/cn'
import { PALETTE_PRESETS, SITE_PALETTES } from '../lib/style'

type Props = { value: PaletteName | null; onChange: (p: PaletteName) => void; size?: 'sm' | 'md'; showLabels?: boolean; wrap?: boolean; className?: string }

// Each preset is a little pie of its own colours. Radios underneath, so arrows move between them.
export function PresetStrip({ value, onChange, size = 'md', showLabels = false, wrap = true, className }: Props) {
  const group = useId()
  return (
    <div role="radiogroup" aria-label="Palette preset" className={cn('flex', wrap ? 'flex-wrap gap-x-3 gap-y-2' : 'gap-x-2', className)}>
      {PALETTE_PRESETS.map(({ name, label }) => {
        const palette = SITE_PALETTES[name]
        const selected = value === name
        return (
          <label key={name} title={label} className="group flex cursor-pointer flex-col items-center gap-1">
            <input type="radio" name={group} className="peer sr-only" checked={selected} onChange={() => onChange(name)} />
            <span
              aria-hidden
              className={cn(
                // the selection is an outline, not a ring: swatch-edge's hairline is a box-shadow and would cancel a ring
                'swatch-edge block rounded-full outline-offset-2 transition-[outline-color] duration-150 peer-focus-visible:outline-2 peer-focus-visible:outline-accent',
                size === 'md' ? 'size-8' : 'size-6',
                selected ? 'outline-2 outline-label' : 'outline-2 outline-transparent group-hover:outline-gray-500',
              )}
              style={{ background: `conic-gradient(${palette.main} 0 33%, ${palette.gold} 0 50%, ${palette.ok} 0 67%, ${palette.hot} 0 84%, ${palette.deep} 0)` }}
            />
            <span className={cn('text-[12px] leading-4', showLabels ? (selected ? 'font-medium text-label' : 'text-label-2') : 'sr-only')}>{label}</span>
          </label>
        )
      })}
    </div>
  )
}
