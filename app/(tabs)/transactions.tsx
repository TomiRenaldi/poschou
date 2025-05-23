// app/(tabs)/transactions.tsx
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  SafeAreaView,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import ReceiptTemplate from '../../components/ReceiptTemplate';
import TransactionItemDisplay from '../../components/TransactionItemDisplay';
import { useAppStore } from '../../store';
import { Transaction } from '../../store/types';

// Konstanta untuk pagination
const TRANSACTIONS_PER_PAGE = 10;

// Fungsi pembantu untuk menentukan grup tanggal
const getGroupLabel = (date: Date): string => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const transactionDate = new Date(date);
  transactionDate.setHours(0, 0, 0, 0);

  if (transactionDate.getTime() === today.getTime()) {
    return 'Hari Ini';
  }
  if (transactionDate.getTime() === yesterday.getTime()) {
    return 'Kemarin';
  }

  const oneWeekAgo = new Date(today);
  oneWeekAgo.setDate(today.getDate() - 7);
  if (transactionDate >= oneWeekAgo && transactionDate < yesterday) {
    return 'Minggu Ini';
  }

  const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  if (transactionDate >= currentMonthStart && transactionDate < oneWeekAgo) {
    return 'Bulan Ini';
  }

  return transactionDate.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
};

export default function TransactionsScreen() {
  // Ambil deleteTransaction dari store
  const { transactions, deleteTransaction } = useAppStore();

  const [isReceiptModalVisible, setIsReceiptModalVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDateFilterType, setSelectedDateFilterType] = useState<'start' | 'end' | null>(null);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  const [currentPage, setCurrentPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    setCurrentPage(1);
    setHasMore(true);
  }, [searchTerm, startDate, endDate]);

  const allFilteredTransactions = useMemo(() => {
    const sorted = [...transactions].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    const filteredBySearch = sorted.filter(transaction => {
      const lowercasedSearchTerm = searchTerm.toLowerCase();
      const transactionId = transaction.id.toLowerCase();
      const itemNames = transaction.items.map(item => item.name.toLowerCase()).join(' ');

      return transactionId.includes(lowercasedSearchTerm) || itemNames.includes(lowercasedSearchTerm);
    });

    const filteredByDate = filteredBySearch.filter(transaction => {
      const transactionDate = new Date(transaction.timestamp);
      transactionDate.setHours(0, 0, 0, 0);

      const start = startDate ? new Date(startDate) : undefined;
      if (start) start.setHours(0, 0, 0, 0);

      const end = endDate ? new Date(endDate) : undefined;
      if (end) end.setHours(23, 59, 59, 999);


      if (start && transactionDate < start) {
        return false;
      }
      if (end && transactionDate > end) {
        return false;
      }
      return true;
    });

    return filteredByDate;
  }, [transactions, searchTerm, startDate, endDate]);

  const paginatedTransactions = useMemo(() => {
    const endIndex = currentPage * TRANSACTIONS_PER_PAGE;
    const currentData = allFilteredTransactions.slice(0, endIndex);
    setHasMore(currentData.length < allFilteredTransactions.length);

    return currentData;
  }, [allFilteredTransactions, currentPage]);

  const filteredAndGroupedTransactions = useMemo(() => {
    const grouped: { [key: string]: Transaction[] } = {};
    paginatedTransactions.forEach(transaction => {
      const date = new Date(transaction.timestamp);
      const label = getGroupLabel(date);
      if (!grouped[label]) {
        grouped[label] = [];
      }
      grouped[label].push(transaction);
    });

    const sectionOrder = ['Hari Ini', 'Kemarin', 'Minggu Ini', 'Bulan Ini'];
    const customSortedSections = Object.keys(grouped).sort((a, b) => {
      const indexA = sectionOrder.indexOf(a);
      const indexB = sectionOrder.indexOf(b);

      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;

      const dateA = new Date(grouped[a][0].timestamp);
      const dateB = new Date(grouped[b][0].timestamp);
      return dateB.getTime() - dateA.getTime();
    });

    return customSortedSections.map(label => ({
      title: label,
      data: grouped[label],
    }));
  }, [paginatedTransactions]);


  const handleViewReceipt = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsReceiptModalVisible(true);
  };

  // BARU: Handler untuk konfirmasi dan penghapusan transaksi
  const handleDeleteTransaction = (transactionId: string) => {
    Alert.alert(
      'Hapus Transaksi',
      'Apakah Anda yakin ingin menghapus transaksi ini? Stok produk akan dikembalikan.',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          onPress: () => {
            deleteTransaction(transactionId); // Panggil action dari store
            Alert.alert('Berhasil', 'Transaksi telah dihapus dan stok produk dikembalikan.');
          },
          style: 'destructive',
        },
      ]
    );
  };

  const renderReceiptAsHtml = (transaction: Transaction) => {
    const transactionDate = new Date(transaction.timestamp).toLocaleString('id-ID', {
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

    const discountHtml = (transaction.discountAmount ?? 0) > 0 ? `
      <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
        <span style="font-size: 14px; font-weight: bold;">Diskon:</span>
        <span style="font-size: 14px; font-weight: bold;">- Rp ${(transaction.discountAmount ?? 0).toLocaleString('id-ID')}</span>
      </div>
    ` : '';

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

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      if (selectedDateFilterType === 'start') {
        setStartDate(selectedDate);
      } else if (selectedDateFilterType === 'end') {
        setEndDate(selectedDate);
      }
    }
  };

  const showDatepicker = (type: 'start' | 'end') => {
    setSelectedDateFilterType(type);
    setShowDatePicker(true);
  };

  const clearDateFilter = () => {
    setStartDate(undefined);
    setEndDate(undefined);
  };

  const handleLoadMore = useCallback(() => {
    if (hasMore && !loadingMore) {
      setLoadingMore(true);
      setTimeout(() => {
        setCurrentPage(prevPage => prevPage + 1);
        setLoadingMore(false);
      }, 500);
    }
  }, [hasMore, loadingMore]);

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.loadingMoreContainer}>
        <ActivityIndicator size="large" color="#3498DB" />
        <Text style={styles.loadingMoreText}>Memuat lebih banyak transaksi...</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Riwayat Transaksi</Text>

      <View style={styles.filterContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Cari ID atau nama produk..."
          value={searchTerm}
          onChangeText={setSearchTerm}
          clearButtonMode="while-editing"
        />
        <View style={styles.dateFilterRow}>
          <TouchableOpacity style={styles.dateInputButton} onPress={() => showDatepicker('start')}>
            <Ionicons name="calendar-outline" size={20} color="#3498DB" />
            <Text style={styles.dateInputText}>
              {startDate ? startDate.toLocaleDateString('id-ID') : 'Tanggal Mulai'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.dateSeparator}>-</Text>
          <TouchableOpacity style={styles.dateInputButton} onPress={() => showDatepicker('end')}>
            <Ionicons name="calendar-outline" size={20} color="#3498DB" />
            <Text style={styles.dateInputText}>
              {endDate ? endDate.toLocaleDateString('id-ID') : 'Tanggal Akhir'}
            </Text>
          </TouchableOpacity>
          {(startDate || endDate) && (
            <TouchableOpacity style={styles.clearFilterButton} onPress={clearDateFilter}>
              <Ionicons name="close-circle-outline" size={24} color="#E74C3C" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {showDatePicker && (
        <DateTimePicker
          testID="dateTimePicker"
          value={(selectedDateFilterType === 'start' && startDate) || (selectedDateFilterType === 'end' && endDate) || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onDateChange}
        />
      )}

      <SectionList
        sections={filteredAndGroupedTransactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TransactionItemDisplay
            transaction={item}
            onViewReceipt={handleViewReceipt}
            onDelete={handleDeleteTransaction}
          />
        )}
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{title}</Text>
          </View>
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Tidak ada transaksi yang cocok.</Text>
        }
        stickySectionHeadersEnabled={true}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
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
  filterContainer: {
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#BDC3C7',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 10,
    fontSize: 16,
    color: '#2C3E50',
  },
  dateFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateInputButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BDC3C7',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: '#FDFDFD',
  },
  dateInputText: {
    marginLeft: 8,
    fontSize: 15,
    color: '#555',
  },
  dateSeparator: {
    marginHorizontal: 10,
    fontSize: 16,
    color: '#7F8C8D',
  },
  clearFilterButton: {
    marginLeft: 10,
    padding: 5,
  },
  sectionHeader: {
    backgroundColor: '#EBF2F7',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#D0D6DC',
    marginTop: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#34495E',
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
  loadingMoreContainer: {
    paddingVertical: 20,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  loadingMoreText: {
    marginLeft: 10,
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