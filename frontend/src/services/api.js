import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
});

// Interceptor: prima di far partire ogni richiesta, controlla se c'è un token e lo aggiunge
api.interceptors.request.use(
  (request) => {
    const token = localStorage.getItem('token'); // token salvato
    if (token) {
      request.headers.Authorization = `Bearer ${token}`;
    }
    return request;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;