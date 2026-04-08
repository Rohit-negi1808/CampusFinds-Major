import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    
    /**
     * DEVELOPMENT PROXY CONFIGURATION
     * ================================
     * 
     * In development (npm run dev), this proxy routes API requests to the 
     * local backend server, bypassing the need for CORS headers.
     * 
     * HOW IT WORKS:
     * - Any request to /api/* gets forwarded to http://localhost:5000/api/*
     * - Any request to /uploads/* gets forwarded to http://localhost:5000/uploads/*
     * - Frontend code can use relative URLs: fetch('/api/items')
     * 
     * IMPORTANT:
     * - This proxy ONLY works in development (npm run dev)
     * - Production (Vercel) does NOT use vite.config.js proxy
     * - In production, use VITE_API_URL environment variable instead
     * - Never commit production URLs here
     * 
     * PRODUCTION BEHAVIOR:
     * - Built app has no Vite proxy
     * - Must use: fetch(`${import.meta.env.VITE_API_URL}/api/...`)
     * - OR use axios with baseURL set to VITE_API_URL
     * - Backend CORS headers must allow frontend origin
     */
    proxy: {
      '/api': {
        // Local backend server (must be running for dev to work)
        target: 'http://localhost:5000',
        changeOrigin: true,
        // No path rewriting: /api/items stays /api/items
      },
      '/uploads': {
        // Static file uploads from backend
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  }
})

