import { Stack } from "expo-router";
import { QueryProvider } from "../providers/QueryProvider";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { UserProvider } from "@/context/UserContext";
import AuthGuard from "@/components/AuthGuard";
import { NotificationProvider } from "@/context/NotificationContext";
import { AdminProvider } from "@/context/AdminContext";
import AdminGuard from "@/components/AdminGuard";

import "./global.css";

export default function RootLayout() {
  return (
    <QueryProvider>
      <UserProvider>
        <AdminProvider>
          <NotificationProvider>
            <SafeAreaProvider>
              <AdminGuard>
                <AuthGuard>
                  <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                    <Stack.Screen name="login" options={{ headerShown: false }} />
                    <Stack.Screen name="signup" options={{ headerShown: false }} />
                    <Stack.Screen name="hotels" options={{ headerShown: false }} />
                    <Stack.Screen name="booking" options={{ headerShown: false }} />
                    <Stack.Screen name="admin/login" options={{ headerShown: false }} />
                    <Stack.Screen name="admin/dashboard" options={{ headerShown: false }} />
                  </Stack>
                </AuthGuard>
              </AdminGuard>
            </SafeAreaProvider>
          </NotificationProvider>
        </AdminProvider>
      </UserProvider>
    </QueryProvider>
  );
}