import React from 'react';
import type { CartItem } from '../types/pos';

interface Props {
  cart: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  onUpdateQty: (productId: number, qty: number) => void;
  onRemove: (productId: number) => void;
  onClear: () => void;
  onCheckout: () => void;
}

export const CartPanel: React.FC<Props> = ({
  cart,
  subtotal,
  tax,
  total,
  onUpdateQty,
  onRemove,
  onClear,
  onCheckout,
}) => {
  return (
    <div className="flex flex-col h-full p-4 bg-white border-l shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Venta Actual</h2>
        {cart.length > 0 && (
          <button onClick={onClear} className="text-red-500 text-sm hover:underline">
            Cancelar (HU-012)
          </button>
        )}
      </div>

      {/* Ítems del carrito */}
      <div className="flex-1 overflow-y-auto space-y-3">
        {cart.length === 0 ? (
          <div className="text-center text-gray-400 mt-10">El carrito está vacío</div>
        ) : (
          cart.map(({ product, quantity, subtotal: itemSubtotal }) => (
            <div key={product.id} className="flex items-center justify-between border-b pb-2">
              <div className="flex-1">
                <p className="font-medium text-sm">{product.name}</p>
                <p className="text-xs text-gray-500">${product.price.toLocaleString()} c/u</p>
              </div>

              {/* Controles de Cantidad */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onUpdateQty(product.id, quantity - 1)}
                  className="w-6 h-6 border rounded font-bold hover:bg-gray-100"
                >
                  -
                </button>
                <span className="text-sm font-semibold">{quantity}</span>
                <button
                  onClick={() => onUpdateQty(product.id, quantity + 1)}
                  className="w-6 h-6 border rounded font-bold hover:bg-gray-100"
                >
                  +
                </button>
              </div>

              <span className="w-20 text-right font-semibold text-sm">${itemSubtotal.toLocaleString()}</span>

              <button onClick={() => onRemove(product.id)} className="ml-2 text-gray-400 hover:text-red-600">
                ✕
              </button>
            </div>
          ))
        )}
      </div>

      {/* HU-010: Totales en tiempo real */}
      <div className="border-t pt-4 mt-4 space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Subtotal:</span>
          <span>${subtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>Impuestos (IVA):</span>
          <span>${tax.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-lg font-bold text-gray-900 border-t pt-2">
          <span>Total:</span>
          <span>${total.toLocaleString()}</span>
        </div>

        {/* HU-011: Botón de Checkout */}
        <button
          disabled={cart.length === 0}
          onClick={onCheckout}
          className="w-full mt-4 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          Cobrar / Finalizar Venta
        </button>
      </div>
    </div>
  );
};