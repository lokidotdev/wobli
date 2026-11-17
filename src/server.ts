// The Worker's entry: TanStack Start's own handler, wrapped in ISR (incremental static regeneration) on Cloudflare's
// edge cache. A rendered page is kept per URL in each Cloudflare location and served without rendering again:
//   fresh  (younger than FRESH_SECONDS)  served from cache
//   stale  (older, younger than MAX_SECONDS)  served from cache at once, and re-rendered in the background for the next
//          visitor, so admin edits show up within about a minute without anyone waiting on a render
//   gone   (older than MAX_SECONDS, or never rendered here)  rendered now and cached
// Only successful, cookie-free GET page renders are cached; errors, server functions and dev are never cached.
// The `x-isr` response header says which happened (HIT, STALE, MISS, BYPASS).
// Note: Cloudflare's cache doesn't work on *.workers.dev URLs, only on a custom domain; there every request is a MISS.

import { createServerEntry } from '@tanstack/react-start/server-entry'
import { createStartHandler, defaultStreamHandler } from '@tanstack/react-start/server'

const startFetch = createStartHandler(defaultStreamHandler)

const FRESH_SECONDS = 60
const MAX_SECONDS = 24 * 60 * 60
const RENDERED_AT = 'x-isr-rendered-at'

type Ctx = { waitUntil(promise: Promise<unknown>): void }

const cacheable = (request: Request) => {
  if (import.meta.env.DEV || request.method !== 'GET') return false
  const { pathname } = new URL(request.url)
  // server functions and anything else under /_ are data calls, not pages
  return !pathname.startsWith('/_') && !request.headers.has('authorization')
}

/** The key a page is cached under: its URL without the fragment, and without the query when it holds only tracking. */
const cacheKey = (request: Request) => {
  const url = new URL(request.url)
  url.hash = ''
  // each build caches separately: a page rendered by an earlier deploy points at asset files the new one doesn't have
  url.searchParams.set('__build', __BUILD_ID__)
  for (const p of [...url.searchParams.keys()]) if (/^(utm_|fbclid$|gclid$|ref$)/.test(p)) url.searchParams.delete(p)
  return new Request(url.toString(), { method: 'GET' })
}

const render = (request: Request, ...rest: unknown[]) => (startFetch as (...a: unknown[]) => Promise<Response>)(request, ...rest)

/** Renders the page and, if it is worth keeping, stores a copy. Returns the response for the visitor, and whether it was stored. */
async function renderAndStore(cache: Cache, key: Request, request: Request, rest: unknown[]): Promise<{ response: Response; stored: boolean }> {
  const response = await render(request, ...rest)
  const type = response.headers.get('content-type') ?? ''
  if (response.status !== 200 || response.headers.has('set-cookie') || !/text\/html|application\/xml/.test(type)) return { response, stored: false }
  const stored = new Response(response.clone().body, response)
  stored.headers.set(RENDERED_AT, String(Date.now()))
  // the edge drops it after MAX_SECONDS; browsers are told to always come back, so they always see the edge's copy
  stored.headers.set('Cache-Control', `public, s-maxage=${MAX_SECONDS}`)
  await cache.put(key, stored)
  return { response, stored: true }
}

/** A response the cache did not keep: labelled, its own headers left alone (robots.txt sets its own Cache-Control). */
const bypass = (response: Response) => {
  const out = new Response(response.body, response)
  out.headers.set('x-isr', 'BYPASS')
  return out
}

const withState = (response: Response, state: string) => {
  const out = new Response(response.body, response)
  out.headers.set('x-isr', state)
  out.headers.delete(RENDERED_AT)
  out.headers.set('Cache-Control', 'public, max-age=0, must-revalidate')
  return out
}

/** Security headers on everything the Worker answers (public/_headers covers the static files). HSTS is set by Cloudflare. */
function secure(response: Response, request: Request): Response {
  const out = new Response(response.body, response)
  out.headers.set('X-Content-Type-Options', 'nosniff')
  out.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  out.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()')
  // the embed player exists to be framed by other sites; every other page may only be framed by this one
  if (!new URL(request.url).pathname.startsWith('/embed/')) {
    out.headers.set('X-Frame-Options', 'SAMEORIGIN')
    out.headers.set('Content-Security-Policy', "frame-ancestors 'self'")
  }
  return out
}

export default createServerEntry({
  async fetch(request: Request, ...rest: unknown[]) {
    return secure(await handle(request, rest), request)
  },
} as Parameters<typeof createServerEntry>[0])

async function handle(request: Request, rest: unknown[]): Promise<Response> {
  if (!cacheable(request)) return render(request, ...rest)
  const ctx = rest[1] as Ctx | undefined
  const cache = (caches as unknown as { default: Cache }).default
  const key = cacheKey(request)

  const hit = await cache.match(key)
  if (hit) {
    const age = (Date.now() - Number(hit.headers.get(RENDERED_AT) ?? 0)) / 1000
    if (age < FRESH_SECONDS) return withState(hit, 'HIT')
    // stale: answer now, render the next copy in the background (or inline when there is no ctx to wait on)
    const refresh = renderAndStore(cache, key, new Request(request), rest).catch((e: unknown) => console.error('isr: background render failed', e))
    if (ctx) ctx.waitUntil(refresh)
    else await refresh
    return withState(hit, 'STALE')
  }

  // only a page this cache keeps is labelled and re-headered; anything else (robots.txt, an error) goes out as it was rendered
  const { response, stored } = await renderAndStore(cache, key, request, rest)
  return stored ? withState(response, 'MISS') : bypass(response)
}
