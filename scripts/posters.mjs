// Makes the WebP posters the site serves from the 600×600 PNG masters in public/posters.
// For every <slug>.png it writes <slug>.webp (600px, for 2× screens) and <slug>-300.webp (300px, for 1×).
// Only stale files are rewritten, so it is cheap to run after adding posters: `pnpm posters`.
import { readdir, stat } from 'node:fs/promises'
import { join } from 'node:path'
import sharp from 'sharp'

const dir = new URL('../public/posters/', import.meta.url).pathname
const SIZES = [
  { suffix: '', width: 600 },
  { suffix: '-300', width: 300 },
]

const mtime = (file) => stat(file).then((s) => s.mtimeMs, () => 0)

let written = 0
for (const name of await readdir(dir)) {
  if (!name.endsWith('.png')) continue
  const src = join(dir, name)
  const srcTime = await mtime(src)
  for (const { suffix, width } of SIZES) {
    const out = join(dir, name.replace(/\.png$/, `${suffix}.webp`))
    if ((await mtime(out)) >= srcTime) continue
    await sharp(src).resize(width, width).webp({ quality: 82, alphaQuality: 90, effort: 6 }).toFile(out)
    written++
  }
}
console.log(`posters: ${written} WebP file(s) written`)
