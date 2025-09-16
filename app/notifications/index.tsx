// app/notifications/index.tsx
// Screen to display notification history

import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNotifications } from '@/context/NotificationContext';
import { router } from 'expo-router';
import { useBookings } from '@/hooks/useBookings';

export default function NotificationsScreen() {
  const { notification, hasPermission, requestPermission } = useNotifications();
  const { data: bookingsData, isLoading, error } = useBookings();
  
  // Generate notifications from booking data
  const generateBookingNotifications = () => {
    if (!bookingsData?.bookings) return [];
    
    return bookingsData.bookings.map((booking: any) => ({
      id: `booking-${booking.id}`,
      title: 'Booking Update',
      body: `Your booking at ${booking.hotel_name} for ${booking.check_in} is ${booking.status}`,
      timestamp: new Date(booking.created_at),
      read: false,
      type: 'booking',
      bookingId: booking.id
    }));
  };

  const notifications = generateBookingNotifications();

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / 86400000);
    const diffHrs = Math.floor((diffMs % 86400000) / 3600000);
    const diffMins = Math.floor(((diffMs % 86400000) % 3600000) / 60000);
    
    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffHrs > 0) return `${diffHrs} hour${diffHrs > 1 ? 's' : ''} ago`;
    if (diffMins > 0) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  const handleRequestPermission = async () => {
    const granted = await requestPermission();
    if (granted) {
      alert('Notification permission granted!');
    } else {
      alert('Notification permission denied. You can enable it in settings.');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1 px-4">
        {/* Header */}
        <View className="flex-row items-center pt-4 pb-6">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-4"
          >
            <Text className="text-lg">←</Text>
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-gray-800">Notifications</Text>
        </View>

        {/* Permission Status */}
        {!hasPermission && (
          <View className="bg-yellow-50 rounded-xl p-4 mb-6">
            <Text className="text-yellow-800 font-medium mb-2">Notification Permission Needed</Text>
            <Text className="text-yellow-700 text-sm mb-3">
              Enable notifications to receive booking confirmations, reminders, and special offers.
            </Text>
            <TouchableOpacity 
              onPress={handleRequestPermission}
              className="bg-yellow-500 py-2 rounded-lg"
            >
              <Text className="text-white text-center font-medium">Enable Notifications</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Recent Notification */}
        {notification && (
          <View className="bg-blue-50 rounded-xl p-4 mb-6">
            <Text className="text-blue-800 font-medium mb-1">Latest Notification</Text>
            <Text className="text-blue-700 font-bold">{notification.request.content.title}</Text>
            <Text className="text-blue-600 text-sm mt-1">{notification.request.content.body}</Text>
          </View>
        )}

        {/* Notification History */}
        <Text className="text-lg font-bold text-gray-800 mb-4">Recent Notifications</Text>
        
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-gray-500 text-lg">Loading notifications...</Text>
          </View>
        ) : error ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-red-500 text-lg">Error loading notifications</Text>
          </View>
        ) : notifications.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-6xl mb-4">🔔</Text>
            <Text className="text-gray-500 text-xl font-semibold mb-2">No Notifications Yet</Text>
            <Text className="text-gray-400 text-center px-8">
              Your booking confirmations, reminders, and special offers will appear here.
            </Text>
          </View>
        ) : (
          <ScrollView className="flex-1">
            {notifications.map((notif: any) => (
              <View 
                key={notif.id} 
                className={`bg-white rounded-xl p-4 mb-3 ${!notif.read ? 'border-l-4 border-blue-500' : ''}`}
              >
                <View className="flex-row justify-between items-start">
                  <View className="flex-1">
                    <Text className={`font-bold ${!notif.read ? 'text-blue-600' : 'text-gray-800'}`}>
                      {notif.title}
                    </Text>
                    <Text className="text-gray-600 mt-1">{notif.body}</Text>
                  </View>
                </View>
                <Text className="text-gray-400 text-xs mt-2">
                  {formatTime(notif.timestamp)}
                </Text>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}