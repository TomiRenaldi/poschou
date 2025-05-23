// store/transactionSlice.ts
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { StateCreator } from 'zustand';
import { AppStore, Transaction, TransactionState } from './types';

export const createTransactionSlice: StateCreator<AppStore, [], [], TransactionState> = (set, get) => ({
  transactions: [],
  // UBAH TIPE ARGUMEN addTransaction:
  addTransaction: (transactionData: Omit<Transaction, 'id' | 'date'>) => {
    const newTransaction: Transaction = {
      ...transactionData, // Sekarang ini sudah termasuk totalAmount, discountAmount, finalAmount
      id: uuidv4(),
      date: new Date().toISOString(), // Simpan dalam format ISO string
    };
    set((state) => ({
      transactions: [...state.transactions, newTransaction],
    }));
    get().saveTransactions();
  },
  loadTransactions: (transactions: Transaction[]) => {
    set({ transactions });
  },
});