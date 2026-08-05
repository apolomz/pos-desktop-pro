import { useState, useMemo } from 'react';
import type { Product } from '../types/Product';
import type { CartItem } from '../types/pos';

export const useCart = () => {
  const [cart, setCart] = useState<CartItem[]>([]);

  // HU-007: Agregar al carrito o incrementar si ya existe
  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.product.id === product.id);
      
      if (existingIndex > -1) {
        const existingItem = prevCart[existingIndex];
        if (existingItem.quantity >= product.stock) return prevCart; // Validar límite de stock

        const updatedCart = [...prevCart];
        const newQty = existingItem.quantity + 1;
        updatedCart[existingIndex] = {
          ...existingItem,
          quantity: newQty,
          subtotal: newQty * product.price,
        };
        return updatedCart;
      }

      return [...prevCart, { product, quantity: 1, subtotal: product.price }];
    });
  };

  // HU-008: Modificar cantidad directamente
  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.product.id === productId) {
          const validQty = Math.min(quantity, item.product.stock);
          return {
            ...item,
            quantity: validQty,
            subtotal: validQty * item.product.price,
          };
        }
        return item;
      })
    );
  };

  // HU-009: Eliminar producto
  const removeFromCart = (productId: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
  };

  // HU-012: Cancelar/Limpiar venta
  const clearCart = () => setCart([]);

  // HU-010: Totales en tiempo real
  const totals = useMemo(() => {
    const subtotal = cart.reduce((acc, item) => acc + item.subtotal, 0);
    const tax = 0; // Cambiar según reglas impositivas
    const total = subtotal + tax;
    return { subtotal, tax, total };
  }, [cart]);

  return {
    cart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    ...totals,
  };
};