import { useEffect, useEffectEvent } from 'react'
import type { RefObject } from 'react'

/**
 * For a non-modal panel and the button that opens it, while it is open: a pointer down outside `root` closes it, and so does
 * Escape, which also hands focus back to `trigger` so the keyboard does not get lost.
 */
export function useDismiss(open: boolean, close: () => void, root: RefObject<HTMLElement | null>, trigger: RefObject<HTMLElement | null>) {
  const onClose = useEffectEvent(close)
  useEffect(() => {
    if (!open) return
    const down = (e: PointerEvent) => !root.current?.contains(e.target as Node) && onClose()
    const key = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      onClose()
      trigger.current?.focus()
    }
    document.addEventListener('pointerdown', down)
    document.addEventListener('keydown', key)
    return () => {
      document.removeEventListener('pointerdown', down)
      document.removeEventListener('keydown', key)
    }
  }, [open, root, trigger])
}
