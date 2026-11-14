import { createFileRoute } from '@tanstack/react-router'
import { Suspense, useEffect, useMemo } from 'react'
import { clock } from 'wobli'
import type { Style } from 'wobli'
import { Sticker } from 'wobli/react'
import { backgroundColor, decodeStyle, styleSearchSchema, toEngineStyle } from '~/features/style'
import { illustrationLabel, loadIllustration, useIcon, useIllustration } from '~/features/illustrations'
import type { Illustration } from '~/features/illustrations'
import { absolute } from '~/features/seo'

// The embeddable player: one sticker filling the frame, in the look its URL encodes, with no site chrome. Transparent unless
// the look sets a background, so an <iframe> sits on whatever page hosts it.
export const Route = createFileRoute('/embed/$slug')({
  validateSearch: styleSearchSchema,
  loader: ({ context: { queryClient }, params }) => loadIllustration(queryClient, params.slug),
  head: ({ loaderData, params }) => ({
    // color-scheme normal: an iframe whose scheme differs from its host gets an opaque backdrop, which would hide transparency
    meta: [{ title: loaderData?.item.title ?? 'wobli' }, { name: 'robots', content: 'noindex' }, { name: 'color-scheme', content: 'normal' }],
    links: [{ rel: 'canonical', href: absolute(`/illustrations/${params.slug}`) }],
  }),
  component: () => (
    <Suspense>
      <Embed />
    </Suspense>
  ),
})

function Embed() {
  const { slug } = Route.useParams()
  const { data } = useIllustration(slug)
  const search = Route.useSearch()
  const style = useMemo(() => decodeStyle(search), [search])
  const look = useMemo(() => toEngineStyle(style), [style])
  // this page holds a single sticker, so the shared page clock can carry the look's speed
  useEffect(() => void (clock.speed = style.speed), [style.speed])
  if (!data) return null
  return <Player illustration={data} look={look} loop={style.loop} background={backgroundColor(style.bg)} />
}

function Player({ illustration, look, loop, background }: { illustration: Illustration; look: Style; loop: boolean; background: string | undefined }) {
  const icon = useIcon(illustration)
  return (
    <div className="grid h-dvh w-full place-items-center overflow-hidden" style={{ background }}>
      <Sticker icon={icon} palette={look.palette} line={look.line} depth={look.depth} loop={loop} label={illustrationLabel(illustration.title)} style={{ width: 'min(100vw, 100dvh)' }} />
    </div>
  )
}
