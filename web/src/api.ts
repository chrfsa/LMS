import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const api = axios.create({
  baseURL: API_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log(`[API] 🔐 Sending request to ${config.method?.toUpperCase()} ${config.url} with JWT`);
    console.log(`[API] 🔑 Token: ${token.substring(0, 20)}...`);
  } else {
    console.log(`[API] 📤 Sending request to ${config.method?.toUpperCase()} ${config.url} (no auth)`);
  }
  return config;
});

// Log errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('[API]', error.response?.status, error.response?.data || error.message);
    return Promise.reject(error);
  }
);
