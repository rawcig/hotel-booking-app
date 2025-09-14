import { Stack } from "expo-router";
import { QueryProvider } from "../providers/QueryProvider";
import { SafeAreaProvider } from 'react-native-safe-area-context';

import "./global.css";

export default function RootLayout() {
  return (
    <QueryProvider>
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="hotels" options={{ headerShown: false }} />
          <Stack.Screen name="booking" options={{ headerShown: false }} />
        </Stack>
      </SafeAreaProvider>
    </QueryProvider>
  );
}