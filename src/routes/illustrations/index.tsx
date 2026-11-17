import { createFileRoute } from '@tanstack/react-router'
import { GlobalStyleControls, useGlobalLook } from '~/features/style'
import { ExplorePage, facetsQuery, illustrationsQuery, listSearchSchema } from '~/features/illustrations'
import { buildMeta, collectionJsonLd } from '~/features/seo'
import { pageSeo } from '~/features/settings'
import { site } from '~/shared/config/site'

export const Route = createFileRoute('/illustrations/')({
  validateSearch: listSearchSchema,
  loaderDeps: ({ search }) => search,
  loader: async ({ context: { queryClient }, deps, cause }) => {
    const seoLoad = pageSeo(queryClient, 'illustrations', {
      title: `Illustrations · ${site.name}`,
      description: 'Live isometric illustrations for product UI. Restyle the whole grid at once, open one to customize and export.',
    })
    // Filtering on the page ('stay') must not hold the URL back until results arrive: that lag let late navigations
    // land out of order under the search box. The page fetches them itself and keeps the old grid up meanwhile.
    if (cause === 'stay') {
      void queryClient.prefetchInfiniteQuery(illustrationsQuery(deps))
      const cached = queryClient.getQueryData(illustrationsQuery(deps).queryKey)?.pages[0]
      return { seo: await seoLoad, items: cached?.items ?? [], total: cached?.total ?? 0 }
    }
    const [seo, list] = await Promise.all([seoLoad, queryClient.ensureInfiniteQueryData(illustrationsQuery(deps)), queryClient.ensureQueryData(facetsQuery())])
    const first = list.pages[0]
    return { seo, items: first?.items ?? [], total: first?.total ?? 0 }
  },
  head: ({ loaderData }) =>
    buildMeta({
      title: loaderData?.seo.title ?? site.name,
      description: loaderData?.seo.description,
      path: '/illustrations', // filtered views canonicalise to the full catalogue
      jsonLd: collectionJsonLd('All illustrations', '/illustrations', loaderData?.items ?? [], loaderData?.total),
    }),
  component: RouteComponent,
})

function RouteComponent() {
  const filters = Route.useSearch()
  const navigate = Route.useNavigate()
  const look = useGlobalLook()
  return <ExplorePage filters={filters} onFiltersChange={(search) => navigate({ search, replace: true, resetScroll: false })} look={look} styleBar={<GlobalStyleControls floating />} styleSidebar={<GlobalStyleControls stacked />} />
}
