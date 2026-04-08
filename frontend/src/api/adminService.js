import axios from 'axios';

/**
 * ADMIN SERVICE - API Calls for Admin Dashboard
 * ==============================================
 * 
 * Central module for all admin-related API requests. Uses environment variable
 * VITE_API_URL to dynamically construct API endpoints.
 * 
 * ENVIRONMENT VARIABLES:
 * - VITE_API_URL: Backend base URL
 *   Dev: http://localhost:5000
 *   Prod: https://campusfinds-major.onrender.com (set in Vercel)
 * 
 * PATTERN:
 * - baseURL = `${VITE_API_URL}/api` (local dev) or `/api` (fallback)
 * - All requests automatically prepended with this baseURL
 * - JWT token automatically added to Authorization header
 * 
 * CORS COMPATIBILITY:
 * - Local: Vite proxy handles CORS transparently
 * - Production: CORS headers from backend allow frontend origin
 * - No hardcoded URLs - all dynamic via import.meta.env
 */
const BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api';
const ax = axios.create({ baseURL: BASE });

/**
 * REQUEST INTERCEPTOR - Attach JWT Token
 * Ensures every request includes the authentication token from localStorage
 */
ax.interceptors.request.use(c => {
  const t = localStorage.getItem('cf-token');
  if (t) c.headers.Authorization = `Bearer ${t}`;
  return c;
});

// ============================================================================
// LOST ITEMS ENDPOINTS
// ============================================================================

export const getLostItems  = () => ax.get('/lost-items').then(r => r.data);
export const createLostItem = (d) => ax.post('/lost-items', d).then(r => r.data);
export const updateLostItem = (id, d) => ax.put(`/lost-items/${id}`, d).then(r => r.data);
export const deleteLostItem = (id) => ax.delete(`/lost-items/${id}`).then(r => r.data);

// ============================================================================
// FOUND ITEMS ENDPOINTS
// ============================================================================

export const getFoundItems  = () => ax.get('/found-items').then(r => r.data);
export const updateFoundItem = (id, d) => ax.put(`/found-items/${id}`, d).then(r => r.data);
export const deleteFoundItem = (id) => ax.delete(`/found-items/${id}`).then(r => r.data);

// ============================================================================
// CLAIMS ENDPOINTS
// ============================================================================

export const getClaims    = () => ax.get('/claims').then(r => r.data);
export const updateClaim  = (id, d) => ax.put(`/claims/${id}`, d).then(r => r.data);

// ============================================================================
// USERS ENDPOINTS
// ============================================================================

export const getUsers        = () => ax.get('/users').then(r => r.data);
export const updateUserStatus = (id, status) => ax.put(`/users/status/${id}`, { status }).then(r => r.data);
export const deleteUser      = (id) => ax.delete(`/users/${id}`).then(r => r.data);

// ============================================================================
// FEEDBACK/CONTACT ENDPOINTS
// ============================================================================

export const getFeedback = () => ax.get('/contact').then(r => r.data);
