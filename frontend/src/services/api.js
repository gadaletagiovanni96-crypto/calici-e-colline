import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5001/api', 
});

// Interceptor: prima di far partire ogni richiesta, controlla se c'è un token e lo aggiunge
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // token salvato
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;