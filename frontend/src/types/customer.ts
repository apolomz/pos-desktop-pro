export interface Customer {
  id: number;
  name: string;
  documentNumber?: string;
  phone?: string;
  email?: string;
  isActive: boolean;
  totalSpent?: number;
  totalSales?: number;
  createdAt?: string;
}

export interface CustomerRequest {
  name: string;
  documentNumber?: string;
  phone?: string;
  email?: string;
}