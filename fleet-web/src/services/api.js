import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
});

let authToken = null;

export const setToken = (token) => { authToken = token; };

api.interceptors.request.use((config) => {
  let token = authToken;
  if (!token) {
    try {
      token = localStorage.getItem('token');
    } catch {
      token = null;
    }
  }
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
