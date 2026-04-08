import axios from 'axios'

// Environment variable: VITE_API_URL from .env or Vercel environment
// Falls back to '/api' for local development with Vite proxy
// Usage: Set VITE_API_URL in .env.local or Vercel deployment settings
const baseURL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api'

const api = axios.create({ baseURL })
api.interceptors.request.use(config => {
  const token = localStorage.getItem('cf-token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})
export default api
