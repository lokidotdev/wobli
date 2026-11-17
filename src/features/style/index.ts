// The style model: what a look is, how it sits in a URL, the look the whole site shares, and the controls that set it.
// The editor, the exporters, the grid and the landing page all build on this; it depends on none of them.
export { GlobalStyleControls } from './components/GlobalStyleControls'
export { PresetStrip } from './components/PresetStrip'
export { useGlobalLook } from './hooks/useGlobalLook'
export { applySiteStyle, getGlobalStyle, isDefaultGlobalStyle, useGlobalStyle, randomPresetForVisit } from './lib/globalStyle'
export {
  DEFAULT_STYLE,
  DEPTH_RANGE,
  HUE_RANGE,
  LINE_RANGE,
  SPEEDS,
  SLOT_LABEL,
  backgroundColor,
  decodeStyle,
  encodeStyle,
  formatMultiplier,
  hasStyleParams,
  isDefaultStyle,
  paletteOf,
  randomizeStyle,
  styleQuery,
  toEngineStyle,
} from './lib/style'
export type { Background, EditorStyle, Recolor } from './lib/style'
export { styleSearchSchema } from './schemas/style.schema'
export type { StyleSearch } from './schemas/style.schema'
