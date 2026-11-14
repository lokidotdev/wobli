import { useEffect, useId, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { cn } from '~/shared/lib/cn'

type Props = {
  trigger: (p: { open: boolean; toggle: () => void; id: string }) => ReactNode
  children: ReactNode
  align?: 'start' | 'end'
  side?: 'top' | 'bottom'
  className?: string
  label: string
}

// A bordered panel that grows from the button that opened it and goes back into it.
// Not modal: no scrim, Escape or a click outside closes it, focus returns to the trigger.
export function Popover({ trigger, children, align = 'end', side = 'bottom', className, label }: Props) {
  const [open, setOpen] = useState(false)
  const id = useId()
  const root = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const down = (e: PointerEvent) => !root.current?.contains(e.target as Node) && setOpen(false)
    const key = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setOpen(false)
      root.current?.querySelector<HTMLElement>('[aria-controls]')?.focus()
    }
    document.addEventListener('pointerdown', down)
    document.addEventListener('keydown', key)
    return () => {
      document.removeEventListener('pointerdown', down)
      document.removeEventListener('keydown', key)
    }
  }, [open])
  const origin = `${side === 'bottom' ? 'top' : 'bottom'} ${align === 'end' ? 'right' : 'left'}`
  return (
    <div ref={root} className="relative">
      {trigger({ open, toggle: () => setOpen((o) => !o), id })}
      <div
        id={id}
        role="dialog"
        aria-label={label}
        inert={!open}
        style={{ transformOrigin: origin }}
        className={cn(
          'absolute z-50 max-h-[calc(100dvh-7rem)] w-[min(24rem,calc(100vw-2rem))] scrollbar-slush overflow-y-auto overscroll-contain rounded-(--radius-float) bg-elevated p-5 shadow-[var(--shadow-menu)]',
          side === 'bottom' ? 'top-full mt-2' : 'bottom-full mb-2',
          align === 'end' ? 'right-0' : 'left-0',
          'transition-[opacity,transform] duration-150',
          open ? 'scale-100 opacity-100 ease-out' : 'pointer-events-none scale-[0.97] opacity-0 ease-in',
          className,
        )}
      >
        {children}
      </div>
    </div>
  )
}
