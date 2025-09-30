// app/login.tsx
import { images } from '@/constants/images';
import { useUser } from '@/context/UserContext';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login, createGuestSession } = useUser();

  const handleLogin = async () => {
    // Simple validation
    if (!email || !password) {
      Alert.alert('Validation Error', 'Please enter both email and password');
      return;
    }
    
    try {
      setIsLoading(true);
      const result = await login(email, password);
      
      if (result.success) {
        router.replace('/(tabs)');
      } else {
        Alert.alert('Login Failed', result.error || 'Invalid email or password');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      Alert.alert('Error', `Failed to login: ${error.message || 'Unknown error occurred'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueAsGuest = async () => {
    try {
      await createGuestSession();
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Guest session error:', error);
      Alert.alert('Error', `Failed to continue as guest: ${error.message || 'Unknown error occurred'}`);
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
          <Text className="text-3xl font-bold text-gray-800 mb-2">Welcome to SU35 Hotel</Text>
          <Text className="text-gray-600 text-center">Sign in to access your bookings and preferences</Text>
        </View>
        
        {/* Login Form */}
        <View className="bg-gray-50 rounded-2xl p-6 mb-8">
          <View className="mb-6">
            <Text className="text-gray-700 mb-2 font-medium">Email Address</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              className="bg-white rounded-xl p-4 text-gray-800 border border-gray-200"
              placeholder="Enter your email"
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
        
        {/* Signup Link */}
                        <Text className="text-gray-600 text-center">Don&apos;t have an account? Sign up</Text>
        
        {/* Continue as Guest */}
        <View className="mb-8">
          <Text className="text-center text-gray-500 mb-4">or</Text>
          <TouchableOpacity 
            onPress={handleContinueAsGuest}
            className="py-4 rounded-xl bg-gray-200 border border-gray-300"
            activeOpacity={0.8}
          >
            <Text className="text-gray-800 text-center font-bold text-lg">Continue as Guest</Text>
          </TouchableOpacity>
        </View>
        
        {/* Demo Info */}
        <View className="bg-blue-50 rounded-xl p-4">
          <Text className="text-blue-800 text-center font-medium">
            Hotel Booking App
          </Text>
          <Text className="text-blue-600 text-center mt-2">
            Enter your credentials to access the app, or continue as guest
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}