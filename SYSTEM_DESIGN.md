# Frontend system design — Isometric Loops (public site)

## 1. Goals

- A fast, SEO-first public site to browse, preview and download looping isometric illustrations.
- Every page is server-rendered with real HTML, titles, meta and structured data — crawlable on first byte.
- Loops play smoothly without wrecking performance (lazy, paused off-screen, respects reduced motion).
- Vibrant, content-first look (inspired by vibrant.design) refined with Apple-style principles: clarity, deference to content, depth.

## 2. Stack

| Concern | Choice |
|---|---|
| Framework | **TanStack Start** (React, SSR + streaming, server functions, file-based **TanStack Router**) |
| Data | **TanStack Query** — every query lives in a feature's `hooks/` folder; SSR-prefetched in route loaders and hydrated |
| Validation | **Zod** — API response parsing, route search params (`validateSearch`), forms |
| Styling | **Tailwind CSS v4** (`@theme` design tokens in CSS) |
| Auth client | `better-auth/react` (`createAuthClient`) pointed at the API |
| Forms | TanStack Form + Zod adapter |
| Motion | CSS + `motion` (Framer Motion) for UI transitions only; illustrations are video/canvas loops |
| Hosting | Cloudflare Workers (`@cloudflare/vite-plugin`), Cloudflare is an official TanStack Start hosting partner |
| Tooling | Bun (install, scripts), Vite, Biome/ESLint, Vitest + Testing Library, Playwright |

## 3. Feature-based folder structure

```
frontend/
├── src/
│   ├── routes/                         # Thin: wiring only (loader, head, component from a feature)
│   │   ├── __root.tsx                  # <html>, global head, QueryClient context, Header/Footer
│   │   ├── index.tsx                   # Landing page
│   │   ├── illustrations/
│   │   │   ├── index.tsx               # /illustrations?category&tag&q&sort  (all illustrations)
│   │   │   └── $slug.tsx               # /illustrations/folder-hover
│   │   ├── categories/$slug.tsx        # /categories/notifications
│   │   ├── auth/sign-in.tsx · sign-up.tsx · forgot-password.tsx
│   │   ├── account/favorites.tsx       # protected (beforeLoad → session check)
│   │   ├── sitemap[.]xml.ts            # server route → XML
│   │   └── robots[.]txt.ts             # server route
│   ├── features/
│   │   ├── landing/
│   │   │   ├── components/  Hero.tsx  HeroLoopRow.tsx  ExamplesGrid.tsx  SeeAllCta.tsx
│   │   │   └── index.ts
│   │   ├── illustrations/
│   │   │   ├── api/         illustrations.api.ts        # fetchers (typed by Zod contracts)
│   │   │   ├── hooks/       queries.ts                  # queryOptions factories + useXxx hooks
│   │   │   │                useIllustrations.ts  useIllustration.ts  useFeatured.ts  useDownload.ts
│   │   │   ├── components/  LoopPlayer.tsx  IllustrationCard.tsx  IllustrationGrid.tsx  Filters.tsx
│   │   │   ├── schemas/     illustration.schema.ts      # Zod (shared contracts re-exported)
│   │   │   └── index.ts                                 # public surface of the feature
│   │   ├── categories/      api/ hooks/ components/ schemas/
│   │   ├── search/          hooks/useSearch.ts  components/SearchBar.tsx
│   │   ├── favorites/       hooks/useFavorites.ts (useQuery + useMutation w/ optimistic update)
│   │   ├── auth/            lib/auth-client.ts  hooks/useSession.ts  components/SignInForm.tsx  GoogleButton.tsx
│   │   └── seo/             lib/meta.ts (buildMeta, canonical)  lib/jsonld.ts
│   ├── shared/
│   │   ├── ui/              Button  Container  Badge  Skeleton  Header  Footer  (design system)
│   │   ├── lib/             api-client.ts (fetch + Zod parse + errors)  query-client.ts  cn.ts
│   │   ├── hooks/           useInView.ts  usePrefersReducedMotion.ts
│   │   └── config/          env.ts (Zod-validated)  site.ts (name, url, socials)
│   ├── styles/app.css       # Tailwind v4 @import + @theme tokens
│   ├── router.tsx           # createRouter + routerWithQueryClient (SSR dehydrate/hydrate)
│   └── server.ts            # Worker entry (TanStack Start server handler)
├── public/                  # favicon, apple-touch-icon, manifest, og-default.png
├── vite.config.ts
├── wrangler.jsonc
└── package.json
```

