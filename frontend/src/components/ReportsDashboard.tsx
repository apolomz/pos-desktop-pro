import React, { useEffect, useState } from 'react';
import { reportService } from '../services/reportService';
import type { FullDashboardReport, PeriodSummary } from '../types/reports';

export const ReportsDashboard: React.FC = () => {
  const [data, setData] = useState<FullDashboardReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');

  const fetchReports = async () => {
    setLoading(true);
    try {
      const result = await reportService.getDashboardData(selectedPeriod);
      setData(result);
    } catch (error) {
      console.error('Error al cargar reportes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [selectedPeriod]);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[600px] text-slate-400">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span>Cargando reportes y analíticas del negocio...</span>
        </div>
      </div>
    );
  }

  // Selección dinámica del periodo actual
  const currentPeriodData: PeriodSummary = 
    selectedPeriod === 'daily' ? data.daily :
    selectedPeriod === 'weekly' ? data.weekly :
    selectedPeriod === 'yearly' ? data.yearly : data.monthly;

  // Cálculo del valor máximo para escalar el gráfico SVG
  const maxRevenueInChart = Math.max(...data.chartData.map((d) => d.revenue), 1);

  return (
    <div className="p-6 bg-slate-900 min-h-screen text-slate-100 space-y-8">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Reportes y Estadísticas</h1>
          <p className="text-slate-400 text-sm">
            Análisis financiero, volumen de ventas, margen de ganancias y salud del inventario
          </p>
        </div>

        {/* Filtro de Periodo Temporal */}
        <div className="flex items-center bg-slate-800 p-1.5 rounded-xl border border-slate-700/80">
          {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((period) => {
            const labels = { daily: 'Diario', weekly: 'Semanal', monthly: 'Mensual', yearly: 'Anual' };
            const isActive = selectedPeriod === period;
            return (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {labels[period]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tarjetas Resumen - KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800/60 border border-slate-800 p-5 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-2 h-full bg-emerald-500" />
          <p className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Ventas Total ({currentPeriodData.periodName})</p>
          <h3 className="text-2xl font-bold text-emerald-400 mt-2 font-mono">
            ${currentPeriodData.totalRevenue.toLocaleString('es-CO')}
          </h3>
          <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
            <span className="text-emerald-400 font-bold">↑ {data.kpis.revenueGrowthPercentage}%</span> comparado con el periodo anterior
          </p>
        </div>

        <div className="bg-slate-800/60 border border-slate-800 p-5 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-2 h-full bg-indigo-500" />
          <p className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Ganancia Neta Est.</p>
          <h3 className="text-2xl font-bold text-indigo-400 mt-2 font-mono">
            ${currentPeriodData.netProfit.toLocaleString('es-CO')}
          </h3>
          <p className="text-xs text-slate-400 mt-2">
            Margen de ganancia: <strong className="text-indigo-300">{currentPeriodData.profitMargin}%</strong>
          </p>
        </div>

        <div className="bg-slate-800/60 border border-slate-800 p-5 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-2 h-full bg-sky-500" />
          <p className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Transacciones realizadas</p>
          <h3 className="text-2xl font-bold text-white mt-2 font-mono">
            {currentPeriodData.totalSalesCount}
          </h3>
          <p className="text-xs text-slate-400 mt-2">
            Ticket promedio: <strong className="text-white">${Math.round(currentPeriodData.averageTicket).toLocaleString('es-CO')}</strong>
          </p>
        </div>

        <div className="bg-slate-800/60 border border-slate-800 p-5 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-2 h-full bg-amber-500" />
          <p className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Valor total inventario</p>
          <h3 className="text-2xl font-bold text-amber-400 mt-2 font-mono">
            ${data.inventorySummary.totalInventoryValue.toLocaleString('es-CO')}
          </h3>
          <p className="text-xs text-slate-400 mt-2">
            <strong className="text-amber-300">{data.inventorySummary.lowStockItemsCount}</strong> prod. en stock bajo
          </p>
        </div>
      </div>

      {/* Sección del Gráfico de Ventas vs Ganancias */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-800/50 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-white">Evolución de Ingresos y Ganancias</h2>
              <p className="text-xs text-slate-400">Comparativa de volumen de ventas e ingresos netos</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-indigo-500 inline-block" /> Ingresos</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-400 inline-block" /> Ganancia</span>
            </div>
          </div>

          {/* Gráfico SVG de Barras Custom Responsive */}
          <div className="h-64 flex items-end justify-between gap-2 pt-8 pb-2 px-2 border-b border-slate-700/60">
            {data.chartData.map((item, idx) => {
              const revenueHeight = (item.revenue / maxRevenueInChart) * 100;
              const profitHeight = (item.profit / maxRevenueInChart) * 100;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                  {/* Tooltip Hover */}
                  <div className="absolute -top-12 bg-slate-950 text-xs text-white px-2.5 py-1 rounded shadow-lg border border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                    <div>{item.label}: ${item.revenue.toLocaleString('es-CO')}</div>
                    <div className="text-emerald-400">Ganancia: ${item.profit.toLocaleString('es-CO')}</div>
                  </div>

                  {/* Contenedor de barras */}
                  <div className="w-full max-w-[40px] flex items-end justify-center gap-1 h-full">
                    {/* Barra de Ingreso */}
                    <div
                      style={{ height: `${revenueHeight}%` }}
                      className="w-1/2 bg-indigo-500/80 group-hover:bg-indigo-500 rounded-t-md transition-all duration-300"
                    />
                    {/* Barra de Ganancia */}
                    <div
                      style={{ height: `${profitHeight}%` }}
                      className="w-1/2 bg-emerald-400/80 group-hover:bg-emerald-400 rounded-t-md transition-all duration-300"
                    />
                  </div>
                  <span className="text-xs text-slate-400 mt-2 font-medium">{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Desglose de Gastos vs Ganancia */}
        <div className="bg-slate-800/50 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-6 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Desglose Financiero</h2>
            <p className="text-xs text-slate-400">Balance del periodo {currentPeriodData.periodName.toLowerCase()}</p>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Costo de Productos Vencidos/Comprados</span>
                <span className="text-rose-400 font-mono font-semibold">${currentPeriodData.totalCost.toLocaleString('es-CO')}</span>
              </div>
              <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-rose-500 h-2 rounded-full"
                  style={{ width: `${(currentPeriodData.totalCost / currentPeriodData.totalRevenue) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Ganancia Neta Generada</span>
                <span className="text-emerald-400 font-mono font-semibold">${currentPeriodData.netProfit.toLocaleString('es-CO')}</span>
              </div>
              <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-400 h-2 rounded-full"
                  style={{ width: `${currentPeriodData.profitMargin}%` }}
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-700/50 p-4 rounded-xl space-y-2">
            <span className="text-xs uppercase font-semibold text-slate-400">Resumen de Rentabilidad</span>
            <p className="text-xs text-slate-300 leading-relaxed">
              Por cada $100 ingresados en ventas durante este periodo, el negocio genera{' '}
              <strong className="text-emerald-400">${Math.round(currentPeriodData.profitMargin)} de utilidad neta libre</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Tablas: Productos Más Vendidos & Valoración por Categoría */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Productos Más Vendidos */}
        <div className="bg-slate-800/50 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">🔥 Productos Más Vendidos</h2>
              <p className="text-xs text-slate-400">Ranking por unidades comercializadas</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/80 text-slate-400 uppercase text-xs">
                <tr>
                  <th className="px-5 py-3">Producto</th>
                  <th className="px-5 py-3 text-center">Unidades</th>
                  <th className="px-5 py-3 text-right">Recaudado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {data.topProducts.map((prod, idx) => (
                  <tr key={prod.productId} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-bold flex items-center justify-center border border-indigo-500/30">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="font-medium text-white">{prod.productName}</div>
                          <div className="text-xs text-slate-500">{prod.categoryName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-center font-mono font-bold text-indigo-300">
                      {prod.unitsSold}
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono text-emerald-400 font-semibold">
                      ${prod.totalRevenue.toLocaleString('es-CO')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Valoración de Inventario por Categoría */}
        <div className="bg-slate-800/50 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-5 border-b border-slate-800">
            <h2 className="text-base font-bold text-white">📦 Valor de Inventario por Categoría</h2>
            <p className="text-xs text-slate-400">Distribución del capital invertido en stock</p>
          </div>

          <div className="p-5 space-y-4">
            {data.inventorySummary.categories.map((cat, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-slate-200">{cat.category} ({cat.itemCount} items)</span>
                  <span className="font-mono text-amber-400 font-semibold">${cat.totalValue.toLocaleString('es-CO')}</span>
                </div>
                <div className="w-full bg-slate-700/50 rounded-full h-2.5 overflow-hidden flex">
                  <div
                    className="bg-amber-400 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};