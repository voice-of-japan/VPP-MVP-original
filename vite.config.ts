import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      // Only HTTP /api/* is proxied to the Worker. The WebSocket (/api/ws)
      // connects directly to the Worker in dev (see resolveWsUrl in
      // useRallyConnection) — Vite's WS proxy is fragile and crashes on the
      // client socket churn React StrictMode produces.
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('error', () => {
            /* swallow proxy errors so the dev server stays up */
          })
        },
      },
    },
  },
})
