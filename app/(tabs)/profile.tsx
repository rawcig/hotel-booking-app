import React from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

const Profile = () => {
  const profileData = {
    name: 'John Doe',
    email: 'john.doe@email.com',
    phone: '+855 12 345 678',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
    memberSince: '2023',
    totalBookings: 12,
    favoriteHotels: 5
  };

  const menuItems = [
  { icon: '👤', title: 'Edit Profile', subtitle: 'Update your personal information' },
  { icon: '💳', title: 'Payment Methods', subtitle: 'Manage your payment options' },
  { icon: '📋', title: 'Booking History', subtitle: 'View all your past bookings' },
  { icon: '❤️', title: 'Favorite Hotels', subtitle: 'Your saved hotels' },
  { icon: '🔔', title: 'Notifications', subtitle: 'Manage notification preferences' },
  { icon: '❓', title: 'Help & Support', subtitle: 'Get help with your bookings' },
  { icon: '⚙️', title: 'Settings', subtitle: 'App settings and preferences' },
];

 
  
  const renderMenuItem = (item: any, index: number) => (
    <TouchableOpacity 
      key={index}
      className="flex-row items-center p-4 bg-white border-b border-gray-100"
      onPress={() => alert(`${item.title} - Coming soon!`)}
    >
      <View className="w-12 h-12 bg-gray-100 rounded-full items-center justify-center mr-4">
        <Text className="text-xl">{item.icon}</Text>
      </View>
      <View className="flex-1">
        <Text className="text-lg font-semibold text-gray-800">{item.title}</Text>
        <Text className="text-sm text-gray-500">{item.subtitle}</Text>
      </View>
      <Text className="text-gray-400 text-lg">›</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1 bg-gray-50">
        <ScrollView className="flex-1">
          {/* Header */}
          <View className="bg-white p-6 border-b border-gray-100">
            <Text className="text-2xl font-bold text-gray-800 mb-4">Profile</Text>

           
            {/* User Info Card */}
            <View className="flex-row items-center">
              <Image 
                source={{ uri: profileData.avatar }} 
                className="w-20 h-20 rounded-full mr-4"
                resizeMode="cover"
              />
              <View className="flex-1">
                <Text className="text-xl font-bold text-gray-800">{profileData.name}</Text>
                <Text className="text-gray-600 mb-1">{profileData.email}</Text>
                <Text className="text-gray-500 text-sm">Member since {profileData.memberSince}</Text>
              </View>
              <TouchableOpacity className="w-8 h-8 bg-blue-500 rounded-full items-center justify-center">
                <Text className="text-white text-lg">✎</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Stats Cards */}
          <View className="flex-row p-4 gap-3">
            <View className="flex-1 bg-white rounded-xl p-4 items-center">
              <Text className="text-2xl font-bold text-blue-600">{profileData.totalBookings}</Text>
              <Text className="text-gray-600 text-sm">Total Bookings</Text>
            </View>
            <View className="flex-1 bg-white rounded-xl p-4 items-center">
              <Text className="text-2xl font-bold text-red-500">{profileData.favoriteHotels}</Text>
              <Text className="text-gray-600 text-sm">Favorite Hotels</Text>
            </View>
            <View className="flex-1 bg-white rounded-xl p-4 items-center">
              <Text className="text-2xl font-bold text-green-500">4.8</Text>
              <Text className="text-gray-600 text-sm">Rating</Text>
            </View>
          </View>

          {/* Menu Items */}
          <View className="mx-4 bg-white rounded-xl overflow-hidden mb-4">
            {menuItems.map(renderMenuItem)}
          </View>

          {/* Logout Button */}
          <TouchableOpacity 
            className="mx-4 bg-white rounded-xl p-4 mb-8"
            onPress={() => alert('Logout functionality - Coming soon!')}
          >
            <View className="flex-row items-center justify-center">
              <Text className="text-red-500 text-lg font-semibold mr-2">🚪</Text>
              <Text className="text-red-500 text-lg font-semibold">Logout</Text>
            </View>
          </TouchableOpacity>

          {/* App Version */}
          <View className="items-center pb-8">
            <Text className="text-gray-400 text-sm">SU35 Hotel Booking App v1.0.0</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default Profile;