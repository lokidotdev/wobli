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

**Data.** The catalogue comes from the API in [../backend](../backend/README.md): metadata and tags from D1, posters and drawings from R2. `src/features/illustrations/api/illustrations.api.ts` holds the fetchers and `src/shared/lib/api.ts` the client, which calls `VITE_API_URL` both while rendering on the server and in the browser. Run `pnpm dev` at the repo root to start both, and `pnpm --filter wobli-api publish-icons` once to fill the local database.

## Environment

| Var | Example |
|---|---|
| `VITE_API_URL` | `http://localhost:8787` (optional; defaults to this in dev, unset in builds) |
| `VITE_CDN_URL` | `https://cdn.isoloops.com` |
| `VITE_SITE_URL` | `http://localhost:3000` (used for canonical URLs / sitemap) |

**Caching (ISR).** `src/server.ts` wraps the renderer in stale-while-revalidate on Cloudflare's edge cache: a page is served from cache for 60s, then served stale while it re-renders in the background, and dropped after a day. Only 200 HTML/XML renders are cached, never in dev. The `x-isr` header shows HIT, STALE, MISS or BYPASS. It needs a custom domain; on `*.workers.dev` every request is a MISS.

**The backend is optional.** A plain `pnpm build && wrangler deploy` ships the site on its own: with no `VITE_API_URL` and no binding it serves the illustrations bundled with it and the default settings. Production settings are never in the repo: set them as build variables on the host (Cloudflare Workers Builds → Settings → Variables), the way you would on Vercel. `VITE_API_URL` is the API's public URL; `API_WORKER` (e.g. `wobli-api`) binds that Worker as `API` for server-side requests, and it must be deployed before the first build that sets it. Locally neither is set, so `pnpm dev` always runs against the local backend. `VITE_SITE_URL` is the public origin used for canonical links, OG images, JSON-LD, the sitemap and robots.txt (defaults to `https://wobli.space`, or `http://localhost:3000` in dev). `.env.example` lists all three.

## Scripts

`bun run dev` · `bun run build` · `bun run test` · `bun run e2e` · `bun run deploy`
