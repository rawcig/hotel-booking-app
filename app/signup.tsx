// app/signup.tsx
import { images } from '@/constants/images';
import { useUser } from '@/context/UserContext';
import { validateSignupForm } from '@/utils/validation';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { signup } = useUser();

  const handleSignup = async () => {
    // Validate form using our validation utility
    const errors = validateSignupForm({ name, email, password, confirmPassword });
    
    // If there are validation errors, show the first one
    if (errors.length > 0) {
      Alert.alert('Validation Error', errors[0].message);
      return;
    }
    
    try {
      setIsLoading(true);
      console.log('Attempting signup with:', { name, email, password: password.length + ' chars', phone });
      const result = await signup(name, email, password, phone);
      console.log('Signup result:', result);
      
      if (result.success) {
        Alert.alert('Success', 'Account created successfully!', [
          { text: 'OK', onPress: () => router.replace('/(tabs)') }
        ]);
      } else {
        Alert.alert('Signup Failed', result.error || 'Failed to create account');
      }
    } catch (error: any) {
      console.error('Signup error caught in component:', error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      Alert.alert('Error', `Failed to create account: ${error.message || 'Unknown error occurred'}`);
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
          <Text className="text-3xl font-bold text-gray-800 mb-2">Create Account</Text>
          <Text className="text-gray-600 text-center">Sign up to access your bookings and preferences</Text>
        </View>
        
        {/* Signup Form */}
        <View className="bg-gray-50 rounded-2xl p-6 mb-8">
          <View className="mb-6">
            <Text className="text-gray-700 mb-2 font-medium">Full Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              className="bg-white rounded-xl p-4 text-gray-800 border border-gray-200"
              placeholder="Enter your full name"
              autoCapitalize="words"
            />
          </View>
          
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
          
          <View className="mb-6">
            <Text className="text-gray-700 mb-2 font-medium">Phone Number (Optional)</Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              className="bg-white rounded-xl p-4 text-gray-800 border border-gray-200"
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
            />
          </View>
          
          <View className="mb-6">
            <Text className="text-gray-700 mb-2 font-medium">Password</Text>
            <Text className="text-gray-500 text-xs mb-1">Minimum 3 characters for testing (will be padded to 6 for security)</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              className="bg-white rounded-xl p-4 text-gray-800 border border-gray-200"
              placeholder="Create a password"
              secureTextEntry
            />
          </View>
          
          <View className="mb-8">
            <Text className="text-gray-700 mb-2 font-medium">Confirm Password</Text>
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              className="bg-white rounded-xl p-4 text-gray-800 border border-gray-200"
              placeholder="Confirm your password"
              secureTextEntry
            />
          </View>
          
          <TouchableOpacity 
            onPress={handleSignup}
            disabled={isLoading}
            className={`py-4 rounded-xl ${isLoading ? 'bg-gray-300' : 'bg-blue-500'}`}
            activeOpacity={0.8}
          >
            <Text className="text-white text-center font-bold text-lg">
              {isLoading ? 'Creating Account...' : 'Sign Up'}
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Login Link */}
        <View className="flex-row justify-center items-center mb-8">
          <Text className="text-gray-600">Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/login')}>
            <Text className="text-blue-500 font-semibold">Sign In</Text>
          </TouchableOpacity>
        </View>
        
        {/* Demo Info */}
        <View className="bg-blue-50 rounded-xl p-4">
          <Text className="text-blue-800 text-center font-medium">
            Hotel Booking App
          </Text>
          <Text className="text-blue-600 text-center mt-2">
            Enter your details to create an account
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}