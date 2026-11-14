import { notFound } from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'
import { illustrationQuery } from '../hooks/queries'
import { loadIcon } from './icons'

/** The accessible name of a live sticker, wherever one is shown. */
export const illustrationLabel = (title: string) => `${title}, animated illustration`

/** A tag as people read it: "dynamic-island" is stored, "dynamic island" is shown. */
export const tagLabel = (tag: string) => tag.replaceAll('-', ' ')

/** Route loader for any page about one illustration: its data in the query cache and its drawing loaded, or a 404. */
export async function loadIllustration(queryClient: QueryClient, slug: string) {
  const item = await queryClient.ensureQueryData(illustrationQuery(slug))
  if (!item) throw notFound()
  await loadIcon(item)
  return { item }
}
