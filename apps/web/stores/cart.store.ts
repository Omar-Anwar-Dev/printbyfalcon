'use client';

import { create } from 'zustand';
import type { CartItem } from '../lib/api';

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  itemCount: number;
  subtotal: number;
  setCart: (items: CartItem[], subtotal: number) => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  isOpen: false,
  itemCount: 0,
  subtotal: 0,

  setCart: (items, subtotal) => {
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    set({ items, subtotal, itemCount });
  },

  openDrawer: () => set({ isOpen: true }),
  closeDrawer: () => set({ isOpen: false }),
  toggleDrawer: () => set((s) => ({ isOpen: !s.isOpen })),
}));
