import apiClient from '../client';
import { User } from './authService';

const adminService = {
  getPendingUsers: async () => {
    const response = await apiClient.get('/admin/pending-users');
    return response.data;
  },

  approveUser: async (userId: string) => {
    const response = await apiClient.put(`/admin/approve/${userId}`);
    return response.data;
  },

  rejectUser: async (userId: string) => {
    const response = await apiClient.put(`/admin/reject/${userId}`);
    return response.data;
  },

  getAllUsers: async (params?: { role?: string; search?: string; page?: number; limit?: number }) => {
    const response = await apiClient.get('/admin/users', { params });
    return response.data;
  },

  getAllOrders: async (params?: { status?: string; page?: number; limit?: number }) => {
    const response = await apiClient.get('/admin/orders', { params });
    return response.data;
  },

  getStats: async () => {
    const response = await apiClient.get('/admin/stats');
    return response.data;
  },

  deactivateUser: async (userId: string) => {
    const response = await apiClient.delete(`/admin/users/${userId}`);
    return response.data;
  },
};

export default adminService;
