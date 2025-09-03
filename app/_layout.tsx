import { Stack } from "expo-router";
import { BookingProvider } from './context/BookingContext';
import "./global.css";

export default function RootLayout() {
  return (
    <BookingProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </BookingProvider>
  );
}