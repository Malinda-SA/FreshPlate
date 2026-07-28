// App configuration constants
import { Platform } from 'react-native';

// API base URL - change this to your backend URL
const getApiUrl = () => {
  if (__DEV__) {
    // For Web or local PC environments
    return 'http://localhost:5000/api';
  }
  // Production URL (update when deployed)
  return 'http://localhost:5000/api';
};

export const Config = {
  API_URL: getApiUrl(),
  APP_NAME: 'FreshPlate',
  APP_VERSION: '1.0.0',
  
  // Token storage key
  TOKEN_KEY: 'freshplate_token',
  USER_KEY: 'freshplate_user',
  
  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  
  // Image placeholders
  DEFAULT_FOOD_IMAGE: 'https://via.placeholder.com/300x200?text=Food',
  DEFAULT_AVATAR: 'https://via.placeholder.com/150x150?text=User',
  
  // Order statuses with labels
  ORDER_STATUSES: {
    pending: 'Pending',
    confirmed: 'Confirmed',
    preparing: 'Preparing',
    ready: 'Ready for Pickup',
    picked_up: 'On the Way',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  } as Record<string, string>,
  
  // Food categories
  FOOD_CATEGORIES: [
    'Sri Lankan',
    'Indian',
    'Chinese',
    'Western',
    'Italian',
    'Japanese',
    'Thai',
    'Mexican',
    'Desserts',
    'Beverages',
    'Other',
  ],
  
  // Spice levels
  SPICE_LEVELS: [
    { value: 'mild', label: 'Mild 🌶️' },
    { value: 'medium', label: 'Medium 🌶️🌶️' },
    { value: 'hot', label: 'Hot 🌶️🌶️🌶️' },
    { value: 'extra-hot', label: 'Extra Hot 🌶️🌶️🌶️🌶️' },
  ],
  
  // User roles
  ROLES: {
    CUSTOMER: 'customer',
    COOK: 'cook',
    DRIVER: 'driver',
    ADMIN: 'admin',
  },
};

export default Config;
