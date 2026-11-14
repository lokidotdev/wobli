import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import type { ReactNode } from 'react'
import { cn } from '~/shared/lib/cn'
import { Button } from './Button'
import { Close } from './icons'

export type BottomSheetHandle = { open: () => void; close: () => void; toggle: () => void }

type Props = {
  /** The dialog's name and the title in its bar. */
  label: string
  /** Under the title, above the scrolling body (a segmented control, say). Part of the grab zone. */
  header?: ReactNode
  /** Pinned under the body. */
  footer?: ReactNode
  children: ReactNode
  /** Classes for the panel, e.g. its max height. */
  panelClassName?: string
  /** Classes for the scrim. */
  scrimClassName?: string
  className?: string
}

/**
 * A modal bottom sheet. The <dialog> is only the full-screen top-layer host (focus trap, Escape); the scrim and the panel
 * inside it are what move, on CSS transitions (.sheet in app.css), so open, close and a drag released halfway can all be
 * interrupted. Drag the handle, the title bar, or the body from its top to dismiss.
 */
export const BottomSheet = forwardRef<BottomSheetHandle, Props>(function BottomSheet(
  { label, header, footer, children, panelClassName, scrimClassName, className },
  ref,
) {
  const dialog = useRef<HTMLDialogElement>(null)
  const close = () => dialog.current?.close()
  const drag = useSheetDrag(close)
  useImperativeHandle(ref, () => ({
    open: () => dialog.current?.showModal(),
    close,
    toggle: () => (dialog.current?.open ? close() : dialog.current?.showModal()),
  }))
  return (
    <dialog
      ref={dialog}
      aria-label={label}
      className={cn('sheet fixed inset-0 m-0 size-full max-h-none max-w-none overflow-clip bg-transparent p-0 text-black backdrop:bg-transparent', className)}
    >
      <div ref={drag.overlay} onClick={close} className={cn('sheet-overlay absolute inset-0 bg-black/50', scrimClassName)} />
      <div ref={drag.panel} className={cn('sheet-panel absolute inset-x-0 bottom-0 flex max-h-[86dvh] flex-col rounded-t-[30px] border border-b-0 border-black bg-white', panelClassName)}>
        {/* the grab zone: the handle and the title bar always drag the sheet; the body below does too, when pulled down from its top */}
        <div {...drag.handlers} className="shrink-0 cursor-grab touch-none border-b border-separator select-none active:cursor-grabbing">
          <span aria-hidden className="mx-auto mt-2.5 block h-1.5 w-11 rounded-full bg-black" />
          <div className="flex items-center justify-between px-4 pt-1 pb-3">
            <h2 className="text-[30px] slush-display">{label}</h2>
            <Button variant="tertiary" size="sm" onClick={close} aria-label={`Close ${label.toLowerCase()}`} className="-mr-2 size-11 px-0">
              <Close className="size-4" />
            </Button>
          </div>
          {header && <div className="px-4 pb-3">{header}</div>}
        </div>
        <div ref={drag.scroller} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4">{children}</div>
        {footer && <div className="shrink-0 border-t border-separator px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">{footer}</div>}
      </div>
    </dialog>
  )
})

const DISMISS_DISTANCE = 0.4 // of the sheet's height
const DISMISS_VELOCITY = 0.5 // px per ms: a flick closes it however short
const RUBBER_BAND = 0.2 // how much of an upward pull the sheet gives

/**
 * Drag to dismiss for the sheet. While the finger is down the panel is the finger: its transform and the scrim's opacity
 * are written straight to the elements, with no React state and no transition. On release the inline styles are dropped
 * and the sheet's own CSS transition finishes the move, either back to rest or (past the distance or velocity threshold)
 * out the way it came in.
 *
 * Two ways in: the grab zone (`handlers`, pointer events) always drags; the list (`scroller`) drags only when a touch
 * starts with it scrolled to the top and heads down, and otherwise scrolls as usual.
 */
