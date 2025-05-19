import { Tabs } from "expo-router";

export default function _Layout() {
  return (
    <Tabs>
        <Tabs.Screen name="index" options={{ title: 'Home', headerShown: false }} />
        <Tabs.Screen name="keranjang" options={{ title: 'Keranjang', headerShown: false }} />
    </Tabs>
  );
}