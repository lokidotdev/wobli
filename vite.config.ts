import { cloudflare } from '@cloudflare/vite-plugin'
import tailwindcss from '@tailwindcss/vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import react from '@vitejs/plugin-react'
import compression from 'compression'
import { defineConfig, type Connect, type Plugin } from 'vite'
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

export default defineConfig({
  plugins: [
    cloudflare({ viteEnvironment: { name: 'ssr' } }),
    tsconfigPaths(),
    tailwindcss(),
    tanstackStart(),
    react(),
    previewCompression(),
  ],
})
