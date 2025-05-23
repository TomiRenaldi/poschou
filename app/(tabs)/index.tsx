// app/(tabs)/index.tsx
import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import CartItemDisplay from '../../components/CartItemDisplay';
import ProductCard from '../../components/ProductCard';
import { useAppStore } from '../../store';
import { Product, TransactionItem } from '../../store/types';

const PRODUCT_CARD_FULL_HEIGHT = 166; // Sesuaikan nilai ini jika Anda mengubah styling ProductCard

export default function PosScreen() {
  const {
    products,
    cart,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    addTransaction,
    decreaseProductStock,
  } = useAppStore();

  const [discountInput, setDiscountInput] = useState('0');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = useMemo(() => {
    if (!searchTerm) {
      return products;
    }
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    return products.filter(product =>
      product.name.toLowerCase().includes(lowercasedSearchTerm)
    );
  }, [products, searchTerm]);

  const getItemLayout = useCallback(
    (data: any, index: number) => ({
      length: PRODUCT_CARD_FULL_HEIGHT,
      offset: PRODUCT_CARD_FULL_HEIGHT * index,
      index,
    }),
    []
  );

  // --- PASTIKAN URUTAN DEKLARASI USEMEMO INI BENAR ---
  const calculateSubtotal = useMemo(() => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [cart]);

  const parsedDiscount = useMemo(() => {
    const discount = parseFloat(discountInput);
    return isNaN(discount) || discount < 0 ? 0 : discount;
  }, [discountInput]);

  const calculateFinalTotal = useMemo(() => { // calculateFinalTotal setelah yang lain
    const subtotal = calculateSubtotal;
    const final = subtotal - parsedDiscount;
    return final < 0 ? 0 : final;
  }, [calculateSubtotal, parsedDiscount]);
  // --- AKHIR URUTAN DEKLARASI USEMEMO ---


  const handleAddToCart = useCallback((product: Product) => {
    const existingCartItem = cart.find(item => item.id === product.id);
    if (existingCartItem && existingCartItem.quantity >= product.stock) {
      Alert.alert('Stok Habis', `Stok ${product.name} hanya tersisa ${product.stock}.`);
      return;
    }
    addToCart(product);
  }, [cart, addToCart, products]);

  const handleUpdateCartQuantity = useCallback((productId: string, newQuantity: number) => {
    const productInStore = products.find(p => p.id === productId);
    if (!productInStore) return;

    if (newQuantity > productInStore.stock) {
      Alert.alert('Stok Tidak Cukup', `Stok ${productInStore.name} hanya tersisa ${productInStore.stock}.`);
      return;
    }

    updateCartItemQuantity(productId, newQuantity);
  }, [products, updateCartItemQuantity]);

  const handleCheckout = useCallback(() => {
    if (cart.length === 0) {
      Alert.alert('Keranjang Kosong', 'Tidak ada item di keranjang untuk checkout.');
      return;
    }

    const subtotal = calculateSubtotal;
    const finalTotal = calculateFinalTotal; // calculateFinalTotal sekarang sudah terdefinisi
    const discount = parsedDiscount;

    if (discount > subtotal) {
        Alert.alert('Diskon Terlalu Besar', 'Diskon tidak boleh melebihi subtotal belanja.');
        return;
    }

    Alert.alert(
      'Konfirmasi Pembayaran',
      `Subtotal: Rp ${subtotal.toLocaleString('id-ID')}\n` +
      `Diskon: Rp ${discount.toLocaleString('id-ID')}\n` +
      `Total Akhir: Rp ${finalTotal.toLocaleString('id-ID')}`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Bayar',
          onPress: () => {
            const transactionItems: TransactionItem[] = cart.map((item) => ({
              productId: item.id,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
            }));

            addTransaction({
              items: transactionItems,
              totalAmount: subtotal,
              discountAmount: discount,
              finalAmount: finalTotal,
            });

            cart.forEach((item) => {
              decreaseProductStock(item.id, item.quantity);
            });

            clearCart();
            setDiscountInput('0');
            Alert.alert('Berhasil!', 'Pembayaran berhasil dan stok telah diperbarui.');
          },
        },
      ]
    );
  }, [cart, calculateSubtotal, parsedDiscount, calculateFinalTotal, addTransaction, decreaseProductStock, clearCart, setDiscountInput]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : -500}
      >
        <Text style={styles.headerTitle}>Kasir Belanja</Text>

        <View style={styles.searchContainer}>
            <TextInput
                style={styles.searchInput}
                placeholder="Cari produk..."
                value={searchTerm}
                onChangeText={setSearchTerm}
                clearButtonMode="while-editing"
            />
        </View>

        <View style={styles.productsSection}>
          <FlatList
            data={filteredProducts}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ProductCard product={item} onAddToCart={handleAddToCart} />
            )}
            numColumns={2}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.productListContainer}
            ListEmptyComponent={
                <Text style={styles.emptyText}>
                    {searchTerm ? "Produk tidak ditemukan." : "Tidak ada produk untuk dijual."}
                </Text>
            }
            getItemLayout={getItemLayout}
            initialNumToRender={10}
            maxToRenderPerBatch={5}
            windowSize={21}
          />
        </View>

        <View style={styles.cartSummarySection}>
            <FlatList
                data={cart}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <CartItemDisplay
                        item={item}
                        onUpdateQuantity={handleUpdateCartQuantity}
                        onRemove={removeFromCart}
                    />
                )}
                ListEmptyComponent={<Text style={styles.emptyCartText}>Keranjang kosong.</Text>}
                contentContainerStyle={styles.cartListContainer}
                ListHeaderComponent={(
                    <View style={styles.cartHeader}>
                        <Text style={styles.cartTitle}>Keranjang Belanja</Text>
                        {cart.length > 0 && (
                            <TouchableOpacity onPress={clearCart}>
                                <Text style={styles.clearCartText}>Bersihkan Keranjang</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
                ListFooterComponent={(
                    <View style={styles.summaryCard}>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Subtotal:</Text>
                            <Text style={styles.summaryValue}>Rp {calculateSubtotal.toLocaleString('id-ID')}</Text>
                        </View>

                        <View style={styles.discountRow}>
                            <Text style={styles.summaryLabel}>Diskon:</Text>
                            <TextInput
                                style={styles.discountInput}
                                value={discountInput}
                                onChangeText={(text) => setDiscountInput(text.replace(/[^0-9.]/g, ''))}
                                keyboardType="numeric"
                                placeholder="0"
                            />
                            <Text style={styles.discountValue}>- Rp {parsedDiscount.toLocaleString('id-ID')}</Text>
                        </View>

                        <View style={styles.finalTotalRow}>
                            <Text style={styles.finalTotalLabel}>Total Akhir:</Text>
                            <Text style={styles.finalTotalValue}>Rp {calculateFinalTotal.toLocaleString('id-ID')}</Text>
                        </View>

                        <TouchableOpacity
                            style={[styles.checkoutButton, (cart.length === 0 || calculateFinalTotal === 0) && styles.checkoutButtonDisabled]}
                            onPress={handleCheckout}
                            disabled={cart.length === 0 || calculateFinalTotal === 0}
                        >
                            <Text style={styles.checkoutButtonText}>Bayar Sekarang</Text>
                        </TouchableOpacity>
                    </View>
                )}
            />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  container: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  searchContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  searchInput: {
    height: 45,
    borderWidth: 1,
    borderColor: '#BDC3C7',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#2C3E50',
    backgroundColor: '#FDFDFD',
  },
  productsSection: {
    flex: 3,
    paddingTop: 10,
  },
  productListContainer: {
    paddingHorizontal: 5,
  },
  row: {
    justifyContent: 'space-around',
    marginBottom: 5,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#7F8C8D',
  },
  cartSummarySection: {
    flex: 2,
    backgroundColor: '#EBF2F7',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 8,
    overflow: 'hidden',
  },
  cartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
    paddingTop: 5,
  },
  cartTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#34495E',
  },
  clearCartText: {
    color: '#E74C3C',
    fontSize: 14,
    fontWeight: 'bold',
  },
  cartListContainer: {
    flexGrow: 1,
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  emptyCartText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 15,
    color: '#95A5A6',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    marginHorizontal: 5,
    padding: 20,
    marginTop: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 6,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#555',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  discountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ECF0F1',
  },
  discountInput: {
    borderWidth: 1,
    borderColor: '#BDC3C7',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    width: 100,
    textAlign: 'right',
    fontSize: 16,
    color: '#2C3E50',
    backgroundColor: '#FDFDFD',
  },
  discountValue: {
    fontSize: 16,
    color: '#E74C3C',
    fontWeight: 'bold',
  },
  finalTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 20,
  },
  finalTotalLabel: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  finalTotalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#27AE60',
  },
  checkoutButton: {
    backgroundColor: '#2980B9',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  checkoutButtonDisabled: {
    backgroundColor: '#BDC3C7',
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});