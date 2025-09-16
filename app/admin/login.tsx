// app/admin/login.tsx
// Admin login screen

import React, { useState } from 'react';
import { Alert, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAdmin } from '@/context/AdminContext';
import { images } from '@/constants/images';

export default function AdminLoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useAdmin();

  const handleLogin = async () => {
    // Basic validation
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }
    
    if (!password.trim()) {
      Alert.alert('Error', 'Please enter your password');
      return;
    }
    
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }
    
    try {
      setIsLoading(true);
      const success = await login(email, password);
      
      if (success) {
        router.replace('/admin/dashboard');
      } else {
        Alert.alert('Error', 'Invalid credentials. Please try again.');
      }
    } catch (error) {
      console.error('Admin login error:', error);
      Alert.alert('Error', 'Failed to login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="flex-1 justify-center px-6 py-12">
        {/* Logo and Title */}
        <View className="items-center mb-12">
          <Image 
            source={images.userMale} 
            className="w-24 h-24 rounded-full mb-6 border-2 border-blue-200"
            resizeMode="cover"
          />
          <Text className="text-3xl font-bold text-gray-800 mb-2">Admin Portal</Text>
          <Text className="text-gray-600 text-center">Sign in to manage hotels and bookings</Text>
        </View>
        
        {/* Login Form */}
        <View className="bg-gray-50 rounded-2xl p-6 mb-8">
          <View className="mb-6">
            <Text className="text-gray-700 mb-2 font-medium">Email Address</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              className="bg-white rounded-xl p-4 text-gray-800 border border-gray-200"
              placeholder="Enter your admin email"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          
          <View className="mb-8">
            <Text className="text-gray-700 mb-2 font-medium">Password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              className="bg-white rounded-xl p-4 text-gray-800 border border-gray-200"
              placeholder="Enter your password"
              secureTextEntry
            />
          </View>
          
          <TouchableOpacity 
            onPress={handleLogin}
            disabled={isLoading}
            className={`py-4 rounded-xl ${isLoading ? 'bg-gray-300' : 'bg-blue-500'}`}
            activeOpacity={0.8}
          >
            <Text className="text-white text-center font-bold text-lg">
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Demo Credentials */}
        <View className="bg-blue-50 rounded-xl p-4">
          <Text className="text-blue-800 text-center font-medium mb-2">
            🔐 Demo Admin Credentials
          </Text>
          <Text className="text-blue-600 text-center">
            Email: admin@hotel.com
          </Text>
          <Text className="text-blue-600 text-center mt-1">
            Password: admin123
          </Text>
        </View>
        
        {/* Back to User App */}
        <View className="mt-6 items-center">
          <TouchableOpacity 
            onPress={() => router.replace('/')}
            className="py-3 px-6"
          >
            <Text className="text-blue-500 font-medium">← Back to User App</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}