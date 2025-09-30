import TestNotificationsButton from '@/components/TestNotificationsButton';
import { images } from "@/constants/images";
import { useUser } from '@/context/UserContext';
import { supabase } from '@/lib/supabase';
import { sanitizeEmail, sanitizeName, sanitizePhone, validateProfileForm } from '@/utils/validation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import { Alert, Image, Modal, ScrollView, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Profile() {
  const router = useRouter();
  const { user, logout } = useUser();
  const [profileData, setProfileData] = useState({
    name: user?.name || 'Guest',
    email: user?.email || 'guest@account.com',
    phone: user?.phone || '+855 12 345 678',
    avatar: images.avatar1,
    memberSince: '2023',
    totalBookings: '0',
    favoriteHotels: '0',
    loyaltyPoints: '0',
    bio: ''
  });

  const [settings, setSettings] = useState({
    notifications: true,
    emailUpdates: true,
    locationServices: false,
    darkMode: false
  });

  const [showEditModal, setShowEditModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [editData, setEditData] = useState({
    name: user?.name || profileData.name,
    email: user?.email || profileData.email,
    phone: user?.phone || profileData.phone,
    bio: profileData.bio
  });

  // Ref to track if we just saved profile data
  const justSavedProfile = useRef(false);

  // Check if user is a guest
  const isGuest = user?.isGuest || !user;

  // Available avatars for guests
  const guestAvatars = [
    images.avatar1,
    images.avatar2,
    images.avatar3,
  ];

  // Save avatar selection for guests
  const saveGuestAvatar = async (avatar: any) => {
    try {
      const updatedProfile = { ...profileData, avatar };
      setProfileData(updatedProfile);
      justSavedProfile.current = true;
      await AsyncStorage.setItem('userProfile', JSON.stringify(updatedProfile));
      setShowAvatarModal(false);
    } catch (error) {
      console.error('Error saving guest avatar:', error);
      Alert.alert('Error', 'Failed to save avatar');
      justSavedProfile.current = false; // Reset flag on error
    }
  };

  // For registered users, we would implement Supabase avatar upload
  const handleAvatarUpload = async () => {
    if (isGuest) {
      setShowAvatarModal(true);
      return;
    }
    
    // For registered users, we would implement actual image upload
    Alert.alert('Feature Coming Soon', 'Avatar upload for registered users will be available soon!');
  };

  // Load settings from storage
  const loadSettings = useCallback(async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('userSettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }, []);

  const loadProfile = useCallback(async () => {
    // If we just saved, don't reload
    if (justSavedProfile.current) {
      justSavedProfile.current = false;
      return;
    }
    
    try {
      // If this is a real user (not guest), load their profile from Supabase
      if (user && !user.isGuest) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          // Get user profile from users table
          const { data: profile, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();
          
          if (!error && profile) {
            setProfileData({
              name: profile.name || user.name || 'User',
              email: profile.email || user.email || '',
              phone: profile.phone || user.phone || '',
              avatar: profile.avatar_url ? { uri: profile.avatar_url } : images.userMale,
              memberSince: new Date(profile.created_at).getFullYear().toString(),
              totalBookings: '12', // We'll fetch this from bookings table later
              favoriteHotels: '5',
              loyaltyPoints: '2450',
              bio: profile.bio || ''
            });
            
            setEditData({
              name: profile.name || user.name || '',
              email: profile.email || user.email || '',
              phone: profile.phone || user.phone || '',
              bio: profile.bio || ''
            });
          }
        }
      } else {
        // For guests or when not logged in, load from AsyncStorage
        const savedProfile = await AsyncStorage.getItem('userProfile');
        if (savedProfile) {
          const parsedProfile = JSON.parse(savedProfile);
          setProfileData(prevProfileData => ({
            ...prevProfileData,
            ...parsedProfile,
            avatar: parsedProfile.avatar || prevProfileData.avatar
          }));
          setEditData(prevEditData => ({
            name: parsedProfile.name || prevEditData.name,
            email: parsedProfile.email || prevEditData.email,
            phone: parsedProfile.phone || prevEditData.phone,
            bio: parsedProfile.bio || prevEditData.bio
          }));
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  }, [user]);

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
    }, [loadSettings, loadProfile]) // Add all dependencies
  );

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
    // Validate form using our validation utility
    const errors = validateProfileForm(editData);
    
    // If there are validation errors, show the first one
    if (errors.length > 0) {
      Alert.alert('Validation Error', errors[0].message);
      return;
    }
    
    try {
      // Sanitize inputs before saving
      const sanitizedData = {
        name: sanitizeName(editData.name),
        email: sanitizeEmail(editData.email),
        phone: sanitizePhone(editData.phone)
      };
      
      // If this is a real user (not guest), update their Supabase profile
      if (user && !user.isGuest) {
        // Update user metadata in Supabase auth
        const { error: authError } = await supabase.auth.updateUser({
          data: {
            name: sanitizedData.name,
            phone: sanitizedData.phone
          }
        });
        
        if (authError) {
          throw new Error(authError.message);
        }
        
        // Update user profile in users table
        const { error: profileError } = await supabase
          .from('users')
          .update({
            name: sanitizedData.name,
            phone: sanitizedData.phone,
            bio: editData.bio,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);
        
        if (profileError) {
          throw new Error(profileError.message);
        }
      }
      
      const updatedProfile = { 
        ...profileData, 
        ...sanitizedData,
        bio: editData.bio
      };
      
      // Update state first
      setProfileData(updatedProfile);
      setEditData({
        ...editData,
        ...sanitizedData
      });
      
      // Mark that we just saved (before AsyncStorage operations)
      justSavedProfile.current = true;
      
      // Save to AsyncStorage
      await AsyncStorage.setItem('userProfile', JSON.stringify(updatedProfile));
      
      // Close modal and show success
      setShowEditModal(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error: any) {
      console.error("There's an error:", error);
      // Handle network errors and other exceptions
      if (error.message.includes('Network Error') || error.message.includes('Failed to fetch')) {
        Alert.alert('Network Error', 'Please check your internet connection and try again.');
      } else {
        Alert.alert('Error', `Failed to update profile: ${error.message || 'Unknown error occurred'}`);
      }
    }
  };

  const handleLogin = () => {
    // Navigate to login screen
    router.push('/login');
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
          phone: profileData.phone,
          bio: profileData.bio
        });
        setShowEditModal(true);
      },
      disabled: isGuest // Disable for guests
    },
    { 
      icon: '💳', 
      title: 'Payment Methods', 
      subtitle: 'Manage your payment options',
      action: () => Alert.alert('Coming Soon', 'Payment management will be available soon!'),
      disabled: isGuest // Disable for guests
    },
    { 
      icon: '📋', 
      title: 'Booking History', 
      subtitle: 'View all your past bookings',
      action: () => Alert.alert('Coming Soon', 'Detailed booking history coming soon!'),
      disabled: isGuest // Disable for guests
    },
    { 
      icon: '❤️', 
      title: 'Favorite Hotels', 
      subtitle: 'Your saved hotels',
      action: () => Alert.alert('Coming Soon', 'Favorites feature coming soon!'),
      disabled: isGuest // Disable for guests
    },
    { 
      icon: '🎁', 
      title: 'Loyalty Program', 
      subtitle: `${profileData.loyaltyPoints} points earned`,
      action: () => Alert.alert('Loyalty Points', `You have ${profileData.loyaltyPoints} points! Keep booking to earn more rewards.`),
      disabled: isGuest // Disable for guests
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
        className={`flex-row items-center p-4 bg-white border-b border-gray-50 ${item.disabled ? 'opacity-50' : ''}`}
        onPress={item.disabled ? () => Alert.alert('Guest Access', 'Please log in to access this feature') : item.action}
        activeOpacity={0.7}
        disabled={item.disabled}
      >
        <View className="w-12 h-12 bg-blue-50 rounded-full items-center justify-center mr-4">
          <Text className="text-xl">{item.icon}</Text>
        </View>
        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-800">{item.title}</Text>
          <Text className="text-sm text-gray-500">{item.subtitle}</Text>
        </View>
        {item.disabled ? (
          <Text className="text-gray-400 text-sm">🔒</Text>
        ) : (
          <Text className="text-gray-400 text-lg">›</Text>
        )}
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
                editable={false} // Email should not be editable for security reasons
              />
            </View>

            <View className="mb-4">
              <Text className="text-gray-700 mb-2">Phone</Text>
              <TextInput
                value={editData.phone}
                onChangeText={(text) => setEditData({...editData, phone: text})}
                className="bg-gray-100 rounded-xl p-3 text-gray-800"
                placeholder="Enter your phone"
                keyboardType="phone-pad"
              />
            </View>

            <View className="mb-6">
              <Text className="text-gray-700 mb-2">Bio</Text>
              <TextInput
                value={editData.bio}
                onChangeText={(text) => setEditData({...editData, bio: text})}
                className="bg-gray-100 rounded-xl p-3 text-gray-800"
                placeholder="Tell us about yourself"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
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

  // Avatar Selection Modal
  const AvatarSelectionModal = () => (
    <Modal
      visible={showAvatarModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowAvatarModal(false)}
    >
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="bg-white rounded-2xl mx-4 w-80 shadow-lg">
          <View className="p-6">
            <Text className="text-xl font-bold text-gray-800 mb-4 text-center">Select Avatar</Text>
            
            <View className="flex-row flex-wrap justify-center gap-3 mb-6">
              {guestAvatars.map((avatar, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => saveGuestAvatar(avatar)}
                  className="w-16 h-16 rounded-full border-2 border-gray-200 overflow-hidden"
                >
                  <Image 
                    source={avatar} 
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity 
              onPress={() => setShowAvatarModal(false)}
              className="bg-gray-200 py-3 rounded-xl"
              activeOpacity={0.8}
            >
              <Text className="text-gray-700 text-center font-semibold">Cancel</Text>
            </TouchableOpacity>
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
                <TouchableOpacity 
                  onPress={handleAvatarUpload}
                  className="relative mr-4"
                >
                  <Image 
                    source={profileData.avatar} 
                    className="w-20 h-20 rounded-full border-2 border-blue-200"
                    resizeMode="cover"
                  />
                  <View className="absolute bottom-0 right-0 w-6 h-6 bg-blue-500 rounded-full items-center justify-center">
                    <Text className="text-white text-xs">✏️</Text>
                  </View>
                </TouchableOpacity>
                <View className="flex-1">
                  <Text className="text-xl font-bold text-gray-800">{profileData.name}</Text>
                  <Text className="text-gray-600 mb-1">{profileData.email}</Text>
                  {profileData.bio ? (
                    <Text className="text-gray-500 text-sm mb-2">{profileData.bio}</Text>
                  ) : null}
                  <View className="flex-row items-center">
                    <View className="bg-blue-100 px-2 py-1 rounded-full mr-2">
                      <Text className="text-blue-600 text-xs font-medium">
                        {isGuest ? 'Guest User' : `Member since ${profileData.memberSince}`}
                      </Text>
                    </View>
                  </View>
                </View>
                {isGuest ? (
                  <TouchableOpacity 
                    onPress={handleLogin}
                    className="w-10 h-10 bg-green-500 rounded-full items-center justify-center"
                    activeOpacity={0.8}
                  >
                    <Text className="text-white text-lg">🔑</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity 
                    onPress={() => setShowEditModal(true)}
                    className="w-10 h-10 bg-blue-500 rounded-full items-center justify-center"
                    activeOpacity={0.8}
                  >
                    <Text className="text-white text-lg">✎</Text>
                  </TouchableOpacity>
                )}
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

          {/* Guest Info */}
          {isGuest && (
            <View className="mx-4 bg-yellow-50 rounded-xl p-4 mb-4">
              <Text className="text-yellow-800 font-medium mb-1">Guest Mode</Text>
              <Text className="text-yellow-700 text-sm">
                Your data will be saved temporarily. Sign in to keep your bookings and preferences permanently.
              </Text>
              <TouchableOpacity 
                onPress={handleLogin}
                className="mt-3 bg-yellow-500 py-2 rounded-lg"
              >
                <Text className="text-white text-center font-medium">Sign In Now</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Menu Items */}
          <View className="mx-4 bg-white rounded-xl overflow-hidden mb-4 shadow-sm">
            {menuItems.map(renderMenuItem)}
          </View>
          
          {/* Test Notifications Button */}
          <View className="mx-4 mb-4">
            <TestNotificationsButton />
          </View>

          {/* Enhanced Logout Button */}
          <TouchableOpacity 
            className="mx-4 bg-white rounded-xl p-4 mb-8 shadow-sm"
            onPress={() => Alert.alert(
              'Logout', 
              isGuest ? 'Are you sure you want to reset guest session?' : 'Are you sure you want to logout?',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: isGuest ? 'Reset' : 'Logout', style: 'destructive', onPress: async () => {
                    // Clear user data
                    await AsyncStorage.removeItem('userProfile');
                    await AsyncStorage.removeItem('userSettings');
                    // Logout from context
                    await logout();
                    // Show confirmation
                    Alert.alert(isGuest ? 'Session Reset!' : 'Logged out!', 
                      isGuest ? 'Guest session has been reset.' : 'You have been successfully logged out.');
                  }
                }
              ]
            )}
            activeOpacity={0.8}
          >
            <View className="flex-row items-center justify-center">
              <Text className="text-red-500 text-lg font-semibold mr-2">🚪</Text>
              <Text className="text-red-500 text-lg font-semibold">{isGuest ? 'Reset Session' : 'Logout'}</Text>
            </View>
          </TouchableOpacity>

          {/* App Info */}
          <View className="items-center pb-8">
            <Text className="text-gray-400 text-sm">SU35 Hotel Booking App v2.0.0</Text>
            <Text className="text-gray-300 text-xs mt-1 pb-10">Made with ❤️ in Cambodia</Text>
          </View>
        </ScrollView>

        <EditProfileModal />
        <AvatarSelectionModal />
      </SafeAreaView>
  );
};