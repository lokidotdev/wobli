import { createFileRoute } from '@tanstack/react-router'
import { LandingPage, landingQueries } from '~/features/landing'
import { sponsorsQuery } from '~/features/sponsors'
import { buildMeta, websiteJsonLd } from '~/features/seo'
import { pageSeo } from '~/features/settings'
import { site } from '~/shared/config/site'
import alloUrl from 'allo-font/fonts/webfonts/AlloVariable.woff2?url'

export const Route = createFileRoute('/')({
  loader: async ({ context: { queryClient } }) => {
    const [seo] = await Promise.all([
      pageSeo(queryClient, 'home', { title: `Animated Isometric Illustrations for React & Next.js · ${site.name}`, description: site.description }),
      ...landingQueries().map((q) => queryClient.ensureQueryData(q)),
      queryClient.ensureQueryData(sponsorsQuery()), // so the sponsor logos are in the server-rendered HTML
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
    // the headline face, preloaded so the first paint is already in it
    return { ...head, links: [...(head.links ?? []), { rel: 'preload', href: alloUrl, as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' }] }
  },
  component: LandingPage,
})
