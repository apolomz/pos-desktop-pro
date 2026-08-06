import React, { useState, useEffect } from 'react';
import { inventoryService } from '../services/inventoryService';
import { productService } from '../services/productService'; // Asumiendo tu servicio de productos
import type { InventoryMovementResponse, LowStockProduct, MovementType } from '../types/inventory';

export const InventoryManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'history' | 'alerts'>('history');
  const [movements, setMovements] = useState<InventoryMovementResponse[]>([]);
  const [alerts, setAlerts] = useState<LowStockProduct[]>([]);
  const [products, setProducts] = useState<{ id: number; name: string; stock: number }[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Estado del Modal
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedProductId, setSelectedProductId] = useState<number | ''>('');
  const [movementType, setMovementType] = useState<MovementType>('ENTRY');
  const [quantity, setQuantity] = useState<number>(1);
  const [reason, setReason] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

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
      // Limpiar Formulario
      setSelectedProductId('');
      setQuantity(1);
      setReason('');
      setMovementType('ENTRY');
      // Recargar datos
      await fetchData();
    } catch (err) {
      alert('Error al registrar el movimiento.');
    } finally {
      setSubmitting(false);
    }
  };

  const getBadgeStyle = (type: MovementType) => {
    switch (type) {
      case 'ENTRY':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'RETURN':
        return 'bg-teal-500/10 text-teal-400 border-teal-500/20';
      case 'EXIT':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'SALE':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'ADJUSTMENT':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default:
        return 'bg-slate-700 text-slate-300';
    }
  };

  const getTypeLabel = (type: MovementType) => {
    const labels: Record<MovementType, string> = {
      ENTRY: 'Entrada',
      EXIT: 'Salida',
      ADJUSTMENT: 'Ajuste',
      SALE: 'Venta',
      RETURN: 'Devolución'
    };
    return labels[type] || type;
  };

  return (
    <div className="p-6 bg-slate-900 min-h-screen text-slate-100 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Gestión de Inventario</h1>
          <p className="text-slate-400 text-sm">Control de movimientos, ajustes e historial atómico</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg shadow-lg transition-colors flex items-center justify-center gap-2"
        >
          <span>+</span> Registrar Movimiento
        </button>
      </div>

      {/* Tabs & Alert Badge */}
      <div className="flex items-center gap-4 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'history' ? 'bg-slate-800 text-indigo-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Historial de Movimientos
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

      {/* Main Content */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">Cargando datos de inventario...</div>
      ) : activeTab === 'history' ? (
        <div className="bg-slate-800/50 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/80 text-slate-400 uppercase text-xs">
                <tr>
                  <th className="px-6 py-3">Fecha</th>
                  <th className="px-6 py-3">Producto</th>
                  <th className="px-6 py-3">Tipo</th>
                  <th className="px-6 py-3 text-right">Cantidad</th>
                  <th className="px-6 py-3 text-right">Prev. Stock</th>
                  <th className="px-6 py-3 text-right">Nuevo Stock</th>
                  <th className="px-6 py-3">Motivo / Ref</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {movements.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-500">
                      No hay movimientos registrados.
                    </td>
                  </tr>
                ) : (
                  movements.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 text-xs text-slate-400">
                        {new Date(m.createdAt).toLocaleString('es-CO')}
                      </td>
                      <td className="px-6 py-4 font-medium text-white">{m.productName}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-xs rounded-full border ${getBadgeStyle(m.type)}`}>
                          {getTypeLabel(m.type)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-semibold">{m.quantity}</td>
                      <td className="px-6 py-4 text-right font-mono text-slate-400">{m.previousStock}</td>
                      <td className="px-6 py-4 text-right font-mono font-bold text-white">{m.newStock}</td>
                      <td className="px-6 py-4 text-slate-400 italic">{m.reason || 'N/A'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Tabla Alertas */
        <div className="bg-slate-800/50 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/80 text-slate-400 uppercase text-xs">
                <tr>
                  <th className="px-6 py-3">Producto</th>
                  <th className="px-6 py-3 text-right">Stock Actual</th>
                  <th className="px-6 py-3 text-right">Stock Mínimo</th>
                  <th className="px-6 py-3 text-center">Estado</th>
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
                        <span className="px-2.5 py-1 text-xs rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-semibold">
                          Reabastecer Urgentemente
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal para Registrar Movimiento */}
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
                      {p.name} (Stock: {p.stock})
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
                  placeholder="Ej: Factura proveedor #123, merma por daño..."
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
    </div>
  );
};