import { Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { site } from '~/shared/config/site'
import { cn } from '~/shared/lib/cn'
import { Container } from './Container'
import { GitHubStar } from './GitHubStar'
import { ThemeToggle } from './ThemeToggle'
import { Logo } from './Logo'

const nav = [
  { to: '/illustrations', label: 'Illustrations' },
  { to: '/docs', label: 'Docs' },
] as const

// Geist header: 64px, translucent Background 1, and a 1px border that appears only once content scrolls under it.
export function Header() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 4)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  return (
    <header
      className={cn(
        'material sticky top-0 z-40 transition-[box-shadow] duration-300',
        scrolled ? 'shadow-[0_1px_0_var(--color-separator)]' : 'shadow-[0_1px_0_transparent]',
      )}
    >
      <Container className="flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 rounded-(--radius-control) text-[18px] font-semibold tracking-[-0.04em]">
          <Logo className="size-6" />
          {site.name}
        </Link>
        <nav aria-label="Main" className="flex items-center gap-1 text-[14px]">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="rounded-(--radius-control) px-3 py-1.5 text-label-2 transition-colors duration-150 hover:bg-gray-alpha-100 hover:text-label"
              activeProps={{ className: 'text-label! font-medium' }}
            >
              {n.label}
            </Link>
          ))}
          <ThemeToggle />
          <GitHubStar className="ml-1" compact />
        </nav>
      </Container>
    </header>
  )
}
