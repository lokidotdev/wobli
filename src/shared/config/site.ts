export const site = {
  name: 'wobli',
  // The public origin canonical links, OG images, JSON-LD, the sitemap and robots.txt are built from (VITE_SITE_URL).
  url: ((import.meta.env.VITE_SITE_URL as string | undefined) || (import.meta.env.DEV ? 'http://localhost:3000' : 'https://wobli.space')).replace(/\/+$/, ''),
  description: 'Animated isometric illustrations you customise in the browser. Change colours, outline and depth, then export a transparent PNG or a component for React and Next.js.',
  // the default share image (media/og/render.sh); PNG because LinkedIn and some chat apps skip WebP previews
  ogImage: { url: '/og-default.png', width: 1200, height: 630, alt: 'wobli: isometric illustrations you restyle live' },
  twitter: '@lokidotdev',
  repo: 'lokidotdev/wobli',
}
