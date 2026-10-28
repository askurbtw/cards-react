import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@shared': fileURLToPath(new URL('./shared', import.meta.url)),
    },
  },
  server: {
    proxy: { '/routes': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }, },
  },
  test: {
    environment: 'node',
    globals: true,                  
    include: ['tests/**/*.test.ts'],
  },
  
})
