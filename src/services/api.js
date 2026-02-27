import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Remove trailing slashes from URLs and add request logging
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Ensure clean URL without trailing slash
  if (config.url) {
    config.url = config.url.replace(/\/+$/, ''); // Remove all trailing slashes
    console.log('🌐 API Request:', config.method?.toUpperCase(), config.baseURL + config.url);
  }

  return config;
});

// Add response interceptor for debugging
API.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error.response?.status, error.config?.url, error.message);
    return Promise.reject(error);
  }
);

export default API;