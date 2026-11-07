'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Cart, CartItem } from '@/lib/format';

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  addToCart: (productId: number, quantity?: number, variationId?: number | null) => Promise<void>;
  updateQuantity: (cartItemId: number, quantity: number) => Promise<void>;
  removeItem: (cartItemId: number) => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const refreshCart = async () => {
    try {
      const res = await fetch('/api/cart');
      if (res.ok) {
        const data = await res.json();
        setCart(data.cart);
      }
    } catch (e) {
      console.error('Failed to load cart', e);
    }
  };

  useEffect(() => {
    refreshCart();
  }, []);

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);

  const addToCart = async (productId: number, quantity = 1, variationId?: number | null) => {
    setLoading(true);
    try {
      const res = await fetch('/api/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity, variationId }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to add item to bag');
      }
      setCart(data.cart);
      openDrawer();
    } catch (error: any) {
      alert(error.message || 'Could not add to bag');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (cartItemId: number, quantity: number) => {
    try {
      const res = await fetch('/api/cart/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartItemId, quantity }),
      });
      const data = await res.json();
      if (res.ok && data.cart) {
        setCart(data.cart);
      }
    } catch (e) {
      console.error('Failed to update quantity', e);
    }
  };

  const removeItem = async (cartItemId: number) => {
    try {
      const res = await fetch(`/api/cart/item/${cartItemId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.cart) {
        setCart(data.cart);
      }
    } catch (e) {
      console.error('Failed to remove item', e);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        isDrawerOpen,
        openDrawer,
        closeDrawer,
        addToCart,
        updateQuantity,
        removeItem,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