Rules:
- `routes/` never contains UI logic — it imports from `features/*/index.ts`.
- **All server state goes through hooks** in `features/*/hooks`. Components never call `fetch` or `useQuery` with inline keys.
- Features may import from `shared/` and from other features' `index.ts` only.

### Query pattern

```ts
// features/illustrations/hooks/queries.ts
export const illustrationKeys = {
  all: ['illustrations'] as const,
  list: (f: ListFilters) => [...illustrationKeys.all, 'list', f] as const,
  featured: (limit: number) => [...illustrationKeys.all, 'featured', limit] as const,
  detail: (slug: string) => [...illustrationKeys.all, 'detail', slug] as const,
}

export const featuredQuery = (limit = 12) =>
  queryOptions({ queryKey: illustrationKeys.featured(limit), queryFn: () => getFeatured(limit), staleTime: 5 * 60_000 })

export const useFeatured = (limit?: number) => useSuspenseQuery(featuredQuery(limit))

// routes/index.tsx
export const Route = createFileRoute('/')({
  loader: ({ context }) => context.queryClient.ensureQueryData(featuredQuery(12)),
  head: () => buildMeta({ title: 'Isometric Loops — animated isometric illustrations', ... }),
  component: LandingPage,
})
```

Loaders prefetch on the server, the dehydrated cache streams to the client, and the hooks read it without a second request. `/illustrations` uses `useInfiniteQuery` with the API cursor, and its filters are Zod-validated search params so filtered pages are shareable and indexable.

## 4. Pages

### Landing (`/`)

```
┌─────────────────────────────────────────────────────────────┐
│ Header: logo · Illustrations · Categories · Sign in          │
├─────────────────────────────────────────────────────────────┤
│                 HERO (100svh)                                │
│     "Isometric loops that make your product feel alive"     │
│     Free, looping, transparent illustrations — drop-in        │
│     for apps, sites and decks.                               │
│             [ Explore illustrations → ]                      │
│                                                             │
│   ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐   ← first row of loops │
│   └────┘ └────┘ └────┘ └────┘ └────┘     visible in the hero │
├───────────────────── fold ──────────────────────────────────┤
│   ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐   ← a few more rows     │
│   └────┘ └────┘ └────┘ └────┘ └────┘     (examples)          │
│             [ See all illustrations ]                        │
├─────────────────────────────────────────────────────────────┤
│ Footer: wordmark · links (Illustrations, License, Privacy,  │
│ Terms, Contact) · socials · ©                                │
└─────────────────────────────────────────────────────────────┘
```

- Hero uses `min-h-svh` with a flex column: heading block centred, then the grid starts so **exactly the first row** sits inside the viewport. Row height is computed from the grid's column count (`grid-cols-2 sm:grid-cols-3 lg:grid-cols-5`, square cards) — the hero reserves space so only one row shows above the fold on every breakpoint.
- One `useFeatured(12-15)` query feeds both the hero row and the examples below (one request).
- "Explore" scrolls/links to `/illustrations`; "See all illustrations" links to `/illustrations`.

### Illustrations (`/illustrations`)
Filter chips (category), search, sort, infinite grid, `?category=&q=&sort=` in the URL.

### Detail (`/illustrations/$slug`)
Large player, title, description, tags, palette, download buttons (WebM alpha / MOV alpha / MP4 / PNG), embed snippet, related grid, favourite button.

## 5. LoopPlayer (performance-critical)

```tsx
<video autoPlay muted loop playsInline preload="none" poster={posterUrl}>
  <source src={movHevcAlphaUrl} type='video/mp4; codecs="hvc1"' />  {/* Safari: alpha */}
  <source src={webmAlphaUrl} type="video/webm" />                     {/* Chrome/Firefox/Edge */}
</video>
```

