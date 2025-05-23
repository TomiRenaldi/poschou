// store/types.ts

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface TransactionItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Transaction {
  id: string;
  date: string;
  items: TransactionItem[];
  totalAmount: number;
  discountAmount?: number; // TAMBAHKAN PROPERTI INI (opsional, bisa 0)
  finalAmount: number; // TAMBAHKAN PROPERTI INI: total setelah diskon
}

// State untuk setiap slice
export interface ProductState {
  products: Product[];
  // PASTIKAN INI SESUAI:
  addProduct: (product: Omit<Product, 'id'>) => void; // Perbarui ke Omit<Product, 'id'>
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  decreaseProductStock: (productId: string, quantity: number) => void;
  loadProducts: (products: Product[]) => void;
}

export interface CartState {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartItemQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

export interface TransactionState {
  transactions: Transaction[];
  // Pastikan addTransaction menerima Omit<Transaction, 'id' | 'date' | 'finalAmount'>
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => void;
  loadTransactions: (transactions: Transaction[]) => void;
}

// Tambahkan definisi untuk fungsi-fungsi helper yang ada di store utama
export interface AppStore extends ProductState, CartState, TransactionState {
  saveProducts: () => Promise<void>; // Menambahkan ini
  saveTransactions: () => Promise<void>; // Menambahkan ini
  loadData: () => Promise<void>; // Menambahkan ini
}