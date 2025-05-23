// app/(tabs)/products.tsx
import React, { useMemo, useState } from 'react';
import { Alert, FlatList, Modal, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import 'react-native-get-random-values'; // Pastikan ini diimpor jika menggunakan uuid v4
import { v4 as uuidv4 } from 'uuid'; // Import v4 as uuidv4
import ProductForm from '../../components/ProductForm'; // Asumsi Anda punya komponen ini
import ProductItem from '../../components/ProductItem'; // Asumsi Anda punya komponen ini
import { useAppStore } from '../../store';
import { Product } from '../../store/types';

export default function ProductsScreen() {
  const { products, addProduct, updateProduct, deleteProduct } = useAppStore();

  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
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

  const handleAddProduct = (newProductData: Omit<Product, 'id'>) => {
    // Generate ID baru di sini sebelum menambahkan produk
    const newProduct: Product = {
      id: uuidv4(), // Pastikan uuidv4 berfungsi
      ...newProductData,
    };
    addProduct(newProduct);
    setIsFormVisible(false);
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    updateProduct(updatedProduct);
    setIsFormVisible(false);
    setEditingProduct(undefined);
  };

  const handleDeleteProduct = (id: string) => {
    Alert.alert(
      'Hapus Produk',
      'Apakah Anda yakin ingin menghapus produk ini?',
      [
        { text: 'Batal', style: 'cancel' },
        { text: 'Hapus', onPress: () => deleteProduct(id), style: 'destructive' },
      ]
    );
  };

  const handleEditPress = (product: Product) => {
    setEditingProduct(product);
    setIsFormVisible(true);
  };

  const handleCancelForm = () => {
    setIsFormVisible(false);
    setEditingProduct(undefined);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Daftar Produk</Text>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Cari produk..."
          value={searchTerm}
          onChangeText={setSearchTerm}
          clearButtonMode="while-editing"
        />
      </View>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          setIsFormVisible(true);
          setEditingProduct(undefined);
        }}
      >
        <Text style={styles.addButtonText}>Tambah Produk Baru</Text>
      </TouchableOpacity>

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ProductItem
            product={item}
            onEdit={handleEditPress}
            onDelete={handleDeleteProduct}
          />
        )}
        contentContainerStyle={styles.productListContainer}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {searchTerm ? "Produk tidak ditemukan." : "Belum ada produk."}
          </Text>
        }
      />

      <Modal
        animationType="slide"
        transparent={false}
        visible={isFormVisible}
        onRequestClose={handleCancelForm}
      >
        <SafeAreaView style={styles.modalSafeArea}>
          <ProductForm
            initialData={editingProduct}
            onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct}
            onCancel={handleCancelForm}
          />
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
  addButton: {
    backgroundColor: '#27AE60',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'center',
    marginVertical: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  productListContainer: {
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
});