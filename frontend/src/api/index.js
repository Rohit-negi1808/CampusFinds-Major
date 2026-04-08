import axios from 'axios'

/**
 * AXIOS INSTANCE - Central API Client
 * ===================================
 * 
 * This is the main HTTP client used across the frontend for all API requests.
 * It automatically includes JWT tokens in headers and uses the VITE_API_URL
 * environment variable to route requests to the correct backend server.
 * 
 * ENVIRONMENT VARIABLES:
 * - VITE_API_URL: Backend API base URL (e.g., https://campusfinds-major.onrender.com)
 *   Set in Vercel Project Settings > Environment Variables for production
 *   Set in .env or .env.local for local development
 * 
 * FALLBACK BEHAVIOR:
 * - If VITE_API_URL is provided: Uses ${VITE_API_URL}/api as base URL
 * - If undefined: Falls back to '/api' (Vite proxy in dev; error in prod)
 * 
 * CORS HANDLING:
 * - Local dev: Vite proxy (vite.config.js) routes /api → http://localhost:5000/api
 * - Production: VITE_API_URL prepended to create full URLs (no proxy)
 * - Backend must have CORS headers allowing the frontend origin
 */
const baseURL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api'

const api = axios.create({ baseURL })

/**
 * REQUEST INTERCEPTOR - Add JWT Authentication
 * Automatically includes the JWT token from localStorage in all API requests.
 * This enables secure communication with the backend without manual header management.
 */
api.interceptors.request.use(config => {
  const token = localStorage.getItem('cf-token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default api