- `IntersectionObserver` (`useInView`) → `play()` when visible, `pause()` when off-screen; `preload="none"` until near the viewport.
- Poster PNG is the SSR'd image (good LCP, good for crawlers); the first hero row's posters get `fetchpriority="high"`.
- `prefers-reduced-motion: reduce` → show the poster only, play on hover/focus.
- Fixed `aspect-square` boxes → zero layout shift (CLS ≈ 0).
- Canvas-based illustrations (`src/fun.ts` / `Sticker.tsx` motion format) render through the same component with a `kind: 'canvas'` branch, lazy-loaded with `React.lazy`.

## 6. SEO (built in from day one)

| Item | Implementation |
|---|---|
| SSR HTML | TanStack Start renders every route on the server; content isn't behind JS |
| Per-route meta | `head()` on each route via `buildMeta()` → title, description, canonical, Open Graph, Twitter card |
| Clean URLs | `/illustrations/folder-hover`, `/categories/notifications` (slugs from the API) |
| Structured data | `WebSite` + `SearchAction` (root), `CollectionPage` + `ItemList` (lists), `VideoObject` + `ImageObject` (detail), `BreadcrumbList` |
| Sitemap | `sitemap.xml` server route built from `/v1/seo/sitemap-data`, cached at the edge |
| robots.txt | Server route; disallows `/account`, `/auth` |
| OG images | Per-illustration poster/OG asset from R2; default `og-default.png` |
| Performance | Core Web Vitals: SSR, poster LCP, no CLS, lazy video, edge-cached HTML (`s-maxage` + SWR) |
| Accessibility | Semantic landmarks, `aria-label` on players, visible focus rings, colour contrast AA |
| i18n-ready | `lang` on `<html>`, `hreflang` when locales are added |

## 7. Design system

Vibrant.design's structure (big confident headline, content-first grid, minimal chrome, simple footer) with Apple Human Interface principles layered on:

- **Clarity** — one clear headline, one primary action, generous whitespace, SF-like type (`Inter`/system-ui stack, tight tracking on display sizes, `text-balance`).
- **Deference** — UI is neutral so the colourful loops are the hero; cards are soft `rounded-3xl` surfaces with subtle borders, not heavy shadows.
- **Depth** — translucent sticky header (`backdrop-blur`, `bg-white/70`), gentle spring hover lift on cards (scale 1.02, `transition` ~300ms ease-out), layered surfaces.
- **Vibrance** — a single vivid accent gradient (e.g. violet → pink → orange) used sparingly: CTA button, headline highlight, focus ring.
- Light + dark mode via CSS variables in Tailwind `@theme`; 8-pt spacing scale; 44px minimum tap targets.

```css
/* styles/app.css */
@import "tailwindcss";
@theme {
  --font-sans: "Inter", ui-sans-serif, system-ui, -apple-system, "SF Pro Text", sans-serif;
  --color-surface: oklch(99% 0 0);
  --color-ink: oklch(20% 0.02 270);
  --color-accent-1: oklch(62% 0.25 295);  /* violet */
  --color-accent-2: oklch(68% 0.24 350);  /* pink   */
  --color-accent-3: oklch(76% 0.18 55);   /* orange */
  --radius-card: 1.5rem;
}
```

## 8. Auth on the frontend

- `authClient = createAuthClient({ baseURL: env.API_URL })` (Better Auth React).
- Sign-in page: email + password form (TanStack Form + Zod) and a "Continue with Google" button (`authClient.signIn.social({ provider: 'google', callbackURL })`).
- `useSession()` hook wraps the session as a TanStack Query; protected routes check the session in `beforeLoad` and redirect to `/auth/sign-in?redirect=...`.
- Session cookie is shared across `*.isoloops.com`, so SSR can forward the cookie to the API.

## 9. Data flow

```
Route loader (server) ──ensureQueryData──▶ api-client ──▶ API Worker (service binding) ──▶ D1
        │                                                       │
        ▼ dehydrated cache in HTML stream                       └─▶ returns R2 CDN URLs
Client hydrate ──▶ feature hooks (useFeatured, useIllustrations…) ──▶ components
                                                                     └─▶ <video> pulls from cdn.isoloops.com
```

## 10. Testing

- Vitest + Testing Library for components and hooks (MSW for API mocks).
- Playwright: landing renders hero row, "See all" navigates, detail page has correct `<title>`/JSON-LD, sign-in flows.
- Lighthouse CI budget: Performance ≥ 90, SEO = 100, Accessibility ≥ 95.
