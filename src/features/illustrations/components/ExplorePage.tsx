import { useDeferredValue, useEffect, useEffectEvent, useMemo, useRef, useState } from 'react'
import type { ReactNode, Ref } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { Style } from 'wobli'
import { useAvailableHeight } from '~/shared/hooks/useAvailableHeight'
import { useScrollFade } from '~/shared/hooks/useScrollFade'
import { Button } from '~/shared/ui/Button'
import { Chips } from '~/shared/ui/Chips'
import { BottomSheet } from '~/shared/ui/BottomSheet'
import type { BottomSheetHandle } from '~/shared/ui/BottomSheet'
import { Filter, Search } from '~/shared/ui/icons'
import { LetterSticker } from '~/shared/ui/LetterSticker'
import { BAND } from '~/shared/ui/slush'
import { illustrationQuery, useFacets, useIllustrations } from '../hooks/queries'
import { tagLabel } from '../lib/illustration'
import letterS from '../lib/letter-s'
import { filterValues } from '../schemas/illustration.schema'
import type { ListFilters, Sort } from '../schemas/illustration.schema'
import { IllustrationGrid } from './IllustrationGrid'
import { LiveSticker } from './LiveSticker'

/** How many tags the filter row offers; search reaches the rest. */
const TOP_TAGS = 14
/** The illustration the empty state shows. */
const NO_RESULTS = 'no-results'
/** The illustration beside the page's description. */
const HEADER_STICKER = 'gift-card'

type Props = {
  filters: ListFilters
  onFiltersChange: (next: ListFilters) => void
  /** The look every card draws with, and the bar that sets it: both come from the route, so this feature stays independent of the customizer. */
  look?: Style
  styleBar?: ReactNode
  /** The same controls laid out for the sidebar, shown instead of `styleBar` on large screens. */
  styleSidebar?: ReactNode
}

export function ExplorePage({ filters, onFiltersChange, look, styleBar, styleSidebar }: Props) {
  // A new filter suspends until its results arrive; deferring it keeps the current grid (and the focused search box) on
  // screen meanwhile instead of unmounting the page.
  const shown = useDeferredValue(filters)
  const { data, hasNextPage, fetchNextPage } = useIllustrations(shown)
  const { data: facets } = useFacets()
  const items = useMemo(() => data.pages.flatMap((p) => p.items), [data])
  const total = data.pages[0]?.total ?? 0
  const allCount = useMemo(() => facets.categories.reduce((n, c) => n + c.count, 0), [facets])
  const filtered = Boolean(filters.q || filters.category || filters.tag)
  const activeCount = (filters.category ? 1 : 0) + (filters.tag ? 1 : 0) + (filters.sort ? 1 : 0)
  const panel = useAvailableHeight<HTMLElement>()
  const fade = useScrollFade<HTMLDivElement>()
  const filterGroups = <FilterGroups filters={filters} onFiltersChange={onFiltersChange} />

  return (
    <>
      <ExploreHeader look={look} />

      {/* band two, white: the catalogue */}
      <section className="bg-white">
        <div className={`${BAND} pt-8 pb-24 sm:pt-10`}>
          {styleBar && <div className={`sticky top-[4.75rem] z-30 mb-6 ${styleSidebar ? 'lg:hidden' : ''}`}>{styleBar}</div>}

          <div className="flex items-start gap-8 xl:gap-10">
            <div className="min-w-0 flex-1">
              <CatalogueToolbar filters={filters} onFiltersChange={onFiltersChange} total={total} allCount={allCount} active={activeCount}>
                {filterGroups}
              </CatalogueToolbar>
              {items.length ? (
                <IllustrationGrid items={items} look={look} onMore={hasNextPage ? () => fetchNextPage({ cancelRefetch: false }) : undefined} />
              ) : (
                <EmptyState filters={filters} filtered={filtered} look={look} onClear={() => onFiltersChange({ sort: filters.sort })} />
              )}
            </div>

            <FilterSidebar
              panel={panel}
              fade={fade.ref}
              styleSidebar={styleSidebar}
              canClear={filtered || !!filters.sort}
              onClear={() => onFiltersChange({ q: filters.q })}
            >
              {filterGroups}
            </FilterSidebar>
          </div>
        </div>
      </section>
    </>
  )
}

