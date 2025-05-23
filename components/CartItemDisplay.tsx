// components/CartItemDisplay.tsx
import { Ionicons } from '@expo/vector-icons';
import React from 'react'; // Pastikan React diimpor
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CartItem } from '../store/types';

interface CartItemDisplayProps {
  item: CartItem;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
}

const CartItemDisplay: React.FC<CartItemDisplayProps> = ({ item, onUpdateQuantity, onRemove }) => {
  // Console log ini hanya untuk debugging, bisa dihapus nanti
  // console.log('Rendering CartItemDisplay:', item.name, 'Qty:', item.quantity);
  const totalPrice = item.price * item.quantity;

  return (
    <View style={styles.container}>
      <View style={styles.infoContainer}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemPrice}>Rp {item.price.toLocaleString('id-ID')} x {item.quantity}</Text>
        <Text style={styles.itemTotalPrice}>= Rp {totalPrice.toLocaleString('id-ID')}</Text>
      </View>
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onUpdateQuantity(item.id, item.quantity - 1)}
          disabled={item.quantity <= 1}
        >
          <Ionicons name="remove-circle" size={24} color={item.quantity <= 1 ? '#ccc' : '#007bff'} />
        </TouchableOpacity>
        <Text style={styles.quantityText}>{item.quantity}</Text>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onUpdateQuantity(item.id, item.quantity + 1)}
          disabled={item.stock <= item.quantity}
        >
          <Ionicons name="add-circle" size={24} color={item.stock <= item.quantity ? '#ccc' : '#28a745'} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={() => onRemove(item.id)}>
          <Ionicons name="trash" size={24} color="#dc3545" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 10,
    marginVertical: 5,
    marginHorizontal: 5, // Sesuaikan dengan margin horizontal FlatList
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  infoContainer: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  itemPrice: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  itemTotalPrice: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#007bff',
    marginTop: 4,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  actionButton: {
    padding: 5,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 8,
    color: '#333',
  },
  deleteButton: {
    marginLeft: 10,
    padding: 5,
  },
});

export default React.memo(CartItemDisplay); // Tambahkan React.memo di sini