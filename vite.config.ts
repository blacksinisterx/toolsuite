import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  worker: { format: 'es' },
  optimizeDeps: {
    // @ffmpeg/ffmpeg constructs its worker as
    // `new Worker(new URL("./worker.js", import.meta.url))` -- Vite's dev
    // dep pre-bundling rewrites that import.meta.url base in a way that
    // breaks the worker's own relative URL resolution (confirmed live: the
    // worker script request 404s/ERR_FAILEDs and every ffmpeg call hangs
    // forever with zero errors surfaced to the app). Excluding it serves
    // the real, unbundled package so its own relative worker path resolves
    // correctly.
    exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util'],
  },
})
