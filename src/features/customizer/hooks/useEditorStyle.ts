import { useEffect, useRef, useState } from 'react'
import { decodeStyle, encodeStyle, getGlobalStyle, hasStyleParams, isDefaultGlobalStyle } from '~/features/style'
import type { EditorStyle, StyleSearch } from '~/features/style'

/**
 * The editor's one piece of state. It renders from local state so every drag is instant, and writes itself to the URL a beat
 * later with replace, so a slider drag leaves one history entry and the address bar always reproduces the look.
 * Opened without a style in the URL, it starts from the grid's global style bar (read after hydration, so SSR matches).
 */
export function useEditorStyle(search: StyleSearch, onSearchChange: (next: StyleSearch) => void) {
  const [style, setStyle] = useState<EditorStyle>(() => decodeStyle(search))
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (hasStyleParams(search)) return
    const globalStyle = getGlobalStyle()
    if (!isDefaultGlobalStyle(globalStyle)) setStyle((prev) => ({ ...prev, ...globalStyle }))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isFirstRender.current) return void (isFirstRender.current = false)
    const t = setTimeout(() => onSearchChange(encodeStyle(style)), 180)
    return () => clearTimeout(t)
  }, [style]) // eslint-disable-line react-hooks/exhaustive-deps

  const update = (patch: Partial<EditorStyle>) => setStyle((prev) => ({ ...prev, ...patch }))
  return { style, setStyle, update }
}
