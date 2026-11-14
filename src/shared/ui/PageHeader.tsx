import type { ReactNode } from 'react'
import { cn } from '~/shared/lib/cn'

/** A page's title with its one paragraph of introduction. */
export function PageHeader({ title, children, className }: { title: string; children?: ReactNode; className?: string }) {
  return (
    <header className={cn('max-w-2xl', className)}>
      <h1 className="type-title">{title}</h1>
      {children && <p className="mt-4 type-lead">{children}</p>}
    </header>
  )
}
