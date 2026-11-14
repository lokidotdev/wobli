import { createFileRoute } from '@tanstack/react-router'
import { DocsPage } from '~/features/docs'
import { buildMeta } from '~/features/seo'
import { pageSeo } from '~/features/settings'
import { site } from '~/shared/config/site'

export const Route = createFileRoute('/docs')({
  loader: async ({ context: { queryClient } }) => ({
    seo: await pageSeo(queryClient, 'docs', {
      title: `Docs · ${site.name}`,
      description: 'Install the wobli package in a TypeScript or JavaScript project, drop a <Sticker> into React, restyle it with palette, line and depth, or draw frames yourself.',
    }),
  }),
  head: ({ loaderData }) => buildMeta({ title: loaderData?.seo.title ?? site.name, description: loaderData?.seo.description, path: '/docs' }),
  component: DocsPage,
})
