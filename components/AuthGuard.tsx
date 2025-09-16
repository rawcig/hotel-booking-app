// components/AuthGuard.tsx
import React, { useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { useRouter, useSegments } from 'expo-router';
import { ActivityIndicator, View, Text } from 'react-native';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { user, isLoading } = useUser();
  const segments = useSegments();
  const router = useRouter();
  
  // Check if we're in a protected route (admin routes, profile editing, etc.)
  const isProtectedRoute = segments[0] === 'admin' || segments[0] === 'profile/edit';
  
  useEffect(() => {
    if (!isLoading) {
      // For protected routes, redirect unauthenticated users to login
      if (!user && isProtectedRoute) {
        router.replace('/login');
      }
      // If user is logged in and trying to access login page, redirect to home
      else if (user && !user.isGuest && segments[0] === 'login') {
        router.replace('/(tabs)');
      }
    }
  }, [user, isLoading, isProtectedRoute, router, segments]);

  // Show loading indicator while checking auth state
  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="mt-4 text-gray-600">Loading session...</Text>
      </View>
    );
  }
  
  // Render children for all users (guests and logged-in users)
  // Only restrict access to truly protected routes
  return <>{children}</>;
}