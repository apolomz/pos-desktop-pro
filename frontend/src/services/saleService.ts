import api from '../api/axios';
import type { SaleInvoiceData } from '../components/InvoiceDetailModal';

export const PAYMENT_METHODS = {
  CASH: 'CASH',
  CARD: 'CARD',
  TRANSFER: 'TRANSFER',
} as const;

export type PaymentMethod =
  (typeof PAYMENT_METHODS)[keyof typeof PAYMENT_METHODS];

export interface SaleItemRequest {
  productId: number;
  quantity: number;
}

export interface SaleRequest {
  items: SaleItemRequest[];
  paymentMethod: PaymentMethod;
  customerId?: number;
}

export const createSale = async (saleData: SaleRequest) => {
  const response = await api.post('/sales', saleData);
  return response.data;
};

export const saleService = {
  getAll: async (): Promise<SaleInvoiceData[]> => {
    const response = await api.get<SaleInvoiceData[]>('/sales');
    return response.data;
  },

  getById: async (id: number): Promise<SaleInvoiceData> => {
    const response = await api.get<SaleInvoiceData>(`/sales/${id}`);
    return response.data;
  },
};