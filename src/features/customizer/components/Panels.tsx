import { usedSlots } from 'wobli'
import type { Icon } from 'wobli'
import { ColorWell } from '~/shared/ui/ColorWell'
import { Button } from '~/shared/ui/Button'
import { Field, Group } from '~/shared/ui/Group'
import { Segmented } from '~/shared/ui/Segmented'
import { Slider } from '~/shared/ui/Slider'
import { DEPTH_RANGE, LINE_RANGE, PAPER_COLOR, PresetStrip, SLOT_LABEL, formatMultiplier, paletteOf } from '~/features/style'
import type { EditorStyle, Recolor } from '~/features/style'

type PanelProps = { style: EditorStyle; update: (patch: Partial<EditorStyle>) => void }

// Common path first (a preset), the quick recolours next, single colours last: one level deeper for each step of control.
export function ColorPanel({ style, update, icon }: PanelProps & { icon: Icon }) {
  const palette = paletteOf(style)
  const slots = usedSlots(icon).filter((s) => s !== 'ink')
  const custom = Object.keys(style.colors).length > 0
  const mode = style.recolor.mode
  const setMode = (next: Recolor['mode']) =>
    update({
      colors: {},
      recolor:
        next === 'hue' ? { mode: 'hue', deg: 40 } : next === 'brand' ? { mode: 'brand', a: palette.main, b: palette.deep } : next === 'mono' ? { mode: 'mono', c: palette.main } : { mode: 'off' },
    })
  return (
    <>
      <Group title="Palette">
        <div>
          <PresetStrip value={style.preset} onChange={(preset) => update({ preset, colors: {} })} showLabels />
        </div>
      </Group>
      <Group title="Quick Recolour" footer={mode === 'brand' ? 'Primary fills bodies and tints, secondary the dark parts, coins and checks.' : mode === 'mono' ? 'One hue at six lightnesses; the outlines keep parts apart.' : undefined}>
        <div className="flex flex-col gap-3">
          <Segmented<Recolor['mode']>
            label="Quick recolour"
            value={mode}
            onChange={setMode}
            options={[
              { value: 'off', label: 'Off' },
              { value: 'hue', label: 'Hue' },
              { value: 'brand', label: 'Brand' },
              { value: 'mono', label: 'Mono' },
            ]}
          />
          {style.recolor.mode === 'hue' && (
            <Slider label="Hue shift" value={style.recolor.deg} min={-180} max={180} step={1} onChange={(deg) => update({ recolor: { mode: 'hue', deg }, colors: {} })} format={(v) => `${Math.round(v)}°`} />
          )}
          {style.recolor.mode === 'brand' && (
            <div className="flex gap-5">
              <ColorWell label="Primary" value={style.recolor.a} onChange={(a) => style.recolor.mode === 'brand' && update({ recolor: { ...style.recolor, a }, colors: {} })} />
              <ColorWell label="Secondary" value={style.recolor.b} onChange={(b) => style.recolor.mode === 'brand' && update({ recolor: { ...style.recolor, b }, colors: {} })} />
            </div>
          )}
          {style.recolor.mode === 'mono' && <ColorWell label="Colour" value={style.recolor.c} onChange={(c) => update({ recolor: { mode: 'mono', c }, colors: {} })} className="items-start" />}
        </div>
      </Group>
      <Group
        title="Colours"
        action={
          custom ? (
            <Button variant="plain" size="sm" onClick={() => update({ colors: {} })} className="text-[12px]! uppercase">
              Clear
            </Button>
          ) : undefined
        }
        footer="Only the colours this illustration uses."
      >
        <div className="grid grid-cols-[repeat(auto-fill,minmax(58px,1fr))] gap-y-3">
          {slots.map((slot) => (
            <ColorWell key={slot} label={SLOT_LABEL[slot]} value={palette[slot]} onChange={(v) => update({ colors: { ...style.colors, [slot]: v } })} />
          ))}
        </div>
      </Group>
    </>
  )
}

export function StrokePanel({ style, update }: PanelProps) {
  return (
    <>
      <Group title="Stroke">
        <div className="flex items-center gap-4">
          <ColorWell label="Stroke colour" value={style.ink} onChange={(ink) => update({ ink })} showLabel={false} />
          <Slider label="Width" value={style.line} {...LINE_RANGE} onChange={(line) => update({ line })} format={(v) => (v === 0 ? 'None' : formatMultiplier(v))} className="flex-1" />
        </div>
      </Group>
      <Group title="Depth" footer="0 is flat: no sides, no creases.">
        <div>
          <Slider label="Extrusion" value={style.depth} {...DEPTH_RANGE} onChange={(depth) => update({ depth })} format={(v) => (v === 0 ? 'Flat' : formatMultiplier(v))} />
        </div>
      </Group>
    </>
  )
}

export function BackgroundPanel({ style, update }: PanelProps) {
  const kind = style.bg === 'none' ? 'none' : style.bg === 'paper' ? 'paper' : 'custom'
  return (
    <Group title="Background" footer="Preview and export only; the illustration itself stays transparent.">
      <div className="flex items-center gap-4">
        <Segmented
          label="Background"
          value={kind}
          onChange={(k) => update({ bg: k === 'none' ? 'none' : k === 'paper' ? 'paper' : '#ffffff' })}
          options={[
            { value: 'none', label: 'None' },
            { value: 'paper', label: 'Paper' },
            { value: 'custom', label: 'Colour' },
          ]}
          className="flex-1"
        />
        {kind === 'custom' && <ColorWell label="Background colour" value={style.bg === 'paper' ? PAPER_COLOR : (style.bg as string)} onChange={(c) => update({ bg: c as `#${string}` })} showLabel={false} />}
      </div>
    </Group>
  )
}

const SPEEDS = ['0.25', '0.5', '1', '1.5', '2'] as const
export function MotionPanel({ style, update }: PanelProps) {
  return (
    <Group title="Motion" footer="Reduced motion opens on the still frame; press play to watch it anyway.">
      <div className="flex flex-col gap-3">
        <Field label="Speed">
          <Segmented
            label="Speed"
            value={String(style.speed) as (typeof SPEEDS)[number]}
            onChange={(v) => update({ speed: Number(v) })}
            options={SPEEDS.map((v) => ({ value: v, label: `${v}×` }))}
            className="w-60"
            size="sm"
          />
        </Field>
        <Field label="Playback">
          <Segmented
            label="Playback"
            value={style.loop ? 'loop' : 'once'}
            onChange={(v) => update({ loop: v === 'loop' })}
            options={[
              { value: 'loop', label: 'Loop' },
              { value: 'once', label: 'Play once' },
            ]}
            className="w-60"
            size="sm"
          />
        </Field>
      </div>
    </Group>
  )
}
