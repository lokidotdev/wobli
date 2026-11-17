import { createFileRoute } from '@tanstack/react-router'
import { LandingPage, landingQueries } from '~/features/landing'
import { buildMeta, websiteJsonLd } from '~/features/seo'
import { pageSeo } from '~/features/settings'
import { site } from '~/shared/config/site'

export const Route = createFileRoute('/')({
  loader: async ({ context: { queryClient } }) => {
    const [seo] = await Promise.all([
      pageSeo(queryClient, 'home', { title: `Animated Isometric Illustrations for React & Next.js · ${site.name}`, description: site.description }),
      ...landingQueries().map((q) => queryClient.ensureQueryData(q)),
    ])
    return { seo }
  },
  head: ({ loaderData }) => {
    const head = buildMeta({
      title: loaderData?.seo.title ?? site.name,
      description: loaderData?.seo.description,
      path: '/',
      jsonLd: websiteJsonLd(),
    })
    // the display face is only used here, so only this page preloads it
    return { ...head, links: [...(head.links ?? []), { rel: 'preload', href: '/fonts/Cove.woff2', as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' }] }
  },
  component: LandingPage,
})
