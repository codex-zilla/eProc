import axiosInstance from '../lib/axios';
import type { Material } from '../types/models';

export const materialService = {
  getAllMaterials: async (): Promise<Material[]> => {
    const response = await axiosInstance.get('/materials');
    return response.data;
  },

  searchMaterials: async (query: string): Promise<Material[]> => {
    const response = await axiosInstance.get(`/materials/search?q=${encodeURIComponent(query)}`);
    return response.data;
  }
};
