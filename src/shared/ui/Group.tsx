import type { ReactNode } from 'react'
import { cn } from '~/shared/lib/cn'

// A titled section of controls (DESIGN.md): an uppercase label, the rows, helper text under them. It draws no box of its
// own: the frame it sits in (inspector, popover, sheet) carries the black outline, so sections never nest cards.
export function Group({ title, footer, action, children, className }: { title?: string; footer?: ReactNode; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn('flex flex-col gap-3', className)}>
      {(title || action) && (
        <div className="flex h-5 items-center justify-between">
          {title && <h3 className="text-[12px] slush-label">{title}</h3>}
          {action}
        </div>
      )}
      <div className="flex flex-col gap-3">{children}</div>
      {footer && <p className="text-[13px] leading-[1.39] font-medium text-label-3">{footer}</p>}
    </section>
  )
}

/** A name on the left and its control on the right. */
export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-[14px] font-medium">{label}</span>
      {children}
    </div>
  )
}
