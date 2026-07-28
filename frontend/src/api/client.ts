import axios from 'axios';
import { getItemAsync, deleteItemAsync } from '../utils/storage';
import { Config } from '../constants/config';

// Create Axios instance
const apiClient = axios.create({
  baseURL: Config.API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - attach auth token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await getItemAsync(Config.TOKEN_KEY);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.log('Error reading token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      if (status === 401) {
        // Token expired or invalid - clear stored token
        deleteItemAsync(Config.TOKEN_KEY).catch(() => {});
        deleteItemAsync(Config.USER_KEY).catch(() => {});
      }

      return Promise.reject({
        status,
        message: data?.message || 'An error occurred',
        errors: data?.errors || [],
      });
    } else if (error.request) {
      // Network error
      return Promise.reject({
        status: 0,
        message: 'Network error. Please check your connection.',
        errors: [],
      });
    }

    return Promise.reject({
      status: 0,
      message: error.message || 'An unexpected error occurred',
      errors: [],
    });
  }
);

export default apiClient;
