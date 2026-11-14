import { z } from 'zod'
import { listOf, slugSchema, sortSchema, tagSchema } from 'wobli-api/contracts'

// What the API sends is defined once, in the backend's contracts; the site parses with the same schemas.
export { categorySchema, facetsSchema, illustrationPageSchema, illustrationSchema, sitemapSchema, PAGE_SIZE } from 'wobli-api/contracts'
export type { Category, Facets, Illustration, IllustrationPage, Sort } from 'wobli-api/contracts'

// Several categories or tags travel as one comma separated value, in the URL and to the API alike: ?tag=chat,inbox
const csv = (item: Parameters<typeof listOf>[0]) => listOf(item).transform((values) => values.join(','))
/** The values of a comma separated filter. */
export const filterValues = (value: string | undefined) => (value ? value.split(',') : [])

// /illustrations search params. A hand-edited value the API would refuse is dropped here, so a filtered URL never errors.
export const listSearchSchema = z.object({
  category: csv(slugSchema).optional().catch(undefined),
  tag: csv(tagSchema).optional().catch(undefined),
  q: z.string().max(64).optional().catch(undefined),
  sort: sortSchema.optional().catch(undefined),
})
export type ListFilters = z.infer<typeof listSearchSchema>
