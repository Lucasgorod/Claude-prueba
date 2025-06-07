import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: '0.0.0.0',
    strictPort: false,
    allowedHosts: ['aea9c984-9871-4576-b46d-d1c0f2ddb55f-00-2lu5hfj0t6t28.spock.replit.dev'],
    hmr: false,
  },
  build: {
    outDir: 'dist',
  },
})