// components/TransactionItemDisplay.tsx
import { Ionicons } from '@expo/vector-icons'; // Untuk ikon
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface TransactionItemDisplayProps {
  transaction: {
    id: string;
    timestamp: string;
    totalAmount: number;
    discountAmount?: number; // Opsional
    finalAmount: number; // Final amount bisa undefined jika perhitungan awal salah atau tidak ada
    items: Array<{ name: string; quantity: number }>;
  };
  onViewReceipt: (transaction: any) => void;
  onDelete: (transactionId: string) => void;
}

const TransactionItemDisplay: React.FC<TransactionItemDisplayProps> = ({
  transaction,
  onViewReceipt,
  onDelete,
}) => {
  const transactionDate = new Date(transaction.timestamp).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const transactionTime = new Date(transaction.timestamp).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const displayItems = transaction.items.map(item => `${item.name} (${item.quantity})`).join(', ');

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.transactionId}>ID: #{transaction.id.substring(0, 8)}</Text>
        <Text style={styles.dateTime}>{transactionDate} {transactionTime}</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.itemsList}>Produk: {displayItems}</Text>
        <View style={styles.amountRow}>
          <Text style={styles.label}>Subtotal:</Text>
          <Text style={styles.value}>Rp {transaction.totalAmount.toLocaleString('id-ID')}</Text>
        </View>
        {/* Perbaikan di sini: Gunakan (transaction.discountAmount ?? 0) */}
        {(transaction.discountAmount ?? 0) > 0 && (
          <View style={styles.amountRow}>
            <Text style={styles.label}>Diskon:</Text>
            <Text style={styles.discountValue}>- Rp {(transaction.discountAmount ?? 0).toLocaleString('id-ID')}</Text>
          </View>
        )}
        <View style={styles.finalAmountRow}>
          <Text style={styles.finalLabel}>Total Akhir:</Text>
          {/* Perbaikan di sini: Gunakan (transaction.finalAmount ?? 0) */}
          <Text style={styles.finalValue}>Rp {(transaction.finalAmount ?? 0).toLocaleString('id-ID')}</Text>
        </View>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.receiptButton} onPress={() => onViewReceipt(transaction)}>
          <Ionicons name="receipt-outline" size={20} color="#2980B9" />
          <Text style={styles.receiptButtonText}>Lihat Struk</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={() => onDelete(transaction.id)}>
          <Ionicons name="trash-outline" size={20} color="#E74C3C" />
          <Text style={styles.deleteButtonText}>Hapus</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingBottom: 5,
  },
  transactionId: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#555',
  },
  dateTime: {
    fontSize: 13,
    color: '#777',
  },
  body: {
    marginBottom: 10,
  },
  itemsList: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  label: {
    fontSize: 14,
    color: '#555',
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  discountValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E74C3C',
  },
  finalAmountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#DDD',
    paddingTop: 8,
    marginTop: 5,
  },
  finalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  finalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#27AE60',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 10,
    marginTop: 5,
  },
  receiptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    backgroundColor: '#EBF6FC',
  },
  receiptButtonText: {
    marginLeft: 5,
    color: '#2980B9',
    fontWeight: 'bold',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    backgroundColor: '#FCEAEA',
  },
  deleteButtonText: {
    marginLeft: 5,
    color: '#E74C3C',
    fontWeight: 'bold',
  },
});

export default TransactionItemDisplay;