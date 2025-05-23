// components/ProductCard.tsx
import React from 'react'; // Pastikan React diimpor
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Product } from '../store/types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  // Console log ini hanya untuk debugging, bisa dihapus nanti
  // console.log('Rendering ProductCard:', product.name);
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onAddToCart(product)}
      disabled={product.stock === 0} // Nonaktifkan klik jika stok 0
    >
      <Text style={styles.productName}>{product.name}</Text>
      <Text style={styles.productPrice}>Rp {product.price.toLocaleString('id-ID')}</Text>
      <Text style={styles.productStock}>Stok: {product.stock}</Text>
      {product.stock === 0 && (
        <View style={styles.outOfStockOverlay}>
          <Text style={styles.outOfStockText}>HABIS</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    margin: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    width: '45%',
    justifyContent: 'space-between',
    minHeight: 120,
    position: 'relative',
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  productPrice: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  productStock: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  outOfStockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 0, 0, 0.6)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outOfStockText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    transform: [{ rotate: '-25deg' }],
  },
});

export default React.memo(ProductCard); // Tambahkan React.memo di sini