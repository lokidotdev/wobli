import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { buildMeta } from '~/features/seo'
import { SponsorsPage, sponsorsQuery } from '~/features/sponsors'
import { site } from '~/shared/config/site'

// Dodo sends buyers back to /sponsors?checkout=<sponsor id>, with its own payment_id and status alongside.
const searchSchema = z.object({ checkout: z.coerce.number().int().positive().optional().catch(undefined) })

export const Route = createFileRoute('/sponsors')({
  validateSearch: (raw) => searchSchema.parse(raw),
  loader: ({ context: { queryClient } }) => queryClient.ensureQueryData(sponsorsQuery()),
  head: () =>
    buildMeta({
      title: `Sponsors · ${site.name}`,
      description: 'Sponsor wobli and put your logo in front of the people building with it. Monthly tiers or a one-time gift.',
      path: '/sponsors',
    }),
  component: function Sponsors() {
    return <SponsorsPage thanks={Route.useSearch().checkout !== undefined} />
  },
})
