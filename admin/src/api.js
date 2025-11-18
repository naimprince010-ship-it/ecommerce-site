import axios from 'axios';

// Base URL from environment or fallback to Render API
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'https://ecommerce-site-c57v.onrender.com';

// Axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
});

// Automatically attach JWT token for every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Helper to set or clear auth token
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    localStorage.removeItem('token');
    delete api.defaults.headers.common.Authorization;
  }
};
