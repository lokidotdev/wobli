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

/** True for an error from an API that wasn't there. Matches on the message too: an error thrown during the server render
 * reaches the browser as a plain Error that keeps only its message. */
export const isUnreachable = (e: unknown) =>
  (e instanceof ApiError && e.code === UNREACHABLE) || (e instanceof Error && e.message === UNREACHABLE_MESSAGE)

/** GET a path of the API and parse the answer. Throws ApiError for any non-2xx, with the API's own code and message. */
export async function apiGet<T extends z.ZodType>(path: string, schema: T, params: Params = {}): Promise<z.output<T>> {
  const query = new URLSearchParams(Object.entries(params).flatMap(([k, v]) => (v === undefined || v === '' ? [] : [[k, String(v)]]))).toString()
  const res = await send(query ? `${path}?${query}` : path).catch(() => {
    throw unreachable()
  })
  // a service binding to a worker that isn't running answers 503 without the API's JSON error shape
  if (res.status === 503 && !res.headers.get('content-type')?.includes('application/json')) throw unreachable()
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: { code?: string; message?: string } } | null
    throw new ApiError(res.status, body?.error?.code ?? 'http_error', body?.error?.message ?? `The API answered ${res.status}.`)
  }
  return schema.parse(await res.json())
}
