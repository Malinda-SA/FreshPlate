import apiClient from '../client';

export interface OrderItem {
  food: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  _id: string;
  orderNumber: string;
  customer: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    address?: any;
  };
  cook: {
    _id: string;
    name: string;
    kitchenName: string;
    phone: string;
    address?: any;
  };
  driver: {
    _id: string;
    name: string;
    phone: string;
    vehicleType: string;
    vehicleNumber: string;
  } | null;
  items: OrderItem[];
  totalAmount: number;
  deliveryFee: number;
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    zip: string;
    coordinates: { lat: number; lng: number };
  };
  pickupAddress: any;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  specialInstructions: string;
  estimatedDeliveryTime: string | null;
  actualDeliveryTime: string | null;
  cancelReason: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateOrderData {
  items: { food: string; quantity: number }[];
  deliveryAddress?: {
    street: string;
    city: string;
    state?: string;
    zip?: string;
  };
  paymentMethod?: string;
  specialInstructions?: string;
}

const orderService = {
  createOrder: async (data: CreateOrderData) => {
    const response = await apiClient.post('/orders', data);
    return response.data;
  },

  getOrders: async (params?: { status?: string; page?: number; limit?: number }) => {
    const response = await apiClient.get('/orders', { params });
    return response.data;
  },

  getAvailableOrders: async () => {
    const response = await apiClient.get('/orders/available');
    return response.data;
  },

  getOrder: async (id: string) => {
    const response = await apiClient.get(`/orders/${id}`);
    return response.data;
  },

  updateOrderStatus: async (id: string, status: string, cancelReason?: string) => {
    const response = await apiClient.put(`/orders/${id}/status`, { status, cancelReason });
    return response.data;
  },

  assignDriver: async (id: string, driverId?: string) => {
    const response = await apiClient.put(`/orders/${id}/assign-driver`, { driverId });
    return response.data;
  },
};

export default orderService;
