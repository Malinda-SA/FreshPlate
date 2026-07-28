import apiClient from '../client';

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: 'customer' | 'cook' | 'driver';
  address?: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  kitchenName?: string;
  specialties?: string[];
  vehicleType?: string;
  vehicleNumber?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'cook' | 'driver' | 'admin';
  isApproved: boolean;
  isActive: boolean;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    coordinates: { lat: number; lng: number };
  };
  profileImage: string;
  kitchenName: string;
  specialties: string[];
  vehicleType: string;
  vehicleNumber: string;
  isAvailable: boolean;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

const authService = {
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/login', data);
    return response.data;
  },

  getMe: async (): Promise<{ success: boolean; data: { user: User } }> => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  updateProfile: async (data: Partial<User>): Promise<{ success: boolean; data: { user: User } }> => {
    const response = await apiClient.put('/auth/profile', data);
    return response.data;
  },
};

export default authService;
