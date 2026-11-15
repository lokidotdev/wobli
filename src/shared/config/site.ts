export const site = {
  name: 'wobli',
  // The public origin canonical links, OG images, JSON-LD, the sitemap and robots.txt are built from (VITE_SITE_URL).
  url: ((import.meta.env.VITE_SITE_URL as string | undefined) || (import.meta.env.DEV ? 'http://localhost:3000' : 'https://wobli.space')).replace(/\/+$/, ''),
  description: 'Animated isometric illustrations you customise in the browser. Change colours, outline and depth, then export a transparent PNG or a component for React and Next.js.',
  ogImage: '/og-default.webp',
  twitter: '@lokidotdev',
  repo: 'lokidotdev/wobli',
}
