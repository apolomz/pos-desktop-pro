import api from '../api/axios';

export interface LowStockItem {
  id: number;
  name: string;
  stock: number;
}

export interface AnalyticsSummary {
  totalSalesCount: number;
  totalRevenue: number;
  totalProducts: number;
  lowStockCount: number;
  lowStockItems: LowStockItem[];
  totalCustomers: number;
}

export interface ChatResponse {
  reply: string;
  timestamp: string;
  offlineMode: boolean;
}

export const aiService = {
  /**
   * Obtiene las métricas generales del negocio para las tarjetas del Dashboard.
   */
  getAnalytics: async (): Promise<AnalyticsSummary> => {
    const response = await api.get<AnalyticsSummary>('/ai/analytics');
    return response.data;
  },

  /**
   * Envía la consulta al chat inyectando la API Key de Gemini desde localStorage.
   */
  sendChatMessage: async (message: string): Promise<ChatResponse> => {
    const storedApiKey = localStorage.getItem('gemini_api_key') || '';
    
    const response = await api.post<ChatResponse>('/ai/chat', {
      message,
      apiKey: storedApiKey,
    });
    
    return response.data;
  },
};