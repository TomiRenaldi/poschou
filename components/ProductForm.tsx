// components/ProductForm.tsx (contoh)
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Product } from '../store/types'; // Pastikan path ini benar

interface ProductFormProps {
  initialData?: Product;
  // onSubmit sekarang bisa menerima Product (untuk edit) atau Omit<Product, 'id'> (untuk add)
  // Untuk menyederhanakan, kita buat onSubmit selalu menerima Product lengkap,
  // dan ID akan di-generate di parent component (ProductsScreen) jika ini produk baru.
  onSubmit: (product: Product) => void;
  onCancel: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [price, setPrice] = useState(initialData?.price.toString() || '');
  const [stock, setStock] = useState(initialData?.stock.toString() || '');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setPrice(initialData.price.toString());
      setStock(initialData.stock.toString());
    } else {
      setName('');
      setPrice('');
      setStock('');
    }
  }, [initialData]);

  const handleSubmit = () => {
    const parsedPrice = parseFloat(price);
    const parsedStock = parseInt(stock, 10);

    if (!name.trim() || isNaN(parsedPrice) || parsedPrice <= 0 || isNaN(parsedStock) || parsedStock < 0) {
      Alert.alert('Input Tidak Valid', 'Mohon lengkapi semua bidang dengan benar (harga dan stok harus angka positif).');
      return;
    }

    const productToSave: Product = {
      id: initialData?.id || 'temp-id', // ID akan di-overwrite oleh uuidv4 di ProductsScreen jika ini produk baru
      name,
      price: parsedPrice,
      stock: parsedStock,
    };
    onSubmit(productToSave);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{initialData ? 'Edit Produk' : 'Tambah Produk Baru'}</Text>

      <TextInput
        style={styles.input}
        placeholder="Nama Produk"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Harga"
        value={price}
        onChangeText={(text) => setPrice(text.replace(/[^0-9.]/g, ''))} // Hanya angka dan titik
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Stok"
        value={stock}
        onChangeText={(text) => setStock(text.replace(/[^0-9]/g, ''))} // Hanya angka
        keyboardType="numeric"
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.buttonText}>Batal</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Simpan</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F7F9FC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#2C3E50',
  },
  input: {
    width: '90%',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#BDC3C7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '90%',
    marginTop: 20,
  },
  saveButton: {
    backgroundColor: '#27AE60',
    padding: 15,
    borderRadius: 10,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  cancelButton: {
    backgroundColor: '#E74C3C',
    padding: 15,
    borderRadius: 10,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ProductForm;