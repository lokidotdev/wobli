import { createIsomorphicFn } from '@tanstack/react-start'
import type { z } from 'zod'

// The API is optional. In dev it defaults to the local backend; a build without VITE_API_URL has none, and every request
// fails as "unreachable" without touching the network, so the site answers from its bundled catalogue.
const API_URL = ((import.meta.env.VITE_API_URL as string | undefined) || (import.meta.env.DEV ? 'http://localhost:8787' : ''))
  .replace(/\/+$/, '')

const noApi = (): Promise<Response> => Promise.reject(new Error('no API configured'))

// The browser calls the API over HTTP. The server render calls it over the service binding when there is one: no network
// hop, no CORS, and not counted against any visitor's rate limit.
const send = createIsomorphicFn()
  .client((path: string) => (API_URL ? fetch(API_URL + path, { headers: { Accept: 'application/json' } }) : noApi()))
  .server(async (path: string) => {
    const { env } = await import('cloudflare:workers')
    if (env.API) return env.API.fetch(new URL(path, 'http://api'))
    return API_URL ? fetch(API_URL + path) : noApi()
  })

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message)
  }
}

type Params = Record<string, string | number | undefined>

/** The API could not be reached at all: not running, or no network. */
const UNREACHABLE = 'unreachable'
const UNREACHABLE_MESSAGE = "Couldn't reach the wobli API."
const unreachable = () => new ApiError(0, UNREACHABLE, UNREACHABLE_MESSAGE)

/** How long a request may take before the API counts as unreachable, so a hung backend can't hold up a page render. */
const TIMEOUT_MS = 4000
const withTimeout = <T,>(p: Promise<T>, ms: number) =>
  new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), ms)
    p.then(resolve, reject).finally(() => clearTimeout(timer))
  })

/** True for an error from an API that wasn't there. Matches on the message too: an error thrown during the server render
 * reaches the browser as a plain Error that keeps only its message. */
export const isUnreachable = (e: unknown) =>
  (e instanceof ApiError && e.code === UNREACHABLE) || (e instanceof Error && e.message === UNREACHABLE_MESSAGE)

/** GET a path of the API and parse the answer. Throws ApiError for any non-2xx, with the API's own code and message. */
export async function apiGet<T extends z.ZodType>(path: string, schema: T, params: Params = {}): Promise<z.output<T>> {
  const query = new URLSearchParams(Object.entries(params).flatMap(([k, v]) => (v === undefined || v === '' ? [] : [[k, String(v)]]))).toString()
  // The site must work without its backend, so anything short of a sound answer counts as "unreachable" and the callers
  // fall back to the bundled catalogue: no network, a hung API (timeout), any 5xx (a binding to a worker that isn't
  // running, Cloudflare failing to reach the host, the API itself crashing), or a body that isn't the expected JSON.
  // Only 4xx stays a real error (404 for a missing slug, 429 for rate limiting).
  const res = await withTimeout(send(query ? `${path}?${query}` : path), TIMEOUT_MS).catch(() => {
    throw unreachable()
  })
  if (res.status >= 500) throw unreachable()
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: { code?: string; message?: string } } | null
    throw new ApiError(res.status, body?.error?.code ?? 'http_error', body?.error?.message ?? `The API answered ${res.status}.`)
  }
  const parsed = schema.safeParse(await res.json().catch(() => undefined))
  if (!parsed.success) {
    // still served from the fallback, but said out loud: a mismatch here means the API and its contracts have drifted
    console.error(`wobli: ${path} answered something its schema does not accept`, parsed.error.issues.slice(0, 3))
    throw unreachable()
  }
  return parsed.data
}

/** apiGet, or `fallback`'s answer when the API isn't there. A 4xx is a real answer and still throws. */
export async function apiGetOr<T extends z.ZodType>(path: string, schema: T, params: Params, fallback: () => Promise<z.output<T>> | z.output<T>): Promise<z.output<T>> {
  try {
    return await apiGet(path, schema, params)
  } catch (e) {
    if (isUnreachable(e)) return fallback()
    throw e
  }
}

/**
 * POST JSON from the browser and parse the answer. Unlike apiGet there is no fallback: a failure is the caller's to show,
 * as `{ ok: false, message }` with the API's own message, or the field errors it sent back.
 */
export async function apiPost<T extends z.ZodType>(
  path: string,
  body: unknown,
  schema: T,
): Promise<{ ok: true; data: z.output<T> } | { ok: false; message: string; fields?: Record<string, string[]> }> {
  if (!API_URL) return { ok: false, message: UNREACHABLE_MESSAGE }
  try {
    const res = await withTimeout(fetch(API_URL + path, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(body) }), 15_000)
    const json = (await res.json().catch(() => null)) as { error?: { message?: string; details?: { fieldErrors?: Record<string, string[]> } } } | null
    if (!res.ok) return { ok: false, message: json?.error?.message ?? `The API answered ${res.status}.`, fields: json?.error?.details?.fieldErrors }
    const parsed = schema.safeParse(json)
    return parsed.success ? { ok: true, data: parsed.data } : { ok: false, message: 'Unexpected answer from the API.' }
  } catch {
    return { ok: false, message: UNREACHABLE_MESSAGE }
  }
}
