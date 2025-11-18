import axios from 'axios';

// API base URL (environment → fallback → default)
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'https://ecommerce-site-c57v.onrender.com';

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
});

// Attach JWT token automatically to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Helper to set or clear token globally
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    localStorage.removeItem('token');
    delete api.defaults.headers.common.Authorization;
  }
};
