// store/productSlices.ts
import { StateCreator } from 'zustand';
import { AppStore, Product, ProductState } from './types';

export const createProductSlice: StateCreator<AppStore, [], [], ProductState> = (set, get) => ({
  products: [],
  addProduct: (product: Product) => {
    set(state => ({
      products: [...state.products, product],
    }));
    get().saveProducts();
  },
  updateProduct: (updatedProduct: Product) => {
    set(state => ({
      products: state.products.map(p => (p.id === updatedProduct.id ? updatedProduct : p)),
    }));
    get().saveProducts();
  },
  deleteProduct: (id: string) => {
    set(state => ({
      products: state.products.filter(p => p.id !== id),
    }));
    get().saveProducts();
  },
  decreaseProductStock: (productId: string, quantity: number) => {
    set(state => ({
      products: state.products.map(p =>
        p.id === productId ? { ...p, stock: Math.max(0, p.stock - quantity) } : p
      ),
    }));
    get().saveProducts();
  },
  // BARU: Fungsi untuk menambah stok produk
  increaseProductStock: (productId: string, quantity: number) => {
    set(state => ({
      products: state.products.map(p =>
        p.id === productId ? { ...p, stock: p.stock + quantity } : p // Tambah stok
      ),
    }));
    get().saveProducts();
  },
  loadProducts: (products: Product[]) => {
    set({ products });
  },
});