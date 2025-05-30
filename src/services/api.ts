// src/services/api.ts
import axios from 'axios';
import urlBackendServer from './urlBackendServer';

const apiClient = axios.create({
  baseURL: urlBackendServer, // Sesuaikan dengan URL backend Anda
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor untuk menambahkan token JWT ke header
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;