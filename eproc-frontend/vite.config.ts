import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['lucide-react', 'clsx', 'tailwind-merge', '@radix-ui/react-dialog', '@radix-ui/react-slot', '@radix-ui/react-tabs', '@radix-ui/react-separator', '@radix-ui/react-progress', '@radix-ui/react-label', '@radix-ui/react-checkbox', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select', '@radix-ui/react-tooltip', '@radix-ui/react-avatar'],
          query: ['@tanstack/react-query'],
          charts: ['recharts'],
          maps: ['leaflet', 'react-leaflet', 'tz-geo-data'],
        },
      },
    },
  },
})
