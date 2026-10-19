import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // In dev, forward /api/* to the .NET backend (same routing as nginx in production)
    proxy: {
      '/api': {
        target: process.env.API_URL ?? 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        // Same X-Forwarded-* headers as nginx, so the API builds its URLs with the client's host and /api prefix
        xfwd: true,
        headers: { 'X-Forwarded-Prefix': '/api' },
      },
    },
  },
})
