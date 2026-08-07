import api from '../api/axios';
import type { InventoryMovementRequest, InventoryMovementResponse, LowStockProduct } from '../types/inventory';

export const inventoryService = {
  createMovement: async (data: InventoryMovementRequest): Promise<InventoryMovementResponse> => {
    const res = await api.post<InventoryMovementResponse>('/inventory/movements', data);
    return res.data;
  },

  getHistory: async (productId?: number): Promise<InventoryMovementResponse[]> => {
    const url = productId ? `/inventory/movements?productId=${productId}` : '/inventory/movements';
    const res = await api.get<InventoryMovementResponse[]>(url);
    return res.data;
  },

  getAlerts: async (): Promise<LowStockProduct[]> => {
    const res = await api.get<LowStockProduct[]>('/inventory/alerts');
    return res.data;
  }
};