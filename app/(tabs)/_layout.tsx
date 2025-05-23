import { useAppStore } from "@/store";
import { FontAwesome } from '@expo/vector-icons';
import { Tabs } from "expo-router";
import React, { useEffect } from "react";
import 'react-native-get-random-values';

export default function _Layout() {
  const loadData = useAppStore((state) => state.loadData);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: 'blue', headerShown: false }}>
        <Tabs.Screen name="index" options={{ title: 'Kasir', tabBarIcon: ({ color }) => <FontAwesome size={24} name="calculator" color={color} /> }} />
        <Tabs.Screen name="products" options={{ title: 'Produk', tabBarIcon: ({ color }) => <FontAwesome size={24} name="th-list" color={color} /> }} />
        <Tabs.Screen name="transactions" options={{ title: 'Riwayat', tabBarIcon: ({ color }) => <FontAwesome size={24} name="history" color={color} /> }} />
    </Tabs>
  );
}