import axios from 'axios';

let csrfToken: string | null = null;

const axiosInstance = axios.create({
  baseURL: typeof window !== 'undefined' ? '/api' : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'),
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for CORS if using cookies
});

// دالة لجلب CSRF Token مرة واحدة وتخزينه
export const fetchCsrfToken = async () => {
  if (!csrfToken && typeof window !== 'undefined') {
    try {
      const response = await axiosInstance.get('/csrf-token');
      csrfToken = response.data.csrfToken;
      axiosInstance.defaults.headers['CSRF-Token'] = csrfToken; // Header name used by csurf
    } catch (error) {
      console.error('Failed to fetch CSRF token:', error);
    }
  }
};

// Request interceptor (no longer needs to set Authorization token manually, cookies will be used)
axiosInstance.interceptors.request.use(
  async (config) => {
    // Only fetch for non-GET requests if not yet fetched
    if (config.method !== 'get' && !csrfToken && typeof window !== 'undefined') {
      await fetchCsrfToken();
      if (csrfToken) {
        config.headers['CSRF-Token'] = csrfToken;
      }
    } else if (csrfToken) {
      config.headers['CSRF-Token'] = csrfToken;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle global errors like 401 Unauthorized
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear local storage and redirect to login if token is invalid
      // Skip this if the request itself was a login request or if already on login page
      const isAuthRequest = error.config && error.config.url && (error.config.url.includes('/auth/login') || error.config.url.includes('/auth/register'));
      if (typeof window !== 'undefined' && !isAuthRequest && window.location.pathname !== '/login') {
        localStorage.removeItem('auth-storage');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
