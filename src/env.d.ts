// The Worker's bindings (wrangler.jsonc), as far as this app uses them.
declare module 'cloudflare:workers' {
  export const env: {
    /** The API Worker. Absent when the site runs without the binding; requests then go over HTTP. */
    API?: { fetch(input: string | URL, init?: RequestInit): Promise<Response> }
  }
}

/** Set per build in vite.config.ts. */
declare const __BUILD_ID__: string
