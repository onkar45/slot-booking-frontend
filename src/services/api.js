import axios from "axios";
import { getOrganization, isLocalhost } from "../utils/getOrganization";

/**
 * Build base URL:
 * - Dev (localhost): use VITE_API_URL env var (e.g. http://localhost:8000)
 * - Prod: use same hostname with API port so backend reads Host header for org
 *   e.g. frontend on tcs.cernsystem.com → API at https://tcs.cernsystem.com/api
 *   OR a dedicated API domain from VITE_API_URL
 */
function getBaseURL() {
  if (isLocalhost()) {
    return import.meta.env.VITE_API_URL || 'http://localhost:8000';
  }
  // Production: use configured API URL (e.g. https://api.cernsystem.com)
  return import.meta.env.VITE_API_URL || `${window.location.protocol}//${window.location.hostname}`;
}

const API = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // ✅ ALWAYS send org (fix)
  const orgSlug = getOrganization();
  if (orgSlug) {
    config.headers['X-Org-Slug'] = orgSlug;
  }

  if (config.url) {
    config.url = config.url.replace(/\/+$/, '');
  }

  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/') {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default API;
