import { createFileRoute } from '@tanstack/react-router'
import { Suspense } from 'react'
import { EditorPage } from '~/features/customizer'
import { loadIllustration, useIllustration } from '~/features/illustrations'
import { buildMeta, illustrationJsonLd } from '~/features/seo'
import { styleSearchSchema } from '~/features/style'
import { site } from '~/shared/config/site'

export const Route = createFileRoute('/illustrations/$slug')({
  validateSearch: styleSearchSchema,
  loader: ({ context: { queryClient }, params }) => loadIllustration(queryClient, params.slug),
  head: ({ loaderData, params }) =>
    loaderData
      ? buildMeta({
          // the admin's SEO fields when set, otherwise generated from the title and description
          title: loaderData.item.seo.title || `${loaderData.item.title} · ${site.name}`,
          description: loaderData.item.seo.description || `${loaderData.item.description} Restyle it live and export a PNG or a component for React and Next.js.`,
          path: `/illustrations/${params.slug}`, // styled URLs share the bare canonical, so they never duplicate the page
          image: loaderData.item.poster,
          jsonLd: illustrationJsonLd(loaderData.item),
        })
      : {},
  component: RouteComponent,
})

function RouteComponent() {
  const { slug } = Route.useParams()
  const { data } = useIllustration(slug)
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  if (!data) return null
  // the boundary only ever waits while the page hydrates: the server's HTML stays up until the drawing's chunk arrives
  return (
    <>
      <Suspense>
        <EditorPage key={slug} illustration={data} search={search} onSearchChange={(next) => navigate({ search: next, replace: true, resetScroll: false })} />
      </Suspense>
      <AboutIllustration title={data.title} content={data.seo.content} />
    </>
  )
}

/** The admin's long-form copy for this illustration, below the editor: paragraphs split by blank lines. Nothing when empty. */
function AboutIllustration({ title, content }: { title: string; content: string }) {
  const paragraphs = content.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
  if (!paragraphs.length) return null
  return (
    <section aria-labelledby="about-illustration" className="mx-auto max-w-3xl px-4 py-12">
      <h2 id="about-illustration" className="type-title">
        About the {title} illustration
      </h2>
      <div className="mt-4 space-y-4 text-label-2">
        {paragraphs.map((p, i) => (
          <p key={i} className="whitespace-pre-line">
            {p}
          </p>
        ))}
      </div>
    </section>
  )
}
