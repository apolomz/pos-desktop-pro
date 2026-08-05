import api from '../api/axios';

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