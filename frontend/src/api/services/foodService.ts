import apiClient from '../client';

export interface Food {
  _id: string;
  cook: {
    _id: string;
    name: string;
    kitchenName: string;
    address: any;
    profileImage: string;
  };
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  isAvailable: boolean;
  preparationTime: number;
  rating: number;
  totalRatings: number;
  ingredients: string[];
  isVegetarian: boolean;
  isVegan: boolean;
  spiceLevel: string;
  createdAt: string;
}

export interface FoodFilters {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  isVegetarian?: boolean;
  isVegan?: boolean;
  spiceLevel?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
}

export interface CreateFoodData {
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  preparationTime: number;
  ingredients?: string[];
  isVegetarian?: boolean;
  isVegan?: boolean;
  spiceLevel?: string;
}

const foodService = {
  getFoods: async (filters?: FoodFilters) => {
    const response = await apiClient.get('/foods', { params: filters });
    return response.data;
  },

  getFood: async (id: string) => {
    const response = await apiClient.get(`/foods/${id}`);
    return response.data;
  },

  getMyFoods: async () => {
    const response = await apiClient.get('/foods/list/my-foods');
    return response.data;
  },

  createFood: async (data: CreateFoodData) => {
    const response = await apiClient.post('/foods', data);
    return response.data;
  },

  updateFood: async (id: string, data: Partial<CreateFoodData & { isAvailable: boolean }>) => {
    const response = await apiClient.put(`/foods/${id}`, data);
    return response.data;
  },

  deleteFood: async (id: string) => {
    const response = await apiClient.delete(`/foods/${id}`);
    return response.data;
  },
};

export default foodService;
