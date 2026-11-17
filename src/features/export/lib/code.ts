import { RISO, usedSlots } from 'wobli'
import type { Icon, Palette } from 'wobli'

const camel = (slug: string) => slug.replace(/-(\w)/g, (_, c: string) => c.toUpperCase())

/** A <Sticker> that reproduces the editor's look: only the slots this icon draws with, only where they differ from the default. */
export function reactSnippet(slug: string, icon: Icon, palette: Palette, line: number, depth: number) {
  const name = camel(slug)
  const slots = [...usedSlots(icon), 'ink' as const].filter((k, i, a) => a.indexOf(k) === i && palette[k].toLowerCase() !== RISO[k].toLowerCase())
  const pal = slots.length ? `\n  palette={{ ${slots.map((k) => `${k}: '${palette[k]}'`).join(', ')} }}` : ''
  const ln = line !== 1 ? `\n  line={${+line.toFixed(2)}}` : ''
  const dp = depth !== 1 ? `\n  depth={${+depth.toFixed(2)}}` : ''
  return `import { Sticker } from 'wobli/react'
import ${name} from 'wobli/icons/${slug}'

<Sticker
  icon={${name}}${pal}${ln}${dp}
  style={{ width: 240 }}
/>`
}

