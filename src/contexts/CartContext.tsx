import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { CartItem } from '../types';

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (slug: string) => void;
  clearCart: () => void;
  total: number;
  count: number;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart deve ser usado dentro de um CartProvider');
  }
  return context;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('caas_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('caas_cart', JSON.stringify(items));
  }, [items]);

  const addItem = (item: CartItem) => {
    setItems(prev => {
      if (prev.find(i => i.slug === item.slug)) return prev;
      return [...prev, item];
    });
    
    setToastMessage(`Adicionado: ${item.name}`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const removeItem = (slug: string) => {
    setItems(prev => prev.filter(i => i.slug !== slug));
  };

  const clearCart = () => {
    setItems([]);
  };

  const total = items.reduce((acc, item) => acc + (item.price || 0), 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clearCart, total, count: items.length }}>
      {children}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[100] bg-slate-900 dark:bg-emerald-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
          <span className="font-bold text-sm">{toastMessage}</span>
        </div>
      )}
    </CartContext.Provider>
  );
}
