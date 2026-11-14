import { use, useEffect, useState } from 'react'
import type { Icon } from 'wobli'
import { loadIcon, peekIcon } from '../lib/icons'
import type { IconRef } from '../lib/icons'

/**
 * The drawing for a page built around one illustration. Suspends until it is loaded; a route loader that awaits
 * loadIllustration() has it ready, so this only ever waits while the page hydrates.
 */
export const useIcon = (ref: IconRef): Icon => peekIcon(ref) ?? use(loadIcon(ref))

/** The drawing for a card in a grid: undefined until `enabled` has been true and the file has arrived. Never suspends. */
export function useLazyIcon(ref: IconRef, enabled = true): Icon | undefined {
  const [icon, setIcon] = useState(() => peekIcon(ref))
  useEffect(() => {
    if (!enabled) return
    let on = true
    loadIcon(ref).then((i) => on && setIcon(i), console.error)
    return () => void (on = false)
  }, [ref.icon, enabled]) // eslint-disable-line react-hooks/exhaustive-deps
  return icon
}