function useSheetDrag(dismiss: () => void) {
  const panel = useRef<HTMLDivElement>(null)
  const overlay = useRef<HTMLDivElement>(null)
  const scroller = useRef<HTMLDivElement>(null)
  const state = useRef<{ startY: number; height: number; y: number; lastY: number; lastT: number; velocity: number } | null>(null)
  const pointer = useRef<number | null>(null)
  const latest = useRef(dismiss)
  latest.current = dismiss

  // stable across renders: these only touch refs, and the touch listeners below hold on to them
  const drag = useRef({
    begin(clientY: number, t: number) {
      const el = panel.current
      if (!el || state.current) return false
      // caught mid-transition, the sheet stays where it is on screen and the drag carries on from there
      const rest = el.offsetTop + (el.offsetParent as HTMLElement).getBoundingClientRect().top
      const y = el.getBoundingClientRect().top - rest
      state.current = { startY: clientY - y, height: el.offsetHeight, y, lastY: clientY, lastT: t, velocity: 0 }
      el.closest('dialog')!.dataset.dragging = ''
      el.style.transform = `translateY(${y}px)`
      return true
    },
    move(clientY: number, t: number) {
      const s = state.current
      const el = panel.current
      if (!s || !el) return
      const raw = clientY - s.startY
      s.y = raw < 0 ? raw * RUBBER_BAND : raw
      const dt = t - s.lastT
      if (dt > 0) {
        s.velocity = 0.6 * ((clientY - s.lastY) / dt) + 0.4 * s.velocity
        s.lastY = clientY
        s.lastT = t
      }
      el.style.transform = `translateY(${s.y}px)`
      if (overlay.current) overlay.current.style.opacity = String(Math.min(1, Math.max(0, 1 - s.y / s.height)))
    },
    end(t: number, cancelled = false) {
      const s = state.current
      const el = panel.current
      if (!s || !el) return
      state.current = null
      // a finger that stopped before lifting carries no velocity, whatever it was doing earlier
      const velocity = t - s.lastT > 80 ? 0 : s.velocity
      // hand over to the CSS transition, which starts from where the finger left it
      delete el.closest('dialog')?.dataset.dragging
      el.style.transform = ''
      if (overlay.current) overlay.current.style.opacity = ''
      if (!cancelled && s.y > 0 && (s.y > s.height * DISMISS_DISTANCE || velocity > DISMISS_VELOCITY)) latest.current()
    },
  }).current

  const handlers = {
    onPointerDown: (e: React.PointerEvent) => {
      if ((e.pointerType === 'mouse' && e.button !== 0) || (e.target as HTMLElement).closest('button')) return
      if (!drag.begin(e.clientY, e.timeStamp)) return
      pointer.current = e.pointerId
      e.currentTarget.setPointerCapture(e.pointerId)
    },
    onPointerMove: (e: React.PointerEvent) => e.pointerId === pointer.current && drag.move(e.clientY, e.timeStamp),
    onPointerUp: (e: React.PointerEvent) => e.pointerId === pointer.current && ((pointer.current = null), drag.end(e.timeStamp)),
    onPointerCancel: (e: React.PointerEvent) => e.pointerId === pointer.current && ((pointer.current = null), drag.end(e.timeStamp, true)),
  }

  // The list. A touch is either a scroll or a sheet drag, decided once, on its first move, and it stays that for its whole
  // life. touchmove has to be a real (non-passive) listener to be able to keep the browser from scrolling instead.
  useEffect(() => {
    const el = scroller.current
    if (!el) return
    let touch: { id: number; y: number; atTop: boolean; mode: 'pending' | 'drag' | 'scroll' } | null = null
    const find = (e: TouchEvent) => [...e.changedTouches].find((t) => t.identifier === touch?.id)
    const onStart = (e: TouchEvent) => {
      const t = e.changedTouches[0]
      if (touch || e.touches.length !== 1 || !t) return
      touch = { id: t.identifier, y: t.clientY, atTop: el.scrollTop <= 0, mode: 'pending' }
    }
    const onMove = (e: TouchEvent) => {
      const t = find(e)
      if (!touch || !t) return
      if (touch.mode === 'pending') {
        const dy = t.clientY - touch.y
        if (dy === 0) return
        touch.mode = touch.atTop && dy > 0 && e.cancelable && drag.begin(t.clientY, e.timeStamp) ? 'drag' : 'scroll'
      }
      if (touch.mode !== 'drag') return
      if (e.cancelable) e.preventDefault()
      drag.move(t.clientY, e.timeStamp)
    }
    const onEnd = (e: TouchEvent) => {
      if (!touch || !find(e)) return
      if (touch.mode === 'drag') drag.end(e.timeStamp, e.type === 'touchcancel')
      touch = null
    }
    el.addEventListener('touchstart', onStart, { passive: true })
    el.addEventListener('touchmove', onMove, { passive: false })
    el.addEventListener('touchend', onEnd)
    el.addEventListener('touchcancel', onEnd)
    return () => {
      el.removeEventListener('touchstart', onStart)
      el.removeEventListener('touchmove', onMove)
      el.removeEventListener('touchend', onEnd)
      el.removeEventListener('touchcancel', onEnd)
    }
  }, [drag])

  return { panel, overlay, scroller, handlers }
}

