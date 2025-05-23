// store/productSlice.ts
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { StateCreator } from 'zustand';
import { AppStore, Product, ProductState } from './types';

export const createProductSlice: StateCreator<AppStore, [], [], ProductState> = (set, get) => ({
  products: [],
  // UBAH BARIS INI: Tambahkan Omit<Product, 'id'>
  addProduct: (productData: Omit<Product, 'id'>) => {
    set((state) => ({
      products: [...state.products, { ...productData, id: uuidv4() }], // ID dibuat di sini
    }));
    get().saveProducts();
  },
  updateProduct: (updatedProduct: Product) => {
    set((state) => ({
      products: state.products.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)),
    }));
    get().saveProducts();
  },
  deleteProduct: (id: string) => {
    set((state) => ({
      products: state.products.filter((p) => p.id !== id),
    }));
    get().saveProducts();
  },
  decreaseProductStock: (productId: string, quantity: number) => {
    set((state) => ({
      products: state.products.map((p) =>
        p.id === productId ? { ...p, stock: p.stock - quantity } : p
      ),
    }));
    get().saveProducts();
  },
  loadProducts: (products: Product[]) => {
    set({ products });
  },
});