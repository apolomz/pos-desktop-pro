import React, { useEffect, useState } from 'react';
import { ProductCatalog } from '../components/ProductCatalog';
import { CartPanel } from '../components/CartPanel';
import { CheckoutModal } from '../components/CheckoutModal';
import { useCart } from '../hooks/useCart';
import { SuccessModal } from '../components/SuccessModal';
import { ErrorModal } from '../components/ErrorModal';
import { createSale, type PaymentMethod } from '../services/saleService';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import { cashShiftService, type CashShift } from '../services/cashShiftService';
import type { Product } from '../types/Product';
import { AlertTriangle, Unlock, Loader2 } from 'lucide-react';

export const PosScreen: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeShift, setActiveShift] = useState<CashShift | null>(null);
  
  const [openShiftModal, setOpenShiftModal] = useState(false);
  const [initialBaseInput, setInitialBaseInput] = useState<number>(50000);
  const [openingShift, setOpeningShift] = useState(false);

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [isErrorOpen, setIsErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const {
    cart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    tax,
    total,
  } = useCart();

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsData, categoriesData, shiftData] = await Promise.all([
        productService.getProducts(undefined, true),
        categoryService.getAll(),
        cashShiftService.getActiveShift().catch(() => null),
      ]);
      setProducts(productsData);
      setCategories(categoriesData.map((c) => c.name));
      setActiveShift(shiftData);
    } catch (error) {
      console.error('Error al cargar datos del POS:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenShiftSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOpeningShift(true);
    try {
      const shift = await cashShiftService.openShift(initialBaseInput);
      setActiveShift(shift);
      setOpenShiftModal(false);
    } catch (err: any) {
      alert(err.friendlyMessage || err.response?.data?.message || 'Error al abrir el turno de caja.');
    } finally {
      setOpeningShift(false);
    }
  };

  const handleConfirmSale = async (paymentMethod: PaymentMethod, customerId?: number) => {
    if (!activeShift) {
      setIsCheckoutOpen(false);
      setErrorMessage('No hay un turno de caja abierto. Abre caja antes de registrar la venta.');
      setIsErrorOpen(true);
      return;
    }

    try {
      const salePayload = {
        items: cart.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
        paymentMethod,
        customerId,
      };

      await createSale(salePayload);
      setIsCheckoutOpen(false);
      setIsSuccessOpen(true);
      clearCart();
      await loadData();
    } catch (error: any) {
      console.error(error);
      setIsCheckoutOpen(false);
      setErrorMessage(
        error.friendlyMessage ||
        error.response?.data?.message ||
        'Ocurrió un error inesperado al procesar la venta.'
      );
      setIsErrorOpen(true);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-400">Cargando Punto de Venta...</div>;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-slate-950 text-slate-100">
      {/* Banner Informativo si NO hay turno de caja abierto */}
      {!activeShift && (
        <div className="bg-amber-500/10 border-b border-amber-500/30 px-6 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 text-amber-300 text-xs sm:text-sm font-medium">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <span>
              <strong>Turno de Caja Cerrado:</strong> Para poder registrar ventas, debes abrir turno e ingresar la base inicial de caja.
            </span>
          </div>
          <button
            onClick={() => setOpenShiftModal(true)}
            className="flex items-center gap-2 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer shrink-0"
          >
            <Unlock className="w-4 h-4" />
            <span>Abrir Turno Ahora</span>
          </button>
        </div>
      )}

      {/* Área Principal POS */}
      <div className="flex flex-1 overflow-hidden">
        {/* Panel Izquierdo: Catálogo */}
        <div className="flex-1 p-4 overflow-hidden">
          <ProductCatalog
            products={products}
            categories={categories}
            onSelectProduct={addToCart}
          />
        </div>

        {/* Panel Derecho: Carrito */}
        <div className="w-96 flex-shrink-0">
          <CartPanel
            cart={cart}
            subtotal={subtotal}
            tax={tax}
            total={total}
            onUpdateQty={updateQuantity}
            onRemove={removeFromCart}
            onClear={clearCart}
            onCheckout={() => {
              if (!activeShift) {
                setOpenShiftModal(true);
              } else {
                setIsCheckoutOpen(true);
              }
            }}
          />
        </div>
      </div>

      {/* Modal Directo de Apertura de Turno de Caja */}
      {openShiftModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Unlock className="w-5 h-5 text-emerald-400" />
              <span>Apertura Rápida de Caja</span>
            </h3>
            <p className="text-xs text-slate-400">
              Ingresa el monto base inicial en efectivo disponible en la gaveta para iniciar las operaciones de venta.
            </p>
            <form onSubmit={handleOpenShiftSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Base Inicial ($)</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={initialBaseInput}
                  onChange={(e) => setInitialBaseInput(Number(e.target.value))}
                  placeholder="50000"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-lg"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOpenShiftModal(false)}
                  className="flex-1 py-2.5 bg-slate-800 text-slate-300 text-sm font-medium rounded-xl hover:bg-slate-700 transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={openingShift}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {openingShift ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirmar Apertura'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Cobro */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        total={total}
        onClose={() => setIsCheckoutOpen(false)}
        onConfirm={handleConfirmSale}
      />
      {/* Modal de Venta Exitosa */}
      <SuccessModal
        isOpen={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
      />
      {/* Modal de Error */}
      <ErrorModal
        isOpen={isErrorOpen}
        message={errorMessage}
        onClose={() => setIsErrorOpen(false)}
      />
    </div>
  );
};