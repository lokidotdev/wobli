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

// Every (poster, size) pair is independent, so they all run at once; sharp queues the actual encoding on its own thread pool.
const names = (await readdir(dir)).filter((name) => name.endsWith('.png'))
const jobs = names.flatMap((name) => SIZES.map(({ suffix, width }) => ({ src: join(dir, name), out: join(dir, name.replace(/\.png$/, `${suffix}.webp`)), width })))
const done = await Promise.all(
  jobs.map(async ({ src, out, width }) => {
    const [srcTime, outTime] = await Promise.all([mtime(src), mtime(out)])
    if (outTime >= srcTime) return false
    await sharp(src).resize(width, width).webp({ quality: 82, alphaQuality: 90, effort: 6 }).toFile(out)
    return true
  }),
)
console.log(`posters: ${done.filter(Boolean).length} WebP file(s) written`)
