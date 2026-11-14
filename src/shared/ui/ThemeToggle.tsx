import { Moon02Icon, Sun03Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useEffect, useState } from 'react'

type Theme = 'light' | 'dark'
const KEY = 'theme'

/** Runs in <head> before paint, so a saved choice never flashes the other theme. */
export const themeScript = `try{var t=localStorage.getItem('${KEY}');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch(e){}`

const current = (): Theme =>
  (document.documentElement.dataset.theme as Theme | undefined) ?? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null) // unknown on the server
  useEffect(() => setTheme(current()), [])
  const flip = () => {
    const next: Theme = current() === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = next
    try {
      localStorage.setItem(KEY, next)
    } catch {}
    setTheme(next)
  }
  return (
    <button
      type="button"
      onClick={flip}
      aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
      className="grid size-8 place-items-center rounded-(--radius-control) text-label-2 transition-colors duration-150 hover:bg-gray-alpha-100 hover:text-label"
    >
      <HugeiconsIcon icon={theme === 'dark' ? Sun03Icon : Moon02Icon} size={18} strokeWidth={1.75} />
    </button>
  )
}
