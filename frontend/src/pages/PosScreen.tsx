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
import { Lock, Unlock, Loader2, Store } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

export const PosScreen: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeShift, setActiveShift] = useState<CashShift | null>(null);

  const [openShiftModal, setOpenShiftModal] = useState(false);
  const [closeShiftModal, setCloseShiftModal] = useState(false);
  const [initialBaseInput, setInitialBaseInput] = useState<number>(50000);
  const [actualFinalAmountInput, setActualFinalAmountInput] = useState<number>(0);
  const [shiftNotesInput, setShiftNotesInput] = useState('');
  const [processingShift, setProcessingShift] = useState(false);

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
    setProcessingShift(true);
    try {
      const shift = await cashShiftService.openShift(initialBaseInput);
      setActiveShift(shift);
      setOpenShiftModal(false);
    } catch (err: any) {
      setErrorMessage(err.friendlyMessage || err.response?.data?.message || 'No se pudo abrir el turno de caja.');
      setIsErrorOpen(true);
    } finally {
      setProcessingShift(false);
    }
  };

  const handleCloseShiftSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeShift) return;
    setProcessingShift(true);
    try {
      await cashShiftService.closeShift(activeShift.id, actualFinalAmountInput, shiftNotesInput);
      setActiveShift(null);
      setCloseShiftModal(false);
      clearCart();
    } catch (err: any) {
      setErrorMessage(err.friendlyMessage || err.response?.data?.message || 'No se pudo cerrar el turno. Verifica los valores ingresados.');
      setIsErrorOpen(true);
    } finally {
      setProcessingShift(false);
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
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center bg-slate-950 text-slate-400 gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
        <span>Cargando Punto de Venta...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-slate-950 text-slate-100">
      {/* Header Superior del POS: Estado del Turno */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600/20 border border-indigo-500/30 rounded-xl text-indigo-400">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-white text-sm">Punto de Venta (POS)</h2>
            <p className="text-[11px] text-slate-400">Terminal Operativa de Facturación</p>
          </div>
        </div>

        {activeShift ? (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-1.5 rounded-xl">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-emerald-400">Turno Activo #{activeShift.id}</span>
              <span className="text-slate-400 text-xs font-mono ml-1">(Base: {formatCurrency(activeShift.initialBase)})</span>
            </div>

            <button
              onClick={() => {
                setActualFinalAmountInput(activeShift.expectedFinalAmount || activeShift.initialBase);
                setCloseShiftModal(true);
              }}
              className="flex items-center gap-2 px-3.5 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-semibold transition-all cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>Cerrar Turno</span>
            </button>
          </div>
        ) : (
          <button
            onClick={() => setOpenShiftModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <Unlock className="w-4 h-4" />
            <span>Abrir Turno de Caja</span>
          </button>
        )}
      </div>

      {/* ÁREA PRINCIPAL POS: Estado Vacío vs Catálogo Activo */}
      {!activeShift ? (
        /* ESTADO VACÍO (EMPTY STATE) CUANDO EL TURNO ESTÁ CERRADO */
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-950">
          <div className="bg-slate-900/60 border border-slate-800 p-8 sm:p-12 rounded-3xl max-w-md w-full shadow-2xl space-y-6 flex flex-col items-center">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-amber-400 shadow-inner">
              <Lock className="w-12 h-12 stroke-[1.5]" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">Turno de Caja Cerrado</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Debes abrir un turno e ingresar la base inicial en efectivo para comenzar a realizar ventas.
              </p>
            </div>

            <button
              onClick={() => setOpenShiftModal(true)}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Unlock className="w-5 h-5" />
              <span>Abrir Turno de Caja</span>
            </button>
          </div>
        </div>
      ) : (
        /* CATÁLOGO Y CARRITO ACTIVOS CUANDO EL TURNO ESTÁ ABIERTO */
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
              onCheckout={() => setIsCheckoutOpen(true)}
            />
          </div>
        </div>
      )}

      {/* Modal: Apertura de Turno de Caja */}
      {openShiftModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Unlock className="w-5 h-5 text-emerald-400" />
              <span>Apertura de Turno de Caja</span>
            </h3>
            <p className="text-xs text-slate-400">
              Ingresa el monto base en efectivo disponible en la gaveta para iniciar ventas.
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
                  disabled={processingShift}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {processingShift ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirmar Apertura'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Cierre de Turno de Caja */}
      {closeShiftModal && activeShift && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-rose-400" />
              <span>Cierre de Turno y Arqueo</span>
            </h3>
            <p className="text-xs text-slate-400">
              Ingresa el conteo físico de dinero en efectivo para cerrar el turno de caja.
            </p>
            <form onSubmit={handleCloseShiftSubmit} className="space-y-4">
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Efectivo Esperado:</span>
                  <span className="font-mono text-indigo-400 font-bold">{formatCurrency(activeShift.expectedFinalAmount)}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Efectivo Físico Reportado ($)</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={actualFinalAmountInput}
                  onChange={(e) => setActualFinalAmountInput(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Notas / Observaciones</label>
                <input
                  type="text"
                  value={shiftNotesInput}
                  onChange={(e) => setShiftNotesInput(e.target.value)}
                  placeholder="Ej: Cierre normal sin novedades..."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCloseShiftModal(false)}
                  className="flex-1 py-2.5 bg-slate-800 text-slate-300 text-sm font-medium rounded-xl hover:bg-slate-700 transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={processingShift}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-sm font-medium rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {processingShift ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirmar Cierre'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modales de Cobro, Éxito y Error */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        total={total}
        onClose={() => setIsCheckoutOpen(false)}
        onConfirm={handleConfirmSale}
      />
      <SuccessModal
        isOpen={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
      />
      <ErrorModal
        isOpen={isErrorOpen}
        message={errorMessage}
        onClose={() => setIsErrorOpen(false)}
      />
    </div>
  );
};