import api from '../api/axios';

export interface Expense {
  id: number;
  shiftId: number;
  category: 'PAYROLL' | 'RAW_MATERIAL' | 'OTHER';
  amount: number;
  description: string;
  registeredBy: string;
  createdAt: string;
}

export const expenseService = {
  createExpense: async (expense: { category: string; amount: number; description: string }): Promise<Expense> => {
    const response = await api.post<Expense>('/expenses', expense);
    return response.data;
  },

  getCurrentExpenses: async (): Promise<Expense[]> => {
    const response = await api.get<Expense[]>('/expenses/current');
    return response.data;
  },

  getAllExpenses: async (): Promise<Expense[]> => {
    const response = await api.get<Expense[]>('/expenses');
    return response.data;
  },
};
