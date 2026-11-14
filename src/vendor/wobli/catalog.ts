// What the site knows about an illustration besides its drawing. Each icon file has a sibling `<slug>.meta.ts` that
// default-exports one of these; the file name is the slug.

/** Every category, once. Add one here and it shows up in the filters; a meta file with an unknown category fails typecheck. */
export const CATEGORIES = {
  files: 'Files',
  notifications: 'Notifications',
  payments: 'Payments',
  messaging: 'Messaging',
  security: 'Security',
  analytics: 'Analytics',
  productivity: 'Productivity',
  ecommerce: 'E-commerce',
  dev: 'Dev & tech',
  system: 'Settings & system',
  onboarding: 'Onboarding',
  social: 'Social',
  ai: 'AI',
  media: 'Media',
  health: 'Health & fitness',
  travel: 'Travel & maps',
  education: 'Education',
  'smart-home': 'Smart home',
  marketing: 'Marketing',
  hr: 'HR & people',
} as const
export type CategorySlug = keyof typeof CATEGORIES

export type IconMeta = {
  title: string
  description: string
  category: CategorySlug
  tags: ReadonlyArray<string>
  /** Shown first in the catalogue and in the landing page's hero row. */
  featured?: boolean
}
