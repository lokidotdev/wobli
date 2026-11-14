import { useEffect, useState } from 'react'
import { site } from '~/shared/config/site'
import { buttonClass } from './Button'

type Props = { variant?: 'primary' | 'secondary'; size?: 'sm' | 'md' | 'lg'; className?: string; label?: string; compact?: boolean }

const fmt = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 })
let cached: Promise<number | null> | undefined
// one request per page load, shared by every button; null when GitHub is unreachable or rate-limited
const loadStars = () =>
  (cached ??= fetch(`https://api.github.com/repos/${site.repo}`)
    .then((r) => (r.ok ? r.json() : null))
    .then((d) => (typeof d?.stargazers_count === 'number' ? d.stargazers_count : null))
    .catch(() => null))

function GitHubMark() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden className="size-4 fill-current">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  )
}

export function GitHubStar({ variant = 'primary', size = 'sm', className, label = 'Star on GitHub', compact }: Props) {
  const [stars, setStars] = useState<number | null>(null)
  useEffect(() => {
    let live = true
    loadStars().then((n) => live && setStars(n))
    return () => {
      live = false
    }
  }, [])
  return (
    <a href={`https://github.com/${site.repo}`} target="_blank" rel="noreferrer" className={buttonClass(variant, size, className)}>
      <GitHubMark />
      <span className={compact ? "max-sm:sr-only" : undefined}>{label}</span>
      {stars !== null && (
        <span className="ml-1 border-l border-current/20 pl-2 font-mono tabular-nums opacity-80" aria-label={`${stars} stars`}>
          {fmt.format(stars)}
        </span>
      )}
    </a>
  )
}
