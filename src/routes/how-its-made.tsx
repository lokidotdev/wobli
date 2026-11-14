import { createFileRoute } from '@tanstack/react-router'
import { GuidePage } from '~/features/guide'
import { buildMeta } from '~/features/seo'
import { site } from '~/shared/config/site'

export const Route = createFileRoute('/how-its-made')({
  head: () =>
    buildMeta({
      title: `How It's Made · ${site.name}`,
      description: 'How every wobli illustration is made, step by step: a general description, an animation description, two AI skills, and an export in every format. Swap the skills for your own style.',
      path: '/how-its-made',
    }),
  component: GuidePage,
})
