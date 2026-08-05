import type { Category } from './category';

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
  minStock: number;
  isActive: boolean;
  imageUrl?: string;
  category: Category;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductRequest {
  name: string;
  description?: string;
  price: number;
  stock: number;
  minStock: number;
  isActive?: boolean;
  imageUrl?: string;
  categoryId: number;
}