/** The catalogue's own "No Results" drawing, live in the current look. Until it arrives (or if it is ever unpublished) a plain search tile stands in. */
function NoResultsSticker({ look }: { look?: Style }) {
  const { data } = useQuery(illustrationQuery(NO_RESULTS))
  if (!data)
    return (
      <span aria-hidden className="mb-4 grid size-14 -rotate-6 place-items-center rounded-[16px] border border-black bg-slush-sunburst">
        <Search className="size-6" />
      </span>
    )
  return (
    <div aria-hidden className="pointer-events-none -mt-8 w-[min(16rem,70%)]">
      <LiveSticker illustration={data} look={look} priority />
    </div>
  )
}

/** Below lg: the sidebar filters move into a bottom sheet behind a Filters button. Changes apply as they are made. */
function FilterDrawer({ active, children }: { active: number; children: ReactNode }) {
  const sheet = useRef<BottomSheetHandle>(null)
  return (
    <>
      <Button
        variant="secondary"
        onClick={() => sheet.current?.open()}
        aria-label={active ? `Filters, ${active} active` : 'Filters'}
        className="relative size-12 shrink-0 px-0 lg:hidden"
      >
        <Filter className="size-4" />
        {active > 0 && (
          <span aria-hidden className="enter absolute -top-1 -right-1 grid size-4 [--enter-scale:0.6] place-items-center rounded-full bg-contrast font-mono text-[10px] text-on-contrast">
            {active}
          </span>
        )}
      </Button>
      <BottomSheet
        ref={sheet}
        label="Filters"
        className="lg:hidden"
        footer={
          <Button onClick={() => sheet.current?.close()} size="lg" className="w-full text-[14px] slush-label">
            Show Results
          </Button>
        }
      >
        {children}
      </BottomSheet>
    </>
  )
}

/**
 * Sort, category and tag. One category and one tag at a time, and every filter narrows the others: in this category AND carrying
 * this tag AND matching the search. Picking a pill replaces the current one; the leading pill clears it.
 */
function FilterGroups({ filters, onFiltersChange }: { filters: ListFilters; onFiltersChange: (next: ListFilters) => void }) {
  const { data: facets } = useFacets()
  const chosenCategory = filterValues(filters.category)[0] ?? ''
  const chosenTag = filterValues(filters.tag)[0] ?? ''
  const allCount = useMemo(() => facets.categories.reduce((n, c) => n + c.count, 0), [facets])
  // the most used tags, plus the chosen one if it is rarer than those
  const tags = useMemo(() => {
    const top = facets.tags.slice(0, TOP_TAGS).map((t) => t.slug)
    return chosenTag && !top.includes(chosenTag) ? [chosenTag, ...top] : top
  }, [facets, chosenTag])
  return (
    <>
      <DrawerGroup title="Sort">
        <Chips<Sort>
          label="Sort"
          wrap
          value={filters.sort ?? 'featured'}
          options={[
            { value: 'featured', label: 'Featured' },
            { value: 'az', label: 'A–Z' },
          ]}
          onChange={(sort) => onFiltersChange({ ...filters, sort: sort === 'featured' ? undefined : sort })}
        />
      </DrawerGroup>
      <DrawerGroup title="Category">
        <Chips<string>
          label="Category"
          wrap
          value={chosenCategory}
          options={[{ value: '', label: 'All', count: allCount }, ...facets.categories.map((c) => ({ value: c.slug, label: c.name, count: c.count }))]}
          onChange={(v) => onFiltersChange({ ...filters, category: v || undefined })}
        />
      </DrawerGroup>
      {tags.length > 0 && (
        <DrawerGroup title="Tags">
          <Chips<string>
            label="Tag"
            wrap
            size="sm"
            variant="quiet"
            value={chosenTag}
            options={[{ value: '', label: 'Any' }, ...tags.map((t) => ({ value: t, label: tagLabel(t) }))]}
            onChange={(v) => onFiltersChange({ ...filters, tag: v || undefined })}
          />
        </DrawerGroup>
      )}
    </>
  )
}

function DrawerGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-[12px] text-label-3 slush-label">{title}</h3>
      {children}
    </div>
  )
}

