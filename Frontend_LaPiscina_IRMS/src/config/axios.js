// FILE: src/config/axios.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // Dito niya kukunin yung nasa .env mo
  withCredentials: true // Importante para sa cookies/sessions
});

export default api;