import { useAppStore } from "@/store";
import { Stack } from "expo-router";
import React, { useEffect } from "react";
import 'react-native-get-random-values';
import './globals.css';

export default function RootLayout() {
  const loadData = useAppStore((state) => state.loadData)

  useEffect(() => {
    loadData();
  }, [loadData]); // Panggil loadData hanya sekali saat komponen di-mount

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  )
}
