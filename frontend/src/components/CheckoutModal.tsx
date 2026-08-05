import React, { useState } from 'react';
import { PAYMENT_METHODS, type PaymentMethod } from '../services/saleService';

interface Props {
  isOpen: boolean;
  total: number;
  onClose: () => void;
  onConfirm: (paymentMethod: PaymentMethod, customerId?: number) => Promise<void>;
}

// Billetes comunes en circulación
const COMMON_BILLS = [2000, 5000, 10000, 20000, 50000, 100000];

export const CheckoutModal: React.FC<Props> = ({ isOpen, total, onClose, onConfirm }) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PAYMENT_METHODS.CASH);
  const [amountReceived, setAmountReceived] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const change = typeof amountReceived === 'number' ? Math.max(0, amountReceived - total) : 0;
  const isCash = paymentMethod === PAYMENT_METHODS.CASH;
  const canSubmit = !isCash || (typeof amountReceived === 'number' && amountReceived >= total);

  // Billetes sugeridos mayores o iguales al total (se limitan a los 4 o 5 más cercanos para no saturar)
  const suggestedBills = COMMON_BILLS.filter((bill) => bill >= total).slice(0, 5);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    try {
      await onConfirm(paymentMethod);
      onClose();
    } catch (error) {
      console.error('Error al procesar la venta', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6 text-slate-100">
        <h3 className="text-xl font-bold mb-4 text-slate-100">Finalizar Venta</h3>
        
        {/* Total a Pagar */}
        <div className="mb-6 p-4 bg-slate-800/80 border border-slate-700/80 rounded-xl flex justify-between items-center">
          <span className="text-slate-300 font-medium text-sm">Total a Pagar:</span>
          <span className="text-2xl font-black text-indigo-400">${total.toLocaleString()}</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Método de Pago */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
              Método de Pago
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: PAYMENT_METHODS.CASH, label: 'Efectivo' },
                { id: PAYMENT_METHODS.CARD, label: 'Tarjeta' },
                { id: PAYMENT_METHODS.TRANSFER, label: 'Transferencia' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPaymentMethod(m.id)}
                  className={`py-2.5 px-3 text-xs font-bold rounded-xl border transition ${
                    paymentMethod === m.id
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cambio / Devuelta si es Efectivo */}
          {isCash && (
            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Monto Recibido
                </label>
                <input
                  type="number"
                  required
                  min={total}
                  value={amountReceived}
                  onChange={(e) => setAmountReceived(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="Ingrese el dinero recibido..."
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-xl font-bold text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />

                {/* Atajos de Billetes y Pago Exacto */}
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  <button
                    type="button"
                    onClick={() => setAmountReceived(total)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition ${
                      amountReceived === total
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                        : 'bg-emerald-950/60 text-emerald-300 border-emerald-800/80 hover:bg-emerald-900/60'
                    }`}
                  >
                    Exacto (${total.toLocaleString()})
                  </button>

                  {suggestedBills.map((bill) => (
                    <button
                      key={bill}
                      type="button"
                      onClick={() => setAmountReceived(bill)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition ${
                        amountReceived === bill
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      ${bill.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center p-3.5 bg-slate-800/40 border border-slate-700/60 rounded-xl">
                <span className="text-slate-300 text-xs font-medium">Cambio / Devuelta:</span>
                <span className="font-extrabold text-emerald-400 text-xl">${change.toLocaleString()}</span>
              </div>
            </div>
          )}

          {/* Botones de Acción */}
          <div className="flex gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-3 text-slate-300 bg-slate-800 border border-slate-700 rounded-xl font-semibold hover:bg-slate-700 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!canSubmit || loading}
              className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 disabled:opacity-40 disabled:shadow-none disabled:cursor-not-allowed transition"
            >
              {loading ? 'Procesando...' : 'Confirmar Pago'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};