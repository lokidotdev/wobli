const REPO = 'lokidotdev/wobli'

export const site = {
  name: 'wobli',
  // The public origin canonical links, OG images, JSON-LD, the sitemap and robots.txt are built from (VITE_SITE_URL).
  url: ((import.meta.env.VITE_SITE_URL as string | undefined) || (import.meta.env.DEV ? 'http://localhost:3000' : 'https://wobli.space')).replace(/\/+$/, ''),
  description: 'Animated isometric illustrations you customise in the browser. Change colours, outline and depth, then export a transparent PNG or a component for React and Next.js.',
  // the default share image (media/og/render.sh); PNG because LinkedIn and some chat apps skip WebP previews
  ogImage: { url: '/og-default.png', width: 1200, height: 630, alt: 'wobli: isometric illustrations you restyle live' },
  twitter: '@lokidotdev',
  repo: REPO,
  repoUrl: `https://github.com/${REPO}`,
  // the creator's other sites, in the footer
  creator: [
    { href: 'https://designeng.tools', label: 'designeng.tools' },
    { href: 'https://oxyn.space', label: 'oxyn.space' },
  ],
}

/** The X profile behind `site.twitter`. */
export const xUrl = `https://x.com/${site.twitter.slice(1)}`

/**
 * The pages the site is made of, besides the landing page: the nav, the phone menu, the footer and the sitemap all list
 * these. Each has a sticker colour (a --color-slush-* name) and a tilt its pill takes when hovered.
 */
export const PAGES = [
  { to: '/illustrations', label: 'Illustrations', colour: 'sunburst', tilt: -4 },
  { to: '/docs', label: 'Docs', colour: 'mint', tilt: 3 },
  { to: '/how-its-made', label: 'How It\u2019s Made', colour: 'lavender', tilt: -3 },
] as const

