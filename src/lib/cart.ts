import { create } from "zustand";

export type CartItem = {
  id: string;
  title: string;
  variant: string; // e.g. "Pack of 5", "Standard", etc.
  price: number;
  quantity: number;
  imageColor: string;
  category: string;
  vendorName: string;
  priceNote: string;
};

type CartState = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  updateQuantity: (id: string, variant: string, quantity: number) => void;
  removeItem: (id: string, variant: string) => void;
  clearCart: () => void;
};

const CART_STORAGE_KEY = "novalyte-cart-v1";

function loadCartItems(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function persistCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {}
}

export const useCart = create<CartState>((set, get) => ({
  items: loadCartItems(),
  
  addItem: (newItem) => {
    const current = get().items;
    const qtyToAdd = newItem.quantity ?? 1;
    
    const existingIndex = current.findIndex(
      (item) => item.id === newItem.id && item.variant === newItem.variant
    );
    
    let next: CartItem[];
    if (existingIndex > -1) {
      next = current.map((item, idx) =>
        idx === existingIndex
          ? { ...item, quantity: item.quantity + qtyToAdd }
          : item
      );
    } else {
      next = [...current, { ...newItem, quantity: qtyToAdd }];
    }
    
    set({ items: next });
    persistCart(next);
  },
  
  updateQuantity: (id, variant, quantity) => {
    const current = get().items;
    if (quantity <= 0) {
      get().removeItem(id, variant);
      return;
    }
    
    const next = current.map((item) =>
      item.id === id && item.variant === variant
        ? { ...item, quantity }
        : item
    );
    
    set({ items: next });
    persistCart(next);
  },
  
  removeItem: (id, variant) => {
    const current = get().items;
    const next = current.filter(
      (item) => !(item.id === id && item.variant === variant)
    );
    
    set({ items: next });
    persistCart(next);
  },
  
  clearCart: () => {
    set({ items: [] });
    persistCart([]);
  },
}));
