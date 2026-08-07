export interface KPIStats {
  todaySalesCount: number;
  todayRevenue: number;
  monthlyRevenue: number;
  monthlyProfit: number;
  totalProductsCount: number;
  lowStockCount: number;
  revenueGrowthPercentage: number;
}

export interface PeriodSummary {
  periodName: string; // "Hoy", "Esta Semana", "Este Mes", "Este Año"
  totalSalesCount: number;
  totalRevenue: number;
  totalCost: number;
  netProfit: number;
  profitMargin: number; // Porcentaje ex: 32.5%
  averageTicket: number;
}

export interface TopProduct {
  productId: number;
  productName: string;
  categoryName: string;
  unitsSold: number;
  totalRevenue: number;
  currentStock: number;
}

export interface TimeSeriesData {
  label: string; // ex: "Ene", "Feb", "Lun", "Mar"
  revenue: number;
  cost: number;
  profit: number;
  salesCount: number;
}

export interface CategoryBreakdown {
  category: string;
  itemCount: number;
  totalValue: number;
  percentage: number;
}

export interface InventoryReport {
  totalInventoryValue: number;
  totalItemsInStock: number;
  lowStockItemsCount: number;
  outOfStockItemsCount: number;
  categories: CategoryBreakdown[];
}

export interface FullDashboardReport {
  kpis: KPIStats;
  daily: PeriodSummary;
  weekly: PeriodSummary;
  monthly: PeriodSummary;
  yearly: PeriodSummary;
  topProducts: TopProduct[];
  chartData: TimeSeriesData[];
  inventorySummary: InventoryReport;
}