import { cloudflare } from '@cloudflare/vite-plugin'
import tailwindcss from '@tailwindcss/vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import react from '@vitejs/plugin-react'
import compression from 'compression'
import { defineConfig, loadEnv, type Connect, type Plugin } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

// `vite preview` sends every file uncompressed, while Cloudflare compresses them in production. Compressing here too makes a
// local Lighthouse run measure the sizes visitors actually download.
const previewCompression = (): Plugin => ({
  name: 'preview-compression',
  enforce: 'pre', // ahead of the Cloudflare plugin, whose middleware answers every request
  configurePreviewServer(server) {
    server.middlewares.use(compression() as Connect.NextHandleFunction)
  },
})

// Production settings come from the host's build variables, never from this repo, so a local run is always dev.
// API_WORKER names the API Worker (../backend) to bind as `API` for server-side requests, e.g. API_WORKER=wobli-api.
// Unset (local dev, forks, a plain deploy) means no binding: the site calls VITE_API_URL if set, else runs on its
// bundled catalogue. Cloudflare refuses to deploy a binding to a Worker that doesn't exist yet, so deploy the API first.
// Read like Vite reads VITE_* (host variables, then .env.production etc.; see .env.example).
export default defineConfig(({ command, mode }) => {
  const apiWorker = loadEnv(mode, process.cwd(), '').API_WORKER?.trim()
  return {
  // a new id per build, so the ISR cache (src/server.ts) never serves a page from an earlier deploy
  define: { __BUILD_ID__: JSON.stringify(Date.now().toString(36)) },
  plugins: [
    cloudflare({
      viteEnvironment: { name: 'ssr' },
      config: command === 'build' && apiWorker ? { services: [{ binding: 'API', service: apiWorker }] } : {},
    }),
    tsconfigPaths(),
    tailwindcss(),
    tanstackStart(),
    react(),
    previewCompression(),
  ],
  }
})
