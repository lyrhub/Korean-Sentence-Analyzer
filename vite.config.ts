import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  base: '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    include: ['parse', 'events'],
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    allowedHosts: ['.e2b.app', '.e2b.dev', 'localhost'],
    hmr: {
      protocol: 'wss',
      clientPort: 443,
    },
    watch: {
      usePolling: true,
      interval: 300,
    },
    proxy: {
      '/parse': {
        target: 'http://localhost:1337',
        changeOrigin: true,
        ws: true,
      },
    },
  },
})
