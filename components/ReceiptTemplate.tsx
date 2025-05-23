// components/ReceiptTemplate.tsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Transaction } from '../store/types';

interface ReceiptTemplateProps {
  transaction: Transaction;
  shopName?: string;
  shopAddress?: string;
  shopPhone?: string;
}

const ReceiptTemplate: React.FC<ReceiptTemplateProps> = ({
  transaction,
  shopName = 'Toko Serba Ada', // Default name
  shopAddress = 'Jl. Contoh No. 123, Kota Bandung', // Default address
  shopPhone = '0812-3456-7890', // Default phone
}) => {
  const transactionDate = new Date(transaction.date).toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <View style={styles.container}>
      <Text style={styles.shopName}>{shopName}</Text>
      <Text style={styles.shopDetail}>{shopAddress}</Text>
      <Text style={styles.shopDetail}>{shopPhone}</Text>
      <Text style={styles.divider}>------------------------------------</Text>
      <Text style={styles.transactionInfo}>Tanggal: {transactionDate}</Text>
      <Text style={styles.transactionInfo}>Transaksi ID: #{transaction.id.substring(0, 8)}</Text>
      <Text style={styles.divider}>------------------------------------</Text>

      {transaction.items.map((item, index) => (
        <View key={index} style={styles.itemRow}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemQuantityPrice}>{item.quantity} x Rp {item.price.toLocaleString('id-ID')}</Text>
          <Text style={styles.itemTotal}>Rp {(item.quantity * item.price).toLocaleString('id-ID')}</Text>
        </View>
      ))}

      <Text style={styles.divider}>------------------------------------</Text>

      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Subtotal:</Text>
        <Text style={styles.summaryValue}>Rp {transaction.totalAmount.toLocaleString('id-ID')}</Text>
      </View>

      {/* --- PERBAIKAN DI SINI --- */}
      {(transaction.discountAmount ?? 0) > 0 && (
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Diskon:</Text>
          <Text style={styles.summaryValue}>- Rp {(transaction.discountAmount ?? 0).toLocaleString('id-ID')}</Text>
        </View>
      )}
      {/* --- AKHIR PERBAIKAN --- */}

      <View style={[styles.summaryRow, styles.finalTotalRow]}>
        <Text style={styles.finalTotalLabel}>TOTAL:</Text>
        <Text style={styles.finalTotalValue}>Rp {(transaction.finalAmount ?? 0).toLocaleString('id-ID')}</Text>
      </View>

      <Text style={styles.divider}>------------------------------------</Text>
      <Text style={styles.footerText}>Terima Kasih Telah Berbelanja!</Text>
      <Text style={styles.footerText}>Produk yang sudah dibeli tidak dapat dikembalikan.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    fontFamily: 'monospace',
    width: '100%',
    maxWidth: 300,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },
  shopName: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  shopDetail: {
    fontSize: 12,
    textAlign: 'center',
  },
  divider: {
    fontSize: 12,
    textAlign: 'center',
    marginVertical: 10,
  },
  transactionInfo: {
    fontSize: 12,
    marginBottom: 2,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  itemName: {
    fontSize: 12,
    flex: 2,
  },
  itemQuantityPrice: {
    fontSize: 12,
    flex: 1.2,
    textAlign: 'right',
  },
  itemTotal: {
    fontSize: 12,
    flex: 1,
    textAlign: 'right',
    fontWeight: 'bold',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  finalTotalRow: {
    borderTopWidth: 1,
    borderTopColor: '#000',
    paddingTop: 5,
    marginTop: 5,
  },
  finalTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  finalTotalValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  footerText: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: 5,
    color: '#555',
  },
});

export default ReceiptTemplate;