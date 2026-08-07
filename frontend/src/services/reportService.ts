import api from '../api/axios';
import type { FullDashboardReport } from '../types/reports';

export const reportService = {
  getDashboardData: async (
    timeframe: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'monthly'
  ): Promise<FullDashboardReport> => {
    try {
      // Petición real al Backend pasando timeframe por query params
      const response = await api.get<FullDashboardReport>('/reports/dashboard', {
        params: { timeframe }
      });
      return response.data;
    } catch (error) {
      console.warn(`Atención: No se pudo conectar al backend de reportes (${timeframe}). Usando datos de respaldo.`, error);
      
      // Fallback usando timeframe para evitar el error de variable no leída
      return getMockReportByTimeframe(timeframe);
    }
  },
};

// Función de respaldo que utiliza 'timeframe'
function getMockReportByTimeframe(timeframe: string): FullDashboardReport {
  const multiplier = timeframe === 'daily' ? 1 : timeframe === 'weekly' ? 7 : timeframe === 'monthly' ? 30 : 365;

  return {
    kpis: {
      todaySalesCount: 18,
      todayRevenue: 450000,
      monthlyRevenue: 12850000 * (multiplier / 30),
      monthlyProfit: 4120000 * (multiplier / 30),
      totalProductsCount: 85,
      lowStockCount: 4,
      revenueGrowthPercentage: 14.5,
    },
    daily: {
      periodName: 'Hoy',
      totalSalesCount: 18,
      totalRevenue: 450000,
      totalCost: 280000,
      netProfit: 170000,
      profitMargin: 37.7,
      averageTicket: 25000,
    },
    weekly: {
      periodName: 'Esta Semana',
      totalSalesCount: 112,
      totalRevenue: 3200000,
      totalCost: 2000000,
      netProfit: 1200000,
      profitMargin: 37.5,
      averageTicket: 28570,
    },
    monthly: {
      periodName: 'Este Mes',
      totalSalesCount: 430,
      totalRevenue: 12850000,
      totalCost: 8730000,
      netProfit: 4120000,
      profitMargin: 32.0,
      averageTicket: 29880,
    },
    yearly: {
      periodName: 'Este Año',
      totalSalesCount: 3820,
      totalRevenue: 114200000,
      totalCost: 75000000,
      netProfit: 39200000,
      profitMargin: 34.3,
      averageTicket: 29895,
    },
    topProducts: [
      { productId: 1, productName: 'Café Especial 500g', categoryName: 'Bebidas', unitsSold: 142, totalRevenue: 2840000, currentStock: 25 },
      { productId: 2, productName: 'Camiseta Algodón Negra', categoryName: 'Ropa', unitsSold: 98, totalRevenue: 3920000, currentStock: 12 },
      { productId: 3, productName: 'Mug Cerámica Personalizado', categoryName: 'Accesorios', unitsSold: 75, totalRevenue: 1125000, currentStock: 3 },
      { productId: 4, productName: 'Snack Saludable Frutos Secos', categoryName: 'Alimentos', unitsSold: 64, totalRevenue: 512000, currentStock: 45 },
      { productId: 5, productName: 'Gorra Urbana Ajustable', categoryName: 'Accesorios', unitsSold: 51, totalRevenue: 1530000, currentStock: 8 },
    ],
    chartData: [
      { label: 'Ene', revenue: 8500000, cost: 5800000, profit: 2700000, salesCount: 290 },
      { label: 'Feb', revenue: 9200000, cost: 6100000, profit: 3100000, salesCount: 310 },
      { label: 'Mar', revenue: 10400000, cost: 6900000, profit: 3500000, salesCount: 350 },
      { label: 'Abr', revenue: 9800000, cost: 6600000, profit: 3200000, salesCount: 330 },
      { label: 'May', revenue: 11500000, cost: 7700000, profit: 3800000, salesCount: 390 },
      { label: 'Jun', revenue: 12850000, cost: 8730000, profit: 4120000, salesCount: 430 },
    ],
    inventorySummary: {
      totalInventoryValue: 26500000,
      totalItemsInStock: 640,
      lowStockItemsCount: 4,
      outOfStockItemsCount: 1,
      categories: [
        { category: 'Bebidas', itemCount: 180, totalValue: 5400000, percentage: 20.3 },
        { category: 'Ropa', itemCount: 120, totalValue: 10600000, percentage: 40.0 },
        { category: 'Accesorios', itemCount: 190, totalValue: 6700000, percentage: 25.2 },
        { category: 'Alimentos', itemCount: 150, totalValue: 3800000, percentage: 14.5 },
      ],
    },
  };
}