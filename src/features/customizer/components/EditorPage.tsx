import { Link } from '@tanstack/react-router'
import { useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { ExportPanel } from '~/features/export'
import { illustrationLabel, tagLabel, useIcon } from '~/features/illustrations'
import type { Illustration } from '~/features/illustrations'
import { useAvailableHeight } from '~/shared/hooks/useAvailableHeight'
import { useScrollFade } from '~/shared/hooks/useScrollFade'
import { cn } from '~/shared/lib/cn'
import { Button } from '~/shared/ui/Button'
import { IconButton } from '~/shared/ui/IconButton'
import { ChevronLeft, Download, Filter, Reset, Shuffle } from '~/shared/ui/icons'
import { Popover } from '~/shared/ui/Popover'
import { Segmented } from '~/shared/ui/Segmented'
import { BottomSheet } from '~/shared/ui/BottomSheet'
import type { BottomSheetHandle } from '~/shared/ui/BottomSheet'
import { BAND, PILL } from '~/shared/ui/slush'
import { DEFAULT_STYLE, randomizeStyle, toEngineStyle } from '~/features/style'
import type { StyleSearch } from '~/features/style'
import { useEditorStyle } from '../hooks/useEditorStyle'
import { BackgroundPanel, ColorPanel, MotionPanel, StrokePanel } from './Panels'
import { Stage } from './Stage'
import type { StageHandle } from './Stage'

// a tag pill turns into a sticker under the pointer (.slush-pill): each takes the next palette colour and its own tilt
const TAG_STICKER = [
  ['var(--color-slush-sunburst)', '-4deg'],
  ['var(--color-slush-mint)', '3deg'],
  ['var(--color-slush-lavender)', '-3deg'],
  ['var(--color-slush-blue)', '4deg'],
] as const

type Props = {
  illustration: Illustration
  /** The look in the URL when the page opened, and where to write it as it changes. */
  search: StyleSearch
  onSearchChange: (next: StyleSearch) => void
}
type Tab = 'colours' | 'stroke' | 'motion' | 'export'

export function EditorPage({ illustration, search, onSearchChange }: Props) {
  const icon = useIcon(illustration)
  const { style, setStyle, update } = useEditorStyle(search, onSearchChange)
  const frame = useAvailableHeight<HTMLElement>()
  const fade = useScrollFade<HTMLDivElement>()
  const look = useMemo(() => toEngineStyle(style), [style])
  const stage = useRef<StageHandle>(null)
  const [tab, setTab] = useState<Tab>('colours')
  const sheet = useRef<BottomSheetHandle>(null)
  const currentFrame = () => stage.current?.currentFrame() ?? icon.still ?? 0
  const isDefault = JSON.stringify(style) === JSON.stringify(DEFAULT_STYLE)
  const reset = () => setStyle(DEFAULT_STYLE)
  const shuffle = () => setStyle(randomizeStyle)
  const panel = { style, update }
  const styleActions = (
    <>
      <IconButton label="Randomize Style" tone="filled" onClick={shuffle}>
        <Shuffle className="size-4" />
      </IconButton>
      <IconButton label="Reset Style" tone="filled" onClick={reset} disabled={isDefault}>
        <Reset className="size-4" />
      </IconButton>
    </>
  )
  const exportPanel = <ExportPanel slug={illustration.slug} title={illustration.title} icon={icon} style={style} currentFrame={currentFrame} />

  return (
    // one sky band (DESIGN.md): the drawing as a sticker-book card, its facts in display type, the controls in one outlined frame
    <section className="bg-slush-sky pt-[72px]">
      <div className={cn(BAND, 'pt-4 pb-28 sm:pt-6 lg:pb-20')}>
        <nav aria-label="Editor" className="flex items-center justify-between gap-3">
          <Link to="/illustrations" className={cn(PILL, 'h-10 gap-1 bg-white pr-4 pl-2.5 text-[12px] text-black hover:bg-slush-mist sm:text-[13px]')}>
            <ChevronLeft className="size-4" />
            Illustrations
          </Link>
          <div className="flex items-center gap-1 lg:hidden">{styleActions}</div>
          <div className="hidden lg:block">
            <Popover
              label="Export"
              trigger={({ open, toggle, id }) => (
                <Button onClick={toggle} aria-expanded={open} aria-controls={id} className="px-5 text-[13px]! uppercase">
                  <Download className="size-4" />
                  Export
                </Button>
              )}
            >
              {exportPanel}
            </Popover>
          </div>
        </nav>

        <div className="mt-4 flex items-start gap-8 lg:mt-6 xl:gap-10">
          <div className="min-w-0 flex-1">
            <Stage ref={stage} icon={icon} look={look} bg={style.bg} speed={style.speed} loop={style.loop} label={illustrationLabel(illustration.title)} />
            <header className="mt-8 sm:mt-10">
              <p className="inline-flex h-7 items-center rounded-full border border-black bg-slush-mint px-3 text-[11px] slush-label">{illustration.category.name}</p>
              <h1 className="mt-4 text-[clamp(2.75rem,7vw,6rem)] text-balance slush-display">{illustration.title}</h1>
              <p className="mt-5 max-w-2xl text-[20px] leading-[1.2] font-medium tracking-[-0.01em] text-pretty sm:mt-6 sm:text-[24px]">{illustration.description}</p>
              <ul aria-label="Tags" className="mt-6 flex flex-wrap gap-1">
                {illustration.tags.map((tag, i) => {
                  const [c, r] = TAG_STICKER[i % TAG_STICKER.length]!
                  return (
                    <li key={tag}>
                      <Link to="/illustrations" search={{ tag }} className={cn(PILL, 'slush-pill h-9 bg-white px-3.5 text-[12px] text-black')} style={{ '--c': c, '--r': r } as CSSProperties}>
                        {tagLabel(tag)}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </header>
          </div>

          {/* desktop inspector. The frame is as tall as the room it has and never scrolls itself; the scroller inside does,
              so the rounded outline clips nothing and the ends blur while there is more beyond them. */}
          <aside
            ref={frame}
            aria-label="Style"
            className="sticky top-[5.25rem] hidden max-h-[var(--avail,calc(100dvh-6.5rem))] min-h-40 w-[23rem] shrink-0 flex-col overflow-hidden rounded-[30px] border border-black bg-white lg:flex"
          >
            <div className="flex shrink-0 items-center justify-between border-b border-black bg-slush-lavender py-4 pr-4 pl-6">
              <h2 className="text-[30px] slush-display">Style</h2>
              <div className="flex items-center gap-1">{styleActions}</div>
            </div>
            <div ref={fade.ref} className="scrollbar-slush min-h-0 flex-1 overflow-y-auto overscroll-contain">
              <div aria-hidden className="pointer-events-none sticky top-0 z-10 h-0">
                <div className="edge-blur absolute inset-x-0 top-0 h-[calc(var(--fade-top,0px)*1.4)] [--edge:to_bottom]" />
              </div>
              <div className="flex flex-col gap-7 py-6 pr-3.5 pl-6">
                <ColorPanel {...panel} icon={icon} />
                <StrokePanel {...panel} />
                <BackgroundPanel {...panel} />
                <MotionPanel {...panel} />
              </div>
              <div aria-hidden className="pointer-events-none sticky bottom-0 z-10 h-0">
                <div className="edge-blur absolute inset-x-0 bottom-0 h-[calc(var(--fade-bottom,0px)*1.4)] [--edge:to_top]" />
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* phone and tablet: the same panels in a bottom sheet (the Illustrations filter drawer), one tab at a time, behind a
          floating button. The sheet stops short of the top and its scrim is light, so the drawing stays in view while it changes. */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center pb-[max(1.25rem,env(safe-area-inset-bottom))] lg:hidden">
        <Button onClick={() => sheet.current?.toggle()} size="lg" className="pointer-events-auto px-6 text-[14px] slush-label shadow-[0_0_0_1px_black]">
          <Filter className="size-4" />
          Style &amp; Export
        </Button>
      </div>
      <BottomSheet
        ref={sheet}
        label="Style"
        className="lg:hidden"
        panelClassName="max-h-[62dvh]"
        scrimClassName="bg-black/15"
        header={
          <Segmented<Tab>
            label="Panel"
            value={tab}
            onChange={setTab}
            options={[
              { value: 'colours', label: 'Colours' },
              { value: 'stroke', label: 'Stroke' },
              { value: 'motion', label: 'Motion' },
              { value: 'export', label: 'Export' },
            ]}
          />
        }
      >
        <div className="flex flex-col gap-7 pb-[env(safe-area-inset-bottom)]">
          {tab === 'colours' && <ColorPanel {...panel} icon={icon} />}
          {tab === 'stroke' && (
            <>
              <StrokePanel {...panel} />
              <BackgroundPanel {...panel} />
            </>
          )}
          {tab === 'motion' && <MotionPanel {...panel} />}
          {tab === 'export' && exportPanel}
        </div>
      </BottomSheet>
    </section>
  )
}
