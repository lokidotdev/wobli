import type { ComponentType, SVGProps } from 'react'
import { useFlash } from '~/shared/hooks/useFlash'
import { cn } from '~/shared/lib/cn'
import { Button } from './Button'
import { IconButton } from './IconButton'
import { Check, Copy } from './icons'

type Props = {
  /** What lands on the clipboard; a function is called at click time. */
  text: string | (() => string)
  /** `text`: icon and a word. `icon`: a round icon button. `block`: a full width secondary button. */
  variant?: 'text' | 'icon' | 'block'
  label?: string
  copiedLabel?: string
  icon?: ComponentType<SVGProps<SVGSVGElement>>
  className?: string
}

/** Copies on click and turns into a check for a moment. Every "copy" on the site is this. */
export function CopyButton({ text, variant = 'text', label = 'Copy', copiedLabel = 'Copied', icon: Icon = Copy, className }: Props) {
  const [copied, flash] = useFlash()
  const copy = async () => {
    await navigator.clipboard.writeText(typeof text === 'function' ? text() : text)
    flash()
  }
  const Glyph = copied ? Check : Icon
  // the check pops in where the copy icon was; keyed, so it mounts fresh (and enters) each time
  const glyph = (size: string) => <Glyph key={String(copied)} className={cn(size, copied && 'enter [--enter-dur:150ms] [--enter-scale:0.6]')} />
  if (variant === 'icon')
    return (
      <IconButton label={label} size="sm" tone="quiet" onClick={copy} className={className}>
        {glyph('size-3.5')}
      </IconButton>
    )
  if (variant === 'block')
    return (
      <Button variant="secondary" onClick={copy} className={className}>
        {glyph('size-4')}
        {copied ? copiedLabel : label}
      </Button>
    )
  return (
    <Button variant="plain" size="sm" onClick={copy} className={cn('text-[12px]! uppercase', className)}>
      {glyph('size-3.5')}
      {copied ? copiedLabel : label}
    </Button>
  )
}
