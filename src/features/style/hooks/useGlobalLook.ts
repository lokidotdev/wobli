import { useMemo } from 'react'
import type { Palette, Style } from 'wobli'
import { useGlobalStyle } from '../lib/globalStyle'
import { SITE_PALETTES } from '../lib/style'

/** The global style bar's choice, as the engine Style every card draws with. */
export function useGlobalLook(): Style & { palette: Palette } {
  const { preset, line, depth } = useGlobalStyle()
  return useMemo(() => ({ palette: SITE_PALETTES[preset], line, depth }), [preset, line, depth])
}
