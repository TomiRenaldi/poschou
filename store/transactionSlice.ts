// store/transactionSlices.ts
import { v4 as uuidv4 } from 'uuid'; // Pastikan uuidv4 diimpor
import { StateCreator } from 'zustand';
import { AppStore, Transaction, TransactionState } from './types';

export const createTransactionSlice: StateCreator<AppStore, [], [], TransactionState> = (set, get) => ({
  transactions: [],
  addTransaction: (transactionData) => {
    const newTransaction: Transaction = {
      id: uuidv4(), // Generate unique ID
      timestamp: new Date().toISOString(), // Current timestamp
      ...transactionData,
    };
    set(state => ({
      transactions: [newTransaction, ...state.transactions], // Tambahkan di awal agar yang terbaru di atas
    }));
    get().saveTransactions(); // Simpan ke storage
  },
  // BARU: Fungsi untuk menghapus transaksi
  deleteTransaction: (transactionId: string) => {
    const state = get(); // Dapatkan state saat ini
    const transactionToDelete = state.transactions.find(t => t.id === transactionId);

    if (transactionToDelete) {
      // Kembalikan stok produk yang terkait
      transactionToDelete.items.forEach(item => {
        state.increaseProductStock(item.productId, item.quantity); // Panggil fungsi dari productSlice
      });

      // Hapus transaksi dari daftar
      set(state => ({
        transactions: state.transactions.filter(t => t.id !== transactionId),
      }));
      get().saveTransactions(); // Simpan perubahan transaksi
    }
  },
  loadTransactions: (transactions: Transaction[]) => {
    set({ transactions });
  },
});