/** Typing stays local and instant; the URL (and the query) follow after a short pause. */
function SearchField({ value, onChange, count }: { value: string; onChange: (q: string) => void; count: number }) {
  const [draft, setDraft] = useState(value)
  // How the draft and the URL stay in step, as state (adjusted while rendering, React's pattern for state that follows a prop):
  //   sent    every value this field has sent up and not yet seen come back. Navigations can land late and out of order, so a
  //           URL value in here is only an echo of earlier typing and must not overwrite the draft. Anything else moved the
  //           URL on its own (back button, a link), and the draft follows it.
  //   target  what the URL is headed for: the last value sent up, or the last outside value the draft adopted
  //   seen    the URL value this was last worked out for
  const [sync, setSync] = useState({ seen: value, target: value, sent: [] as ReadonlyArray<string> })
  if (value !== sync.seen) {
    if (sync.sent.includes(value)) setSync({ seen: value, target: sync.target, sent: value === sync.target ? [] : sync.sent }) // caught up, or still on the way
    else {
      setSync({ seen: value, target: value, sent: [] })
      setDraft(value)
    }
  }
  const send = useEffectEvent((next: string) => {
    setSync((s) => ({ ...s, target: next, sent: [...s.sent, next] }))
    onChange(next)
  })
  // "/" focuses search from anywhere on the page, unless the visitor is already typing somewhere
  const input = useRef<HTMLInputElement>(null)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey || t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return
      e.preventDefault()
      input.current?.focus()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
  useEffect(() => {
    const next = draft.trim()
    if (next === sync.target) return
    const timer = setTimeout(() => send(next), 250)
    return () => clearTimeout(timer)
  }, [draft, sync.target])
  return (
    <div className="relative flex-1">
      <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-black" />
      <input
        ref={input}
        type="search"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => e.key === 'Escape' && draft && (e.preventDefault(), setDraft(''))}
        placeholder="Search illustrations…"
        aria-label="Search illustrations"
        aria-keyshortcuts="/"
        className="peer h-12 w-full rounded-full border border-black bg-white pr-4 pl-12 text-[16px] sm:pr-12 lg:pr-24 font-medium outline-none transition-colors duration-150 placeholder:text-label-3 hover:bg-slush-mist/50 focus-visible:bg-white focus-visible:shadow-[0_0_0_3px_var(--color-slush-sunburst)] [&::-webkit-search-cancel-button]:hidden"
      />
      {/* how many are showing, on a wide screen; a narrow one says it under the bar instead */}
      <div aria-hidden className="pointer-events-none absolute top-1/2 right-3 flex -translate-y-1/2 items-center gap-1.5">
        <span className="hidden h-7 items-center rounded-full bg-black px-2.5 text-[13px] font-bold text-white tabular-nums lg:inline-flex">{count}</span>
        <kbd className="hidden size-7 place-items-center rounded-full border border-black bg-slush-sunburst text-[13px] font-bold sm:grid">/</kbd>
      </div>
    </div>
  )
}

type ToolbarProps = { filters: ListFilters; onFiltersChange: (next: ListFilters) => void; total: number; allCount: number; active: number; children: ReactNode }

/** Over the grid: the search box, the Filters button (below lg), how many are showing, and a way to clear what narrows them. */
function CatalogueToolbar({ filters, onFiltersChange, total, allCount, active, children }: ToolbarProps) {
  const filtered = Boolean(filters.q || filters.category || filters.tag)
  return (
    <section aria-label="Search illustrations" className="mb-6 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <SearchField value={filters.q ?? ''} onChange={(q) => onFiltersChange({ ...filters, q: q || undefined })} count={total} />
        <FilterDrawer active={active}>
          <div className="flex flex-col gap-6">{children}</div>
        </FilterDrawer>
      </div>
      <p aria-live="polite" className="sr-only">
        {total} {total === 1 ? 'illustration' : 'illustrations'}
        {filters.q && <> matching “{filters.q}”</>}
      </p>
      {/* narrow screens: how many of the catalogue are showing, only once something narrows it */}
      {filtered && (
        <div className="enter flex items-center justify-between gap-3 [--enter-y:-4px] lg:hidden">
          <span aria-hidden className="inline-flex h-7 items-center rounded-full bg-black px-2.5 text-[13px] font-bold text-white tabular-nums">
            {total}
            <span className="opacity-60">/{allCount}</span>
          </span>
          <Button variant="secondary" size="sm" onClick={() => onFiltersChange({ sort: filters.sort })} className="px-3.5 text-[12px] slush-label">
            Clear Filters
          </Button>
        </div>
      )}
    </section>
  )
}

