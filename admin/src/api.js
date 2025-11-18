import axios from 'axios';

// Resolve base URL from environment or fall back to the deployed Render API.
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'https://ecommerce-site-c57v.onrender.com';

export const api = axios.create({
  baseURL: API_BASE_URL,
});

// Attach JWT tokens to every request using the Authorization header.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Helper to set or clear the auth token for future requests and storage.
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    localStorage.removeItem('token');
    delete api.defaults.headers.common.Authorization;
  }
};
