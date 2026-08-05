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
import type { Product } from '../types/Product';


export const PosScreen: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
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
      // Consumo directo de los métodos de productService y categoryService
      const [productsData, categoriesData] = await Promise.all([
        productService.getProducts(undefined, true), // Filtramos para traer activos
        categoryService.getAll(),
      ]);
      setProducts(productsData);
      setCategories(categoriesData.map((c) => c.name));
    } catch (error) {
      console.error('Error al cargar datos del POS:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleConfirmSale = async (paymentMethod: PaymentMethod, customerId?: number) => {
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
      // Cerrar modal de pago
    setIsCheckoutOpen(false);

    // Mostrar modal de éxito
    setIsSuccessOpen(true);

    // Limpiar carrito
    clearCart();

    // Recargar inventario
    await loadData();

    //Modal de error
    } catch (error: any) {

      console.error(error);

      setIsCheckoutOpen(false);

      setErrorMessage(
        error.response?.data?.message ??
        'Ocurrió un error inesperado.'
      );

      setIsErrorOpen(true);

    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Cargando Punto de Venta...</div>;
  }

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-slate-950 text-slate-100">
      {/* Panel Izquierdo: Catálogo y Búsqueda */}
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
      <ErrorModal
        isOpen={isErrorOpen}
        message={errorMessage}
        onClose={() => setIsErrorOpen(false)}
      />
    </div>
  );
};