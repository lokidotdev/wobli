import { featuredQuery } from '~/features/illustrations'

/** The Featured grid's default eight, in this order: two full rows of four. */
export const GRID = ['folder-hover', 'ai-agent-tasks', 'calendar-booking', 'camera-capture', 'e-signature', 'headphones', 'invoice-paid', 'no-results']

/** Everything the landing page reads before it can render: the hero's few and the grid's eight. The route prefetches these. */
export const landingQueries = () => [featuredQuery(), featuredQuery(GRID.length)]
