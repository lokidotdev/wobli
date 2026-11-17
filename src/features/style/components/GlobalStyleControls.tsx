import { cn } from '~/shared/lib/cn'
import { Button } from '~/shared/ui/Button'
import { Reset } from '~/shared/ui/icons'
import { Slider } from '~/shared/ui/Slider'
import { isDefaultGlobalStyle, resetGlobalStyle, setGlobalStyle, useGlobalStyle } from '../lib/globalStyle'
import { DEPTH_RANGE, LINE_RANGE, PALETTE_PRESETS, formatMultiplier } from '../lib/style'
import { PresetStrip } from './PresetStrip'

type Props = {
  /** A short lead in front of the controls, e.g. "Try a Style". */
  label?: string
  /** Draw it as a floating bar (Geist menu material) that content scrolls under. Without it the caller supplies the surface. */
  floating?: boolean
  className?: string
  /** A narrow vertical column, for a sidebar: palette, then sliders, then reset. */
  stacked?: boolean
}

/**
 * The controls for the style every sticker on the site shares: palette, stroke, depth, reset. One compact row from `lg` up,
 * so the sticky bar costs as little of the grid as it can; the palette and the sliders stack on smaller screens.
 */
export function GlobalStyleControls({ label, floating, className, stacked }: Props) {
  const globalStyle = useGlobalStyle()
  const isDefault = isDefaultGlobalStyle(globalStyle)
  const paletteName = PALETTE_PRESETS.find((p) => p.name === globalStyle.preset)?.label
  const reset = (
    <Button
      variant="tertiary"
      size="sm"
      onClick={resetGlobalStyle}
      disabled={isDefault}
      title={isDefault ? 'Already the default style' : 'Back to the default palette, stroke and depth'}
      className="shrink-0 lg:ml-3"
    >
      <Reset className="size-4" />
      <span className="sr-only sm:not-sr-only">Reset Style</span>
    </Button>
  )
  if (stacked)
    // Sidebar column: one titled group whose reset sits beside the title, so the action is next to what it undoes, and
    // only appears once there is something to undo.
    return (
      <div role="group" aria-label="Style for every illustration" className={cn('flex flex-col gap-4', className)}>
        <div className="flex h-7 items-center justify-between">
          <h3 className="text-[13px] font-medium text-label">Style</h3>
          {!isDefault && (
            <Button variant="tertiary" size="sm" onClick={resetGlobalStyle} title="Back to the default palette, stroke and depth" className="-mr-2.5 h-7 text-label-2">
              <Reset className="size-3.5" />
              Reset
            </Button>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-[13px] text-label-3">
            Palette · <span className="text-label-2">{paletteName}</span>
          </p>
          <PresetStrip value={globalStyle.preset} onChange={(preset) => setGlobalStyle({ preset })} size="sm" wrap />
        </div>
        <Slider label="Stroke" value={globalStyle.line} {...LINE_RANGE} onChange={(line) => setGlobalStyle({ line })} format={formatMultiplier} />
        <Slider label="Depth" value={globalStyle.depth} {...DEPTH_RANGE} onChange={(depth) => setGlobalStyle({ depth })} format={formatMultiplier} />
      </div>
    )
  return (
    <div
      role="group"
      aria-label="Style for every illustration"
      className={cn('flex flex-wrap items-center gap-x-3 gap-y-2 lg:flex-nowrap lg:gap-0', floating && 'material-thick rounded-(--radius-float) px-4 py-3 lg:py-2', className)}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3 lg:flex-none lg:pr-5">
        {label ? (
          <p className="hidden shrink-0 text-[14px] font-semibold sm:block">{label}</p>
        ) : (
          <p className="hidden w-[4.5rem] shrink-0 sm:block">
            <span className="block text-[12px] leading-4 text-label-3">Palette</span>
            <span className="block truncate text-[13px] leading-4 font-medium text-label">{paletteName}</span>
          </p>
        )}
        <PresetStrip value={globalStyle.preset} onChange={(preset) => setGlobalStyle({ preset })} size="sm" wrap={false} />
      </div>
      <div className="order-last flex basis-full flex-col gap-1 sm:flex-row sm:items-center sm:gap-6 lg:order-none lg:flex-1 lg:basis-auto lg:border-l lg:border-separator lg:pl-5">
        <Slider layout="inline" label="Stroke" value={globalStyle.line} {...LINE_RANGE} onChange={(line) => setGlobalStyle({ line })} format={formatMultiplier} className="flex-1 [&>label]:w-12" />
        <Slider layout="inline" label="Depth" value={globalStyle.depth} {...DEPTH_RANGE} onChange={(depth) => setGlobalStyle({ depth })} format={formatMultiplier} className="flex-1 [&>label]:w-12" />
      </div>
      {reset}
    </div>
  )
}
