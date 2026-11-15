import { Link } from '@tanstack/react-router'
import { site } from '~/shared/config/site'
import { Container } from './Container'
import { Logo, useLogoShuffle } from './Logo'

const creator = [
  { href: 'https://designeng.tools', label: 'designeng.tools' },
  { href: 'https://oxyn.space', label: 'oxyn.space' },
]

export function Footer() {
  const shuffle = useLogoShuffle()
  return (
    <footer className="mt-28 border-t border-separator bg-bg-2">
      <Container className="flex flex-col gap-8 py-12 text-[14px] text-label-2 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm">
          <Link to="/" className="flex items-center gap-2 text-[16px] font-semibold tracking-[-0.02em] text-label" {...shuffle}>
            <Logo className="size-5" />
            {site.name}
          </Link>
          <p className="mt-2">{site.description}</p>
        </div>
        <div className="grid grid-cols-2 gap-x-12 gap-y-8 sm:grid-cols-3">
          <nav aria-label="Footer" className="flex flex-col gap-3">
            <h2 className="text-[13px] font-medium text-label">Product</h2>
            <Link to="/illustrations" className="hover:text-label">
              Illustrations
            </Link>
            <Link to="/docs" className="hover:text-label">
              Docs
            </Link>
            <Link to="/docs" hash="licence" className="hover:text-label">
              Licence
            </Link>
          </nav>
          <nav aria-label="More from the creator" className="flex flex-col gap-3">
            <h2 className="text-[13px] font-medium text-label">More from the Creator</h2>
            {creator.map((l) => (
              <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className="hover:text-label">
                {l.label}
              </a>
            ))}
          </nav>
          <nav aria-label="Social" className="flex flex-col gap-3">
            <h2 className="text-[13px] font-medium text-label">Follow</h2>
            <a href="https://x.com/lokidotdev" target="_blank" rel="noreferrer" className="hover:text-label">
              X (@lokidotdev)
            </a>
            <a href={`https://github.com/${site.repo}`} target="_blank" rel="noreferrer" className="hover:text-label">
              GitHub
            </a>
          </nav>
        </div>
      </Container>
      <Container className="pb-10 text-[13px] text-label-3">
        © {new Date().getFullYear()} {site.name}.
      </Container>
    </footer>
  )
}
