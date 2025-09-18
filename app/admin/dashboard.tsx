// app/admin/dashboard.tsx
// Admin dashboard screen

import React, { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View, Image, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useAdmin } from '@/context/AdminContext';
import { images } from '@/constants/images';
import { analyticsService } from '@/services/analyticsService';

export default function AdminDashboard() {
  const { admin, logout, isSuperAdmin } = useAdmin();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = () => {
    const summary = analyticsService.getSummary();
    const bookingAnalytics = analyticsService.getBookingAnalytics();
    
    setAnalytics({
      summary,
      bookingAnalytics
    });
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadAnalytics();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/admin/login');
  };

  const menuItems = [
    {
      title: 'Manage Hotels',
      description: 'Add, edit, and remove hotels',
      icon: '🏨',
      action: () => router.push('/admin/hotels'),
      color: 'bg-blue-100',
      textColor: 'text-blue-600'
    },
    {
      title: 'Manage Rooms',
      description: 'Add, edit, and remove rooms',
      icon: '🛏️',
      action: () => router.push('/admin/rooms'),
      color: 'bg-green-100',
      textColor: 'text-green-600'
    },
    {
      title: 'View Bookings',
      description: 'View and manage all bookings',
      icon: '📅',
      action: () => router.push('/admin/bookings'),
      color: 'bg-purple-100',
      textColor: 'text-purple-600'
    },
    {
      title: 'Manage Staff',
      description: 'Add and manage staff members',
      icon: '👤',
      action: () => router.push('/admin/staff'),
      color: 'bg-yellow-100',
      textColor: 'text-yellow-600',
      adminOnly: true
    },
    {
      title: 'Reports',
      description: 'View booking statistics and reports',
      icon: '📊',
      action: () => router.push('/admin/reports'),
      color: 'bg-red-100',
      textColor: 'text-red-600'
    }
  ];

  return (
    <ScrollView 
      className="flex-1 bg-gray-50"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 pb-8">
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-2xl font-bold text-white">Admin Dashboard</Text>
          <TouchableOpacity 
            onPress={handleLogout}
            className="flex-row items-center bg-white/20 px-4 py-2 rounded-full"
          >
            <Text className="text-white font-medium">Logout</Text>
          </TouchableOpacity>
        </View>
        
        {/* Admin Info Card */}
        <View className="bg-white/95 rounded-2xl p-4 backdrop-blur-sm">
          <View className="flex-row items-center">
                      <Image 
            source={images.userMale} 
            className="w-16 h-16 rounded-full mr-4 border-2 border-blue-200"
            resizeMode="cover"
          />
            <View className="flex-1">
              <Text className="text-xl font-bold text-gray-800">
                {admin?.first_name} {admin?.last_name}
              </Text>
              <Text className="text-gray-600 mb-1">{admin?.email}</Text>
              <View className="flex-row items-center">
                <View className={`px-2 py-1 rounded-full mr-2 ${isSuperAdmin ? 'bg-red-100' : 'bg-blue-100'}`}>
                  <Text className={`text-xs font-medium ${isSuperAdmin ? 'text-red-600' : 'text-blue-600'}`}>
                    {isSuperAdmin ? 'Super Admin' : 'Admin'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Analytics Cards */}
      <View className="flex-row p-4 gap-3 -mt-4">
        <View className="flex-1 bg-white rounded-xl p-4 items-center shadow-sm">
          <Text className="text-2xl font-bold text-blue-600">
            {analytics?.summary?.events?.today || 0}
          </Text>
          <Text className="text-gray-600 text-sm text-center">Events (24h)</Text>
        </View>
        <View className="flex-1 bg-white rounded-xl p-4 items-center shadow-sm">
          <Text className="text-2xl font-bold text-red-500">
            {analytics?.summary?.errors?.today || 0}
          </Text>
          <Text className="text-gray-600 text-sm text-center">Errors (24h)</Text>
        </View>
        <View className="flex-1 bg-white rounded-xl p-4 items-center shadow-sm">
          <Text className="text-2xl font-bold text-purple-500">
            {analytics?.bookingAnalytics?.totalBookings || 0}
          </Text>
          <Text className="text-gray-600 text-sm text-center">Bookings</Text>
        </View>
      </View>

      {/* Menu Items */}
      <View className="px-4 mb-8">
        <Text className="text-lg font-bold text-gray-800 mb-4 mt-2">Management</Text>
        <View className="bg-white rounded-xl overflow-hidden shadow-sm">
          {menuItems
            .filter(item => !item.adminOnly || isSuperAdmin)
            .map((item, index) => (
              <TouchableOpacity
                key={index}
                onPress={item.action}
                className={`flex-row items-center p-4 ${index < menuItems.length - 1 ? 'border-b border-gray-100' : ''}`}
              >
                <View className={`${item.color} w-12 h-12 rounded-full items-center justify-center mr-4`}>
                  <Text className="text-xl">{item.icon}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-gray-800">{item.title}</Text>
                  <Text className="text-gray-600 text-sm">{item.description}</Text>
                </View>
                <Text className="text-gray-400 text-lg">›</Text>
              </TouchableOpacity>
            ))}
        </View>
      </View>

      {/* Quick Actions */}
      <View className="px-4 mb-8">
        <Text className="text-lg font-bold text-gray-800 mb-4">Quick Actions</Text>
        <View className="flex-row gap-3">
          <TouchableOpacity 
            onPress={() => router.push('/admin/hotels/create')}
            className="flex-1 bg-white rounded-xl p-4 items-center shadow-sm"
          >
            <Text className="text-2xl mb-2">+</Text>
            <Text className="text-gray-700 font-medium">Add Hotel</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => router.push('/admin/rooms/create')}
            className="flex-1 bg-white rounded-xl p-4 items-center shadow-sm"
          >
            <Text className="text-2xl mb-2">+</Text>
            <Text className="text-gray-700 font-medium">Add Room</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}