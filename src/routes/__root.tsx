import { themeScript } from '~/shared/ui/ThemeToggle'
/// <reference types="vite/client" />
import { HeadContent, Outlet, Scripts, createRootRouteWithContext, useRouterState } from '@tanstack/react-router'
import { settingsQuery } from '~/features/settings'
import { applySiteStyle } from '~/features/style'
import type { QueryClient } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { site } from '~/shared/config/site'
import { Footer } from '~/shared/ui/Footer'
import { Header } from '~/shared/ui/Header'
import { SlushLayout } from '~/shared/ui/SlushChrome'
import appCss from '~/styles/app.css?url'

// Umami, only when both build variables are set (never in a plain local run or a fork without them).
const umamiSrc = import.meta.env.VITE_UMAMI_SRC as string | undefined
const umamiId = import.meta.env.VITE_UMAMI_WEBSITE_ID as string | undefined
const analytics = umamiSrc && umamiId ? [{ src: umamiSrc, defer: true, 'data-website-id': umamiId }] : []

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  // the admin's site-wide look, in place before any page renders (and again on the client, from the dehydrated data)
  loader: async ({ context: { queryClient } }) => {
    const settings = await queryClient.ensureQueryData(settingsQuery())
    applySiteStyle(settings.style)
    return { style: settings.style }
  },
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
      { name: 'theme-color', content: '#ffffff', media: '(prefers-color-scheme: light)' },
      { name: 'theme-color', content: '#0a0a0a', media: '(prefers-color-scheme: dark)' },
      { name: 'color-scheme', content: 'light dark' },
      { title: site.name },
    ],
    links: [
      { rel: 'preload', href: '/fonts/Geist.woff2', as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' },
      // used above the fold too: preloading it starts the download with the stylesheet rather than after it
      { rel: 'preload', href: '/fonts/GeistMono.woff2', as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' },
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
      { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
      { rel: 'manifest', href: '/manifest.webmanifest' },
    ],
    scripts: analytics,
  }),
  component: RootComponent,
  notFoundComponent: () => (
    <div className="mx-auto max-w-xl px-4 py-32 text-center">
      <h1 className="type-title">Page Not Found</h1>
      <p className="mt-3 text-label-2">This illustration doesn't exist (yet).</p>
    </div>
  ),
})

const SLUSH_PAGES = new Set(['/', '/illustrations', '/docs', '/how-its-made'])
// the editor (/illustrations/$slug) is a sticker-book page too
const isSlush = (path: string) => SLUSH_PAGES.has(path.replace(/\/+$/, '') || '/') || path.startsWith('/illustrations/')

function RootComponent() {
  applySiteStyle(Route.useLoaderData().style) // no-op once applied; covers hydration, where the loader does not re-run
  // the embed player is bare: no header or footer, and no page colour behind a transparent sticker
  // the sticker-book pages (DESIGN.md) bring their own shell: marquee, pill nav and footer
  const shell = useRouterState({ select: (s) => (s.location.pathname.startsWith('/embed/') ? 'embed' : isSlush(s.location.pathname) ? 'slush' : 'site') })
  if (shell === 'embed')
    return (
      <RootDocument bodyClass="bg-transparent">
        <Outlet />
      </RootDocument>
    )
  if (shell === 'slush')
    return (
      <RootDocument>
        <SlushLayout>
          <Outlet />
        </SlushLayout>
      </RootDocument>
    )
  return (
    <RootDocument>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </RootDocument>
  )
}

function RootDocument({ children, bodyClass }: { children: ReactNode; bodyClass?: string }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <HeadContent />
      </head>
      <body className={bodyClass}>
        {children}
        <Scripts />
      </body>
    </html>
  )
}
