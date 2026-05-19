import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface CartItem {
  sku: string;
  title: string;
  price: number;
  qty: number;
  metadata?: any;
}

interface Cart {
  cartId: string;
  items: CartItem[];
  context?: {
    cnpj?: string;
    companyName?: string;
  };
  totals: {
    total: number;
  };
}

interface CartContextType {
  cart: Cart;
  addToCart: (item: Omit<CartItem, 'qty'>, context?: any, openDrawer?: boolean) => Promise<void>;
  removeFromCart: (index: number) => Promise<void>;
  clearCart: () => Promise<void>;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
  loading: boolean;
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
  const [cart, setCart] = useState<Cart>({ cartId: '', items: [], totals: { total: 0 } });
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedCartId = localStorage.getItem('cartId');
    const initialCartId = savedCartId || uuidv4();
    if (!savedCartId) localStorage.setItem('cartId', initialCartId);

    // Initial load from localStorage for speed and fallback
    const localCart = localStorage.getItem('microcaas_cart');
    if (localCart) {
      try {
        setCart(JSON.parse(localCart));
      } catch (e) {}
    }

    fetchCart(initialCartId);
  }, []);

  const saveLocal = (newCart: Cart) => {
    localStorage.setItem('microcaas_cart', JSON.stringify(newCart));
    setCart(newCart);
  };

  const fetchCart = async (id: string) => {
    setLoading(true);
    try {
      const resp = await fetch(`/api/cart/get?cartId=${id}`);
      if (resp.ok) {
        const data = await resp.json();
        const updatedCart = {
          cartId: id,
          items: data.items || [],
          totals: data.totals || { total: 0 }
        };
        saveLocal(updatedCart);
      }
    } catch (e) {
      console.error("Fetch cart error", e);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (item: Omit<CartItem, 'qty'>, context?: any, openDrawer = true) => {
    setLoading(true);
    // Optimistic / Fallback Update
    const currentItems = [...cart.items];
    const existingIndex = currentItems.findIndex(i => i.sku === item.sku && JSON.stringify(i.metadata) === JSON.stringify(item.metadata));
    
    if (existingIndex > -1) {
      currentItems[existingIndex].qty += 1;
    } else {
      currentItems.push({ ...item, qty: 1 });
    }
    
    const newTotal = currentItems.reduce((acc, i) => acc + (i.price * i.qty), 0);
    const optimisticCart = { ...cart, items: currentItems, totals: { total: newTotal } };
    saveLocal(optimisticCart);

    try {
      const resp = await fetch('/api/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartId: cart.cartId,
          ...item,
          qty: 1,
          context: context || {}
        })
      });
      if (resp.ok) {
        const data = await resp.json();
        saveLocal(data);
      }
    } catch (e) {
      console.error("Add to cart error", e);
      // We already updated local state optimistically
    } finally {
      setLoading(false);
      if (openDrawer) {
        setIsDrawerOpen(true);
      }
    }
  };

  const removeFromCart = async (index: number) => {
    setLoading(true);
    // Optimistic Update
    const currentItems = [...cart.items];
    currentItems.splice(index, 1);
    const newTotal = currentItems.reduce((acc, i) => acc + (i.price * i.qty), 0);
    const optimisticCart = { ...cart, items: currentItems, totals: { total: newTotal } };
    saveLocal(optimisticCart);

    try {
      const resp = await fetch('/api/cart/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartId: cart.cartId,
          index
        })
      });
      if (resp.ok) {
        const data = await resp.json();
        saveLocal(data);
      }
    } catch (e) {
      console.error("Remove from cart error", e);
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    setLoading(true);
    saveLocal({ ...cart, items: [], totals: { total: 0 } });
    try {
      await fetch('/api/cart/clear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartId: cart.cartId })
      });
    } catch (e) {
      console.error("Clear cart error", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, isDrawerOpen, setIsDrawerOpen, loading }}>
      {children}
    </CartContext.Provider>
  );
}
