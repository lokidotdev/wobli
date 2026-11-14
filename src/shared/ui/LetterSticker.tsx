import { Sticker } from 'wobli/react'
import type { Icon, Style } from 'wobli'
import type { CSSProperties } from 'react'
import { cn } from '~/shared/lib/cn'

type Props = {
  icon: Icon
  look?: Style
  /** The letter it stands for, as the canvas's accessible name. */
  label: string
  /** Seconds after it first shows to pop in. */
  enter?: number
  /** The slot the letter takes in the line of type: its width, and margins if the word needs air. */
  className?: string
  style?: CSSProperties
}

/**
 * A capital letter in display type that is a live sticker. The box is the letter's own size (cap height tall), so the word
 * spaces as type; the canvas is larger and centred on it (a letter drawing fills about 60% of its square) and lets the
 * pointer through to the letters it overlaps.
 */
export function LetterSticker({ icon, look, label, enter, className, style }: Props) {
  return (
    <span className={cn('relative inline-block h-[0.7em]', className)} style={style}>
      <Sticker
        icon={icon}
        palette={look?.palette}
        line={look?.line}
        depth={look?.depth}
        enter={enter}
        label={label}
        className="pointer-events-none absolute top-1/2 left-1/2 max-w-none"
        style={{ width: '1.22em', translate: '-47% -52%' }}
      />
    </span>
  )
}
