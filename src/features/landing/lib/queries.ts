import { featuredQuery } from '~/features/illustrations'

/** The Featured grid's default eight, in this order: two full rows of four. */
export const GRID = ['folder-hover', 'ai-agent-tasks', 'calendar-booking', 'camera-capture', 'e-signature', 'headphones', 'invoice-paid', 'no-results']

/** How many of the featured the hero pins: the first of the grid's eight, in the admin's order. */
export const HERO_COUNT = 5

/** Everything the landing page reads before it can render (the featured eight). The route prefetches these. */
export const landingQueries = () => [featuredQuery(GRID.length)]
