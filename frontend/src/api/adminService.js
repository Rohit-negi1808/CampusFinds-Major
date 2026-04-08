import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api';
const ax = axios.create({ baseURL: BASE });
ax.interceptors.request.use(c => {
  const t = localStorage.getItem('cf-token');
  if (t) c.headers.Authorization = `Bearer ${t}`;
  return c;
});

export const getLostItems  = () => ax.get('/lost-items').then(r => r.data);
export const createLostItem = (d) => ax.post('/lost-items', d).then(r => r.data);
export const updateLostItem = (id, d) => ax.put(`/lost-items/${id}`, d).then(r => r.data);
export const deleteLostItem = (id) => ax.delete(`/lost-items/${id}`).then(r => r.data);

export const getFoundItems  = () => ax.get('/found-items').then(r => r.data);
export const updateFoundItem = (id, d) => ax.put(`/found-items/${id}`, d).then(r => r.data);
export const deleteFoundItem = (id) => ax.delete(`/found-items/${id}`).then(r => r.data);

export const getClaims    = () => ax.get('/claims').then(r => r.data);
export const updateClaim  = (id, d) => ax.put(`/claims/${id}`, d).then(r => r.data);

export const getUsers        = () => ax.get('/users').then(r => r.data);
export const updateUserStatus = (id, status) => ax.put(`/users/status/${id}`, { status }).then(r => r.data);
export const deleteUser      = (id) => ax.delete(`/users/${id}`).then(r => r.data);

export const getFeedback = () => ax.get('/contact').then(r => r.data);