/** Band one, sky: the page as a poster. The sticker beside the description simply goes missing if it cannot be loaded. */
function ExploreHeader({ look }: { look?: Style }) {
  const { data: giftCard } = useQuery(illustrationQuery(HEADER_STICKER))
  return (
    <section className="bg-slush-sky pt-[72px]">
      <div className={`${BAND} pt-10 pb-12 sm:pt-14 sm:pb-16`}>
        <div className="relative">
          {/* the last S is a live sticker standing in the type, in the look picked below */}
          <h1 aria-label="Illustrations" className="text-[clamp(2.4rem,11.2vw,10.25rem)] slush-display">
            <span aria-hidden className="whitespace-nowrap">
              Illustration
              <LetterSticker icon={letterS} look={look} label="S" enter={0.3} className="ml-[0.03em] w-[0.5em]" />
            </span>
          </h1>
        </div>
        {/* the description, with one sticker beside it: display type never stands alone (DESIGN.md) */}
        <div className="mt-6 flex items-center gap-4 sm:mt-8 sm:gap-8">
          <p className="max-w-2xl text-[20px] leading-[1.2] font-medium tracking-[-0.01em] text-balance sm:text-[24px]">
            Every one is live. Set a style and the whole grid follows; open one to fine tune it and export.
          </p>
          {giftCard && (
            <div aria-hidden className="pointer-events-none -my-6 w-[26vw] max-w-[180px] shrink-0 rotate-[8deg] sm:-my-10 sm:w-[15vw]">
              <LiveSticker illustration={giftCard} look={look} priority sizes="(min-width: 640px) 15vw, 26vw" />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

/** What the catalogue shows when nothing matches: the No Results sticker, why, and a way out. */
function EmptyState({ filters, filtered, look, onClear }: { filters: ListFilters; filtered: boolean; look?: Style; onClear: () => void }) {
  return (
    <div className="enter flex flex-col items-center rounded-[40px] border border-black bg-slush-lavender px-6 py-20 text-center [--enter-dur:300ms] [--enter-scale:0.96]">
      <NoResultsSticker look={look} />
      <p className="mt-2 text-[clamp(2.25rem,5vw,4rem)] slush-display">Nothing here</p>
      <p className="mt-4 max-w-sm text-[16px] leading-[1.39] font-medium">
        {filters.q ? <>Nothing matches “{filters.q}”{filters.category || filters.tag ? ' with these filters' : ''}. </> : 'Nothing matches these filters. '}
        Clear the filters to see every illustration.
      </p>
      {filtered && (
        <Button onClick={onClear} className="mt-6 px-5 text-[13px] slush-label">
          Clear Filters
        </Button>
      )}
    </div>
  )
}

type SidebarProps = {
  panel: Ref<HTMLElement>
  fade: Ref<HTMLDivElement>
  styleSidebar?: ReactNode
  canClear: boolean
  onClear: () => void
  children: ReactNode
}

/**
 * Large screens: the filters (and the style controls above them) in a sticky frame beside the grid. The frame is as tall as
 * the room it has (useAvailableHeight) and never scrolls itself; the scroller inside does, so the rounded border clips nothing
 * and the ends can blur while there is more beyond them.
 */
function FilterSidebar({ panel, fade, styleSidebar, canClear, onClear, children }: SidebarProps) {
  return (
    <aside
      ref={panel}
      aria-label="Filter illustrations"
      className="sticky top-[5.25rem] hidden max-h-[var(--avail,calc(100dvh-6.5rem))] min-h-40 w-[20rem] shrink-0 flex-col overflow-hidden rounded-[30px] border border-black bg-white lg:flex"
    >
      <div ref={fade} className="scrollbar-slush min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div aria-hidden className="pointer-events-none sticky top-0 z-10 h-0">
          <div className="edge-blur absolute inset-x-0 top-0 h-[calc(var(--fade-top,0px)*1.4)] [--edge:to_bottom]" />
        </div>
        {styleSidebar && <div className="border-b border-black bg-slush-sky pt-5 pr-3.5 pb-6 pl-6">{styleSidebar}</div>}
        <div className="flex flex-col gap-6 py-6 pr-3.5 pl-6">
          <div className="-mb-3 flex h-7 items-center justify-between">
            <h3 className="text-[13px] slush-label">Filters</h3>
            {canClear && (
              <Button variant="tertiary" size="sm" onClick={onClear} className="-mr-2.5 h-7 text-[12px] slush-label">
                Clear
              </Button>
            )}
          </div>
          {children}
        </div>
        <div aria-hidden className="pointer-events-none sticky bottom-0 z-10 h-0">
          <div className="edge-blur absolute inset-x-0 bottom-0 h-[calc(var(--fade-bottom,0px)*1.4)] [--edge:to_top]" />
        </div>
      </div>
    </aside>
  )
}
