import api from '../api/axios';
import type { Customer, CustomerRequest } from '../types/customer';

export const customerService = {
  getAll: async (search = '') => {
    const response = await api.get<{ content: Customer[] }>(`/customers?search=${encodeURIComponent(search)}`);
    return response.data.content;
  },
  getById: async (id: number) => {
    const response = await api.get<Customer>(`/customers/${id}`);
    return response.data;
  },
  create: async (data: CustomerRequest) => {
    const response = await api.post<Customer>('/customers', data);
    return response.data;
  },
  update: async (id: number, data: CustomerRequest) => {
    const response = await api.put<Customer>(`/customers/${id}`, data);
    return response.data;
  },
  toggleStatus: async (id: number) => {
    await api.patch(`/customers/${id}/toggle-status`);
  }
};