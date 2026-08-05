import React, { useState } from 'react';
import { PAYMENT_METHODS, type PaymentMethod } from '../services/saleService';

interface Props {
  isOpen: boolean;
  total: number;
  onClose: () => void;
  onConfirm: (paymentMethod: PaymentMethod, customerId?: number) => Promise<void>;
}

export const CheckoutModal: React.FC<Props> = ({ isOpen, total, onClose, onConfirm }) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PAYMENT_METHODS.CASH)
  const [amountReceived, setAmountReceived] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const change = typeof amountReceived === 'number' ? Math.max(0, amountReceived - total) : 0;
  const isCash = paymentMethod === PAYMENT_METHODS.CASH
  const canSubmit = !isCash || (typeof amountReceived === 'number' && amountReceived >= total);

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h3 className="text-xl font-bold mb-4">Finalizar Venta</h3>
        
        <div className="mb-6 p-4 bg-blue-50 rounded-lg flex justify-between items-center">
          <span className="text-gray-700 font-medium">Total a Pagar:</span>
          <span className="text-2xl font-extrabold text-blue-600">${total.toLocaleString()}</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* HU-013: Método de pago */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Método de Pago</label>
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
                  className={`py-2 px-3 text-sm font-semibold rounded-lg border ${
                    paymentMethod === m.id
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Módulo de Cambio/Devuelta si es Efectivo */}
          {isCash && (
            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monto Recibido</label>
                <input
                  type="number"
                  required
                  min={total}
                  value={amountReceived}
                  onChange={(e) => setAmountReceived(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="0.00"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-100 rounded-lg text-sm">
                <span className="text-gray-600">Cambio / Devuelta:</span>
                <span className="font-bold text-green-600 text-lg">${change.toLocaleString()}</span>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-2 text-gray-700 border rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!canSubmit || loading}
              className="flex-1 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Procesando...' : 'Confirmar Pago'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};