import axios from 'axios';

const API = axios.create({
  baseURL: 'https://nivesh-nidhi.onrender.com/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request if available
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('nn_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth endpoints
export const signupUser = (data) => API.post('/auth/signup', data);
export const loginUser  = (data) => API.post('/auth/login',  data);
export const getProfile = ()     => API.get('/auth/profile');

export default API;
