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
    <div className="flex flex-col h-full p-4 bg-slate-900 border-l border-slate-800 shadow-2xl">
      <div className="flex justify-between items-center pb-3 border-b border-slate-800">
        <h2 className="text-lg font-bold text-slate-100">Venta Actual</h2>
        {cart.length > 0 && (
          <button onClick={onClear} className="text-rose-400 text-xs font-semibold hover:text-rose-300 transition">
            Vaciar Carrito
          </button>
        )}
      </div>

      {/* Ítems del carrito */}
      <div className="flex-1 overflow-y-auto space-y-3 py-4 pr-1">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 text-sm">
            <span>El carrito está vacío</span>
            <span className="text-xs text-slate-600 mt-1">Selecciona productos para comenzar</span>
          </div>
        ) : (
          cart.map(({ product, quantity, subtotal: itemSubtotal }) => (
            <div key={product.id} className="flex items-center justify-between bg-slate-800/60 border border-slate-700/50 p-2.5 rounded-lg">
              <div className="flex-1 pr-2">
                <p className="font-semibold text-sm text-slate-100 line-clamp-1">{product.name}</p>
                <p className="text-xs text-slate-400">${product.price.toLocaleString()} c/u</p>
              </div>

              {/* Controles de Cantidad */}
              <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 rounded-lg p-1">
                <button
                  onClick={() => onUpdateQty(product.id, quantity - 1)}
                  className="w-5 h-5 flex items-center justify-center text-slate-300 font-bold hover:bg-slate-800 rounded transition"
                >
                  -
                </button>
                <span className="text-xs font-bold text-slate-100 px-1">{quantity}</span>
                <button
                  onClick={() => onUpdateQty(product.id, quantity + 1)}
                  className="w-5 h-5 flex items-center justify-center text-slate-300 font-bold hover:bg-slate-800 rounded transition"
                >
                  +
                </button>
              </div>

              <span className="w-16 text-right font-bold text-sm text-slate-200 ml-2">${itemSubtotal.toLocaleString()}</span>

              <button onClick={() => onRemove(product.id)} className="ml-2 text-slate-500 hover:text-rose-400 transition">
                ✕
              </button>
            </div>
          ))
        )}
      </div>

      {/* Totales */}
      <div className="border-t border-slate-800 pt-4 space-y-2">
        <div className="flex justify-between text-xs text-slate-400">
          <span>Subtotal:</span>
          <span className="text-slate-200">${subtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-xs text-slate-400">
          <span>Impuestos (IVA):</span>
          <span className="text-slate-200">${tax.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-lg font-bold text-slate-100 border-t border-slate-800/80 pt-2">
          <span>Total:</span>
          <span className="text-indigo-400">${total.toLocaleString()}</span>
        </div>

        {/* Botón de Checkout */}
        <button
          disabled={cart.length === 0}
          onClick={onCheckout}
          className="w-full mt-3 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg shadow-lg shadow-indigo-600/30 disabled:opacity-40 disabled:shadow-none disabled:cursor-not-allowed transition"
        >
          Cobrar / Finalizar Venta
        </button>
      </div>
    </div>
  );
};