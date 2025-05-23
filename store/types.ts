// store/types.ts
// Pastikan semua definisi interface yang sudah ada tetap ada
// Contoh saja, sesuaikan dengan definisi Anda yang sebenarnya

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
  productId: string; // ID produk yang terjual
  name: string;
  price: number;
  quantity: number;
}

export interface Transaction {
  id: string;
  timestamp: string; // Tanggal transaksi dibuat
  items: TransactionItem[];
  totalAmount: number; // Subtotal sebelum diskon
  discountAmount?: number; // Diskon (opsional)
  finalAmount: number; // Total akhir setelah diskon
}

export interface ProductState {
  products: Product[];
  addProduct: (product: Product) => void;
  updateProduct: (updatedProduct: Product) => void;
  deleteProduct: (id: string) => void;
  decreaseProductStock: (productId: string, quantity: number) => void;
  increaseProductStock: (productId: string, quantity: number) => void; // BARU: Tambahkan ini
  loadProducts: (products: Product[]) => void;
}

export interface CartState {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateCartItemQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  loadCart: (cart: CartItem[]) => void;
}

export interface TransactionState {
  transactions: Transaction[];
  addTransaction: (transactionData: Omit<Transaction, 'id' | 'timestamp'>) => void;
  deleteTransaction: (transactionId: string) => void; // BARU: Tambahkan ini
  loadTransactions: (transactions: Transaction[]) => void;
}

// AppStore menggabungkan semua state dan actions
export interface AppStore extends ProductState, CartState, TransactionState {
  // Fungsi-fungsi untuk menyimpan data ke AsyncStorage (jika dikelola manual)
  saveProducts: () => void;
  saveCart: () => void;
  saveTransactions: () => void;
  saveAllData: () => void;
  initData: () => Promise<void>;
}