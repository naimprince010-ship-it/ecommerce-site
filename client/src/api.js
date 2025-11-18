import axios from 'axios';

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'https://ecommerce-site-c57v.onrender.com';

export const api = axios.create({
  baseURL: API_BASE_URL,
});
