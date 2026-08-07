import React, { useState, useEffect } from 'react';
import { inventoryService } from '../services/inventoryService';
import { productService } from '../services/productService';
import type { InventoryMovementResponse, LowStockProduct, MovementType } from '../types/inventory';
import type { Product } from '../types/Product';

export const InventoryManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'stock' | 'history' | 'alerts'>('stock');
  const [movements, setMovements] = useState<InventoryMovementResponse[]>([]);
  const [alerts, setAlerts] = useState<LowStockProduct[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filtro de historial
  const [historyFilter, setHistoryFilter] = useState<string>('ALL');

  // Estado del Modal de Registro de Movimiento
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedProductId, setSelectedProductId] = useState<number | ''>('');
  const [movementType, setMovementType] = useState<MovementType>('ENTRY');
  const [quantity, setQuantity] = useState<number>(1);
  const [reason, setReason] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Estado del Modal de Detalle de Venta / Movimiento
  const [selectedMovement, setSelectedMovement] = useState<InventoryMovementResponse | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [historyData, alertsData, productsData] = await Promise.all([
        inventoryService.getHistory(),
        inventoryService.getAlerts(),
        productService.getProducts()
      ]);
      setMovements(historyData);
      setAlerts(alertsData);
      setProducts(productsData);
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

  const openDetailModal = (movement: InventoryMovementResponse) => {
    setSelectedMovement(movement);
    setIsDetailModalOpen(true);
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
        reason
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

  const getBadgeStyle = (type: MovementType) => {
    switch (type) {
      case 'ENTRY': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'RETURN': return 'bg-teal-500/10 text-teal-400 border-teal-500/20';
      case 'EXIT': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'SALE': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'ADJUSTMENT': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default: return 'bg-slate-700 text-slate-300';
    }
  };

  const getTypeLabel = (type: MovementType) => {
    const labels: Record<MovementType, string> = {
      ENTRY: 'Entrada', EXIT: 'Salida', ADJUSTMENT: 'Ajuste', SALE: 'Venta', RETURN: 'Devolución'
    };
    return labels[type] || type;
  };

  // Auxiliares para extraer Usuario y Cliente independientemente de la estructura de la respuesta
  const getUserName = (m: any): string => {
    if (m.userName) return m.userName;
    if (typeof m.user === 'string') return m.user;
    if (m.user && typeof m.user === 'object' && m.user.name) return m.user.name;
    if (m.createdBy) return m.createdBy;
    return 'Sistema / General';
  };

  const getCustomerName = (m: any): string => {
    if (m.customerName) return m.customerName;
    if (typeof m.customer === 'string') return m.customer;
    if (m.customer && typeof m.customer === 'object' && m.customer.name) return m.customer.name;
    if (m.clientName) return m.clientName;
    return m.type === 'SALE' ? 'Cliente General' : 'N/A';
  };

  const filteredMovements = movements.filter((m) => {
    if (historyFilter === 'ALL') return true;
    return m.type === historyFilter;
  });

  return (
    <div className="p-6 bg-slate-900 min-h-screen text-slate-100 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Gestión de Inventario y Ventas</h1>
          <p className="text-slate-400 text-sm">Control de existencias, historial de ventas, usuarios y clientes</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg shadow-lg transition-colors flex items-center justify-center gap-2"
        >
          <span>+</span> Registrar Movimiento
        </button>
      </div>

      {/* Navegación por Pestañas */}
      <div className="flex items-center gap-4 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('stock')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'stock' ? 'bg-slate-800 text-indigo-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Stock Actual ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'history' ? 'bg-slate-800 text-indigo-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Historial de Movimientos / Ventas
        </button>
        <button
          onClick={() => setActiveTab('alerts')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${
            activeTab === 'alerts' ? 'bg-slate-800 text-amber-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Alertas de Stock Bajo
          {alerts.length > 0 && (
            <span className="px-2 py-0.5 text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full">
              {alerts.length}
            </span>
          )}
        </button>
      </div>

      {/* Contenido Principal */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">Cargando inventario...</div>
      ) : activeTab === 'stock' ? (
        /* Vista: Stock Actual */
        <div className="bg-slate-800/50 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/80 text-slate-400 uppercase text-xs">
                <tr>
                  <th className="px-6 py-3">Producto</th>
                  <th className="px-6 py-3">Categoría</th>
                  <th className="px-6 py-3 text-right">Precio Unit.</th>
                  <th className="px-6 py-3 text-right">Stock Actual</th>
                  <th className="px-6 py-3 text-right">Stock Mínimo</th>
                  <th className="px-6 py-3 text-center">Estado</th>
                  <th className="px-6 py-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {products.map((p) => {
                  const isLow = p.stock <= p.minStock;
                  const isOut = p.stock === 0;
                  return (
                    <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-white">{p.name}</td>
                      <td className="px-6 py-4 text-slate-400">{p.category?.name || 'Sin Categoría'}</td>
                      <td className="px-6 py-4 text-right font-mono">${p.price.toLocaleString('es-CO')}</td>
                      <td className={`px-6 py-4 text-right font-mono font-bold ${isOut ? 'text-rose-500' : isLow ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {p.stock}
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-slate-400">{p.minStock}</td>
                      <td className="px-6 py-4 text-center">
                        {isOut ? (
                          <span className="px-2.5 py-1 text-xs rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-semibold">
                            Agotado
                          </span>
                        ) : isLow ? (
                          <span className="px-2.5 py-1 text-xs rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold">
                            Stock Bajo
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 text-xs rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                            Suficiente
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => openMovementForProduct(p.id)}
                          className="px-3 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-indigo-300 font-medium rounded-md transition-colors"
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
        </div>
      ) : activeTab === 'history' ? (
        /* Vista: Historial con Filtro y Detalle de Ventas */
        <div className="bg-slate-800/50 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          {/* Barra de Filtro */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-800/30 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 uppercase">Filtrar por:</span>
              <select
                value={historyFilter}
                onChange={(e) => setHistoryFilter(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="ALL">Todos los Movimientos</option>
                <option value="SALE">Solo Ventas</option>
                <option value="ENTRY">Solo Entradas</option>
                <option value="EXIT">Solo Salidas</option>
                <option value="RETURN">Solo Devoluciones</option>
                <option value="ADJUSTMENT">Solo Ajustes</option>
              </select>
            </div>
            <span className="text-xs text-slate-400">
              Mostrando {filteredMovements.length} registro(s)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/80 text-slate-400 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Producto</th>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3 text-right">Cant.</th>
                  <th className="px-4 py-3">Usuario</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3 text-right">Stock (Prev → Nuevo)</th>
                  <th className="px-4 py-3">Motivo / Ref</th>
                  <th className="px-4 py-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredMovements.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-8 text-slate-500">
                      No hay registros para el filtro seleccionado.
                    </td>
                  </tr>
                ) : (
                  filteredMovements.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-4 text-xs text-slate-400 whitespace-nowrap">
                        {new Date(m.createdAt).toLocaleString('es-CO')}
                      </td>
                      <td className="px-4 py-4 font-medium text-white">{m.productName}</td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 text-xs rounded-full border ${getBadgeStyle(m.type)}`}>
                          {getTypeLabel(m.type)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right font-mono font-semibold text-white">{m.quantity}</td>
                      <td className="px-4 py-4 text-indigo-300 font-medium text-xs whitespace-nowrap">
                        {getUserName(m)}
                      </td>
                      <td className="px-4 py-4 text-emerald-300 font-medium text-xs whitespace-nowrap">
                        {getCustomerName(m)}
                      </td>
                      <td className="px-4 py-4 text-right font-mono text-xs whitespace-nowrap">
                        <span className="text-slate-400">{m.previousStock}</span> → <span className="text-white font-bold">{m.newStock}</span>
                      </td>
                      <td className="px-4 py-4 text-slate-400 italic text-xs max-w-xs truncate">
                        {m.reason || 'N/A'}
                      </td>
                      <td className="px-4 py-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => openDetailModal(m)}
                          className="px-2.5 py-1 text-xs bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 rounded-md font-medium transition-colors"
                        >
                          Ver Detalle
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Vista: Alertas */
        <div className="bg-slate-800/50 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/80 text-slate-400 uppercase text-xs">
                <tr>
                  <th className="px-6 py-3">Producto</th>
                  <th className="px-6 py-3 text-right">Stock Actual</th>
                  <th className="px-6 py-3 text-right">Stock Mínimo</th>
                  <th className="px-6 py-3 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {alerts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-emerald-400 font-medium">
                      ✓ Todo en orden. No hay productos con stock crítico.
                    </td>
                  </tr>
                ) : (
                  alerts.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-white">{a.name}</td>
                      <td className="px-6 py-4 text-right font-mono text-rose-400 font-bold">{a.stock}</td>
                      <td className="px-6 py-4 text-right font-mono text-slate-400">{a.minStock}</td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => openMovementForProduct(a.id)}
                          className="px-3 py-1 text-xs bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 font-semibold rounded-md transition-colors"
                        >
                          Reabastecer
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Registrar Movimiento */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-700 pb-3">
              <h3 className="text-lg font-bold text-white">Registrar Movimiento</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Producto</label>
                <select
                  required
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="">Selecciona un producto</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Stock actual: {p.stock})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Tipo de Operación</label>
                <select
                  value={movementType}
                  onChange={(e) => setMovementType(e.target.value as MovementType)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="ENTRY">Entrada (+ Suma Stock)</option>
                  <option value="EXIT">Salida (- Resta Stock)</option>
                  <option value="RETURN">Devolución (+ Reingreso)</option>
                  <option value="ADJUSTMENT">Ajuste (Reemplaza por Conteo Físico)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                  {movementType === 'ADJUSTMENT' ? 'Nuevo Stock Total (Conteo)' : 'Cantidad'}
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Motivo / Notas</label>
                <input
                  type="text"
                  placeholder="Ej: Reabastecimiento, producto vencido..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-700 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm text-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-semibold text-white transition-colors"
                >
                  {submitting ? 'Guardando...' : 'Guardar Movimiento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Ver Detalle de Venta / Movimiento */}
      {isDetailModalOpen && selectedMovement && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex justify-between items-center border-b border-slate-700 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white">
                  {selectedMovement.type === 'SALE' ? 'Detalle de Venta' : 'Detalle del Movimiento'}
                </h3>
                <p className="text-xs text-slate-400">ID Registro: #{selectedMovement.id}</p>
              </div>
              <button
                onClick={() => {
                  setIsDetailModalOpen(false);
                  setSelectedMovement(null);
                }}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-700/50">
                <span className="text-xs text-slate-400 block uppercase font-semibold">Fecha y Hora</span>
                <span className="text-slate-200 font-medium">
                  {new Date(selectedMovement.createdAt).toLocaleString('es-CO')}
                </span>
              </div>

              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-700/50">
                <span className="text-xs text-slate-400 block uppercase font-semibold">Tipo de Operación</span>
                <span className={`inline-block px-2.5 py-0.5 text-xs rounded-full border mt-1 font-semibold ${getBadgeStyle(selectedMovement.type)}`}>
                  {getTypeLabel(selectedMovement.type)}
                </span>
              </div>

              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-700/50 col-span-2">
                <span className="text-xs text-slate-400 block uppercase font-semibold">Producto</span>
                <span className="text-white font-bold text-base">{selectedMovement.productName}</span>
              </div>

              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-700/50">
                <span className="text-xs text-slate-400 block uppercase font-semibold">Usuario / Cajero</span>
                <span className="text-indigo-300 font-semibold">{getUserName(selectedMovement)}</span>
              </div>

              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-700/50">
                <span className="text-xs text-slate-400 block uppercase font-semibold">Cliente</span>
                <span className="text-emerald-300 font-semibold">{getCustomerName(selectedMovement)}</span>
              </div>

              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-700/50">
                <span className="text-xs text-slate-400 block uppercase font-semibold">Cantidad Afectada</span>
                <span className="text-white font-mono font-bold text-base">{selectedMovement.quantity} u.</span>
              </div>

              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-700/50">
                <span className="text-xs text-slate-400 block uppercase font-semibold">Cambio de Stock</span>
                <span className="text-slate-300 font-mono">
                  {selectedMovement.previousStock} → <strong className="text-white">{selectedMovement.newStock}</strong>
                </span>
              </div>

              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-700/50 col-span-2">
                <span className="text-xs text-slate-400 block uppercase font-semibold">Motivo / Referencia</span>
                <p className="text-slate-300 italic mt-0.5">{selectedMovement.reason || 'Sin observaciones'}</p>
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-700 pt-4">
              <button
                type="button"
                onClick={() => {
                  setIsDetailModalOpen(false);
                  setSelectedMovement(null);
                }}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm text-white font-medium transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};