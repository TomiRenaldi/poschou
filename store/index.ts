// store/index.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { createCartSlice } from './cartSlice';
import { createProductSlice } from './productSlice';
import { createTransactionSlice } from './transactionSlice';
import { AppStore } from './types';

export const useAppStore = create<AppStore>()(
  persist(
    (set, get, api) => ({
      // Menggabungkan semua slice
      ...createProductSlice(set, get, api),
      ...createCartSlice(set, get, api),
      ...createTransactionSlice(set, get, api),

      // Fungsi untuk menyimpan data ke Async Storage
      // Fungsi ini akan dipanggil oleh action dari slice
      saveProducts: async () => {
        const products = get().products;
        await AsyncStorage.setItem('pos-app-products', JSON.stringify(products));
      },
      saveTransactions: async () => {
        const transactions = get().transactions;
        await AsyncStorage.setItem('pos-app-transactions', JSON.stringify(transactions));
      },

      // Fungsi untuk memuat data dari Async Storage saat aplikasi dimulai
      loadData: async () => {
        try {
          const productsData = await AsyncStorage.getItem('pos-app-products');
          if (productsData) {
            get().loadProducts(JSON.parse(productsData));
          }

          const transactionsData = await AsyncStorage.getItem('pos-app-transactions');
          if (transactionsData) {
            get().loadTransactions(JSON.parse(transactionsData));
          }
        } catch (error) {
          console.error('Failed to load data from Async Storage', error);
        }
      },
    }),
    {
      name: 'pos-app-storage', // Nama unik untuk storage
      storage: createJSONStorage(() => AsyncStorage),
      // Middleware persist Zustand tidak akan menangani 'loadData', 'saveProducts', 'saveTransactions'
      // karena kita ingin mengelola penyimpanan secara manual di dalam aksi kita.
      // Jadi, kita hanya perlu men exclude states yang tidak ingin disimpan otomatis oleh persist.
      partialize: (state) => ({
          products: state.products,
          transactions: state.transactions,
      }),
      onRehydrateStorage: (state) => {
        // Ini akan dipanggil setelah data dihidrasi dari storage
        // Kita tidak perlu melakukan apa-apa di sini karena loadData akan dipanggil terpisah
      }
    }
  )
);