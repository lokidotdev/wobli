// Every code sample in the docs, in both languages. The package ships compiled JavaScript with type definitions, so the
// two differ only where a type is written down.
export type Lang = 'ts' | 'js'
export type Example = Record<Lang, string>

export const INSTALLS = ['npm i wobli', 'pnpm add wobli', 'yarn add wobli', 'bun add wobli'] as const

export const REACT: Example = {
  ts: `// Checkout.tsx
import { Sticker } from 'wobli/react'
import { brand } from 'wobli'
import type { Palette } from 'wobli'
import cardTap from 'wobli/icons/card-tap'

const palette: Palette = brand('#0a84ff', '#ff7a1a')

export function Checkout() {
  return (
    <>
      <Sticker icon={cardTap} style={{ width: 240 }} />
      <Sticker icon={cardTap} palette={palette} line={1.5} depth={0.6} />
      <Sticker icon={cardTap} loop={false} replayOnHover />
    </>
  )
}`,
  js: `// Checkout.jsx
import { Sticker } from 'wobli/react'
import { brand } from 'wobli'
import cardTap from 'wobli/icons/card-tap'

const palette = brand('#0a84ff', '#ff7a1a')

export function Checkout() {
  return (
    <>
      <Sticker icon={cardTap} style={{ width: 240 }} />
      <Sticker icon={cardTap} palette={palette} line={1.5} depth={0.6} />
      <Sticker icon={cardTap} loop={false} replayOnHover />
    </>
  )
}`,
}

export const LAZY: Example = {
  ts: `import { lazy } from 'react'
import { Sticker } from 'wobli/react'
import type { Icon } from 'wobli'

// each illustration is its own module, so it can load when it is needed
async function load(slug: string): Promise<Icon> {
  return (await import(\`wobli/icons/\${slug}.js\`)).default
}

// or as a component that suspends until the drawing arrives
const CardTap = lazy(async () => {
  const { default: icon } = await import('wobli/icons/card-tap')
  return { default: () => <Sticker icon={icon} /> }
})`,
  js: `import { lazy } from 'react'
import { Sticker } from 'wobli/react'

// each illustration is its own module, so it can load when it is needed
async function load(slug) {
  return (await import(\`wobli/icons/\${slug}.js\`)).default
}

// or as a component that suspends until the drawing arrives
const CardTap = lazy(async () => {
  const { default: icon } = await import('wobli/icons/card-tap')
  return { default: () => <Sticker icon={icon} /> }
})`,
}

export const VANILLA: Example = {
  ts: `import { play, draw } from 'wobli'
import type { Player, Style } from 'wobli'
import cloudUpload from 'wobli/icons/cloud-upload'

const canvas = document.querySelector<HTMLCanvasElement>('#sticker')!
const player: Player = play(canvas, cloudUpload, { palette: { main: '#5e5ce6' }, line: 1.2 })
player.set({ depth: 0.5 }) // restyle in place, no restart
player.replay()
player.stop()

// one frame, e.g. for an export: scale ctx so 500 units fill the box
const style: Style = { palette: { main: '#5e5ce6' }, line: 1, depth: 1 }
const ctx = canvas.getContext('2d')!
ctx.scale(canvas.width / 500, canvas.width / 500)
draw(ctx, cloudUpload, 124, style)`,
  js: `import { play, draw } from 'wobli'
import cloudUpload from 'wobli/icons/cloud-upload'

const canvas = document.querySelector('#sticker')
const player = play(canvas, cloudUpload, { palette: { main: '#5e5ce6' }, line: 1.2 })
player.set({ depth: 0.5 }) // restyle in place, no restart
player.replay()
player.stop()

// one frame, e.g. for an export: scale ctx so 500 units fill the box
const style = { palette: { main: '#5e5ce6' }, line: 1, depth: 1 }
const ctx = canvas.getContext('2d')
ctx.scale(canvas.width / 500, canvas.width / 500)
draw(ctx, cloudUpload, 124, style)`,
}

export const TYPES: Example = {
  ts: `import type { Icon, Palette, PaletteName, Style, PlayOptions, Player } from 'wobli'

// a palette can be partial: only the roles you want to change
const mine: Partial<Palette> = { main: '#5e5ce6', ink: '#1d1d1f' }`,
  js: `// Types come with the package, so editors autocomplete in plain JavaScript too.
// Add JSDoc where you want checking without TypeScript:

/** @type {Partial<import('wobli').Palette>} */
const mine = { main: '#5e5ce6', ink: '#1d1d1f' }

/** @param {import('wobli').Icon} icon */
function frames(icon) {
  return icon.frames
}`,
}
