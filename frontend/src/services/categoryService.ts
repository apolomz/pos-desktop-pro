import api from '../api/axios';
import type { Category, CategoryRequest } from '../types/category';

export const categoryService = {
  getAll: async (): Promise<Category[]> => {
    const res = await api.get<Category[]>('/categories');
    return res.data;
  },
  create: async (data: CategoryRequest): Promise<Category> => {
    const res = await api.post<Category>('/categories', data);
    return res.data;
  },
  update: async (id: number, data: CategoryRequest): Promise<Category> => {
    const res = await api.put<Category>(`/categories/${id}`, data);
    return res.data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/categories/${id}`);
  }
};