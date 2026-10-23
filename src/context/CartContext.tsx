import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Product } from '../types/product';
import type { CartItem } from '../types/cart';
import { loadCartFromStorage, saveCartToStorage, clearCartStorage } from '../lib/storage';

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  totalCOP: number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (product: Product, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => loadCartFromStorage());
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Sincronizar con almacenamiento local en cada cambio
  useEffect(() => {
    saveCartToStorage(items);
  }, [items]);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const addItem = (product: Product, quantity = 1) => {
    if (!product.is_available || !product.is_active) {
      alert('Este producto no se encuentra disponible actualmente para pedidos.');
      return;
    }

    const safeQty = Math.max(1, Math.floor(quantity));

    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => item.product.id === product.id);

      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + safeQty,
          // Actualizar datos del producto por si hubo cambios de precio
          product: product,
        };
        return updated;
      }

      return [...prevItems, { product, quantity: safeQty }];
    });

    setIsCartOpen(true);
  };

  const updateQuantity = (productId: string, quantity: number) => {
    const safeQty = Math.floor(quantity);

    setItems((prevItems) => {
      if (safeQty <= 0) {
        return prevItems.filter((item) => item.product.id !== productId);
      }

      return prevItems.map((item) =>
        item.product.id === productId ? { ...item, quantity: safeQty } : item
      );
    });
  };

  const removeItem = (productId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setItems([]);
    clearCartStorage();
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalCOP = items.reduce((sum, item) => sum + item.product.price_cop * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        totalCOP,
        isCartOpen,
        openCart,
        closeCart,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe ser utilizado dentro de un CartProvider');
  }
  return context;
};
