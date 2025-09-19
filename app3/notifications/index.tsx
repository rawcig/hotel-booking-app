// app/notifications/index.tsx
// Screen to display notification history

import React, { useState, useEffect, useCallback } from 'react';
import { ScrollView, Text, TouchableOpacity, View, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNotifications } from '@/context/NotificationContext';
import { router } from 'expo-router';
import { useUser } from '@/context/UserContext';
import { supabase } from '@/lib/supabase';
import { analyticsService } from '@/services/analyticsService';

interface DatabaseNotification {
  id: number;
  guest_id: number;
  type: 'email' | 'sms';
  subject: string;
  message: string;
  sent_at: string | null;
  status: 'pending' | 'sent' | 'failed';
  created_at: string;
  updated_at: string;
}

export default function NotificationsScreen() {
  const { notification, hasPermission, requestPermission, processDatabaseNotifications } = useNotifications();
  const { user } = useUser();
  const [notifications, setNotifications] = useState<DatabaseNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load notifications from database
  const loadNotifications = useCallback(async () => {
    try {
      setError(null);
      
      // Get guest ID for current user
      const { data: guestData, error: guestError } = await supabase
        .from('guests')
        .select('id')
        .eq('email', user?.email)
        .single();

      if (guestError) {
        throw new Error(`Failed to get guest data: ${guestError.message}`);
      }

      if (!guestData) {
        throw new Error('No guest record found for current user');
      }

      // Get notifications for this guest
      const { data: notificationData, error: notificationError } = await supabase
        .from('notifications')
        .select('*')
        .eq('guest_id', guestData.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (notificationError) {
        throw new Error(`Failed to fetch notifications: ${notificationError.message}`);
      }

      setNotifications(notificationData || []);
      analyticsService.trackEvent({
        event: 'notifications_viewed',
        category: 'ui',
        action: 'viewed',
        userId: user?.id
      });
    } catch (err) {
      console.error('Error loading notifications:', err);
      setError(err instanceof Error ? err.message : 'Failed to load notifications');
      analyticsService.logError({
        error: 'NotificationLoadError',
        message: err instanceof Error ? err.message : 'Unknown error loading notifications',
        component: 'NotificationsScreen.loadNotifications',
        userId: user?.id,
        severity: 'medium'
      });
    } finally {
      setIsLoading(false);
    }
  }, [user?.email, user?.id]);

  // Refresh notifications
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  }, [loadNotifications]);

  // Process database notifications when screen is focused
  useEffect(() => {
    loadNotifications();
    processDatabaseNotifications();
  }, [user?.email, loadNotifications, processDatabaseNotifications]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
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
            <Text className="text-red-500 text-lg">Error: {error}</Text>
            <TouchableOpacity 
              onPress={loadNotifications}
              className="bg-blue-500 py-2 px-4 rounded-lg mt-4"
            >
              <Text className="text-white font-medium">Try Again</Text>
            </TouchableOpacity>
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
          <ScrollView 
            className="flex-1"
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {notifications.map((notif) => (
              <View 
                key={notif.id} 
                className={`bg-white rounded-xl p-4 mb-3 ${notif.status === 'pending' ? 'border-l-4 border-yellow-500' : notif.status === 'sent' ? 'border-l-4 border-green-500' : 'border-l-4 border-red-500'}`}
              >
                <View className="flex-row justify-between items-start">
                  <View className="flex-1">
                    <Text className={`font-bold ${notif.status === 'pending' ? 'text-yellow-600' : notif.status === 'sent' ? 'text-green-600' : 'text-red-600'}`}>
                      {notif.subject}
                    </Text>
                    <Text className="text-gray-600 mt-1">{notif.message}</Text>
                  </View>
                  <View className="items-end">
                    <Text className={`text-xs px-2 py-1 rounded-full ${
                      notif.type === 'email' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                    }`}>
                      {notif.type}
                    </Text>
                    <Text className={`text-xs px-2 py-1 rounded-full mt-1 ${
                      notif.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      notif.status === 'sent' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {notif.status}
                    </Text>
                  </View>
                </View>
                <Text className="text-gray-400 text-xs mt-2">
                  {formatTime(notif.created_at)}
                </Text>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}