# Isometric Loops — Frontend

Public, SEO-first site for browsing and downloading looping isometric illustrations.

**Stack:** TanStack Start (React SSR) · TanStack Router · TanStack Query · Zod · Tailwind CSS v4 · Better Auth client · Cloudflare Workers · Bun

Full architecture: [SYSTEM_DESIGN.md](SYSTEM_DESIGN.md)

## Pages

| Route | What |
|---|---|
| `/` | Landing: value headline, **Explore** button, first row of loops in the hero, a few more examples, **See all illustrations**, footer |
| `/illustrations` | All illustrations — filters, search, infinite scroll |
| `/illustrations/:slug` | Detail, downloads, related |
| `/categories/:slug` | Category listing |
| `/auth/*` | Sign in / sign up (email + password, Google) |
| `/account/favorites` | Saved illustrations (signed in) |
| `/sitemap.xml`, `/robots.txt` | SEO server routes |

## Structure (feature-based)

```
src/
  routes/      thin route files (loader + head + component)
  features/    landing · illustrations · categories · search · favorites · auth · seo
               each with api/ hooks/ components/ schemas/ index.ts
  shared/      ui/ (design system) · lib/ · hooks/ · config/
  styles/      Tailwind v4 tokens
```

All server data is fetched through **query hooks in `features/*/hooks`** — components never call `fetch` directly.

## Getting started

```bash
bun install
bun run dev        # http://localhost:3000
```

## Status

Built: landing page (`/`), explore page (`/illustrations` with category, search and sort in the URL), `sitemap.xml`, `robots.txt`, per-page meta + JSON-LD.

Not built yet: detail page, categories pages, auth, favorites.

**Data.** The catalogue comes from the API in [../backend](../backend/README.md): metadata and tags from D1, posters and drawings from R2. `src/features/illustrations/api/illustrations.api.ts` holds the fetchers and `src/shared/lib/api.ts` the client, which uses the `API` service binding while rendering on the server and `VITE_API_URL` in the browser. Run `pnpm dev` at the repo root to start both, and `pnpm --filter wobli-api publish-icons` once to fill the local database.

## Environment

| Var | Example |
|---|---|
| `VITE_API_URL` | `http://localhost:8787` |
| `VITE_CDN_URL` | `https://cdn.isoloops.com` |
| `VITE_SITE_URL` | `http://localhost:3000` (used for canonical URLs / sitemap) |

`wrangler.jsonc` binds `API` to the backend Worker for server-side requests: `wobli-api-dev` by default, `wobli-api` in `env.production` (`pnpm deploy` builds with `CLOUDFLARE_ENV=production`).

## Scripts

`bun run dev` · `bun run build` · `bun run test` · `bun run e2e` · `bun run deploy`
