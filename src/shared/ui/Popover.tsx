import { useId, useLayoutEffect, useRef, useState } from 'react'
import type { ReactNode, RefObject } from 'react'
import { useDismiss } from '~/shared/hooks/useDismiss'
import { cn } from '~/shared/lib/cn'

type Props = {
  /** The button that opens it: spread `props` on it (its ref and ARIA state), and call `toggle` when it is pressed. */
  trigger: (p: { open: boolean; toggle: () => void; props: TriggerProps }) => ReactNode
  children: ReactNode
  align?: 'start' | 'end'
  side?: 'top' | 'bottom'
  className?: string
  label: string
}

type TriggerProps = { ref: RefObject<HTMLButtonElement | null>; 'aria-expanded': boolean; 'aria-controls': string }

/** Space kept between the panel and the window edge it grows towards. */
const EDGE = 16

// A bordered panel that grows from the button that opened it and goes back into it.
// Not modal: no scrim, Escape or a click outside closes it, focus returns to the trigger.
// It is never taller than the room left between it and the window edge; when its content is taller it scrolls, and the
// edge with more content behind it fades and blurs.
export function Popover({ trigger, children, align = 'end', side = 'bottom', className, label }: Props) {
  const [open, setOpen] = useState(false)
  const [maxHeight, setMaxHeight] = useState<number>()
  const [more, setMore] = useState({ above: false, below: false })
  const id = useId()
  const root = useRef<HTMLDivElement>(null)
  const panel = useRef<HTMLDialogElement>(null)
  const button = useRef<HTMLButtonElement>(null)
  useDismiss(open, () => setOpen(false), root, button)

  const measureScroll = () => {
    const el = panel.current
    if (!el) return
    const above = el.scrollTop > 1
    const below = el.scrollTop + el.clientHeight < el.scrollHeight - 1
    setMore((m) => (m.above === above && m.below === below ? m : { above, below }))
  }

  // The room between the trigger and the window edge the panel opens towards, measured from the trigger so the panel's
  // own scale doesn't skew it. Re-measured on resize, and whenever the content changes size.
  useLayoutEffect(() => {
    if (!open) return
    const fit = () => {
      const anchor = root.current?.getBoundingClientRect()
      if (!anchor) return
      const gap = 8 // mt-2 / mb-2
      setMaxHeight(Math.max(160, side === 'bottom' ? innerHeight - anchor.bottom - gap - EDGE : anchor.top - gap - EDGE))
      measureScroll()
    }
    fit()
    const content = panel.current?.firstElementChild?.nextElementSibling
    const observer = new ResizeObserver(measureScroll)
    if (content) observer.observe(content)
    addEventListener('resize', fit)
    return () => {
      observer.disconnect()
      removeEventListener('resize', fit)
    }
  }, [open, side])

  const origin = `${side === 'bottom' ? 'top' : 'bottom'} ${align === 'end' ? 'right' : 'left'}`
  const fade = 'pointer-events-none absolute inset-x-0 h-12 backdrop-blur-[3px] transition-opacity duration-200 ease-(--ease-out)'
  return (
    <div ref={root} className="relative">
      {trigger({ open, toggle: () => setOpen((o) => !o), props: { ref: button, 'aria-expanded': open, 'aria-controls': id } })}
      {/* a non-modal <dialog>, always open: it stays mounted (inert while closed) so it can animate out */}
      <dialog
        ref={panel}
        open
        id={id}
        aria-label={label}
        inert={!open}
        onScroll={measureScroll}
        style={{ transformOrigin: origin, maxHeight }}
        className={cn(
          'absolute z-50 m-0 border-0 p-0 text-inherit max-h-[calc(100dvh-7rem)] w-[min(24rem,calc(100vw-2rem))] scrollbar-slush overflow-y-auto overscroll-contain rounded-(--radius-float) bg-elevated shadow-[var(--shadow-menu)]',
          side === 'bottom' ? 'top-full mt-2' : 'bottom-full mb-2',
          align === 'end' ? 'right-0 left-auto' : 'left-0 right-auto',
          // grows out of the trigger's corner; leaves a little faster than it came. Reduced motion: a fade only.
          'transition-[opacity,transform] ease-(--ease-out) motion-reduce:transform-none',
          open ? 'scale-100 opacity-100 duration-200' : 'pointer-events-none scale-[0.95] opacity-0 duration-150',
          className,
        )}
      >
        {/* zero-height sticky rails: the fades ride the scroll edges without taking up room */}
        <div className="sticky top-0 z-10 h-0">
          <div
            aria-hidden
            className={cn(fade, 'top-0 bg-linear-to-b from-elevated to-transparent', more.above ? 'opacity-100' : 'opacity-0')}
            style={{ maskImage: 'linear-gradient(to bottom, #000 40%, transparent)', WebkitMaskImage: 'linear-gradient(to bottom, #000 40%, transparent)' }}
          />
        </div>
        <div className="p-5">{children}</div>
        <div className="sticky bottom-0 z-10 h-0">
          <div
            aria-hidden
            className={cn(fade, 'bottom-0 bg-linear-to-t from-elevated to-transparent', more.below ? 'opacity-100' : 'opacity-0')}
            style={{ maskImage: 'linear-gradient(to top, #000 40%, transparent)', WebkitMaskImage: 'linear-gradient(to top, #000 40%, transparent)' }}
          />
        </div>
      </dialog>
    </div>
  )
}
