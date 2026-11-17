/// <reference types="vite/client" />
import { HeadContent, Outlet, Scripts, createRootRouteWithContext, useRouterState } from '@tanstack/react-router'
import { NotFoundPage } from '~/features/landing'
import { settingsQuery } from '~/features/settings'
import { applySiteStyle } from '~/features/style'
import type { QueryClient } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { site } from '~/shared/config/site'
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
      { name: 'theme-color', content: '#ffffff' },
      { name: 'color-scheme', content: 'light' },
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
  notFoundComponent: NotFoundPage,
})

function RootComponent() {
  applySiteStyle(Route.useLoaderData().style) // no-op once applied; covers hydration, where the loader does not re-run
  // every page is a sticker-book page (DESIGN.md), 404s included; only the embed player is bare: no nav or footer, and no
  // page colour behind a transparent sticker
  const embed = useRouterState({ select: (s) => s.location.pathname.startsWith('/embed/') })
  if (embed)
    return (
      <RootDocument bodyClass="bg-transparent">
        <Outlet />
      </RootDocument>
    )
  return (
    <RootDocument>
      <SlushLayout>
        <Outlet />
      </SlushLayout>
    </RootDocument>
  )
}

function RootDocument({ children, bodyClass }: { children: ReactNode; bodyClass?: string }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className={bodyClass}>
        {children}
        <Scripts />
      </body>
    </html>
  )
}
