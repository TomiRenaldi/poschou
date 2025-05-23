// store/cartSlice.ts
import { StateCreator } from 'zustand';
import { AppStore, CartState, Product } from './types';

export const createCartSlice: StateCreator<AppStore, [], [], CartState> = (set) => ({
  cart: [],
  addToCart: (product: Product, quantity: number = 1) => {
    set((state) => {
      const existingItem = state.cart.find((item) => item.id === product.id);

      if (existingItem) {
        // Jika produk sudah ada di keranjang, tingkatkan kuantitas
        return {
          cart: state.cart.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          ),
        };
      } else {
        // Jika produk belum ada, tambahkan sebagai item baru
        return {
          cart: [...state.cart, { ...product, quantity }],
        };
      }
    });
  },
  removeFromCart: (productId: string) => {
    set((state) => ({
      cart: state.cart.filter((item) => item.id !== productId),
    }));
  },
  updateCartItemQuantity: (productId: string, quantity: number) => {
    set((state) => ({
      cart: state.cart.map((item) =>
        item.id === productId ? { ...item, quantity: quantity } : item
      ).filter(item => item.quantity > 0), // Hapus item jika kuantitas <= 0
    }));
  },
  clearCart: () => {
    set({ cart: [] });
  },
});