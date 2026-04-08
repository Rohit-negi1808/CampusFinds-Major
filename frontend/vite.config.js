import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    // Local development proxy configuration
    // Routes /api and /uploads requests to localhost:5000
    // This allows fetch('/api/...') to work in development without CORS issues
    // In production (Vercel), use VITE_API_URL environment variable instead
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  }
})
