import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const auth = {
  register: (username, password, email) => api.post('/auth/register', { username, password, email }),
  login: (username, password) => api.post('/auth/login', { username, password }),
};

export const artists = {
  search: (query) => api.get('/artists/search', { params: { q: query } }),
};

export const lineups = {
  getAll: () => api.get('/lineups'),
  getOne: (id) => api.get(`/lineups/${id}`),
  create: (data) => api.post('/lineups', data),
  update: (id, data) => api.put(`/lineups/${id}`, data),
  delete: (id) => api.delete(`/lineups/${id}`),
};

export const stats = {
  leaderboard: (limit = 50, offset = 0) => api.get('/stats/leaderboard', { params: { limit, offset } }),
  artist: (name) => api.get(`/stats/artist/${encodeURIComponent(name)}`),
  browse: (limit = 20, offset = 0, sort = 'recent') => api.get('/stats/browse', { params: { limit, offset, sort } }),
  searchArtists: (q) => api.get('/stats/search-artists', { params: { q } }),
  site: () => api.get('/stats/site'),
};

export default api;
