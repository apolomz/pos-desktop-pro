import React, { useState, useEffect } from 'react';
import { inventoryService } from '../services/inventoryService';
import { productService } from '../services/productService';
import { saleService } from '../services/saleService';
import type { InventoryMovementResponse, LowStockProduct, MovementType } from '../types/inventory';
import type { Product } from '../types/Product';
import { InvoiceDetailModal, type SaleInvoiceData } from './InvoiceDetailModal';
import { formatCurrency, formatPaymentMethod } from '../utils/formatters';
import { Search, Calendar, Filter, FileText, Plus, AlertTriangle, Loader2 } from 'lucide-react';

export const InventoryManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'stock' | 'sales' | 'movements' | 'alerts'>('stock');
  const [movements, setMovements] = useState<InventoryMovementResponse[]>([]);
  const [sales, setSales] = useState<SaleInvoiceData[]>([]);
  const [alerts, setAlerts] = useState<LowStockProduct[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filtros Avanzados
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [movementFilter, setMovementFilter] = useState<string>('ALL');

  // Estado Modal de Registro de Movimiento
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedProductId, setSelectedProductId] = useState<number | ''>('');
  const [movementType, setMovementType] = useState<MovementType>('ENTRY');
  const [quantity, setQuantity] = useState<number>(1);
  const [reason, setReason] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Estado Modal de Detalle de Factura
  const [selectedInvoice, setSelectedInvoice] = useState<SaleInvoiceData | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState<boolean>(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [historyData, alertsData, productsData, salesData] = await Promise.all([
        inventoryService.getHistory().catch(() => []),
        inventoryService.getAlerts().catch(() => []),
        productService.getProducts().catch(() => []),
        saleService.getAll().catch(() => []),
      ]);
      setMovements(historyData);
      setAlerts(alertsData);
      setProducts(productsData);
      setSales(salesData);
    } catch (err) {
      console.error('Error al cargar datos de inventario:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openMovementForProduct = (productId: number) => {
    setSelectedProductId(productId);
    setIsModalOpen(true);
  };

  const handleOpenInvoiceModal = (sale: SaleInvoiceData) => {
    setSelectedInvoice(sale);
    setIsInvoiceModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) return;

    setSubmitting(true);
    try {
      await inventoryService.createMovement({
        productId: Number(selectedProductId),
        type: movementType,
        quantity: Number(quantity),
        reason,
      });
      setIsModalOpen(false);
      setSelectedProductId('');
      setQuantity(1);
      setReason('');
      setMovementType('ENTRY');
      await fetchData();
    } catch (err) {
      alert('Error al registrar el movimiento.');
    } finally {
      setSubmitting(false);
    }
  };

  // Filtrado de Facturas / Ventas
  const filteredSales = sales.filter((s) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      !term ||
      s.id.toString().includes(term) ||
      (s.customerName && s.customerName.toLowerCase().includes(term)) ||
      (s.sellerUsername && s.sellerUsername.toLowerCase().includes(term));

    const sDate = new Date(s.createdAt).getTime();
    const fromTime = startDate ? new Date(startDate).getTime() : 0;
    const toTime = endDate ? new Date(endDate + 'T23:59:59').getTime() : Infinity;

    const matchesDate = sDate >= fromTime && sDate <= toTime;
    return matchesSearch && matchesDate;
  });

  // Filtrado de Productos
  const filteredProducts = products.filter((p) => {
    const term = searchTerm.toLowerCase();
    return !term || p.name.toLowerCase().includes(term) || (p.category?.name && p.category.name.toLowerCase().includes(term));
  });

  // Filtrado de Movimientos
  const filteredMovements = movements.filter((m) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = !term || m.productName.toLowerCase().includes(term) || (m.reason && m.reason.toLowerCase().includes(term));

    const mDate = new Date(m.createdAt).getTime();
    const fromTime = startDate ? new Date(startDate).getTime() : 0;
    const toTime = endDate ? new Date(endDate + 'T23:59:59').getTime() : Infinity;
    const matchesDate = mDate >= fromTime && mDate <= toTime;

    const matchesType = movementFilter === 'ALL' || m.type === movementFilter;
    return matchesSearch && matchesDate && matchesType;
  });

  return (
    <div className="p-6 bg-slate-950 min-h-screen text-slate-100 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Inventario y Facturación</h1>
          <p className="text-slate-400 text-sm">Control de existencias, trazabilidad por factura y movimientos de stock</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Movimiento Manual</span>
        </button>
      </div>

      {/* Barra de Filtros Avanzados */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3 shadow-lg">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <Filter className="w-4 h-4 text-indigo-400" />
          <span>Barra de Filtros Avanzados</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Buscador de Texto */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre, #factura, cliente..."
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Fecha Desde */}
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs">
            <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent text-white focus:outline-none w-full"
            />
          </div>

          {/* Fecha Hasta */}
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs">
            <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent text-white focus:outline-none w-full"
            />
          </div>

          {/* Limpiar Filtros */}
          <button
            onClick={() => {
              setSearchTerm('');
              setStartDate('');
              setEndDate('');
              setMovementFilter('ALL');
            }}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-all cursor-pointer"
          >
            Limpiar Filtros
          </button>
        </div>
      </div>

      {/* Navegación por Pestañas */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('stock')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
            activeTab === 'stock' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Stock Actual ({filteredProducts.length})
        </button>
        <button
          onClick={() => setActiveTab('sales')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
            activeTab === 'sales' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Historial de Facturación ({filteredSales.length})
        </button>
        <button
          onClick={() => setActiveTab('movements')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
            activeTab === 'movements' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Movimientos de Inventario ({filteredMovements.length})
        </button>
        <button
          onClick={() => setActiveTab('alerts')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'alerts' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Alertas de Stock Bajo
          {alerts.length > 0 && (
            <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full">
              {alerts.length}
            </span>
          )}
        </button>
      </div>

      {/* Contenido Principal */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
          <span>Cargando datos...</span>
        </div>
      ) : activeTab === 'stock' ? (
        /* Vista: Stock Actual */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/60 text-slate-400 uppercase text-xs tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-6 py-3.5">Producto</th>
                <th className="px-6 py-3.5">Categoría</th>
                <th className="px-6 py-3.5 text-right">Precio Unit.</th>
                <th className="px-6 py-3.5 text-right">Stock Actual</th>
                <th className="px-6 py-3.5 text-right">Stock Mínimo</th>
                <th className="px-6 py-3.5 text-center">Estado</th>
                <th className="px-6 py-3.5 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredProducts.map((p) => {
                const isLow = p.stock <= p.minStock;
                const isOut = p.stock === 0;
                return (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-semibold text-white">{p.name}</td>
                    <td className="px-6 py-4 text-slate-400">{p.category?.name || 'Sin Categoría'}</td>
                    <td className="px-6 py-4 text-right font-mono text-indigo-300 font-bold">{formatCurrency(p.price)}</td>
                    <td className={`px-6 py-4 text-right font-mono font-bold ${isOut ? 'text-rose-400' : isLow ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {p.stock}
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-slate-400">{p.minStock}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-1 text-xs rounded-full font-bold uppercase tracking-wider ${
                        isOut ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : isLow ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {isOut ? 'Agotado' : isLow ? 'Stock Bajo' : 'Suficiente'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => openMovementForProduct(p.id)}
                        className="px-3 py-1.5 text-xs bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-xl font-medium transition-all cursor-pointer"
                      >
                        Ajustar / Mover
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : activeTab === 'sales' ? (
        /* Vista: Historial de Facturación Agrupado (1 Fila por Factura) */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/60 text-slate-400 uppercase text-xs tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-6 py-3.5">Factura #</th>
                <th className="px-6 py-3.5">Fecha y Hora</th>
                <th className="px-6 py-3.5">Atendido Por</th>
                <th className="px-6 py-3.5">Cliente</th>
                <th className="px-6 py-3.5">Método de Pago</th>
                <th className="px-6 py-3.5 text-right">Total</th>
                <th className="px-6 py-3.5 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-500 text-xs">No se encontraron ventas para los filtros seleccionados.</td>
                </tr>
              ) : (
                filteredSales.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-indigo-400">#{s.id}</td>
                    <td className="px-6 py-4 text-xs text-slate-400">{new Date(s.createdAt).toLocaleString('es-CO')}</td>
                    <td className="px-6 py-4 text-slate-200">{s.sellerUsername}</td>
                    <td className="px-6 py-4 text-slate-300">{s.customerName || 'Cliente General'}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-xs font-semibold">
                        {formatPaymentMethod(s.paymentMethod)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-bold text-white text-base">{formatCurrency(s.total)}</td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleOpenInvoiceModal(s)}
                        className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 mx-auto"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Ver Factura</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : activeTab === 'movements' ? (
        /* Vista: Movimientos de Inventario */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 bg-slate-950/40 border-b border-slate-800 flex items-center gap-2 text-xs">
            <span className="text-slate-400 uppercase font-semibold">Tipo Movimiento:</span>
            <select
              value={movementFilter}
              onChange={(e) => setMovementFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1 text-white focus:outline-none"
            >
              <option value="ALL">Todos los Movimientos</option>
              <option value="ENTRY">Entradas (+)</option>
              <option value="EXIT">Salidas (-)</option>
              <option value="SALE">Ventas</option>
              <option value="RETURN">Devoluciones</option>
              <option value="ADJUSTMENT">Ajustes</option>
            </select>
          </div>

          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/60 text-slate-400 uppercase text-xs tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-4 py-3.5">Fecha</th>
                <th className="px-4 py-3.5">Producto</th>
                <th className="px-4 py-3.5">Tipo</th>
                <th className="px-4 py-3.5 text-right">Cantidad</th>
                <th className="px-4 py-3.5 text-right">Stock Prev → Nuevo</th>
                <th className="px-4 py-3.5">Motivo / Observaciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredMovements.map((m) => (
                <tr key={m.id} className="hover:bg-slate-800/40">
                  <td className="px-4 py-3.5 text-xs text-slate-400">{new Date(m.createdAt).toLocaleString('es-CO')}</td>
                  <td className="px-4 py-3.5 font-semibold text-white">{m.productName}</td>
                  <td className="px-4 py-3.5">
                    <span className="px-2 py-0.5 bg-slate-800 border border-slate-700 text-slate-200 rounded text-xs font-semibold">
                      {m.type}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono font-bold text-white">{m.quantity}</td>
                  <td className="px-4 py-3.5 text-right font-mono text-xs text-slate-400">{m.previousStock} → <span className="text-white font-bold">{m.newStock}</span></td>
                  <td className="px-4 py-3.5 text-xs text-slate-400 italic">{m.reason || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Vista: Alertas */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl p-6 space-y-4">
          <h3 className="text-lg font-bold text-amber-400 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            <span>Productos con Stock Crítico</span>
          </h3>
          {alerts.length === 0 ? (
            <p className="text-emerald-400 text-sm font-medium">✓ No hay productos con stock por debajo del mínimo.</p>
          ) : (
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/60 text-slate-400 uppercase text-xs border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Producto</th>
                  <th className="px-4 py-3 text-right">Stock Actual</th>
                  <th className="px-4 py-3 text-right">Stock Mínimo</th>
                  <th className="px-4 py-3 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {alerts.map((a) => (
                  <tr key={a.id}>
                    <td className="px-4 py-3.5 font-medium text-white">{a.name}</td>
                    <td className="px-4 py-3.5 text-right font-mono text-rose-400 font-bold">{a.stock}</td>
                    <td className="px-4 py-3.5 text-right font-mono text-slate-400">{a.minStock}</td>
                    <td className="px-4 py-3.5 text-center">
                      <button
                        onClick={() => openMovementForProduct(a.id)}
                        className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer"
                      >
                        Reabastecer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Modal Registrar Movimiento */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Registrar Movimiento de Inventario</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Producto</label>
                <select
                  required
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Selecciona...</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Tipo Movimiento</label>
                <select
                  value={movementType}
                  onChange={(e) => setMovementType(e.target.value as MovementType)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="ENTRY">Entrada (+)</option>
                  <option value="EXIT">Salida (-)</option>
                  <option value="RETURN">Devolución (+)</option>
                  <option value="ADJUSTMENT">Ajuste (Reemplaza)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Cantidad / Nuevo Stock</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Motivo / Notas</label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Ej: Compra proveedor..."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-800 text-slate-300 text-sm font-medium rounded-xl hover:bg-slate-700 transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Guardar Movimiento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Factura Integrado */}
      <InvoiceDetailModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        sale={selectedInvoice}
      />
    </div>
  );
};