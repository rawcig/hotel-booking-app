import { images } from "@/constants/images";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useRef, useState } from 'react';
import { Alert, Image, Modal, ScrollView, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Profile() {
  const [profileData, setProfileData] = useState({
    name: 'Try Leanghak',
    email: 'hak.goBy@email.com',
    phone: '+855 12 345 678',
    avatar: images.hak,
    memberSince: '2023',
    totalBookings: 12,
    favoriteHotels: 5,
    loyaltyPoints: 2450
  });

  const [settings, setSettings] = useState({
    notifications: true,
    emailUpdates: true,
    locationServices: false,
    darkMode: false
  });

  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({
    name: profileData.name,
    email: profileData.email,
    phone: profileData.phone
  });

  // Ref to track if we just saved profile data
  const justSavedProfile = useRef(false);

  // Load settings from storage
  useFocusEffect(
    useCallback(() => {
      // Don't load if we just saved
      if (justSavedProfile.current) {
        justSavedProfile.current = false;
        return;
      }
      
      loadSettings();
      loadProfile();
    }, [])
  );

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('userSettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const loadProfile = async () => {
    // If we just saved, don't reload
    if (justSavedProfile.current) {
      justSavedProfile.current = false;
      return;
    }
    
    try {
      const savedProfile = await AsyncStorage.getItem('userProfile');
      if (savedProfile) {
        const parsedProfile = JSON.parse(savedProfile);
        setProfileData(parsedProfile);
        setEditData({
          name: parsedProfile.name,
          email: parsedProfile.email,
          phone: parsedProfile.phone
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const saveSettings = async (newSettings: any) => {
    try {
      await AsyncStorage.setItem('userSettings', JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error("There's an error:", error);
      Alert.alert('Error', 'Failed to save settings');
    }
  };

  const handleToggleSetting = (key: keyof typeof settings) => {
    const newSettings = { ...settings, [key]: !settings[key]  };
    saveSettings(newSettings);
  };

  const handleSaveProfile = async () => {
    try {
      const updatedProfile = { ...profileData, ...editData };
      setProfileData(updatedProfile);
      justSavedProfile.current = true;
      await AsyncStorage.setItem('userProfile', JSON.stringify(updatedProfile));
      setShowEditModal(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      console.error("There's an error:", error);
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const menuItems = [
    {
      icon: '👤', 
      title: 'Edit Profile', 
      subtitle: 'Update your personal information',
      action: () => {
        // Update editData with current profileData before showing modal
        setEditData({
          name: profileData.name,
          email: profileData.email,
          phone: profileData.phone
        });
        setShowEditModal(true);
      }
    },
    { 
      icon: '💳', 
      title: 'Payment Methods', 
      subtitle: 'Manage your payment options',
      action: () => Alert.alert('Coming Soon', 'Payment management will be available soon!')
    },
    { 
      icon: '📋', 
      title: 'Booking History', 
      subtitle: 'View all your past bookings',
      action: () => Alert.alert('Coming Soon', 'Detailed booking history coming soon!')
    },
    { 
      icon: '❤️', 
      title: 'Favorite Hotels', 
      subtitle: 'Your saved hotels',
      action: () => Alert.alert('Coming Soon', 'Favorites feature coming soon!')
    },
    { 
      icon: '🎁', 
      title: 'Loyalty Program', 
      subtitle: `${profileData.loyaltyPoints} points earned`,
      action: () => Alert.alert('Loyalty Points', `You have ${profileData.loyaltyPoints} points! Keep booking to earn more rewards.`)
    },
    { 
      icon: '🔔', 
      title: 'Notifications', 
      subtitle: 'Manage notification preferences',
      action: () => Alert.alert('Coming Soon', 'Advanced notification settings coming soon!')
    },
    { 
      icon: '❓', 
      title: 'Help & Support', 
      subtitle: 'Get help with your bookings',
      action: () => Alert.alert('Support', 'Contact us at support@su35hotel.com or call +855 12 345 678')
    },
    { 
      icon: '⚙️', 
      title: 'Settings', 
      subtitle: 'App settings and preferences',
      action: () => {} // Will show settings inline
    },
  ];

  const renderMenuItem = (item: any, index: number) => (
    <View key={index}>
      <TouchableOpacity 
        className="flex-row items-center p-4 bg-white border-b border-gray-50"
        onPress={item.action}
        activeOpacity={0.7}
      >
        <View className="w-12 h-12 bg-blue-50 rounded-full items-center justify-center mr-4">
          <Text className="text-xl">{item.icon}</Text>
        </View>
        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-800">{item.title}</Text>
          <Text className="text-sm text-gray-500">{item.subtitle}</Text>
        </View>
        <Text className="text-gray-400 text-lg">›</Text>
      </TouchableOpacity>
      
      {/* Settings toggles */}
      {item.title === 'Settings' && (
        <View className="bg-gray-50 px-4 py-3">
          {Object.entries(settings).map(([key, value]) => {
            const typedKey = key as keyof typeof settings;
            return (
              <View key={key} className="flex-row justify-between items-center py-3 border-b border-gray-200">
                <Text className="text-gray-700 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </Text>
                <Switch
                  value={value}
                  onValueChange={() => handleToggleSetting(typedKey)}
                  trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
                  thumbColor={value ? '#FFFFFF' : '#9CA3AF'}
                />
              </View>
            );
          })}
        </View>
      )}
    </View>
  );

  // Edit Profile Modal
  const EditProfileModal = () => (
    <Modal
      visible={showEditModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowEditModal(false)}
    >
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="bg-white rounded-2xl mx-4 w-80 shadow-lg">
          <View className="p-6">
            <Text className="text-xl font-bold text-gray-800 mb-4 text-center">Edit Profile</Text>
            
            <View className="mb-4">
              <Text className="text-gray-700 mb-2">Full Name</Text>
              <TextInput
                value={editData.name}
                onChangeText={(text) => setEditData({...editData, name: text})}
                className="bg-gray-100 rounded-xl p-3 text-gray-800"
                placeholder="Enter your name"
              />
            </View>

            <View className="mb-4">
              <Text className="text-gray-700 mb-2">Email</Text>
              <TextInput
                value={editData.email}
                onChangeText={(text) => setEditData({...editData, email: text})}
                className="bg-gray-100 rounded-xl p-3 text-gray-800"
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View className="mb-6">
              <Text className="text-gray-700 mb-2">Phone</Text>
              <TextInput
                value={editData.phone}
                onChangeText={(text) => setEditData({...editData, phone: text})}
                className="bg-gray-100 rounded-xl p-3 text-gray-800"
                placeholder="Enter your phone"
                keyboardType="phone-pad"
              />
            </View>

            <View className="flex-row gap-3">
              <TouchableOpacity 
                onPress={() => setShowEditModal(false)}
                className="flex-1 bg-gray-200 py-3 rounded-xl"
                activeOpacity={0.8}
              >
                <Text className="text-gray-700 text-center font-semibold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleSaveProfile}
                className="flex-1 bg-blue-500 py-3 rounded-xl"
                activeOpacity={0.8}
              >
                <Text className="text-white text-center font-semibold">Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
          {/* Enhanced Header */}
          <View className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 pb-8">
            <Text className="text-2xl font-bold text-black mb-6">Profile</Text>

            {/* User Info Card */}
            <View className="bg-white/95 rounded-2xl p-4 backdrop-blur-sm">
              <View className="flex-row items-center">
                <Image 
                  source={images.hak} 
                  className="w-20 h-20 rounded-full mr-4 border-2 border-blue-200"
                  resizeMode="cover"
                />
                <View className="flex-1">
                  <Text className="text-xl font-bold text-gray-800">{profileData.name}</Text>
                  <Text className="text-gray-600 mb-1">{profileData.email}</Text>
                  <View className="flex-row items-center">
                    <View className="bg-blue-100 px-2 py-1 rounded-full mr-2">
                      <Text className="text-blue-600 text-xs font-medium">Member since {profileData.memberSince}</Text>
                    </View>
                  </View>
                </View>
                <TouchableOpacity 
                  onPress={() => setShowEditModal(true)}
                  className="w-10 h-10 bg-blue-500 rounded-full items-center justify-center"
                  activeOpacity={0.8}
                >
                  <Text className="text-white text-lg">✎</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Enhanced Stats Cards */}
          <View className="flex-row p-4 gap-3 -mt-4">
            <View className="flex-1 bg-white rounded-xl p-4 items-center shadow-sm">
              <Text className="text-2xl font-bold text-blue-600">{profileData.totalBookings}</Text>
              <Text className="text-gray-600 text-sm text-center">Total Bookings</Text>
            </View>
            <View className="flex-1 bg-white rounded-xl p-4 items-center shadow-sm">
              <Text className="text-2xl font-bold text-red-500">{profileData.favoriteHotels}</Text>
              <Text className="text-gray-600 text-sm text-center">Favorite Hotels</Text>
            </View>
            <View className="flex-1 bg-white rounded-xl p-4 items-center shadow-sm">
              <Text className="text-2xl font-bold text-green-500">{profileData.loyaltyPoints}</Text>
              <Text className="text-gray-600 text-sm text-center">Loyalty Points</Text>
            </View>
          </View>

          {/* Menu Items */}
          <View className="mx-4 bg-white rounded-xl overflow-hidden mb-4 shadow-sm">
            {menuItems.map(renderMenuItem)}
          </View>

          {/* Enhanced Logout Button */}
          <TouchableOpacity 
            className="mx-4 bg-white rounded-xl p-4 mb-8 shadow-sm"
            onPress={() => Alert.alert(
              'Logout', 
              'Are you sure you want to logout?',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Logout', style: 'destructive', onPress: () => {
                    // Clear user data
                    AsyncStorage.removeItem('userProfile');
                    AsyncStorage.removeItem('userSettings');
                    // Show confirmation and navigate to login or home
                    Alert.alert('Logged out!', 'You have been successfully logged out.');
                    // In a real app, you would navigate to login screen here
                  }
                }
              ]
            )}
            activeOpacity={0.8}
          >
            <View className="flex-row items-center justify-center">
              <Text className="text-red-500 text-lg font-semibold mr-2">🚪</Text>
              <Text className="text-red-500 text-lg font-semibold">Logout</Text>
            </View>
          </TouchableOpacity>

          {/* App Info */}
          <View className="items-center pb-8">
            <Text className="text-gray-400 text-sm">SU35 Hotel Booking App v2.0.0</Text>
            <Text className="text-gray-300 text-xs mt-1 pb-10">Made with ❤️ in Cambodia</Text>
          </View>
        </ScrollView>

        <EditProfileModal />
      </SafeAreaView>
  );
};