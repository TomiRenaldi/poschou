// app/(tabs)/transactions.tsx
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import ReceiptTemplate from '../../components/ReceiptTemplate';
import TransactionItemDisplay from '../../components/TransactionItemDisplay';
import { useAppStore } from '../../store';
import { Transaction } from '../../store/types';

export default function TransactionsScreen() {
  const { transactions } = useAppStore();
  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const [isReceiptModalVisible, setIsReceiptModalVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const handleViewReceipt = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsReceiptModalVisible(true);
  };

  const renderReceiptAsHtml = (transaction: Transaction) => {
    const transactionDate = new Date(transaction.date).toLocaleString('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short',
    });

    const shopName = 'Toko Serba Ada';
    const shopAddress = 'Jl. Contoh No. 123, Kota Bandung';
    const shopPhone = '0812-3456-7890';

    const itemsHtml = transaction.items.map(item => `
      <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
        <span style="font-size: 12px; flex: 2;">${item.name}</span>
        <span style="font-size: 12px; flex: 1.2; text-align: right;">${item.quantity} x Rp ${item.price.toLocaleString('id-ID')}</span>
        <span style="font-size: 12px; flex: 1; text-align: right; font-weight: bold;">Rp ${(item.quantity * item.price).toLocaleString('id-ID')}</span>
      </div>
    `).join('');

    // --- PERBAIKAN DI SINI UNTUK DISCOUNT AMOUNT ---
    const discountHtml = (transaction.discountAmount ?? 0) > 0 ? `
      <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
        <span style="font-size: 14px; font-weight: bold;">Diskon:</span>
        <span style="font-size: 14px; font-weight: bold;">- Rp ${(transaction.discountAmount ?? 0).toLocaleString('id-ID')}</span>
      </div>
    ` : '';
    // --- AKHIR PERBAIKAN ---

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: 'monospace';
            margin: 0;
            padding: 20px;
            color: #000;
            background-color: #fff;
            width: 100%;
            max-width: 300px;
            box-sizing: border-box;
          }
          .container {
            border: 1px dashed #ccc;
            padding: 10px;
          }
          .shop-name {
            font-size: 20px;
            font-weight: bold;
            text-align: center;
            margin-bottom: 5px;
          }
          .shop-detail {
            font-size: 12px;
            text-align: center;
          }
          .divider {
            font-size: 12px;
            text-align: center;
            margin: 10px 0;
          }
          .transaction-info {
            font-size: 12px;
            margin-bottom: 2px;
          }
          .item-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 3px;
          }
          .summary-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
          }
          .summary-label {
            font-size: 14px;
            font-weight: bold;
          }
          .summary-value {
            font-size: 14px;
            font-weight: bold;
          }
          .final-total-row {
            border-top: 1px solid #000;
            padding-top: 5px;
            margin-top: 5px;
          }
          .final-total-label {
            font-size: 16px;
            font-weight: bold;
          }
          .final-total-value {
            font-size: 16px;
            font-weight: bold;
          }
          .footer-text {
            font-size: 10px;
            text-align: center;
            margin-top: 5px;
            color: #555;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <p class="shop-name">${shopName}</p>
          <p class="shop-detail">${shopAddress}</p>
          <p class="shop-detail">${shopPhone}</p>
          <p class="divider">------------------------------------</p>
          <p class="transaction-info">Tanggal: ${transactionDate}</p>
          <p class="transaction-info">Transaksi ID: #${transaction.id.substring(0, 8)}</p>
          <p class="divider">------------------------------------</p>

          ${itemsHtml}

          <p class="divider">------------------------------------</p>

          <div class="summary-row">
            <span class="summary-label">Subtotal:</span>
            <span class="summary-value">Rp ${transaction.totalAmount.toLocaleString('id-ID')}</span>
          </div>

          ${discountHtml}

          <div class="summary-row final-total-row">
            <span class="final-total-label">TOTAL:</span>
            <span class="final-total-value">Rp ${(transaction.finalAmount ?? 0).toLocaleString('id-ID')}</span>
          </div>

          <p class="divider">------------------------------------</p>
          <p class="footer-text">Terima Kasih Telah Berbelanja!</p>
          <p class="footer-text">Produk yang sudah dibeli tidak dapat dikembalikan.</p>
        </div>
      </body>
      </html>
    `;
  };

  const handlePrint = async () => {
    if (!selectedTransaction) return;

    const html = renderReceiptAsHtml(selectedTransaction);

    try {
      await Print.printAsync({ html: html });
    } catch (error) {
      console.error('Error printing:', error);
      Alert.alert('Gagal Cetak', 'Terjadi kesalahan saat mencoba mencetak struk.');
    }
  };

  const handleShare = async () => {
    if (!selectedTransaction) return;

    const html = renderReceiptAsHtml(selectedTransaction);

    try {
      const { uri } = await Print.printToFileAsync({ html: html, base64: false });

      if (uri) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Bagikan Struk',
          UTI: 'com.adobe.pdf',
        });
      } else {
        Alert.alert('Gagal Bagikan', 'Tidak dapat membuat file PDF untuk dibagikan.');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      Alert.alert('Gagal Bagikan', 'Terjadi kesalahan saat mencoba membagikan struk.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Riwayat Transaksi</Text>
      <FlatList
        data={sortedTransactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TransactionItemDisplay
            transaction={item}
            onViewReceipt={handleViewReceipt}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Belum ada transaksi.</Text>
        }
      />

      <Modal
        animationType="slide"
        transparent={false}
        visible={isReceiptModalVisible}
        onRequestClose={() => setIsReceiptModalVisible(false)}
      >
        <SafeAreaView style={styles.modalSafeArea}>
            <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setIsReceiptModalVisible(false)} style={styles.closeButton}>
                    <Ionicons name="close-circle" size={30} color="#E74C3C" />
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Preview Struk</Text>
            </View>

            <View style={styles.receiptPreviewContainer}>
                {selectedTransaction && (
                    <ReceiptTemplate transaction={selectedTransaction} />
                )}
            </View>

            <View style={styles.modalActions}>
                <TouchableOpacity style={styles.printButton} onPress={handlePrint}>
                    <Ionicons name="print" size={24} color="#fff" />
                    <Text style={styles.actionButtonText}>Cetak Struk</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
                    <Ionicons name="share-social" size={24} color="#fff" />
                    <Text style={styles.actionButtonText}>Bagikan Struk</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
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
  listContent: {
    padding: 10,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#7F8C8D',
  },
  modalSafeArea: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    left: 15,
    padding: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  receiptPreviewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  printButton: {
    backgroundColor: '#2980B9',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  shareButton: {
    backgroundColor: '#27AE60',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});