import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
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
        // Forward LiveQuery WebSocket upgrades (Parse.liveQueryServerURL =
        // wss://<host>/parse) to the Parse LiveQuery server on :1337.
        ws: true,
      },
    },
  },
})
