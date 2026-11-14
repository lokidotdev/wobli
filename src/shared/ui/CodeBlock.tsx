import { cn } from '~/shared/lib/cn'
import { CopyButton } from './CopyButton'

/** Source on a card, with a copy button in its corner. */
export function CodeBlock({ code, className }: { code: string; className?: string }) {
  return (
    <div className={cn('relative rounded-(--radius-card) bg-bg-2 shadow-[var(--shadow-border)]', className)}>
      <CopyButton text={code} variant="icon" label="Copy code" className="absolute top-1.5 right-1.5" />
      <pre className="overflow-x-auto px-4 py-3.5 pr-12 font-mono text-[13px] leading-5">{code}</pre>
    </div>
  )
}
