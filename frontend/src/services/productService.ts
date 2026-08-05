import api from '../api/axios';
import type { Product, ProductRequest } from '../types/Product';

export const productService = {
  getProducts: async (search?: string, activeOnly?: boolean): Promise<Product[]> => {
    const params: Record<string, any> = {};
    if (search) params.search = search;
    if (activeOnly !== undefined) params.activeOnly = activeOnly;

    const res = await api.get<Product[]>('/products', { params });
    return res.data;
  },
  create: async (data: ProductRequest): Promise<Product> => {
    const res = await api.post<Product>('/products', data);
    return res.data;
  },
  update: async (id: number, data: ProductRequest): Promise<Product> => {
    const res = await api.put<Product>(`/products/${id}`, data);
    return res.data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/products/${id}`);
  },
  toggleStatus: async (id: number): Promise<Product> => {
    const res = await api.patch<Product>(`/products/${id}/toggle-status`);
    return res.data;
  }
};