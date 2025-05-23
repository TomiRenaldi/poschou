// components/TransactionItemDisplay.tsx
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Transaction } from '../store/types';

interface TransactionItemDisplayProps {
  transaction: Transaction;
  onViewReceipt: (transaction: Transaction) => void;
}

const TransactionItemDisplay: React.FC<TransactionItemDisplayProps> = ({ transaction, onViewReceipt }) => {
  return (
    <View style={styles.transactionCard}>
      <View style={styles.transactionHeader}>
        <Text style={styles.transactionId}>Transaksi ID: #{transaction.id.substring(0, 8)}</Text>
        <Text style={styles.transactionDate}>
          {new Date(transaction.date).toLocaleString('id-ID', {
            dateStyle: 'medium',
            timeStyle: 'short',
          })}
        </Text>
      </View>
      <View style={styles.itemsList}>
        {transaction.items.map((product, index) => (
          <Text key={index} style={styles.itemText}>
            {product.name} ({product.quantity}x) - Rp{' '}
            {(product.price * product.quantity).toLocaleString('id-ID')}
          </Text>
        ))}
      </View>
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Subtotal:</Text>
        <Text style={styles.summaryValue}>Rp {transaction.totalAmount.toLocaleString('id-ID')}</Text>
      </View>
      {/* --- PERBAIKAN DI SINI --- */}
      {/* Pastikan discountAmount adalah angka atau default ke 0 */}
      {(transaction.discountAmount ?? 0) > 0 && (
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Diskon:</Text>
          <Text style={styles.summaryValue}>- Rp {(transaction.discountAmount ?? 0).toLocaleString('id-ID')}</Text>
        </View>
      )}
      {/* --- AKHIR PERBAIKAN --- */}
      <View style={[styles.summaryRow, styles.totalRow]}>
        <Text style={styles.totalLabel}>Total Akhir:</Text>
        <Text style={styles.totalValue}>
          Rp {
            (transaction.finalAmount ?? 0).toLocaleString('id-ID')
          }
        </Text>
      </View>
      <TouchableOpacity
        style={styles.receiptButton}
        onPress={() => onViewReceipt(transaction)}
      >
        <Ionicons name="receipt-outline" size={20} color="#fff" />
        <Text style={styles.receiptButtonText}>Lihat Struk</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  transactionCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 8,
  },
  transactionId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#34495E',
  },
  transactionDate: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  itemsList: {
    marginBottom: 10,
  },
  itemText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 3,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  summaryLabel: {
    fontSize: 15,
    color: '#333',
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingTop: 8,
    marginTop: 5,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#27AE60',
  },
  receiptButton: {
    backgroundColor: '#3498DB',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  receiptButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 5,
  },
});

export default TransactionItemDisplay;