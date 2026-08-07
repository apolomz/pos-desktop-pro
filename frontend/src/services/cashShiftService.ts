import api from '../api/axios';

export interface CashShift {
  id: number;
  userId: number;
  username: string;
  userFullName: string;
  openedAt: string;
  closedAt?: string;
  initialBase: number;
  cashSalesTotal: number;
  totalExpenses: number;
  expectedFinalAmount: number;
  actualFinalAmount?: number;
  difference: number;
  status: 'OPEN' | 'CLOSED';
  notes?: string;
}

export const cashShiftService = {
  getActiveShift: async (): Promise<CashShift | null> => {
    try {
      const response = await api.get<CashShift>('/shifts/active');
      if (response.status === 204 || !response.data) return null;
      return response.data;
    } catch (error) {
      console.warn('No active shift found or backend error', error);
      return null;
    }
  },

  openShift: async (initialBase: number): Promise<CashShift> => {
    const response = await api.post<CashShift>('/shifts/open', { initialBase });
    return response.data;
  },

  closeShift: async (shiftId: number, actualFinalAmount: number, notes?: string): Promise<CashShift> => {
    const response = await api.post<CashShift>(`/shifts/${shiftId}/close`, { actualFinalAmount, notes });
    return response.data;
  },

  getAllShifts: async (): Promise<CashShift[]> => {
    const response = await api.get<CashShift[]>('/shifts');
    return response.data;
  },
};
