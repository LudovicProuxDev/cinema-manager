/// <reference types="vitest/config" />
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
  // https://vitest.dev/config/
  test: {
    environment: 'jsdom',
    // A time zone other than UTC, to check the conversions between local times and the UTC times of the API
    env: { TZ: 'Europe/Paris' },
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      // A summary in the console, and a detailed report to browse in coverage/index.html
      reporter: ['text', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/main.tsx', 'src/test/**'],
    },
  },
})
