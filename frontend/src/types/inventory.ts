export type MovementType = 'ENTRY' | 'EXIT' | 'ADJUSTMENT' | 'SALE' | 'RETURN';

export interface InventoryMovementRequest {
  productId: number;
  type: MovementType;
  quantity: number;
  reason?: string;
}

export interface InventoryMovementResponse {
  id: number;
  productId: number;
  productName: string;
  type: MovementType;
  quantity: number;
  previousStock: number;
  newStock: number;
  reason?: string;
  createdAt: string;
}

export interface LowStockProduct {
  id: number;
  name: string;
  stock: number;
  minStock: number;
  price: number;
}